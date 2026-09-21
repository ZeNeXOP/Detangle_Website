# Changelog

## v2.3

- Fix Cloudinary uploads failing on production: Render was missing the CLOUDINARY_* and SECRET_KEY environment variables
- Show the real error message when an upload fails instead of a generic "Upload failed"
- Split the event description into a short description and a long description
- Short description shows on the upcoming event section on the landing page
- Long description shows on the event's own page
- Make the whole upcoming event card on the landing page clickable, linking straight to that event's page
- Note: existing events need their Short/Long Description filled in again via the Edit tab (the old single description field is no longer used)

## v2.2

- Remove the description text from the upcoming event section on the landing page
- Add "Program" as a new event type option in the admin panel (Add and Edit)
- Note: run `python db.py` again after this update to let MongoDB accept the new "Program" type

## v2.1

- Fix production deployment: route /api requests through Vercel to the Render backend
- Add SPA fallback so /admin, /events, /book don't 404 on direct page load
- Document the Render backend migration in Setup.md
- Split admin panel into three tabs: Add, Edit, Delete
- Add tab: show a hint when adding a second upcoming event (triggers the two-event homepage layout)
- Edit tab: select an existing event and update any field (title, status, type, description, date, cutoff hours, location, price, WhatsApp text)
- Edit tab: replace or remove the poster, add or remove individual gallery photos/videos
- Delete tab: select an event, preview it, delete with a confirmation prompt
- Remove the old "Existing Event" option from Add (replaced by the Edit tab)
- Move shared admin logic (file upload, slug generation, fetching the events list) into shared helper files
