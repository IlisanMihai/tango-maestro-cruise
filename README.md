# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

## Supabase (etapa 1: baza de date + securitate)

Fișierele sunt în `supabase/`:

- `migrations/…_events_profiles.sql`: tipuri, tabelele `events` și `profiles`, RLS
- `migrations/…_event_images_storage.sql`: bucket-ul public `event-images` + reguli de upload
- `seed.sql`: un singur eveniment (weekendul Carolina Jador, publicat)
- `checks/rls_check.sql`: verifică regulile de securitate (rulează totul într-o tranzacție cu ROLLBACK, nu lasă nimic în urmă)

### 1. Creează proiectul

1. [supabase.com](https://supabase.com) → **New project**, regiunea **Central EU (Frankfurt)**. Salvează parola bazei de date în managerul de parole.
   - **Enable Data API**: bifat (site-ul citește evenimentele prin el).
   - **Automatically expose new tables**: debifat (recomandat; migrațiile dau singure permisiunile necesare).
   - **Enable automatic RLS**: bifat.
2. După ce proiectul e creat: **Authentication → Sign In / Providers** (în unele versiuni **Authentication → Settings**): dezactivează **Allow new users to sign up** (conturile de staff le inviți tu).

### 2. Rulează migrațiile

**Varianta A: SQL Editor (fără instalări).** Copiază și rulează, în ordine:
`supabase/migrations/20261009000000_events_profiles.sql`, apoi `…000100_event_images_storage.sql`, apoi `supabase/seed.sql`.
Migrațiile adăugate ulterior (ex. `20261010000000_remove_concert_type.sql`) se rulează la fel, o singură dată fiecare, în ordinea numelui.

**Varianta B: Supabase CLI.**

```bash
npx supabase login
npx supabase link --project-ref <project-ref>
npx supabase db push --include-seed
```

### 3. Fă-te admin

1. **Authentication → Users → Add user → Create new user**, cu emailul tău, o parolă și **Auto Confirm User** bifat. Profilul se creează automat, **inactiv**, cu rolul `editor`.
   Nu folosi încă **Send invitation**: linkul din email duce la „Site URL” (implicit `http://localhost:3000`), iar pagina de setare a parolei vine abia în etapa de login/admin.
   Setează între timp **Authentication → URL Configuration → Site URL** la `http://localhost:8080` (la lansare va deveni adresa site-ului).
2. În SQL Editor:

```sql
update public.profiles set role = 'admin', active = true where email = 'emailul-tau@exemplu.ro';
```

Editorii noi îi activezi la fel (`active = true`, rolul rămâne `editor`). Dacă ai creat utilizatori **înainte** de migrații, adaugă-le profilul cu
`insert into public.profiles (id, email) select id, email from auth.users on conflict do nothing;`.

### 4. Verifică securitatea

Rulează `supabase/checks/rls_check.sql` în SQL Editor. Dacă nu apare nicio eroare `FAIL: …`, toate regulile sunt respectate (editorul nu poate modifica evenimentele altora, nu poate șterge, nu-și poate schimba rolul etc.).

### 5. Variabile de mediu

Din **Project Settings → API** (sau **API Keys**) ia **Project URL** și cheia **anon / publishable** (cheia publică). **Nu** folosi niciodată cheia `service_role` / `secret` în frontend.

- **Local:** copiază `.env.example` în `.env.local` (fișierul e ignorat de git) și completează valorile. Apoi:
  - `npm run supabase:check`: citește evenimentele cu cheia publică și verifică faptul că un vizitator nu poate scrie
  - `npm run dev` și deschide `http://localhost:8080/dev/supabase` (pagină doar pentru dev, nu ajunge în producție)
- **Netlify:** Site configuration → Environment variables → adaugă `VITE_SUPABASE_URL` și `VITE_SUPABASE_ANON_KEY`, apoi fă un redeploy (Vite le include la build).

### 6. Pagina de evenimente și previzualizarea pe rețele (etapa 3)

- `/events` (tab-uri Active / Trecute, filtru `?type=milonga`) și `/events/<slug>`; în celelalte limbi `/en/events`, `/hu/events` ...
- Vechea adresă `/event` e redirecționată permanent (301) spre `/events` din `public/_redirects`.
- `netlify/edge-functions/event-meta/` pune titlul, descrierea și poza evenimentului în HTML-ul paginii `/events/<slug>`, ca Facebook/WhatsApp să afișeze o previzualizare corectă (ei nu rulează JavaScript). Folosește aceleași variabile `VITE_SUPABASE_URL` și `VITE_SUPABASE_ANON_KEY`: în Netlify, la fiecare variabilă, lasă **Scopes** pe „All scopes” (sau bifează și **Functions**). Dacă lipsesc, pagina merge normal, doar fără previzualizare personalizată.
- Verificare după deploy: lipește linkul unui eveniment în [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/).

### 7. Administrare evenimente (etapa 4)

- `/admin/login`: login cu email + parolă sau cu Google. Conturile se creează doar din Supabase (Authentication → Users → Add user), apoi se activează în `profiles` (`active = true`).
- `/admin`: lista evenimentelor (adminul le vede pe toate, editorul doar pe ale lui), căutare, ștergere (doar admin).
- `/admin/events/new` și `/admin/events/<id>`: formular cu un tab pe limbă (româna obligatorie), poză micșorată automat (max. 1600 px, WebP) încărcată în `event-images/<uid>/`, ciornă / publicat, previzualizare.
- Data și ora se aleg dintr-un calendar în română plus liste pentru oră și minute (din 5 în 5), mereu în ora României.
- Locația se poate alege pe hartă (OpenStreetMap + căutare Nominatim, gratuite, fără cont sau cheie): punctul ales se salvează în `latitude` / `longitude` (migrarea `20261010010000_event_coordinates.sql`), iar pe site linkul de locație deschide Google Maps exact acolo.
- Zona de admin e doar în română, nu e indexată de Google (`noindex` + `robots.txt`) și se încarcă separat de site.

**Setări în Supabase → Authentication → URL Configuration:**
- **Site URL**: `https://oradeatango.ro`
- **Redirect URLs**: `https://oradeatango.ro/admin`, `http://localhost:8080/admin` (și, pentru telefon, `http://192.168.100.101:8080/admin`)

**Login cu Google (opțional):**
1. [Google Cloud Console](https://console.cloud.google.com/) → proiect nou → *APIs & Services* → *OAuth consent screen*: tip **External**, numele aplicației „Tango Oradea”, emailul tău; publică aplicația (*Publish app*).
2. *Credentials* → *Create credentials* → *OAuth client ID* → tip **Web application**.
   - *Authorized JavaScript origins*: `https://oradeatango.ro`, `http://localhost:8080`
   - *Authorized redirect URIs*: adresa de callback afișată de Supabase la pasul 3 (de forma `https://<project-id>.supabase.co/auth/v1/callback`)
3. Supabase → Authentication → Sign In / Providers → **Google** → Enable, lipești *Client ID* și *Client Secret* → Save.
4. Te poți loga cu Google doar cu un email care are deja cont (înregistrarea publică e oprită).
5. Butonul „Continuă cu Google” apare doar cu `VITE_GOOGLE_LOGIN=true`, în `.env.local` și în Netlify (apoi redeploy).

### 8. Utilizatori și invitații (etapa 5)

- `/admin/users` (doar admin): lista conturilor, rol (editor / administrator), activ / inactiv, și „Adaugă o persoană”:
  - **Invitație pe email**: persoana primește un link și își alege parola (pagina `/admin/set-password`);
  - **Cont cu parolă**: alegi tu parola și i-o comunici (merge și fără email configurat).
- Pe login: „Am uitat parola” trimite un link de resetare. În admin: „Parola mea”.
- Baza de date nu permite să rămână zero administratori activi (migrarea `20261010020000_keep_an_admin.sql`).
- `netlify/functions/keep-supabase-awake.mjs` face o citire pe zi, ca proiectul Supabase gratuit să nu fie pus pe pauză.

**De făcut o singură dată:**

1. **Migrările**: rulează în SQL Editor `supabase/migrations/20261010020000_keep_an_admin.sql`, apoi `20261010030000_names.sql` (fiecare își poate schimba numele în „Contul meu”; pe site apare „Adăugat de …” la evenimentele publicate, doar numele, niciodată emailul).
2. **Funcția `invite-user`** (creează conturile; verifică pe server că ești admin):
   Supabase → **Edge Functions** → *Deploy a new function* → *Via Editor* → numele **`invite-user`** → înlocuiești codul cu conținutul fișierului `supabase/functions/invite-user/index.ts` → *Deploy*.
   Apoi, în *invite-user → Settings*, **dezactivează „Verify JWT”** (proiectele noi folosesc chei de semnare ES256, pe care această opțiune veche le respinge). Funcția verifică ea însăși că apelantul e administrator activ.
   (Sau cu CLI: `npx supabase functions deploy invite-user --no-verify-jwt`.)
3. **Redirect URLs** (Authentication → URL Configuration): adaugă `https://oradeatango.ro/**`, `http://localhost:8080/**` (și `http://192.168.100.101:8080/**`), ca linkurile din emailuri să poată reveni la `/admin/set-password`.
4. **Emailuri către oricine (pentru invitații / resetare parolă)**: serverul de email inclus în Supabase trimite doar către membrii echipei proiectului și foarte puține mesaje pe oră. Pentru invitații reale:
   - în contul Google `oradeatango@gmail.com`: *Securitate* → *Verificare în doi pași* (activată) → **Parole pentru aplicații** → creează una („Supabase”);
   - Supabase → Authentication → **Emails → SMTP Settings** → *Enable custom SMTP*: host `smtp.gmail.com`, port `465`, user `oradeatango@gmail.com`, parola = parola pentru aplicații, sender `oradeatango@gmail.com`, nume „Tango Oradea”.
   Până atunci, folosește „Cont cu parolă”.
5. **Textele emailurilor în română** (Authentication → Emails → Templates):
   - *Invite user* – subiect „Invitație în administrarea Tango Oradea”, conținut:
     `<p>Bună!</p><p>Ai fost invitat(ă) să adaugi evenimente pe oradeatango.ro.</p><p><a href="{{ .ConfirmationURL }}">Acceptă invitația și alege-ți parola</a></p>`
   - *Reset password* – subiect „Parolă nouă pentru Tango Oradea”, conținut:
     `<p>Ai cerut o parolă nouă pentru administrarea oradeatango.ro.</p><p><a href="{{ .ConfirmationURL }}">Alege parola nouă</a></p><p>Dacă nu ai cerut tu, ignoră acest email.</p>`
