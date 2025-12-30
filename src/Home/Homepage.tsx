import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  ImageBackground,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ClockActionButton from "./clockbutton";
import ClockCard from "./showhours";
import HomeLayout from "./header";
import WeeklyReport from "./weekgraph";

import {
  getSnapshot,
  startShift,
  endShift,
  formatHMS,
  formatHM,
} from "./timerlogic";
import {
  getAllRollups,
  getWeekKeyLocal,
  getMonthKeyLocal,
} from "./timerlogic";

/* ────────────────────────────────────────────── */
/* FALLBACK WEEK DATA                             */
/* ────────────────────────────────────────────── */

const EMPTY_WEEK = [
  { label: "MON", hours: 0, color: "#6366F1" },
  { label: "TUE", hours: 0, color: "#8B5CF6" },
  { label: "WED", hours: 0, color: "#EC4899" },
  { label: "THU", hours: 0, color: "#F59E0B" },
  { label: "FRI", hours: 0, color: "#10B981" },
  { label: "SAT", hours: 0, color: "#3B82F6" },
  { label: "SUN", hours: 0, color: "#EF4444" },
];

/* ────────────────────────────────────────────── */
/* COMPONENT                                     */
/* ────────────────────────────────────────────── */

export default function HomeScreen() {
  /* ───────────── DATA STATE ───────────── */

const [dayRollup, setDayRollup] = useState<Record<string, number>>({});


const [weekRollup, setWeekRollup] = useState<Record<string, number>>({});
const [monthRollup, setMonthRollup] = useState<Record<string, number>>({});
useEffect(() => {
  const loadRollups = async () => {
    const { week, month } = await getAllRollups();
    setWeekRollup(week);
    setMonthRollup(month);
  };

  loadRollups();
}, []);
useEffect(() => {
  const load = async () => {
    const { day } = await getAllRollups();
    setDayRollup(day);
  };
  load();
}, []);

function getWeekKeyByOffset(offset: number) {
  const d = new Date();
  d.setDate(d.getDate() - offset * 7);
  return getWeekKeyLocal(d.getTime());
}

function getMonthKeyByOffset(offset: number) {
  const d = new Date();
  d.setMonth(d.getMonth() - offset);
  return getMonthKeyLocal(d.getTime());
}
const thisWeekHM = formatHM(
  weekRollup[getWeekKeyByOffset(0)] ?? 0
);

const lastWeekHM = formatHM(
  weekRollup[getWeekKeyByOffset(1)] ?? 0
);

const twoWeeksAgoHM = formatHM(
  weekRollup[getWeekKeyByOffset(2)] ?? 0
);

const lastMonthHM = formatHM(
  monthRollup[getMonthKeyByOffset(1)] ?? 0
);









function buildCurrentWeekBars(dayRollup: Record<string, number>) {
  const labels = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
  const colors = [
    "#6366F1",
    "#8B5CF6",
    "#EC4899",
    "#F59E0B",
    "#10B981",
    "#3B82F6",
    "#EF4444",
  ];

  // Find Monday of this week (ISO)
  const now = new Date();
  const day = (now.getDay() + 6) % 7; // Mon = 0
  const monday = new Date(now);
  monday.setDate(now.getDate() - day);

  return labels.map((label, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);

    const key = `${d.getFullYear()}-${String(
      d.getMonth() + 1
    ).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

    return {
      label,
      hours: (dayRollup[key] ?? 0) / 3600,
      color: colors[i],
    };
  });
}






  const [elapsedSec, setElapsedSec] = useState(0);
  const [totals, setTotals] = useState({
    todaySec: 0,
    thisWeekSec: 0,
    thisMonthSec: 0,
  });
const [isClockedIn, setIsClockedIn] = useState(false);

const syncClockState = async () => {
  const snap = await getSnapshot();
  setIsClockedIn(Boolean(snap.running));
};

useEffect(() => {
  syncClockState();
}, []);

  /* ───────────── UI STATE ───────────── */

  const [pageScrollEnabled, setPageScrollEnabled] = useState(true);

  /* ───────────── ANIMATIONS ───────────── */

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(30)).current;

  const barAnimations = useRef(
    Array.from({ length: 7 }, () => new Animated.Value(0))
  ).current;

  /* ───────────── TICK CONTROL (SINGLE SOURCE) ───────────── */

  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTicking = () => {
    if (tickRef.current) return;

    tickRef.current = setInterval(async () => {
      const snap = await getSnapshot();
      setElapsedSec(snap.elapsedSec);
    }, 1000);
  };

  const stopTicking = () => {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
  };

  /* ───────────── DATE UTILS ───────────── */

  const isNewDay = (last: number, now: number) => {
    const a = new Date(last);
    const b = new Date(now);

    return (
      a.getFullYear() !== b.getFullYear() ||
      a.getMonth() !== b.getMonth() ||
      a.getDate() !== b.getDate()
    );
  };

  /* ───────────── INITIAL LOAD ───────────── */

  useEffect(() => {
    const load = async () => {
      const snap = await getSnapshot();

      setElapsedSec(snap.elapsedSec);
      setTotals(snap.totals);
      setIsClockedIn(!!snap.running);

      if (snap.running) {
        startTicking();
      }
    };

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.stagger(
      100,
      barAnimations.map((anim) =>
        Animated.spring(anim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: false,
        })
      )
    ).start();

    load();
    return () => stopTicking();
  }, []);
const weeklyBars = buildCurrentWeekBars(dayRollup);

  /* ───────────── MIDNIGHT RESET ───────────── */

  useEffect(() => {
    const midnightCheck = setInterval(async () => {
      const snap = await getSnapshot();

      // Do nothing if still clocked in
      if (snap.running) return;
      if (!snap.lastEventAt) return;

      if (isNewDay(snap.lastEventAt, Date.now())) {
        setElapsedSec(0);
      }
    }, 60_000);

    return () => clearInterval(midnightCheck);
  }, []);

  /* ───────────── HANDLERS ───────────── */

  const handleClockIn = async (time: Date) => {
    await startShift(time);

    const snap = await getSnapshot();
    setIsClockedIn(true);
    setElapsedSec(snap.elapsedSec);
    setTotals(snap.totals);

    startTicking();
  };

  const handleClockOut = async (time: Date) => {
    await endShift(time);

    const snap = await getSnapshot();
    setIsClockedIn(false);

    // Freeze today's final value until midnight
    setElapsedSec(snap.elapsedSec);
    setTotals(snap.totals);

    stopTicking();
  };

  /* ───────────── RENDER ───────────── */

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={{
          uri: "./assets/mywallpaper.jpg",
        }}
        style={styles.backgroundImage}
        blurRadius={20}
      >
        <Animated.FlatList
          data={[{ key: "home" }]}
          keyExtractor={(item) => item.key}
          nestedScrollEnabled
          scrollEnabled={pageScrollEnabled}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          renderItem={() => (
            <Animated.View
              style={[
                styles.content as ViewStyle,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideUpAnim }],
                },
              ]}
            >
              <HomeLayout fadeAnim={fadeAnim} slideUpAnim={slideUpAnim} />

              <ClockCard
                  status={isClockedIn ? "clocked-in" : "clocked-out"}
                  mainTime={formatHMS(elapsedSec)}
                  thisWeek={thisWeekHM}
                  lastWeek={lastWeekHM}
                  twoWeeksAgo={twoWeeksAgoHM}
                  lastMonth={lastMonthHM}
                />


                <ClockActionButton
                isClockedIn={isClockedIn}
                onClockIn={handleClockIn}
                onClockOut={handleClockOut}
                />



              <WeeklyReport
                bars={weeklyBars}
                barAnimations={barAnimations}
              />

            </Animated.View>
          )}
        />
      </ImageBackground>
    </SafeAreaView>
  );
}

/* ────────────────────────────────────────────── */
/* STYLES                                        */
/* ────────────────────────────────────────────── */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0F14",
  },
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 12,
  },
  content: {
    flex: 1,
  },
});
