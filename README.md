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

## Green Lion grill brush guide

Added the owner's front/back GL-CB5 box photos on 31 October 2026, optimized for mobile and with EXIF metadata removed. Original NAS files: `20261031_185513.jpg` and `20261031_185523.jpg`. The other uploaded front view was a duplicate.

The operating steps follow Green Lion's GL-CB5 manual: https://www.greenlion.net/blog/green-lion-guides-183/gncb5grilbrbk-2898. The household's existing gas-off/cold-grill instruction is retained. The three-minute video is Grillion's official tutorial for a similar rotary brush, explicitly labelled as a different model: https://www.youtube.com/watch?v=9ycJS4dVpus. The note beside the video directs cleaners to this guide and clarifies cold grill, plain water and hand-rinsing; the video differs on these points. Task order and IDs remain unchanged to preserve saved ticks.

## Shark StainForce HX101 guide

Added 31 October 2026 from the owner's Amazon listing (ASIN B0FLDZGB5D). A visible equipment card appears under Living room → Sofa and Shared areas → Floors touch-up. It opens the product photo with use, fabric checks, self-rinse and aftercare instructions. These supplement existing tasks without changing IDs, schedules, task counts or stored visits.

- Product and photo source: https://www.sharkninja.com/shark-stainforce-cordless-portable-spot-spill-cleaner/HX101.html
- Manufacturer image: https://assets.sharkninja.com/image/upload/f_auto/q_auto/SharkNinja-NA/HX101_01.jpg. Served locally as `img/shark-stainforce.jpg`, optimized to 1000 × 1000 for mobile, with source credit in the guide.
- Official usage video, Shark Home: https://www.youtube.com/watch?v=uecQ3ylcVos
- Official maintenance video, Shark Home UK (2:35): https://www.youtube.com/watch?v=-WyoxLZ8NF8
- Shark's StainForce HX100-series manual (UK edition, manufacturer-distributed PDF): https://media.flixcar.com/webp/synd-asset/Shark-390018373-ViewProductAttachment-OpenFile-LocaleId--DirectoryPath--FileName-HX100UKTplusIB.pdf

The care video/manual cover the StainForce product family; regional accessories may differ. No region-specific voltage, charging time or warranty claims are used. The household Eight Sleep restriction is retained. Product photo is a manufacturer image, not an owner photograph or an assertion of a free image licence.

