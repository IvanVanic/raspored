# Raspored

Osobni raspored i rokovi za ljetni semestar 2025./26. na FIDIT-u (Sveučilišni prijediplomski studij Informatika).

Built with Next.js 16 + React 19 + Tailwind v4. Dark-only. Mobile-first (Samsung S24 Ultra is the reference viewport), desktop grid for anything wider.

## What it shows

- **Raspored** — dnevni raspored predavanja i vježbi po tjednu (1–15), auto-skače na sljedeći tjedan u petak navečer / vikendom.
- **Rokovi** — agenda svih kolokvija, kviza, obrana, kontrolnih zadaća i ispitnih rokova, grupirano po datumu, s filterima po kolegiju i tipu.
- **Semestar** — mjesečni kalendar (ožujak–lipanj) s event-pillovima po danu i detaljnim panelom kad tapneš dan.

## Running

```bash
npm install
npm run dev
```

Live na `http://localhost:3000`.

## Data

Sve ulazne podatke drži `src/data/`:

- `schedule-data.json` — generirano iz `update-course-data.bat` / moodle-dl, sadrži slotove, grupe, date_overrides, online sesije.
- `curriculum.ts` — po kolegiju: tjedne teme (predavanje/vježba), grading shema, ispitni rokovi.
- `resources.ts` — linkovi na materijale.

Kritične datume regex ekstrakcija u `src/lib/extraction.ts` hvata iz teksta tjedna i grading nota.

## Structure

```
src/
  app/          Next.js app router (single page)
  components/
    calendar/   Rokovi agenda
    layout/     TopBar, BottomTabBar
    schedule/   DayView, DesktopGrid, SlotCard, CourseModal, NextClassStrip
    shared/     Dropdown, MetaSep
    timeline/   SemesterTimeline (bottom-sheet mjesečni kalendar)
  data/         Schedule JSON + curriculum + types
  hooks/        useTemporalContext, useSwipe, useKeyboard
  lib/          date-utils, extraction, labels, schedule-utils
```
