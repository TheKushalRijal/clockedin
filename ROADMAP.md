# Clockin — Feature Roadmap

Informed by competitor research (Toggl Track, Clockify, Harvest) and user review analysis (2026).
Tasks ranked by user impact. Ship in order.

---

## Competitor Gap Analysis

| Feature | Toggl | Clockify | Harvest | Clockin |
|---|---|---|---|---|
| Break tracking | ✅ | ✅ | ✅ | ❌ |
| Push notifications | ✅ | ✅ | ✅ | ❌ |
| Projects / tags | ✅ | ✅ | ✅ | ❌ |
| Export CSV / PDF | ✅ | ✅ | ✅ | ❌ |
| Earnings / billing rate | ✅ | ✅ | ✅ | ❌ |
| Manual time entry | ✅ | ✅ | ✅ | partial (edit only) |
| Home screen widget | ✅ | ✅ | ❌ | ❌ |
| Idle detection | ✅ | ❌ | ❌ | ❌ |
| Offline mode | ✅ | ✅ | ❌ | ✅ (AsyncStorage) |
| Dark mode | ✅ | ✅ | ❌ | ✅ |
| Daily/weekly reports | ✅ | ✅ | ✅ | ✅ |
| Calendar view | ✅ | ❌ | ❌ | ❌ |
| Invoicing | ❌ | ❌ | ✅ | ❌ |
| Pomodoro timer | ✅ | ❌ | ❌ | ❌ |
| Apple Watch support | ✅ | ❌ | ❌ | ❌ |

**Key insight:** Clockin is missing every feature that competitors consider table stakes.
The first 5 gaps below are what users search for and leave reviews about.

---

## Priority 1 — Break Tracking
**Seen in:** Toggl, Clockify, Harvest
**Why critical:** "Start Break / End Break" is the #1 complaint in reviews of apps that lack it.
Shift workers, office workers, and hourly employees all need break deduction.
Without it, reported hours are inaccurate and users abandon the app.

- [ ] "Start Break" / "End Break" button appears only while clocked in
- [ ] Break time tracked separately and deducted from shift duration automatically
- [ ] Break duration shown in today's clock card and session details
- [ ] Multiple breaks per shift supported

---

## Priority 2 — Push Notifications
**Seen in:** Toggl, Clockify, Harvest
**Why critical:** 92% of time tracking users rate notifications as critical (Capterra 2026).
Users forget the app exists between shifts. Notifications are the retention engine.

- [ ] "Forgot to clock out?" alert — fires if clocked in for 12+ hours
- [ ] Daily clock-in reminder at a user-configured time ("Remind me at 9:00 AM")
- [ ] Weekly summary push every Monday ("You worked 38.5h last week")
- [ ] Notification settings screen (enable/disable each type, set time)

---

## Priority 3 — Earnings Calculator
**Seen in:** Toggl, Clockify, Harvest
**Why critical:** Turns abstract hours into money. Makes the app emotionally engaging.
Freelancers and contractors specifically search for this — huge App Store keyword.

- [ ] Hourly rate input in settings (optional, off by default)
- [ ] Show `hours × rate = $earned` on home screen clock card when rate is set
- [ ] Show earnings per entry in reports screen
- [ ] Support multiple currencies

---

## Priority 4 — Export (CSV / PDF)
**Seen in:** Toggl, Clockify, Harvest
**Why critical:** Without export, the app is a dead end. Freelancers need timesheets for
invoicing. Contractors need records for payroll. This unlocks the highest-value user segment.

- [ ] Export sessions to CSV (date, start, end, duration, break, earnings)
- [ ] Generate PDF timesheet (date range picker, total hours, optional earnings)
- [ ] Share via iOS/Android share sheet (email, Files, AirDrop, etc.)

---

## Priority 5 — Manual Time Entry
**Seen in:** Toggl, Clockify, Harvest
**Why critical:** Users forget to clock in. Real apps let you add past shifts manually.
Currently Clockin only lets users edit a day's total — not add a full shift with start/end times.

- [ ] "Add shift" button to manually enter past start and end times
- [ ] Date + time pickers for start and end
- [ ] Validates no overlap with existing sessions
- [ ] Shows manual entries in reports the same as real-time entries

---

## Priority 6 — Projects / Tags
**Seen in:** Toggl, Clockify
**Why critical:** Users with multiple clients or job types need to split hours.
Also the foundation for the earnings feature (different rates per project).

- [ ] User creates and names projects with a color
- [ ] Clock in optionally selects a project
- [ ] Weekly bar chart shows stacked breakdown by project
- [ ] Filter reports by project
- [ ] Per-project hourly rate (ties into earnings calculator)

---

## Priority 7 — Home Screen Widget
**Seen in:** Toggl, Clockify
**Why critical:** Most requested feature in time tracking app reviews (Capterra 2026).
A live timer on the home screen is visible to others — organic word-of-mouth.

- [ ] Small widget: clocked in/out status + elapsed time
- [ ] Medium widget: status + elapsed time + today's total hours
- [ ] Tap widget opens app directly to clock in/out
- [ ] Widget updates every minute when clocked in

---

## Priority 8 — Daily Goal + Progress Ring
**Seen in:** Various fitness/habit apps applied to time tracking
**Why critical:** Goals create daily opens and build habit loops.
Users are more likely to keep using an app when they're working toward something.

- [ ] User sets a daily hours target in settings (e.g. 8h)
- [ ] Circular progress ring on home screen fills as the day progresses
- [ ] Ring color changes: gray → teal → green when goal is hit
- [ ] Optional celebration animation when goal is reached

---

## Priority 9 — Shareable Weekly Report Card
**Why critical:** Viral loop. Users post these on Instagram/LinkedIn. Others ask what app it is.
Zero marketing cost.

- [ ] "Share" button on the weekly bar chart
- [ ] Generates a clean branded image (chart + weekly total + app name/logo)
- [ ] Share via iOS/Android share sheet

---

## Priority 10 — Calendar View
**Seen in:** Toggl Track
**Why critical:** Power users want to see their time as blocks in a calendar.
Visual density helps users spot gaps and overtime at a glance.

- [ ] Month calendar view with color-coded day intensity (more hours = darker)
- [ ] Tap a day to see all shifts for that day
- [ ] Accessible from the reports screen

---

## Priority 11 — Idle Detection
**Seen in:** Toggl Track
**Why useful:** Prevents inflated hours when the user forgets to clock out and walks away.
Detects inactivity (screen off / no interaction) and prompts to discard idle time.

- [ ] Detect when device is inactive for 10+ minutes while clocked in
- [ ] Show prompt: "You were away for X minutes — discard this time?"
- [ ] User chooses to keep or trim the idle period

---

## Not building yet

- Cloud sync / accounts — adds onboarding friction, wrong stage
- Team / multi-user features — wrong audience
- Invoicing — Harvest owns this; too complex to compete
- Apple Watch — low ROI until user base grows
- Pomodoro timer — different use case, different audience
- AI summaries — no real utility at this scale

---

## Sources

Research based on:
- [Toggl Track Features](https://toggl.com/track/features/)
- [Clockify Features](https://clockify.me/features/)
- [Zapier: Best Time Tracking Apps 2026](https://zapier.com/blog/best-time-tracking-apps/)
- [Capterra: Best Time Tracking Software 2026](https://www.capterra.com/time-tracking-software/)
- [The Digital Project Manager: 23 Best Time Tracking Apps 2026](https://thedigitalprojectmanager.com/tools/best-time-tracking-app/)
