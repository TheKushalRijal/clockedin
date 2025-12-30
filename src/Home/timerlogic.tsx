import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Production-friendly time tracking for shifts.
 * - Stores a running shift (if any)
 * - Stores completed sessions
 * - Stores rollups for day/week/month for fast UI
 *
 * Notes:
 * - All times stored as UTC epoch milliseconds.
 * - Rollups use device-local calendar boundaries (day/week/month).
 */

const STORAGE_KEYS = {
  RUNNING: "tt:runningShift",
  SESSIONS: "tt:sessions",
  ROLLUP_DAY: "tt:rollup:day",
  ROLLUP_WEEK: "tt:rollup:week",
  ROLLUP_MONTH: "tt:rollup:month",
  VERSION: "tt:version",
} as const;

const SCHEMA_VERSION = 1;

export type ShiftSession = {
  id: string;
  startMs: number; // epoch ms
  endMs: number; // epoch ms
  durationSec: number; // rounded down
  // Useful denormalized keys for grouping quickly:
  dayKey: string; // YYYY-MM-DD (local)
  weekKey: string; // YYYY-Www (local, Monday-based)
  monthKey: string; // YYYY-MM (local)
};

export type RunningShift = {
  startMs: number;
  startedAtDayKey: string;
  baseTodaySec: number; // ← how much was already worked today
};


export type RollupMap = Record<string, number>; // key -> total seconds

function safeJsonParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function nowMs() {
  return Date.now();
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

/** Local day key YYYY-MM-DD */
export function getDayKeyLocal(ms: number) {
  const d = new Date(ms);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/**
 * Monday-based week key in local time: YYYY-Www
 * (ISO-ish; week starts Monday. Good enough for timesheets.)
 */
export function getWeekKeyLocal(ms: number) {
  const d = new Date(ms);
  // Copy date at local midnight
  const date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  // JS: Sunday=0..Saturday=6. Convert to Monday=0..Sunday=6
  const day = (date.getDay() + 6) % 7;

  // Thursday trick for ISO week-year alignment
  date.setDate(date.getDate() - day + 3);
  const weekYear = date.getFullYear();

  // Week 1 is the week with Jan 4th in it
  const jan4 = new Date(weekYear, 0, 4);
  const jan4Day = (jan4.getDay() + 6) % 7;
  const week1Thursday = new Date(weekYear, 0, 4 - jan4Day + 3);

  const diffMs = date.getTime() - week1Thursday.getTime();
  const week = 1 + Math.round(diffMs / (7 * 24 * 60 * 60 * 1000));

  return `${weekYear}-W${pad2(week)}`;
}

/** Local month key YYYY-MM */
export function getMonthKeyLocal(ms: number) {
  const d = new Date(ms);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
}

function makeId() {
  // Stable enough for production without deps.
  return `${nowMs()}-${Math.random().toString(16).slice(2)}`;
}

function clampNonNegative(n: number) {
  return Number.isFinite(n) && n > 0 ? n : 0;
}

async function ensureSchema() {
  const vRaw = await AsyncStorage.getItem(STORAGE_KEYS.VERSION);
  const v = vRaw ? Number(vRaw) : 0;
  if (v === SCHEMA_VERSION) return;

  // If schema changes in future, migrate here.
  await AsyncStorage.setItem(STORAGE_KEYS.VERSION, String(SCHEMA_VERSION));
}

/** Reads and validates rollup maps */
async function readRollup(key: string): Promise<RollupMap> {
  const raw = await AsyncStorage.getItem(key);
  const map = safeJsonParse<RollupMap>(raw, {});
  // sanitize values
  for (const k of Object.keys(map)) {
    map[k] = clampNonNegative(map[k]);
  }
  return map;
}

async function writeRollups(day: RollupMap, week: RollupMap, month: RollupMap) {
  await AsyncStorage.multiSet([
    [STORAGE_KEYS.ROLLUP_DAY, JSON.stringify(day)],
    [STORAGE_KEYS.ROLLUP_WEEK, JSON.stringify(week)],
    [STORAGE_KEYS.ROLLUP_MONTH, JSON.stringify(month)],
  ]);
}

/** Adds seconds to rollup maps for the keys derived from startMs (shift grouped by its start day/week/month) */
function addToRollups(
  startMs: number,
  secondsToAdd: number,
  day: RollupMap,
  week: RollupMap,
  month: RollupMap
) {
  const dayKey = getDayKeyLocal(startMs);
  const weekKey = getWeekKeyLocal(startMs);
  const monthKey = getMonthKeyLocal(startMs);

  day[dayKey] = clampNonNegative((day[dayKey] ?? 0) + secondsToAdd);
  week[weekKey] = clampNonNegative((week[weekKey] ?? 0) + secondsToAdd);
  month[monthKey] = clampNonNegative((month[monthKey] ?? 0) + secondsToAdd);
}

async function readSessions(): Promise<ShiftSession[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.SESSIONS);
  const sessions = safeJsonParse<ShiftSession[]>(raw, []);
  // sanitize + drop invalid sessions
  const cleaned = sessions.filter((s) => {
    return (
      s &&
      typeof s.id === "string" &&
      Number.isFinite(s.startMs) &&
      Number.isFinite(s.endMs) &&
      s.endMs >= s.startMs &&
      Number.isFinite(s.durationSec) &&
      s.durationSec >= 0
    );
  });
  return cleaned;
}

async function writeSessions(sessions: ShiftSession[]) {
  await AsyncStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
}

async function readRunning(): Promise<RunningShift | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.RUNNING);
  const r = safeJsonParse<RunningShift | null>(raw, null);
  if (!r) return null;
  if (!Number.isFinite(r.startMs) || r.startMs <= 0) return null;
  if (typeof r.startedAtDayKey !== "string") return null;
  return r;
}

