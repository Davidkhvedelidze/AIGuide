# AI Tour Guide: product requirements (MVP)

## Problem

A visitor in Tbilisi stands in front of a building and wants to know what it is and why it matters, now, without reading a long article. General tools (Google Lens, chat assistants with a camera) can name the building, but they give generic text, sometimes wrong, with no audio made for walking.

## Who it is for

Independent visitors to Tbilisi who explore on foot, plus locals showing the city to guests. English first, Georgian second.

## Why this can win against free general tools

1. **Trust.** Stories are written only from facts with sources, and a person reviews each place before it is published. Sources are visible in the app.
2. **Made for walking.** A one to three minute narration with transcript, playable with the phone in a pocket.
3. **Local depth.** One city done properly beats the whole world done thinly. Expansion is city by city.

## Core loop

Open app, point camera, tap. The app proposes the place (or asks the user to choose between nearby candidates), the user listens, saves the place, and sees what else is within walking distance.

## MVP scope

| Area | In |
| --- | --- |
| Scan | Camera capture, location-narrowed recognition, three outcomes: recognised, choose from candidates, not recognised. Daily limit for free users. |
| Place | Name, period, summary, audio guide, highlights, nearby places, sources, draft marker for unreviewed content. |
| Audio | Play, pause, ±15 s, speed, transcript with current sentence, mini-player across tabs, resume. Narrated file when available, phone voice otherwise. |
| Map | Places on a map, category filter, list sorted by distance. |
| Library | Save, collections, history, basic stats. Works offline on the device, syncs when signed in. |
| Account | Guest by default, email code sign-in, delete account and data. |
| Pro | Unlimited scans. Entitlement checked on the server. |
| Languages | English, Georgian. |

## Not in the MVP

AR view, 3D map, social features, user-generated content, countries/badges gamification, trip planning, cities other than Tbilisi, a "Trips" tab.

## Quality bars

- **Recognition:** on a labelled set of real photos, confidently wrong answers under 2%; correct or in-candidates at least 85% (`npm run eval:scan`).
- **Content:** zero validator errors; every published place reviewed by a person.
- **Accessibility:** WCAG AA contrast, 44pt targets, labels on every control.
- **Cost:** audio generated once per place and language, then cached. One vision call per scan.

## Success metrics (first 8 weeks after launch)

- Scan to listen conversion (scan attempt ends in audio started): 60%+
- Audio completion rate: 50%+
- Day-7 retention among users with one successful scan: 15%+ (most users are short-stay visitors, so also track scans per active day)
- Free to Pro conversion among users who hit the limit: measure first, then set a target

## Open decisions (owner: product)

- Final app name. "AI Tour Guide" is generic and hard to find or trademark.
- Pro pricing and whether there is a short "trip pass" (3 or 7 days) for visitors, which may fit better than a monthly subscription.
- Georgian narration: which voice provider sounds acceptable. Test with native speakers before shipping Georgian audio.
- Bundle identifier, developer accounts, privacy policy URL, support email.
