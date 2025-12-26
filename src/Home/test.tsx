import AsyncStorage from "@react-native-async-storage/async-storage";

/* ─────────────────────────────── */
/* STORAGE KEYS                    */
/* ─────────────────────────────── */

const STORAGE_RUNNING_SHIFT = "runningShift";
const STORAGE_SESSIONS = "sessions";
const STORAGE_DAY_TOTALS = "dayTotals";
const STORAGE_WEEK_TOTALS = "weekTotals";
const STORAGE_MONTH_TOTALS = "monthTotals";

/* ─────────────────────────────── */
/* TYPES                           */
/* ─────────────────────────────── */

export type RunningShift = {
  startTimeMs: number;
  baseTodaySeconds: number;
};


export type Session = {
  id: string;
  startTimeMs: number;
  endTimeMs: number;
  durationSeconds: number;
  dateKey?: string;
};

/* ─────────────────────────────── */
/* DATE KEY HELPERS                */
/* ─────────────────────────────── */

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

function getDayKey(timeMs: number): string {
  const d = new Date(timeMs);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function getWeekKey(timeMs: number): string {
  const d = new Date(timeMs);
  const date = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  const mondayIndex = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - mondayIndex + 3);

  const year = date.getFullYear();
  const jan4 = new Date(year, 0, 4);
  const diffMs = date.getTime() - jan4.getTime();
  const week = 1 + Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));

  return `${year}-W${pad2(week)}`;
}

function getMonthKey(timeMs: number): string {
  const d = new Date(timeMs);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
}

/* ─────────────────────────────── */
/* STORAGE HELPERS                 */
/* ─────────────────────────────── */

async function loadObject(key: string, fallback: any) {
  const raw = await AsyncStorage.getItem(key);
  return raw ? JSON.parse(raw) : fallback;
}

async function saveObject(key: string, value: any) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

/* ─────────────────────────────── */
/* START SHIFT                     */
/* ─────────────────────────────── */

export async function startShift(startDate: Date) {
  const dayTotals = await loadObject(STORAGE_DAY_TOTALS, {});
  const todayKey = getDayKey(startDate.getTime());

  const runningShift = {
    startTimeMs: startDate.getTime(),
    baseTodaySeconds: dayTotals[todayKey] || 0,
  };

  await saveObject(STORAGE_RUNNING_SHIFT, runningShift);
  return runningShift;
}


/* ─────────────────────────────── */
/* END SHIFT                       */
/* ─────────────────────────────── */

export async function endShift() {
  const runningShift: RunningShift | null = await loadObject(
    STORAGE_RUNNING_SHIFT,
    null
  );

  const endTimeMs = Date.now();

  const session: Session = {
    id: String(endTimeMs),
    startTimeMs: runningShift!.startTimeMs,
    endTimeMs,
    durationSeconds: Math.floor(
      (endTimeMs - runningShift!.startTimeMs) / 1000
    ),
  };

  const sessions: Session[] = await loadObject(STORAGE_SESSIONS, []);
  const dayTotals = await loadObject(STORAGE_DAY_TOTALS, {});
  const weekTotals = await loadObject(STORAGE_WEEK_TOTALS, {});
  const monthTotals = await loadObject(STORAGE_MONTH_TOTALS, {});

  sessions.push(session);

  /* Split the session across local midnights */
  let cursorTime = session.startTimeMs;

  while (cursorTime < session.endTimeMs) {
    const currentDate = new Date(cursorTime);

    const nextMidnightMs = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate() + 1
    ).getTime();

    const chunkEndMs = Math.min(session.endTimeMs, nextMidnightMs);
    const chunkSeconds = Math.floor(
      (chunkEndMs - cursorTime) / 1000
    );

    const dayKey = getDayKey(cursorTime);
    const weekKey = getWeekKey(cursorTime);
    const monthKey = getMonthKey(cursorTime);

    dayTotals[dayKey] = (dayTotals[dayKey] || 0) + chunkSeconds;
    weekTotals[weekKey] = (weekTotals[weekKey] || 0) + chunkSeconds;
    monthTotals[monthKey] = (monthTotals[monthKey] || 0) + chunkSeconds;

    cursorTime = chunkEndMs;
  }

  await saveObject(STORAGE_SESSIONS, sessions);
  await saveObject(STORAGE_DAY_TOTALS, dayTotals);
  await saveObject(STORAGE_WEEK_TOTALS, weekTotals);
  await saveObject(STORAGE_MONTH_TOTALS, monthTotals);
  await AsyncStorage.removeItem(STORAGE_RUNNING_SHIFT);

  return session;
}

/* ─────────────────────────────── */
/* SNAPSHOT (FOR UI)               */
/* ─────────────────────────────── */

export async function getSnapshot() {
  const runningShift: RunningShift | null = await loadObject(
    STORAGE_RUNNING_SHIFT,
    null
  );

  const dayTotals = await loadObject(STORAGE_DAY_TOTALS, {});
  const weekTotals = await loadObject(STORAGE_WEEK_TOTALS, {});
  const monthTotals = await loadObject(STORAGE_MONTH_TOTALS, {});

  const nowMs = Date.now();

  return {
    running: runningShift,
    elapsedSeconds: runningShift
      ? Math.floor((nowMs - runningShift.startTimeMs) / 1000)
      : 0,
    totals: {
      todaySeconds: dayTotals[getDayKey(nowMs)] || 0,
      thisWeekSeconds: weekTotals[getWeekKey(nowMs)] || 0,
      thisMonthSeconds: monthTotals[getMonthKey(nowMs)] || 0,
    },
  };
}
