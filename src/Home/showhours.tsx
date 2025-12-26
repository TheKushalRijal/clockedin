import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

type Props = {
  status: "clocked-in" | "clocked-out";
  mainTime: string;          // HH:MM:SS (running or 00:00:00)
  thisWeek: string;          // H:MM
  lastWeek: string;          // H:MM
  twoWeeksAgo: string;       // H:MM
  lastMonth: string;         // H:MM
};

export default function ClockCard({
  status,
  mainTime,
  thisWeek,
  lastWeek,
  twoWeeksAgo,
  lastMonth,
}: Props) {
  return (
    <LinearGradient
      colors={["rgba(15, 42, 42, 0.95)", "rgba(15, 63, 58, 0.95)"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.clockCard}
    >
      <View style={styles.clockContent}>
        {/* Header */}
        <View style={styles.clockHeader}>
          <View style={styles.clockStatus}>
            <Ionicons
              name="checkmark-circle"
              size={18}
              color={status === "clocked-in" ? "#22C55E" : "#9CA3AF"}
            />
            <Text
              style={[
                styles.clockedIn,
                status === "clocked-out" && styles.clockedOut,
              ]}
            >
              {status === "clocked-in" ? "CLOCKED IN" : "CLOCKED OUT"}
            </Text>
          </View>

         
        </View>

        {/* Main Time (MOST IMPORTANT) */}
        <View style={styles.timerContainer}>
          <Text style={styles.timer}>{mainTime}</Text>
          <Text style={styles.timerLabel}>Total Hours</Text>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Stats */}
        <View style={styles.statsGrid}>
          <Stat label="This Week" value={thisWeek} />
          <Stat label="Last Week" value={lastWeek} />
          <Stat label="2 Weeks" value={twoWeeksAgo} />
          <Stat label="Last Month" value={lastMonth} />
        </View>
      </View>
    </LinearGradient>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}


const styles = StyleSheet.create({
  clockCard: {
    borderRadius: 24,
    marginBottom: 20,
    overflow: "hidden",
    shadowColor: "#22D3EE",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 16,
  },
  clockContent: {
    padding: 14,
  },
  clockHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 1,
  },
  clockStatus: {
    flexDirection: "row",
    alignItems: "center",
  },
  clockedIn: {
    fontSize: 12,
    color: "#22C55E",
    fontWeight: "600",
    letterSpacing: 1,
    marginLeft: 8,
  },
  timerContainer: {
    alignItems: "center",
    marginBottom: 4,
  },
  timer: {
    fontSize: 38,
    fontWeight: "700",
    color: "#ECFEFF",
    letterSpacing: 2,
    fontVariant: ["tabular-nums"],
  },
  timerLabel: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 1,
    letterSpacing: 1,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 6,
  },
  statItem: {
    width: "48%",
  },
  statLabel: {
    fontSize: 11,
    color: "#9CA3AF",
    letterSpacing: 0.8,
    marginBottom: 1,
  },
  statValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#F9FAFB",
  },
});
