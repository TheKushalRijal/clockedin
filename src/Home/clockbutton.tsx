import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  FlatList,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

/* ────────────────────────────────────────────── */
/* CONFIG */
/* ────────────────────────────────────────────── */

const ITEM_HEIGHT = 28;
const VISIBLE_ROWS = 3;

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);

/* ────────────────────────────────────────────── */
/* TYPES */
/* ────────────────────────────────────────────── */

type Props = {
  isClockedIn: boolean;
  onClockIn: (time: Date) => void;
  onClockOut: (time: Date) => void;
  onWheelTouchStart?: () => void;
  onWheelTouchEnd?: () => void;
};

/* ────────────────────────────────────────────── */
/* TIME WHEEL */
/* ────────────────────────────────────────────── */

function TimeWheel({
  data,
  value,
  onChange,
  onTouchStart,
  onTouchEnd,
}: {
  data: number[];
  value: number;
  onChange: (v: number) => void;
  onTouchStart?: () => void;
  onTouchEnd?: () => void;
}) {
  const listRef = useRef<FlatList<number>>(null);

  // Snap to initial value ONCE
  useEffect(() => {
    listRef.current?.scrollToOffset({
      offset: value * ITEM_HEIGHT,
      animated: false,
    });
  }, []);

  return (
    <View style={styles.wheelContainer}>
      <FlatList
        ref={listRef}
        data={data}
        keyExtractor={(item) => String(item)}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        bounces={false}
        nestedScrollEnabled
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        contentContainerStyle={styles.wheelContent}
        getItemLayout={(_, index) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * index,
          index,
        })}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(
            e.nativeEvent.contentOffset.y / ITEM_HEIGHT
          );
          onChange(data[index] ?? value);
        }}
        renderItem={({ item }) => (
          <View style={styles.wheelItem}>
            <Text style={styles.wheelText}>
              {item.toString().padStart(2, "0")}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

/* ────────────────────────────────────────────── */
/* MAIN COMPONENT */
/* ────────────────────────────────────────────── */

export default function ClockActionButton({
  isClockedIn,
  onClockIn,
  onClockOut,
  onWheelTouchStart,
  onWheelTouchEnd,
}: Props) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const now = new Date();
  const [hour, setHour] = useState(now.getHours());
  const [minute, setMinute] = useState(now.getMinutes());

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.96,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    const selected = new Date();
    selected.setHours(hour, minute, 0, 0);

    isClockedIn ? onClockOut(selected) : onClockIn(selected);
  };

  return (
    <View style={styles.container}>
      {/* CLOCK BUTTON */}
      <Animated.View
        style={[
          styles.buttonWrapper,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <TouchableOpacity activeOpacity={0.9} onPress={handlePress}>
          <LinearGradient
            colors={
              isClockedIn
                ? ["#EF4444", "#DC2626"]
                : ["#22C55E", "#16A34A"]
            }
            style={styles.button}
          >
            <Ionicons
              name={isClockedIn ? "stop" : "play"}
              size={18}
              color="#FFFFFF"
            />
            <Text style={styles.buttonText}>
              {isClockedIn ? "CLOCK OUT" : "CLOCK IN"}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {/* TIME PICKER */}
      <View style={styles.pickerContainer}>
        <TimeWheel
          data={HOURS}
          value={hour}
          onChange={setHour}
          onTouchStart={onWheelTouchStart}
          onTouchEnd={onWheelTouchEnd}
        />

        <Text style={styles.colon}>:</Text>

        <TimeWheel
          data={MINUTES}
          value={minute}
          onChange={setMinute}
          onTouchStart={onWheelTouchStart}
          onTouchEnd={onWheelTouchEnd}
        />
      </View>
    </View>
  );
}

/* ────────────────────────────────────────────── */
/* STYLES */
/* ────────────────────────────────────────────── */

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12,
  },

  buttonWrapper: {
    flex: 1,
    marginRight: 12,
  },

  button: {
    height: 52,
    borderRadius: 26,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1,
  },

  pickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
  },

  wheelContainer: {
    height: ITEM_HEIGHT * VISIBLE_ROWS,
    width: 42,
    overflow: "hidden",
  },

  wheelContent: {
    paddingVertical: ITEM_HEIGHT,
  },

  wheelItem: {
    height: ITEM_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },

  wheelText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#F9FAFB",
    fontVariant: ["tabular-nums"],
  },

  colon: {
    fontSize: 18,
    fontWeight: "700",
    color: "#9CA3AF",
    marginHorizontal: 4,
  },
});
