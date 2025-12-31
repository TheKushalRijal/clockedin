import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { getAllRollups } from "./timerlogic";
import { changeDayHours, deleteDayHours } from "./timechangemutator";

type Entry = {
  id: string;
  date: string;   // YYYY-MM-DD
  hours: number;  // decimal hours
};

type Props = {
  onClose: () => void;
};

const { width } = Dimensions.get("window");

export default function TimesheetCard({ onClose }: Props) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [editDay, setEditDay] = useState<string | null>(null);
  const [inputHours, setInputHours] = useState("");

  /* ───────── LOAD DATA ───────── */

  const loadEntries = async () => {
    const { day } = await getAllRollups();

    const rows: Entry[] = Object.entries(day)
      .map(([dayKey, totalSec]) => ({
        id: dayKey,
        date: dayKey,
        hours: Number((totalSec / 3600).toFixed(2)),
      }))
      .sort((a, b) => (a.date < b.date ? 1 : -1));

    setEntries(rows);
  };

  useEffect(() => {
    loadEntries();
  }, []);

  /* ───────── RENDER ───────── */

  return (
    <View style={styles.card}>
      {/* CLOSE */}
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Ionicons name="close" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {/* HEADER */}
      <View style={styles.headerRow}>
        <Text style={styles.header}>Day</Text>
        <Text style={styles.header}>Hours</Text>
        <View style={styles.headerAction} />
      </View>

      {/* LIST */}
      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.dayText}>{item.date}</Text>
            <Text style={styles.hoursText}>{item.hours}</Text>

            <View style={styles.actions}>
              {/* CHANGE */}
              <TouchableOpacity
                style={styles.pill}
                onPress={() => {
                  setEditDay(item.date);
                  setInputHours(item.hours.toString());
                }}
              >
                <Text style={styles.pillText}>Change</Text>
              </TouchableOpacity>

              {/* DELETE */}
              <TouchableOpacity
                style={styles.pill}
                onPress={async () => {
                  await deleteDayHours(item.date);
                  await loadEntries();
                }}
              >
                <Text style={styles.pillText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* ───────── EDIT HOURS MODAL ───────── */}
      {editDay && (
        <View style={styles.editOverlay}>
          <View style={styles.editModal}>
            <Text style={styles.editTitle}>Edit hours</Text>

            <TextInput
              value={inputHours}
              onChangeText={setInputHours}
              keyboardType="decimal-pad"
              placeholder="e.g. 7.5"
              placeholderTextColor="#9CA3AF"
              style={styles.input}
            />

            <View style={styles.editActions}>
              <TouchableOpacity
                onPress={() => {
                  setEditDay(null);
                  setInputHours("");
                }}
              >
                <Text style={styles.cancel}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={async () => {
                  const hours = Number(inputHours);
                  if (!Number.isFinite(hours) || hours < 0) return;

                  await changeDayHours(editDay, hours);
                  await loadEntries();

                  setEditDay(null);
                  setInputHours("");
                }}
              >
                <Text style={styles.save}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

/* ───────── STYLES ───────── */

const styles = StyleSheet.create({
  card: {
    width: Math.min(width * 0.92, 380),
    maxHeight: 420,
    backgroundColor: "#000000",
    borderRadius: 24,
    padding: 20,
  },

  closeButton: {
    position: "absolute",
    top: 14,
    right: 14,
    zIndex: 10,
  },

  headerRow: {
    flexDirection: "row",
    marginBottom: 12,
    marginTop: 18,
  },

  header: {
    width: 90,
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  headerAction: {
    flex: 1,
  },

  listContent: {
    paddingBottom: 12,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 6,
  },

  dayText: {
    width: 90,
    fontSize: 14,
    color: "#FFFFFF",
  },

  hoursText: {
    width: 50,
    fontSize: 14,
    color: "#FFFFFF",
  },

  actions: {
    flexDirection: "row",
    gap: 6,
    flexShrink: 1,
  },

  pill: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 14,
  },

  pillText: {
    fontSize: 12,
    color: "#111827",
    fontWeight: "500",
  },

  /* EDIT MODAL */

  editOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },

  editModal: {
    width: 280,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
  },

  editTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },

  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    color: "#111827",
  },

  editActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  cancel: {
    color: "#6B7280",
  },

  save: {
    color: "#2563EB",
    fontWeight: "600",
  },
});
