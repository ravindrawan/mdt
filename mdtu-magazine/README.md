# The Trainer — MDTU magazine desk

Trilingual (English, Sinhala, and Tamil) magazine publishing system for the Management Development and Training Unit of the North Western Provincial Council. The public name of the journal is The Trainer / පුහුණුකරු / பயிற்சியாளர். Public readers can open every published issue in the browser and download a print-ready A4 PDF. Staff file contributions. Editors review them and assemble a fixed 10-page issue.

Seeded articles are demonstration copy, not official Unit publications. The header on the site and the covers is the Unit’s official banner.

## Run

Requires Node.js 22 or newer (the app uses the built-in `node:sqlite` module).

```bash
npm install
npm start
```

Open http://127.0.0.1:3000 for the Unit website. The monthly journal, The Trainer, is at http://127.0.0.1:3000/journal.html.

| Desk | Email | Password |
| --- | --- | --- |
| Admin | admin | 123 |
| Contributor | nimal.perera@mdtu.local | Retreat#Staff1 |

Other seeded staff accounts use `Retreat#Staff1`. Delete `data/retreat.db` and restart to rebuild the demonstration data.

## What is included

- Public homepage with the current issue, highlights, archive, read-online flipbook and one-click PDF.
- Full-screen reader with page turns, keyboard arrows, swipe, thumbnails and a language switch.
- Contributor desk for six streams: training, language and external courses, foreign scholarships, milestones, creative work, and plans. Each piece is filed in both languages and tracked as draft, submitted, approved, returned or published.
- Admin desk for accounts (search, paging, create, edit, reset password, deactivate, delete), the editorial queue, and the magazine builder.
- Auto-assemble places approved pieces for that month onto the 10-page grid. Editors can also place, feature and remove pieces by hand, then publish or unpublish.
- Print engine at `/magazine/2026-10/print` using `@page { size: A4 portrait; margin: 0 }`. The PDF route asks the Chrome or Edge already installed on the machine to print that page. Set `CHROME_PATH` if the browser lives somewhere else. If no browser is available, Download opens the print view so the browser can save the PDF.

## Ten pages

1. Cover — full-bleed image, masthead, month, featured lines.
2. Leadership desk — Deputy Chief Secretary’s message, portrait, Director’s note, contents.
3. Training — month statistics and the lead programmes.
4. Training — hall and lab sessions.
5. Milestone and remaining practice.
6. Language and external courses (Bhasha and bahira patamala).
7. Foreign scholarships and attachments.
8. Creative corner — writing.
9. Creative corner — photo essay.
10. The month ahead, credits and the back cover.

## Database

The running app stores data in SQLite (`data/retreat.db`) with the tables in `src/schema.sql`: `users`, `categories`, `articles`, `programs`, `magazines`, `media`, `audit_log`.

Production schemas for the same model:

- `schema/mysql.sql`
- `schema/postgres.sql`

## Environment

- `PORT` — default `3000`
- `SESSION_SECRET` — session signing key
- `CHROME_PATH` — browser used for PDF rendering
