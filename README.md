# Azure · The cleaning companion

A mobile-friendly shared checklist for the cleaning pair at Azure Residences.

## Hosting and running

The frontend stays at https://michaeljennings93.github.io/cleaning-checklist/ and is published by GitHub Pages from the root of main. No build is needed.

Run `npm start` for the frontend on http://127.0.0.1:4173. Localhost connects to the separate service preview at http://127.0.0.1:5173, never the production database. Run `npm test` for unit checks. With the service preview running, run `node tests/service.integration.cjs` for database, access, and saved-report checks.

The backend source is maintained separately in the sibling azure-cleaning-service project. It runs on Sites with a managed D1 database. Production origin: https://azure-residence-care.michael726848.chatgpt.site.

## Behaviour

- One shared checklist, using the original room and task IDs.
- Monday and Thursday extras, plus monthly care on the first Monday.
- Full fountain water changes every 14 days on alternate Mondays, starting 2 November 2026 (2, 16, 30 November, 14 December, and so on). The normal fountain task stays on every visit. The new task is appended to preserve existing checkbox IDs and is included in the shared report only on its scheduled dates.
- Non-scheduled dates retain the original Monday-list fallback and are explicitly labelled.
- Ticks save immediately to shared storage. Visible pages refresh every two seconds.
- Offline changes persist on the phone and retry automatically. A report cannot be marked saved while that phone's changes are waiting to sync.
- Save visit creates a dated snapshot of completed and outstanding tasks, notes, and supply selections. The snapshot stays unchanged if the live checklist is edited later.
- Save & WhatsApp saves first, then opens the prefilled message. The cleaner must tap Send in WhatsApp. The app does not claim delivery.
- Saved visits are available on both phones and can be downloaded as text reports.
- Notes and supply selections are local drafts until a report is saved.
- Home repairs (`repairs.html`) is a shared, persistent snag list independent of visit dates. Jobs can be added, edited, assigned, moved between To do / In progress / Fixed, and reopened. Fixed jobs retain their completion date while fixed.
- Repairs refresh every three seconds while visible. Changes require a connection and show success only after the server confirms. Revision checks prevent one phone from silently overwriting another's edits; unchanged polls preserve focus and open forms.
- Find help opens a Google Maps trade search for Palm Jumeirah. It does not book or contact a contractor.
- Cleaning supplies (`supplies.html`) saves shared product/part requests, quantities, stock level and notes across visits. Coffee-machine filters and Shark StainForce spray are suggestions, not seeded requests. Needed / Ordered requests remain active; Restocked / No longer needed requests stay in History. Duplicate active item names are rejected atomically. Requests require a connection; failed edits remain in the open form.
- Each newly saved visit contains an immutable snapshot of active supply requests and includes them in its WhatsApp summary. A separate Send list to Michael button refreshes the shared list before opening WhatsApp; the cleaner still taps Send. Existing visit-only supply drafts remain accessible until cleared, while new requests use the shared area.
- Optional cupboard photos in Finish & report: take a photo or choose up to six per visit. Images are resized to 1800 px, exported as JPEG without original metadata, and saved to R2 through the authenticated service. Both phones refresh the list every five seconds. Pending or failed uploads block saving/changing dates until finished or discarded; keep the page open during uploads. Removing a visit photo does not change earlier saved reports. WhatsApp summaries link to the saved report and its photos; they do not attach image files automatically. Supplies shows the most recently uploaded visit’s photos.
- The original ticks-YYYY-MM-DD localStorage keys are retained and migrated without overwriting newer shared records.

## Access

As requested, this is an unlisted, account-free link, not a private website. Anyone who receives its address can use the shared checklist and history. The API issues scoped, expiring browser sessions to the allowed website origins. Its signing secret remains in the service's runtime environment, never in this public repository.

## Files

- data.js: original instructions, safety notes, room photos, video links, and supply list.
- core.js: Dubai calendar, task schedule, report text, local progress/outbox.
- cloud.js: persistent shared transport, retries, and save operations.
- app.js / styles.css: interface, photo guides, visit history, responsive layout.
- repairs.html / repairs.css / repairs.js / repairs-client.js: shared home repair list and editing flow. `node tests/repairs.integration.cjs` exercises creation, shared updates, conflicts and completion against the local service only.
- supplies.html / supplies.css / supplies.js: product and part requests, status history and WhatsApp sharing. `node tests/supplies.integration.cjs` verifies shared persistence, duplicate/race protection and report snapshots against loopback only.
- cupboard-photos.js / cupboard-photos.css: visit uploads, shared galleries and saved report photos. `node tests/photos.integration.cjs` verifies uploads, validation, retry/concurrency safety, date isolation and immutable photo snapshots against loopback only. The backend requires the BUCKET R2 binding and cupboard_photos D1 migration.

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

