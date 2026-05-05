import React, { useMemo, useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  ScrollView,
  Easing,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { getAllRollups } from "../Home/timerlogic";
/* ───────────────────────────── */
/* TYPES                         */
/* ───────────────────────────── */

type Mode = "daily" | "weekly" | "monthly";

type ReportItem = {
  label: string;
  hours: number;
  date?: string;
};

type StatCard = {
  title: string;
  value: string;
  subtitle: string;
  color: string;
};

/* ───────────────────────────── */
/* CONSTANTS & MOCK DATA         */
/* ───────────────────────────── */

const { width } = Dimensions.get("window");



const modeIcons = {
  daily: "📅",
  weekly: "📊",
  monthly: "📈",
};

const modeTitles = {
  daily: "Daily Reports",
  weekly: "Weekly Overview",
  monthly: "Monthly Analytics",
};

/* ───────────────────────────── */
/* COMPONENTS                    */
/* ───────────────────────────── */

const ModeButton = ({
  mode,
  currentMode,
  onPress,
}: {
  mode: Mode;
  currentMode: Mode;
  onPress: () => void;
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.7)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.7,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const isActive = currentMode === mode;

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }],
        opacity: opacityAnim,
        flex: 1,
      }}
    >
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        delayPressIn={0}
        activeOpacity={0.9}
        style={[
          styles.modeButton,
          isActive && styles.modeButtonActive,
        ]}
      >
        <LinearGradient
          colors={
            isActive
              ? ["#4F46E5", "#7C3AED"]
              : ["transparent", "transparent"]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.modeGradient}
        >
          <Text style={styles.modeIcon}>{modeIcons[mode]}</Text>
          <Text
            style={[
              styles.modeText,
              isActive && styles.modeTextActive,
            ]}
          >
            {mode.charAt(0).toUpperCase() + mode.slice(1)}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const StatCardComponent = ({ card }: { card: StatCard }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.statCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <LinearGradient
        colors={["rgba(255,255,255,0.05)", "rgba(255,255,255,0.02)"]}
        style={styles.statGradient}
      >
        <View style={styles.statHeader}>
          <View
            style={[
              styles.statIcon,
              { backgroundColor: `${card.color}20` },
            ]}
          >
            <Text style={{ color: card.color, fontSize: 20 }}>
              {card.title === "Total Hours" ? "⏱️" : 
               card.title === "Avg/Day" ? "📊" : 
               card.title === "Peak Day" ? "📈" : "🎯"}
            </Text>
          </View>
        </View>
        <Text style={styles.statValue}>{card.value}</Text>
        <Text style={styles.statTitle}>{card.title}</Text>
        <Text style={styles.statSubtitle}>{card.subtitle}</Text>
      </LinearGradient>
    </Animated.View>
  );
};

const ReportRow = ({ item, index, maxHours }: { item: ReportItem; index: number; maxHours: number }) => {
  const widthAnim = useRef(new Animated.Value(0)).current;
  const translateAnim = useRef(new Animated.Value(50)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const delay = index * 100;

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(widthAnim, {
          toValue: (item.hours / maxHours) * 100,
          duration: 800,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
          useNativeDriver: false,
        }),
        Animated.spring(translateAnim, {
          toValue: 0,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);
  }, []);

  const getBarColor = (percentage: number) => {
    if (percentage > 80) return "#10B981";
    if (percentage > 60) return "#22C55E";
    if (percentage > 40) return "#84CC16";
    if (percentage > 20) return "#EAB308";
    return "#F97316";
  };

  const percentage = (item.hours / maxHours) * 100;

  return (
    <Animated.View
      style={[
        styles.rowCard,
        {
          opacity: opacityAnim,
          transform: [{ translateX: translateAnim }],
        },
      ]}
    >
      <View style={styles.rowHeader}>
        <Text style={styles.rowLabel}>{item.label}</Text>
        <View style={styles.hoursBadge}>
          <Text style={styles.hoursText}>
            {item.hours.toFixed(1)}h
          </Text>
        </View>
      </View>

      <View style={styles.barContainer}>
        <Animated.View
          style={[
            styles.bar,
            {
              width: widthAnim.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              }),
              backgroundColor: getBarColor(percentage),
            },
          ]}
        />
        <View style={styles.barOverlay}>
          {[25, 50, 75].map((mark) => (
            <View
              key={mark}
              style={[
                styles.barMark,
                { left: `${mark}%` },
              ]}
            />
          ))}
        </View>
      </View>

     
    </Animated.View>
  );
};

/* ───────────────────────────── */
/* MAIN SCREEN                   */
/* ───────────────────────────── */

