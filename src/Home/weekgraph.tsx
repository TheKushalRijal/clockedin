import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");
const EMPTY_WEEK: {
  label: string;
  hours: number;
  color: string;
}[] = [
  { label: "MON", hours: 0, color: "#6366F1" },
  { label: "TUE", hours: 0, color: "#8B5CF6" },
  { label: "WED", hours: 0, color: "#EC4899" },
  { label: "THU", hours: 0, color: "#F59E0B" },
  { label: "FRI", hours: 0, color: "#10B981" },
  { label: "SAT", hours: 0, color: "#3B82F6" },
  { label: "SUN", hours: 0, color: "#EF4444" },
];

type Bar = {
  label: string;
  hours: number;
  color: string;
};

type Props = {
  bars: Bar[];
  barAnimations: Animated.Value[];
};

export default function WeeklyReport({ bars, barAnimations }: Props) {
  const totalHours = bars.reduce((sum, b) => sum + b.hours, 0);
  const avgHours = bars.length ? totalHours / bars.length : 0;
  const navigation = useNavigation();

  return (
    <BlurView intensity={80} tint="dark" style={styles.card}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.cardTitle}>Weekly Report</Text>
          <Text style={styles.cardSubtitle}>This Week</Text>
        </View>

        <TouchableOpacity
  style={styles.moreButton}
  onPress={() => (navigation as any).navigate("Details")}
>
  <Ionicons name="chevron-forward" size={22} color="#ffffffff" />
</TouchableOpacity>

      </View>

      {/* Chart */}
      <View style={styles.chart}>
        {bars.map((item, index) => (
          <View key={item.label} style={styles.barWrapper}>
            <Animated.View
              style={[
                styles.barContainer,
                {
                  height: barAnimations[index].interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, item.hours * 10],
                  }),
                },
              ]}
            >
              <Text style={styles.barValue2}>
              {item.hours.toFixed(1)}
            </Text>
              <LinearGradient
                colors={[item.color, `${item.color}80`]}
                style={styles.bar}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
              />
            </Animated.View>

            <Text style={styles.barValue}>
              {item.hours.toFixed(1)}h
            </Text>
            <Text style={styles.barLabel}>{item.label}</Text>
          </View>
        ))}
      </View>

      {/* Footer */}
      <View style={styles.chartFooter}>
        <View style={styles.footerItem}>
          <View
            style={[styles.colorDot, { backgroundColor: "#10B981" }]}
          />
          <Text style={styles.footerText}>
            Total: {totalHours.toFixed(1)} hours
          </Text>
        </View>

        <View style={styles.footerItem}>
          <View
            style={[styles.colorDot, { backgroundColor: "#F59E0B" }]}
          />
          <Text style={styles.footerText}>
            Avg: {avgHours.toFixed(1)}h/day
          </Text>
        </View>
      </View>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 34,
    marginBottom: 20,
    overflow: "hidden",
    backgroundColor: "rgba(17, 24, 39, 0.7)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 64,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 1,
    marginTop: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  moreButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.36)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  chart: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 150,
    marginBottom: 5,
  },
  barWrapper: {
    alignItems: "center",
    width: (width - 120) / 7,
  },
  barContainer: {
    width: 20,
    overflow: "hidden",
    borderRadius: 7,
    marginBottom: 8,
  },
  bar: {
    flex: 1,
    borderRadius: 7,
  },
  barValue: {
    fontSize: 10,
    color: "#FFFFFF",
    fontWeight: "600",
    marginBottom: 4,
  },
  barLabel: {
    fontSize: 10,
    color: "#9CA3AF",
    letterSpacing: 0.5,
  },
    barValue2: {
    fontSize: 10,
    color: "#FFFFFF",
    fontWeight: "600",
    marginBottom: 4,
    width: 30,
  },
  chartFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 1,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  footerItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  footerText: {
    fontSize: 12,
    color: "#9CA3AF",
  },
});
