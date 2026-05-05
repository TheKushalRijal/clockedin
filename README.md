# Clockin – Time Tracking App

A **shift/time tracking** app built with **React Native** and **Expo**. Users can clock in/out, track hours worked, and view detailed reports.

---

## Architecture & Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | React Native 0.81.5 + Expo 54 |
| **Navigation** | React Navigation (native stack) |
| **Storage** | AsyncStorage |
| **UI** | LinearGradient, BlurView, Animated API |
| **Icons** | @expo/vector-icons (Ionicons, MaterialCommunityIcons) |

---

## App Structure

```
App.tsx
├── Home Screen (Homepage.tsx)
│   ├── Header (greeting + "Hard working Man")
│   ├── ClockCard (status, timer, stats)
│   ├── ClockActionButton (Clock In/Out + timesheet)
│   └── WeeklyReport (bar chart + link to Details)
│
└── Details Screen (detailspage.tsx)
    └── Reports (Daily/Weekly/Monthly)
```

---

## Features

### 1. Clock In / Clock Out
- One-tap clock in/out with green (Clock In) and red (Clock Out) buttons
- Live timer updates every second while clocked in
- Uses current time for start/end timestamps

### 2. Time Display
- **Main timer**: HH:MM:SS format (running session or today's total)
- **Stats**: This Week, Last Week, 2 Weeks Ago, Last Month (H:MM format)
- Status indicator: CLOCKED IN / CLOCKED OUT

### 3. Weekly Bar Chart
- Bar chart showing Mon–Sun of the current week
- Color-coded bars per day
- Total hours and average per day
- Chevron button to navigate to Details screen

### 4. Timesheet Management
- Opens from the ⏱ icon next to the Clock In/Out button
- Lists all days with recorded hours
- **Change**: Edit hours for a specific day (creates synthetic session)
- **Delete**: Remove all hours for a day
- Data persists and rollups are rebuilt after edits

### 5. Reports / Details Screen
- **Mode selector**: Daily, Weekly, Monthly
- **Time distribution**: List of dates/periods with hours
- **Animated bars**: Proportional to max hours
- **Stats cards**: Total Hours, Avg/Day, Peak Day
- Dark theme with gradient accents

### 6. Data Persistence
- **timerlogic.tsx** handles:
  - Running shift (start time, base today seconds)
  - Sessions (start, end, duration, day/week/month keys)
  - Rollups: day (YYYY-MM-DD), week (YYYY-Www), month (YYYY-MM)
- Uses AsyncStorage with `tt:`-prefixed keys
- Sessions spanning midnight are split across days correctly
- Rollups can be rebuilt from sessions if needed

### 7. UI / UX
- Time-of-day greeting (Morning/Afternoon/Evening)
- Fade and slide animations on load
- Spring animations on bar chart
- Blurred background (ImageBackground with blur)
- Dark theme with cyan/teal accents

---

## Data Flow

1. **Clock In** → `startShift()` stores running shift in AsyncStorage
2. **Clock Out** → `endShift()` creates a session, updates rollups, clears running shift
3. **UI** → `getSnapshot()` and `getAllRollups()` read current state and rollups
4. **Edit/Delete** → `timechangemutator.tsx` modifies sessions and rebuilds rollups

---

## Getting Started

### Prerequisites
- Node.js
- Yarn or npm
- Expo CLI
- iOS Simulator / Android Emulator (or Expo Go app)

### Installation

```bash
# Install dependencies
yarn install
# or
npm install
```

### Running the App

```bash
# Start Expo development server
yarn start
# or
npm start

# Run on Android
yarn android
# or
npm run android

# Run on iOS
yarn ios
# or
npm run ios

# Run on web
yarn web
# or
npm run web
```

---

## Project Structure

```
fans/
├── App.tsx                 # Root app with navigation
├── index.ts                # Entry point
├── app.json                # Expo config
├── package.json
├── assets/                  # Images, icons
└── src/
    ├── Home/
    │   ├── Homepage.tsx     # Main home screen
    │   ├── header.tsx       # Greeting header
    │   ├── clockbutton.tsx  # Clock In/Out button
    │   ├── showhours.tsx    # Time display card
    │   ├── weekgraph.tsx    # Weekly bar chart
    │   ├── timerlogic.tsx   # Core time tracking logic
    │   ├── timepeakerlogic.tsx  # Timesheet modal
    │   └── timechangemutator.tsx # Edit/delete hours
    └── page/
        └── detailspage.tsx # Reports screen
```

---

## Notes

- `test.tsx` appears to be legacy/alternate timer logic and is not used in the main flow
- `@react-native-community/datetimepicker` is in dependencies but not currently used in the codebase
- The background image uses `uri: "./assets/mywallpaper.jpg"` — this may need to be changed to `require()` for proper bundling in React Native