export default function ReportsScreen() {


  const [dayTotals, setDayTotals] = useState<Record<string, number>>({});
  const [weekTotals, setWeekTotals] = useState<Record<string, number>>({});
  const [monthTotals, setMonthTotals] = useState<Record<string, number>>({});

  useEffect(() => {
    const load = async () => {
      const { day, week, month } = await getAllRollups();
      setDayTotals(day);
      setWeekTotals(week);
      setMonthTotals(month);
    };

    load();
  }, []);
  const [mode, setMode] = useState<Mode>("daily");
  const scrollY = useRef(new Animated.Value(0)).current;

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [280, 200],
    extrapolate: 'clamp',
  });

  const data: ReportItem[] = useMemo(() => {
    if (mode === "daily") {
      return Object.entries(dayTotals)
  .sort(([a], [b]) => b.localeCompare(a)) // 🔥 newest first
  .map(([key, sec]) => ({
    label: key,
    hours: sec / 3600,
  }));

    }

    if (mode === "weekly") {
      return Object.entries(weekTotals)
        .sort(([a], [b]) => b.localeCompare(a))
        .map(([key, sec]) => ({
          label: key,
          hours: sec / 3600,
        }));
    }

    if (mode === "monthly") {
      return Object.entries(monthTotals)
        .sort(([a], [b]) => b.localeCompare(a))
        .map(([key, sec]) => ({
          label: key,
          hours: sec / 3600,
        }));
    }

    const quarterlyMap: Record<string, number> = {};
    Object.entries(monthTotals).forEach(([month, sec]) => {
      const [, m] = month.split("-");
      const q = Math.floor((Number(m) - 1) / 3) + 1;
      const key = `${month.slice(0, 4)} Q${q}`;
      quarterlyMap[key] = (quarterlyMap[key] || 0) + sec;
    });

    return Object.entries(quarterlyMap).map(([key, sec]) => ({
      label: key,
      hours: sec / 3600,
    }));
  }, [mode, dayTotals, weekTotals, monthTotals]);


const stats: StatCard[] = useMemo(() => {
  if (data.length === 0) {
    return [
      {
        title: "Total Hours",
        value: "0.0",
        subtitle: `0 ${mode} records`,
        color: "#4F46E5",
      },
      {
        title: "Avg/Day",
        value: "0.0",
        subtitle: "Average hours",
        color: "#10B981",
      },
      {
        title: "Peak Day",
        value: "0.0",
        subtitle: "—",
        color: "#F59E0B",
      },
    ];
  }

  const totalHours = data.reduce((sum, item) => sum + item.hours, 0);
  const avgHours = totalHours / data.length;

  const peakDay = data.reduce((max, item) =>
    item.hours > max.hours ? item : max
  );

  return [
    {
      title: "Total Hours",
      value: totalHours.toFixed(1),
      subtitle: `${data.length} ${mode} records`,
      color: "#4F46E5",
    },
    {
      title: "Avg/Day",
      value: avgHours.toFixed(1),
      subtitle: "Average hours",
      color: "#10B981",
    },
    {
      title: "Peak Day",
      value: peakDay.hours.toFixed(1),
      subtitle: peakDay.label,
      color: "#F59E0B",
    },
  ];
}, [data, mode]);


  const maxHours = Math.max(...data.map((d) => d.hours), 1);

  return (
    <View style={styles.container}>
      <Animated.ScrollView
showsVerticalScrollIndicator={false}
onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* HEADER */}
        
        {/* STATS CARDS */}
        

        {/* MODE SELECTOR */}
        <View style={styles.selectorContainer}>
          <View style={styles.selector}>
            {(Object.keys(modeIcons) as Mode[]).map((m) => (
              <ModeButton
                key={m}
                mode={m}
                currentMode={mode}
                onPress={() => setMode(m)}
              />
            ))}
          </View>
        </View>

        {/* REPORTS LIST */}
        <View style={styles.listContainer}>
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>Time Distribution</Text>
            
          </View>

          {data.map((item, index) => (
            <ReportRow
              key={item.label}
              item={item}
              index={index}
              maxHours={maxHours}
            />
          ))}

          {/* SUMMARY */}
        
        </View>
      </Animated.ScrollView>
    </View>
  );
}

/* ───────────────────────────── */
/* STYLES                        */
/* ───────────────────────────── */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
  },

  /* ───── Header ───── */

  headerGradient: {
    flex: 1,
    padding: 24,
    justifyContent: 'flex-end',
  },
  headerContent: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },

  /* ───── Stats ───── */
  statsContainer: {
    marginTop: -40,
    marginBottom: 24,
  },
  statsContent: {
    paddingHorizontal: 20,
  },
  statCard: {
    width: width * 0.65,
    height: 160,
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: 16, // Added marginRight instead of gap
  },
  statGradient: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  statTitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
    marginTop: 4,
  },
  statSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 5,
  },

  /* ───── Selector ───── */
  selectorContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
    marginTop: 50,
  },
  selector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 16,
    padding: 8,
  },
  modeButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    marginHorizontal: 4, // Added horizontal margin
  },
  modeButtonActive: {
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  modeGradient: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  modeIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  modeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94A3B8',
    textAlign: 'center',
  },
  modeTextActive: {
    color: '#FFFFFF',
  },

  /* ───── List ───── */
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  legend: {
    flexDirection: 'row',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16, // Added marginLeft instead of gap
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginLeft: 6, // Added marginLeft
  },

  /* ───── Row ───── */
  rowCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.3)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#E5E7EB',
  },
  hoursBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  hoursText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#22C55E',
  },

  /* ───── Bar ───── */
  barContainer: {
    height: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  bar: {
    height: '100%',
    borderRadius: 10,
  },
  barOverlay: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
  },
  barMark: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },

  /* ───── Row Footer ───── */
  rowFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  percentageText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '500',
  },
  timeText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },

  /* ───── Summary ───── */
  summaryCard: {
    marginTop: 24,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.2)',
  },
  summaryGradient: {
    padding: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#22C55E',
  },
});