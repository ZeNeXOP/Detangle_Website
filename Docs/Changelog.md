# Changelog

## v3.0

- Full frontend redesign: same page structure and palette (cream/teal/yellow), refreshed with real typography (Fraunces/Work Sans/JetBrains Mono) and a subtle neobrutalist accent (hard borders + offset shadows on buttons, cards, chips and the nav) — kept deliberately restrained, everything else stays soft and calm
- Rebuilt the navbar as a sticky bar with a proper mobile hamburger menu, replacing the old floating pill that wrapped and overlapped page headings on small screens
- Landing hero is full-height again; the upcoming-events section is now a pair of wide horizontal panels (poster + info side by side), alternating sides between the two events, on both desktop and mobile
- Services grid expanded from 4 to 8: Therapy Sessions (now explicitly online + in person), Reiki, Sound Healing, Aura Cleansing, Chakra Balancing, Dedicated Programs, Workshops & Events, Group Sessions
- Added a "Level 3 Reiki Practitioner / teacher-training eligible" qualification to the About page
- Book a Session page: added a short reassurance panel (Noopur's photo + a 24-hour response note) and a privacy line under the form
- Blog listing is now a single column of larger, more readable cards
- Blog posts and event long descriptions now support **bold**, *italic*, and "- " bullet lists, and correctly preserve line breaks and paragraph spacing — previously everything collapsed into one run-on paragraph. Admin forms show a hint with the supported syntax
- Widened the content column on the Events and Blog pages (less dead space on the sides)
- Admin panel: same layout, restyled with the new tokens

## v2.4

- Add a Blog feature: Noopur can now publish articles (title, subtitle, short description, full content, date)
- Add "Blog" to the navbar, with a listing page and individual post pages
- Blog list cards show title, subtitle, date, and short description; full content only shows on the post's own page
- Content is plain text (paragraph breaks preserved) — no rich text/markdown for now
- Add a second content-type switcher to the admin panel (Events / Blog), each with its own Add/Edit/Delete tabs
- Note: run `python db.py` again after this update to create the new blog_posts collection's schema

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
