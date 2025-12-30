import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  FlatList,
  StyleSheet,
  Modal,
  Pressable,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

/* ───────── CONFIG ───────── */

const ITEM_HEIGHT = 32;
const VISIBLE_ROWS = 5;

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);
const AMPM = ["AM", "PM"] as const;

/* date wheel: today ± 14 days */
const buildDates = () => {
  const base = new Date();
  return Array.from({ length: 29 }, (_, i) => {
    const d = new Date(base);
    d.setDate(base.getDate() + i - 14);
    d.setHours(0, 0, 0, 0);
    return d;
  });
};

const DATES = buildDates();

/* ───────── TYPES ───────── */

type Props = {
  isClockedIn: boolean;
  onClockIn: (time: Date) => Promise<void> | void;
  onClockOut: (time: Date) => Promise<void> | void;
};

/* ───────── WHEEL ───────── */

function Wheel<T>({
  data,
  value,
  render,
  onChange,
}: {
  data: readonly T[];
  value: T;
  render: (v: T) => string;
  onChange: (v: T) => void;
}) {
  const ref = useRef<FlatList<T>>(null);

  useEffect(() => {
    const index = data.indexOf(value);
    if (index >= 0) {
      ref.current?.scrollToOffset({
        offset: index * ITEM_HEIGHT,
        animated: false,
      });
    }
  }, []);

  return (
    <View style={styles.wheel}>
      <FlatList
        ref={ref}
        data={data}
        keyExtractor={(_, i) => String(i)}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        getItemLayout={(_, i) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * i,
          index: i,
        })}
        contentContainerStyle={{ paddingVertical: ITEM_HEIGHT * 2 }}
        onMomentumScrollEnd={(e) => {
          const i = Math.round(
            e.nativeEvent.contentOffset.y / ITEM_HEIGHT
          );
          onChange(data[i] ?? value);
        }}
        renderItem={({ item }) => (
          <View style={styles.wheelItem}>
            <Text style={styles.wheelText}>{render(item)}</Text>
          </View>
        )}
      />
    </View>
  );
}

/* ───────── MAIN ───────── */

export default function ClockActionButton({
  isClockedIn,
  onClockIn,
  onClockOut,
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const now = new Date();

  const [canvasOpen, setCanvasOpen] = useState(false);

  const [date, setDate] = useState(DATES[14]);
  const [hour, setHour] = useState(12);
  const [minute, setMinute] = useState(now.getMinutes());
  const [ampm, setAmPm] = useState<(typeof AMPM)[number]>(
    now.getHours() >= 12 ? "PM" : "AM"
  );

  const pressAnim = () => {
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.96,
        duration: 90,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 7,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  };

  /* ───── SUBMIT LOGIC (FIXED) ───── */

  const submit = async (useCustomTime: boolean) => {
    pressAnim();

    const now = new Date();
    let finalTime = now;

    if (useCustomTime) {
      finalTime = new Date(date);

      let h = hour % 12;
      if (ampm === "PM") h += 12;

      finalTime.setHours(h, minute, 0, 0);
    }

    try {
      if (isClockedIn) {
        await onClockOut(finalTime < now ? now : finalTime);
      } else {
        await onClockIn(finalTime);
      }
    } catch (e) {
      console.warn("Clock action failed:", e);
    } finally {
      setCanvasOpen(false);
    }
  };

  /* ───────── RENDER ───────── */

  return (
    <>
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.buttonWrapper,
            { transform: [{ scale }] },
          ]}
        >
          <TouchableOpacity onPress={() => submit(false)}>
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
                color="#FFF"
              />
              <Text style={styles.buttonText}>
                {isClockedIn ? "CLOCK OUT" : "CLOCK IN"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => setCanvasOpen(true)}
        >
          <Ionicons name="time-outline" size={22} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      {/* CANVAS */}
      <Modal visible={canvasOpen} transparent animationType="slide">
        <Pressable
          style={styles.overlay}
          onPress={() => setCanvasOpen(false)}
        />

        <View style={styles.canvas}>
          <View style={styles.header}>
            <Text style={styles.label}>date</Text>
            <Text style={styles.label}>hour</Text>
            <Text style={styles.label}>min</Text>
            <Text style={styles.label}></Text>
          </View>

          <View style={styles.row}>
            <Wheel
              data={DATES}
              value={date}
              onChange={setDate}
              render={(d) => d.getDate().toString()}
            />
            <Wheel
              data={HOURS}
              value={hour}
              onChange={setHour}
              render={(h) => h.toString()}
            />
            <Wheel
              data={MINUTES}
              value={minute}
              onChange={setMinute}
              render={(m) => m.toString().padStart(2, "0")}
            />
            <Wheel
              data={AMPM}
              value={ampm}
              onChange={setAmPm}
              render={(v) => v.toLowerCase()}
            />
          </View>

          <TouchableOpacity
            style={styles.confirmButton}
            onPress={() => submit(true)}
          >
            <Text style={styles.confirmText}>Confirm</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
}

/* ───────── STYLES ───────── */

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
    color: "#FFF",
    fontWeight: "700",
    letterSpacing: 1,
  },
  editButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  canvas: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#0B0F14",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 8,
  },
  label: {
    color: "#9CA3AF",
    fontSize: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  wheel: {
    height: ITEM_HEIGHT * VISIBLE_ROWS,
    width: 60,
    overflow: "hidden",
  },
  wheelItem: {
    height: ITEM_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  wheelText: {
    fontSize: 22,
    fontWeight: "600",
    color: "#FFF",
  },
  confirmButton: {
    marginTop: 16,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#22C55E",
    justifyContent: "center",
    alignItems: "center",
  },
  confirmText: {
    fontWeight: "700",
    letterSpacing: 1,
    color: "#0B0F14",
  },
});