async function writeRunning(running: RunningShift | null) {
  if (!running) {
    await AsyncStorage.removeItem(STORAGE_KEYS.RUNNING);
  } else {
    await AsyncStorage.setItem(STORAGE_KEYS.RUNNING, JSON.stringify(running));
  }
}

/**
 * Public API
 */

export type TrackerSnapshot = {
  running: RunningShift | null;
  elapsedSec: number; // 0 if not running
  totals: {
    todaySec: number;
    thisWeekSec: number;
    thisMonthSec: number;
  };

};

export async function getSnapshot(): Promise<TrackerSnapshot> {
  await ensureSchema();

  const [running, day, week, month] = await Promise.all([
    readRunning(),
    readRollup(STORAGE_KEYS.ROLLUP_DAY),
    readRollup(STORAGE_KEYS.ROLLUP_WEEK),
    readRollup(STORAGE_KEYS.ROLLUP_MONTH),
  ]);
const now = nowMs();
const todayKey = getDayKeyLocal(now);
let elapsedSec;

if (running) {
  const runningSec = Math.floor(
    (now - running.startMs) / 1000
  );

  elapsedSec = running.baseTodaySec + runningSec;
} else {
  elapsedSec = day[todayKey] ?? 0;
}



  const weekKey = getWeekKeyLocal(now);
  const monthKey = getMonthKeyLocal(now);

  return {
    running,
    elapsedSec,
    totals: {
      todaySec: clampNonNegative(day[todayKey] ?? 0),
      thisWeekSec: clampNonNegative(week[weekKey] ?? 0),
      thisMonthSec: clampNonNegative(month[monthKey] ?? 0),
    },
  };
}

/**
 * Start shift.
 * Throws if already running.
 */
export async function startShift(
  startDate?: Date
): Promise<RunningShift> {
  await ensureSchema();

  const existing = await readRunning();
  if (existing) {
    throw new Error("Shift already running.");
  }

  const startMs = startDate
    ? startDate.getTime()
    : nowMs();

  const todayKey = getDayKeyLocal(startMs);
  const dayRollup = await readRollup(STORAGE_KEYS.ROLLUP_DAY);

  const running: RunningShift = {
    startMs,
    startedAtDayKey: todayKey,
    baseTodaySec: dayRollup[todayKey] ?? 0,
  };

  await writeRunning(running);
  return running;
}


/**
 * End shift.
 * Finalizes session, updates sessions + rollups.
 * Returns the created session.
 */
