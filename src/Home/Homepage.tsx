import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
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
  getAllRollups,
  getWeekKeyLocal,
  getMonthKeyLocal,
} from "./timerlogic";

/* ────────────────────────────────────────────── */
/* HELPERS (outside component — stable refs)      */
/* ────────────────────────────────────────────── */

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

  const now = new Date();
  const day = (now.getDay() + 6) % 7; // Mon = 0
  const monday = new Date(now);
  monday.setDate(now.getDate() - day);

  return labels.map((label, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    return { label, hours: (dayRollup[key] ?? 0) / 3600, color: colors[i] };
  });
}

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

/* ────────────────────────────────────────────── */
/* COMPONENT                                     */
/* ────────────────────────────────────────────── */

export default function HomeScreen() {
  /* ───────────── DATA STATE ───────────── */

  const [dayRollup, setDayRollup] = useState<Record<string, number>>({});
  const [weekRollup, setWeekRollup] = useState<Record<string, number>>({});
  const [monthRollup, setMonthRollup] = useState<Record<string, number>>({});
  const [elapsedSec, setElapsedSec] = useState(0);
  const [isClockedIn, setIsClockedIn] = useState(false);

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

  /* ───────────── INITIAL LOAD (single effect) ───────────── */

  useEffect(() => {
    const load = async () => {
      const [snap, { day, week, month }] = await Promise.all([
        getSnapshot(),
        getAllRollups(),
      ]);

      setElapsedSec(snap.elapsedSec);
      setIsClockedIn(!!snap.running);
      setDayRollup(day);
      setWeekRollup(week);
      setMonthRollup(month);

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

    load();
    return () => stopTicking();
  }, []);

  /* ───────────── BAR ANIMATION (re-runs when data changes) ───────────── */

  useEffect(() => {
    barAnimations.forEach((anim) => anim.setValue(0));
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
  }, [dayRollup]);

  /* ───────────── MIDNIGHT RESET ───────────── */

  useEffect(() => {
    const midnightCheck = setInterval(async () => {
      const snap = await getSnapshot();
      if (snap.running) return;
      if (!snap.lastEventAt) return;
      if (isNewDay(snap.lastEventAt, Date.now())) {
        setElapsedSec(0);
      }
    }, 60_000);

    return () => clearInterval(midnightCheck);
  }, []);

  /* ───────────── DERIVED DATA ───────────── */

  const weeklyBars = useMemo(() => buildCurrentWeekBars(dayRollup), [dayRollup]);

  const thisWeekHM = useMemo(
    () => formatHM(weekRollup[getWeekKeyByOffset(0)] ?? 0),
    [weekRollup]
  );
  const lastWeekHM = useMemo(
    () => formatHM(weekRollup[getWeekKeyByOffset(1)] ?? 0),
    [weekRollup]
  );
  const twoWeeksAgoHM = useMemo(
    () => formatHM(weekRollup[getWeekKeyByOffset(2)] ?? 0),
    [weekRollup]
  );
  const lastMonthHM = useMemo(
    () => formatHM(monthRollup[getMonthKeyByOffset(1)] ?? 0),
    [monthRollup]
  );

  /* ───────────── HANDLERS ───────────── */

  const handleClockIn = async (time: Date) => {
    await startShift(time);
    const [snap, { day, week, month }] = await Promise.all([
      getSnapshot(),
      getAllRollups(),
    ]);
    setIsClockedIn(true);
    setElapsedSec(snap.elapsedSec);
    setDayRollup(day);
    setWeekRollup(week);
    setMonthRollup(month);
    startTicking();
  };

  const handleClockOut = async (time: Date) => {
    await endShift(time);
    const [snap, { day, week, month }] = await Promise.all([
      getSnapshot(),
      getAllRollups(),
    ]);
    setIsClockedIn(false);
    setElapsedSec(snap.elapsedSec);
    setDayRollup(day);
    setWeekRollup(week);
    setMonthRollup(month);
    stopTicking();
  };

  /* ───────────── RENDER ───────────── */

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require("../../assets/mywalpaper.jpg")}
        style={styles.backgroundImage}
        blurRadius={20}
      >
        <Animated.FlatList
          data={[{ key: "home" }]}
          keyExtractor={(item) => item.key}
          nestedScrollEnabled
          scrollEnabled
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
