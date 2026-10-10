import { describe, expect, it, vi } from "vitest";
import { handle, parseBody, type Env } from "../../supabase/functions/invite-user/index";

const env: Env = { url: "https://x.supabase.co", anonKey: "anon", serviceKey: "service" };

type Fake = {
  caller?: string | null; // id of the signed-in user, null = invalid token
  me?: { role: string; active: boolean } | null;
  inviteError?: string;
  createError?: string;
};

function fakes(f: Fake) {
  const calls = { invite: vi.fn(), createUser: vi.fn(), update: vi.fn(), updateEq: vi.fn() };
  const create = ((_url: string, key: string) => {
    if (key === "anon") {
      return {
        auth: {
          getUser: async () =>
            f.caller ? { data: { user: { id: f.caller } }, error: null } : { data: { user: null }, error: { message: "bad jwt" } },
        },
      };
    }
    return {
      from: () => ({
        select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: f.me ?? null }) }) }),
        update: (changes: unknown) => {
          calls.update(changes);
          return { eq: async (col: string, value: string) => (calls.updateEq(col, value), { error: null }) };
        },
      }),
      auth: {
        admin: {
          inviteUserByEmail: async (email: string, opts: unknown) => {
            calls.invite(email, opts);
            return f.inviteError
              ? { data: { user: null }, error: { message: f.inviteError } }
              : { data: { user: { id: "new-user" } }, error: null };
          },
          createUser: async (args: unknown) => {
            calls.createUser(args);
            return f.createError
              ? { data: { user: null }, error: { message: f.createError } }
              : { data: { user: { id: "new-user" } }, error: null };
          },
        },
      },
    };
  }) as never;
  return { create, calls };
}

const post = (body: unknown, token: string | null = "token") =>
  new Request("https://x.supabase.co/functions/v1/invite-user", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body),
  });

const adminFakes = (extra: Fake = {}) => fakes({ caller: "admin-id", me: { role: "admin", active: true }, ...extra });

describe("parseBody", () => {
  it("cleans the values and defaults to editor", () => {
    expect(parseBody({ mode: "invite", email: "  Ana@Example.RO ", name: " Ana " })).toEqual({
      mode: "invite",
      email: "ana@example.ro",
      name: "Ana",
      role: "editor",
      password: undefined,
      redirectTo: undefined,
    });
  });

  it("rejects bad input", () => {
    expect(parseBody({ mode: "invite", email: "not-an-email" })).toEqual({ error: "bad_email" });
    expect(parseBody({ mode: "other", email: "a@b.ro" })).toEqual({ error: "bad_request" });
    expect(parseBody({ mode: "password", email: "a@b.ro", password: "short" })).toEqual({ error: "weak_password" });
    expect(parseBody({ mode: "invite", email: "a@b.ro", redirectTo: "javascript:alert(1)" })).toMatchObject({
      redirectTo: undefined,
    });
  });
});

describe("invite-user function", () => {
  it("answers the browser's CORS preflight", async () => {
    const res = await handle(new Request("https://x/f", { method: "OPTIONS" }), env, fakes({}).create);
    expect(res.status).toBe(200);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
  });

  it("refuses visitors without a valid login", async () => {
    expect((await handle(post({}, null), env, fakes({}).create)).status).toBe(401);
    expect((await handle(post({}), env, fakes({ caller: null }).create)).status).toBe(401);
  });

  it("refuses editors and inactive admins", async () => {
    const editor = fakes({ caller: "u", me: { role: "editor", active: true } });
    expect((await handle(post({ mode: "invite", email: "a@b.ro" }), env, editor.create)).status).toBe(403);
    expect(editor.calls.invite).not.toHaveBeenCalled();
    const inactive = fakes({ caller: "u", me: { role: "admin", active: false } });
    expect((await handle(post({ mode: "invite", email: "a@b.ro" }), env, inactive.create)).status).toBe(403);
  });

  it("invites by email and activates the new profile with the chosen role", async () => {
    const { create, calls } = adminFakes();
    const res = await handle(
      post({ mode: "invite", email: "ana@example.ro", name: "Ana", role: "editor", redirectTo: "https://oradeatango.ro/admin/set-password" }),
      env,
      create,
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: "invited" });
    expect(calls.invite).toHaveBeenCalledWith("ana@example.ro", {
      data: { name: "Ana" },
      redirectTo: "https://oradeatango.ro/admin/set-password",
    });
    expect(calls.update).toHaveBeenCalledWith({ role: "editor", active: true, name: "Ana" });
    expect(calls.updateEq).toHaveBeenCalledWith("id", "new-user");
  });

  it("creates an account with a password, already confirmed", async () => {
    const { create, calls } = adminFakes();
    const res = await handle(post({ mode: "password", email: "b@example.ro", password: "secret-123", role: "admin" }), env, create);
    expect(await res.json()).toEqual({ status: "created" });
    expect(calls.createUser).toHaveBeenCalledWith({
      email: "b@example.ro",
      password: "secret-123",
      email_confirm: true,
      user_metadata: { name: null },
    });
    expect(calls.update).toHaveBeenCalledWith({ role: "admin", active: true });
  });

  it("re-activates an existing account instead of failing", async () => {
    const { create, calls } = adminFakes({ inviteError: "A user with this email address has already been registered" });
    const res = await handle(post({ mode: "invite", email: "old@example.ro" }), env, create);
    expect(await res.json()).toEqual({ status: "existing" });
    expect(calls.updateEq).toHaveBeenCalledWith("email", "old@example.ro");
  });

  it("reports other Supabase errors (e.g. email sending limits)", async () => {
    const { create } = adminFakes({ inviteError: "Email rate limit exceeded" });
    const res = await handle(post({ mode: "invite", email: "c@example.ro" }), env, create);
    expect(res.status).toBe(502);
    expect(await res.json()).toMatchObject({ error: "invite_failed", message: "Email rate limit exceeded" });
  });
});
