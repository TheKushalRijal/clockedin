import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getSessions,
  rebuildRollupsFromSessions,
  getWeekKeyLocal,
  getMonthKeyLocal,
} from "./timerlogic";
import { ShiftSession } from "./timerlogic";



const SESSIONS_KEY = "tt:sessions";

/**
 * CHANGE: overwrite total hours for a given day
 */
export async function changeDayHours(
  dayKey: string,      // YYYY-MM-DD
  newHours: number     // decimal hours
) {
  const newSec = Math.floor(newHours * 3600);
  const sessions = await getSessions();

  // Remove all existing sessions for that day
  const remaining = sessions.filter(
    (s) => s.dayKey !== dayKey
  );

  if (newSec > 0) {
    const startMs = new Date(`${dayKey}T09:00:00`).getTime();
    const endMs = startMs + newSec * 1000;

    const synthetic: ShiftSession = {
      id: `manual-${dayKey}`,
      startMs,
      endMs,
      durationSec: newSec,
      dayKey,
      weekKey: getWeekKeyLocal(startMs),
      monthKey: getMonthKeyLocal(startMs),
    };

    remaining.push(synthetic);
  }

  await AsyncStorage.setItem(
    SESSIONS_KEY,
    JSON.stringify(remaining)
  );

  await rebuildRollupsFromSessions();
}

/**
 * DELETE: remove all hours for a given day
 */
export async function deleteDayHours(dayKey: string) {
  const sessions = await getSessions();

  const remaining = sessions.filter(
    (s) => s.dayKey !== dayKey
  );

  await AsyncStorage.setItem(
    SESSIONS_KEY,
    JSON.stringify(remaining)
  );

  await rebuildRollupsFromSessions();
}
