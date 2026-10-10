// Supabase Edge Functions (Deno) import supabase-js through a JSR specifier;
// for TypeScript and Vitest in this project it is the same npm package.
declare module "jsr:@supabase/supabase-js@2" {
  export * from "@supabase/supabase-js";
}
