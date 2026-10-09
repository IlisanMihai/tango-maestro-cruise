-- Seed: the Carolina Jador weekend in Oradea (texts from src/i18n/translations.ts, carolina.*).
-- Runs automatically on `supabase db reset` (local) or with `supabase db push --include-seed`;
-- can also be pasted into the SQL editor. Safe to run twice.

insert into public.events (
  slug, type, start_at, end_at, title, summary, content,
  location, external_url, status, created_by
)
values (
  'carolina-jador-oradea-2026',
  'workshop',
  '2026-05-23 13:00:00+03',  -- Saturday, Workshop 1 (Europe/Bucharest, EEST)
  '2026-05-24 17:45:00+03',  -- Sunday, end of Workshop 4
  jsonb_build_object(
    'ro', 'Weekend intensiv de Tango cu Carolina Jador',
    'en', 'Intensive tango weekend with Carolina Jador',
    'hu', 'Intenzív tangó hétvége Carolina Jadorral',
    'es', 'Fin de semana intensivo de tango con Carolina Jador',
    'sk', 'Intenzívny tango víkend s Carolinou Jador'
  ),
  jsonb_build_object(
    'ro', '4 Workshop-uri + 1 Milonga cu 2 TDJ argentinieni pentru o experiență autentică de tango.',
    'en', '4 Workshops + 1 Milonga with 2 argentinians TDJ for an authentic tango experience.',
    'hu', '4 workshop + 1 milonga 2 argentin TDJ-vel egy autentikus tangó élményért.',
    'es', '4 Talleres + 1 Milonga con 2 TDJ argentinos para una experiencia de tango auténtica.',
    'sk', 'Štyri workshopy a jedna milonga s dvomi TDJ-mi z Argentíny pre autentický zážitok z tanga.'
  ),
  jsonb_build_object(
    'ro', 'Carolina Jador este o dansatoare și profesoare de tango argentinian cu aproape 30 de ani de experiență. Și-a dezvoltat activitatea artistică atât în Argentina, cât și la nivel internațional, ca profesoare, coregrafă, DJ și organizatoare de evenimente de tango.',
    'en', 'Carolina Jador is an Argentine tango dancer and teacher with nearly 30 years of experience. She develops her artistic activity both in Argentina and internationally as a teacher, choreographer, DJ, and tango event organizer.',
    'hu', 'Carolina Jador egy argentin tangó táncos és tanár, csaknem 30 év tapasztalattal. Tanár, koreográfus, DJ és tangó eseményszervező szakmai tevékenységeit Argentínában és nemzetközileg is végzi.',
    'es', 'Carolina Jador es una bailarina y profesora de tango argentino con casi 30 años de trayectoria en la danza. Desarrolla su actividad artística como profesora, coreógrafa, musicalizadora y organizadora de eventos de tango en Argentina y en el exterior.',
    'sk', 'Carolina Jador je argentínska tanečnica a učiteľka tanga s takmer 30-ročnými skúsenosťami. Svoju umeleckú činnosť rozvíjala v Argentíne aj medzinárodne ako učiteľka, choreografka, DJ-ka a organizátorka tango podujatí.'
  ),
  'Feeling Dance Studio, Strada Vasile Alecsandri nr 12, Oradea, Bihor',
  'https://oradeatango.ro/event',
  'published',
  null
)
on conflict (slug) do nothing;
