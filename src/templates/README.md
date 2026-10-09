# Șabloane (templates)

Cod păstrat ca model pentru evenimente cu înscriere, dar care nu mai apare pe pagina principală.
Textele sunt în `src/locales/<limbă>/legacy.json` (namespace-ul i18next `legacy`).

| Fișier | Ce este |
| --- | --- |
| `carolina/EventOradeaPage.tsx` | Pagina weekendului cu Carolina Jador (`/event`), cu program, prețuri și înscriere |
| `carolina/CarolinaRegistrationSection.tsx` | Formularul de înscriere al evenimentului (EmailJS + Google Sheets) |
| `registration/RegistrationSection.tsx` | Formularul de înscriere la cursurile de 3 luni (EmailJS + Google Sheets) |

## Cum reactivezi o pagină

În `src/App.tsx`, în interiorul rutei `/:lng?`, adaugi o linie:

```tsx
<Route path="eveniment-nou" element={<EventOradeaPage />} />
```

Ruta funcționează automat în toate limbile (`/eveniment-nou`, `/en/eveniment-nou` ...).

Un formular se reactivează punând componenta într-o pagină, de exemplu `<RegistrationSection />` în `src/pages/Index.tsx`.