export async function endShift(
  endDate?: Date
): Promise<ShiftSession> {
  await ensureSchema();

  const running = await readRunning();
  if (!running) {
    throw new Error("No running shift to end.");
  }

  const endMs = endDate
    ? endDate.getTime()
    : nowMs();

  // Handle device time issues (clock moved backwards)
  if (endMs < running.startMs) {
    // Treat as 0 duration, still close it to avoid "stuck running"
    await writeRunning(null);
    throw new Error("Device time appears to have moved backwards. Shift was stopped for safety.");
  }

  const durationSec = clampNonNegative(Math.floor((endMs - running.startMs) / 1000));

  const session: ShiftSession = {
    id: makeId(),
    startMs: running.startMs,
    endMs,
    durationSec,
    dayKey: getDayKeyLocal(running.startMs),
    weekKey: getWeekKeyLocal(running.startMs),
    monthKey: getMonthKeyLocal(running.startMs),
  };

  // Read-modify-write in a safe order:
  // 1) append session
  // 2) update rollups
  // 3) clear running

  function addSessionToRollupsByDay(
  startMs: number,
  endMs: number,
  day: RollupMap,
  week: RollupMap,
  month: RollupMap
) {
  let cursor = startMs;

  while (cursor < endMs) {
    const d = new Date(cursor);
    const nextMidnight = new Date(
      d.getFullYear(),
      d.getMonth(),
      d.getDate() + 1
    ).getTime();

    const chunkEnd = Math.min(endMs, nextMidnight);
    const seconds = Math.floor((chunkEnd - cursor) / 1000);

    if (seconds > 0) {
      addToRollups(cursor, seconds, day, week, month);
    }

    cursor = chunkEnd;
  }
}

  const [sessions, day, week, month] = await Promise.all([
    readSessions(),
    readRollup(STORAGE_KEYS.ROLLUP_DAY),
    readRollup(STORAGE_KEYS.ROLLUP_WEEK),
    readRollup(STORAGE_KEYS.ROLLUP_MONTH),
  ]);

  sessions.push(session);
  addSessionToRollupsByDay(session.startMs, session.endMs, day, week, month);


  // Persist updates (best effort atomic-ish via multiSet + sequential)
  await writeSessions(sessions);
  await writeRollups(day, week, month);
  await writeRunning(null);

  return session;
}

/**
 * Cancel a running shift without saving time.
 * Useful if user tapped start by mistake.
 */
export async function cancelRunningShift(): Promise<void> {
  await ensureSchema();
  await writeRunning(null);
}

/**
 * Rebuild rollups from sessions.
 * Useful if you ever detect corruption or want to migrate.
 */
export async function rebuildRollupsFromSessions(): Promise<void> {
  await ensureSchema();
  const sessions = await readSessions();

  const day: RollupMap = {};
  const week: RollupMap = {};
  const month: RollupMap = {};

  for (const s of sessions) {
    addToRollups(s.startMs, clampNonNegative(s.durationSec), day, week, month);
  }

  await writeRollups(day, week, month);
}

/**
 * Get raw sessions (for reports, history screens).
 */
export async function getSessions(): Promise<ShiftSession[]> {
  await ensureSchema();
  return await readSessions();
}

/**
 * Utility: format seconds as HH:MM:SS
 */
export function formatHMS(totalSec: number) {
  const sec = clampNonNegative(Math.floor(totalSec));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${pad2(h)}:${pad2(m)}:${pad2(s)}`;
}

/**
 * Utility: format seconds as H:MM (weekly hours like 40:45)
 */
export function formatHM(totalSec: number) {
  const sec = clampNonNegative(Math.floor(totalSec));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return `${h}:${pad2(m)}`;
}




export async function getAllRollups(): Promise<{
  day: Record<string, number>;
  week: Record<string, number>;
  month: Record<string, number>;
}> {
  await ensureSchema();

  const [day, week, month] = await Promise.all([
    readRollup(STORAGE_KEYS.ROLLUP_DAY),
    readRollup(STORAGE_KEYS.ROLLUP_WEEK),
    readRollup(STORAGE_KEYS.ROLLUP_MONTH),
  ]);

  return { day, week, month };
}
