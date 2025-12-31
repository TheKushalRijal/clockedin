import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Modal,
  Pressable,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import TimesheetCard from "./timepeakerlogic";

type Props = {
  isClockedIn: boolean;
  onClockIn: (time: Date) => Promise<void> | void;
  onClockOut: (time: Date) => Promise<void> | void;
};

export default function ClockActionButton({
  isClockedIn,
  onClockIn,
  onClockOut,
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const [timesheetOpen, setTimesheetOpen] = useState(false);

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

  const submit = async () => {
    pressAnim();
    const now = new Date();

    try {
      if (isClockedIn) {
        await onClockOut(now);
      } else {
        await onClockIn(now);
      }
    } catch (e) {
      console.warn("Clock action failed:", e);
    }
  };

  return (
    <>
      <View style={styles.container}>
        <Animated.View
          style={[styles.buttonWrapper, { transform: [{ scale }] }]}
        >
          <TouchableOpacity onPress={submit}>
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

        {/* ⏱ ICON */}
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => setTimesheetOpen(true)}
        >
          <Ionicons name="time-outline" size={22} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      {/* TIMESHEET CANVAS */}
<Modal visible={timesheetOpen} transparent animationType="fade">
  <View style={styles.modalCenter}>
    <TimesheetCard onClose={() => setTimesheetOpen(false)} />
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
  timesheetCanvas: {
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
},

  buttonWrapper: {
    flex: 1,
    marginRight: 12,
  },

  modalCenter: {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.4)",
  justifyContent: "center",
  alignItems: "center",
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
