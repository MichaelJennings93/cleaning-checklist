# Azure · The cleaning companion

A mobile-friendly shared checklist for the cleaning pair at Azure Residences.

## Hosting and running

The frontend stays at https://michaeljennings93.github.io/cleaning-checklist/ and is published by GitHub Pages from the root of main. No build is needed.

Run `npm start` for the frontend on http://127.0.0.1:4173. Localhost connects to the separate service preview at http://127.0.0.1:5173, never the production database. Run `npm test` for unit checks. With the service preview running, run `node tests/service.integration.cjs` for database, access, and saved-report checks.

The backend source is maintained separately in the sibling azure-cleaning-service project. It runs on Sites with a managed D1 database. Production origin: https://azure-residence-care.michael726848.chatgpt.site.

## Behaviour

- One shared checklist, using the original room and task IDs.
- Monday and Thursday extras, plus monthly care on the first Monday.
- Non-scheduled dates retain the original Monday-list fallback and are explicitly labelled.
- Ticks save immediately to shared storage. Visible pages refresh every two seconds.
- Offline changes persist on the phone and retry automatically. A report cannot be marked saved while that phone's changes are waiting to sync.
- Save visit creates a dated snapshot of completed and outstanding tasks, notes, and supply selections. The snapshot stays unchanged if the live checklist is edited later.
- Save & WhatsApp saves first, then opens the prefilled message. The cleaner must tap Send in WhatsApp. The app does not claim delivery.
- Saved visits are available on both phones and can be downloaded as text reports.
- Notes and supply selections are local drafts until a report is saved.
- The original ticks-YYYY-MM-DD localStorage keys are retained and migrated without overwriting newer shared records.

## Access

As requested, this is an unlisted, account-free link, not a private website. Anyone who receives its address can use the shared checklist and history. The API issues scoped, expiring browser sessions to the allowed website origins. Its signing secret remains in the service's runtime environment, never in this public repository.

## Files

- data.js: original instructions, safety notes, room photos, video links, and supply list.
- core.js: Dubai calendar, task schedule, report text, local progress/outbox.
- cloud.js: persistent shared transport, retries, and save operations.
- app.js / styles.css: interface, photo guides, visit history, responsive layout.

## Photography

The coastal hero is Palm Jumeirah area photography, not a photograph of the Azure building.

- Nelemson Guevarra: https://unsplash.com/photos/a-beach-with-palm-trees-and-buildings-in-the-background-yOSMn_kpWLs
- Free under the Unsplash License: https://unsplash.com/license
- File: img/palm-coast.jpg. Credit also appears in the site footer.
- The apartment and sea-view photographs were retained from the original website.

