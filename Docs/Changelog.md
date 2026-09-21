# Changelog

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
