import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Modal,
  Dimensions,
} from "react-native";

const ITEM_HEIGHT = 44;
const VISIBLE = 5;
const CENTER = Math.floor(VISIBLE / 2);

const { width } = Dimensions.get("window");

/* DATA */
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = Array.from({ length: 60 }, (_, i) =>
  String(i).padStart(2, "0")
);
const AMPM = ["am", "pm"];

/* WHEEL */
function Wheel({
  data,
  value,
  onChange,
}: {
  data: (string | number)[];
  value: string | number;
  onChange: (v: any) => void;
}) {
  const ref = useRef<FlatList>(null);

  useEffect(() => {
    const index = data.indexOf(value);
    if (index >= 0) {
      ref.current?.scrollToOffset({
        offset: (index - CENTER) * ITEM_HEIGHT,
        animated: false,
      });
    }
  }, []);

  return (
    <View style={styles.wheel}>
      <FlatList
        ref={ref}
        data={data}
        keyExtractor={(i) => String(i)}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingVertical: CENTER * ITEM_HEIGHT,
        }}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(
            e.nativeEvent.contentOffset.y / ITEM_HEIGHT
          );
          onChange(data[index + CENTER]);
        }}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemText}>{item}</Text>
          </View>
        )}
      />
    </View>
  );
}

/* MAIN CANVAS */
export default function TimePickerCanvas({
  visible,
  onClose,
  onConfirm,
}: {
  visible: boolean;
  onClose: () => void;
  onConfirm: (v: {
    day: number;
    hour: number;
    minute: string;
    ampm: string;
  }) => void;
}) {
  const [day, setDay] = useState(3);
  const [hour, setHour] = useState(3);
  const [minute, setMinute] = useState("03");
  const [ampm, setAmPm] = useState("am");

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.canvas}>
          {/* HEADER */}
          <View style={styles.labels}>
            <Text style={styles.label}>date</Text>
            <Text style={styles.label}>hour</Text>
            <Text style={styles.label}>minute</Text>
            <Text style={styles.label}></Text>
          </View>

          {/* WHEELS */}
          <View style={styles.row}>
            <Wheel data={DAYS} value={day} onChange={setDay} />
            <Wheel data={HOURS} value={hour} onChange={setHour} />
            <Wheel data={MINUTES} value={minute} onChange={setMinute} />
            <Wheel data={AMPM} value={ampm} onChange={setAmPm} />
          </View>

          {/* HIGHLIGHT */}
          <View style={styles.highlight} />

          {/* DONE */}
          <Text
            style={styles.done}
            onPress={() => {
              onConfirm({ day, hour, minute, ampm });
              onClose();
            }}
          >
            done
          </Text>
        </View>
      </View>
    </Modal>
  );
}

/* STYLES */
const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },

  canvas: {
    width: width - 40,
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 16,
    overflow: "hidden",
  },

  labels: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingBottom: 8,
  },

  label: {
    fontSize: 14,
    color: "#000",
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-around",
  },

  wheel: {
    height: ITEM_HEIGHT * VISIBLE,
    width: 60,
  },

  item: {
    height: ITEM_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },

  itemText: {
    fontSize: 24,
    color: "#000",
  },

  highlight: {
    position: "absolute",
    top: ITEM_HEIGHT * CENTER + 42,
    left: 10,
    right: 10,
    height: ITEM_HEIGHT,
    backgroundColor: "rgba(120,120,255,0.35)",
    borderRadius: 10,
  },

  done: {
    textAlign: "center",
    paddingTop: 12,
    fontSize: 16,
    fontWeight: "600",
  },
});
