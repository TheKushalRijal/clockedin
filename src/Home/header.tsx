import React from "react";
import {
  View,
  Text,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  fadeAnim: Animated.Value;
  slideUpAnim: Animated.Value;
  children: React.ReactNode;

};

export default function HomeLayout({
  fadeAnim,
  slideUpAnim,
  children,
}: Props) {
  return (
   
     
        <View style={styles.header}>
                      <View>
                        <Text style={styles.greeting}>Good Morning</Text>
                        <Text style={styles.headerText}>Hard working person</Text>
                      </View>
                     
                    </View>
  );
}
const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 2,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 4,
  },
  greeting: {
    fontSize: 14,
    color: "#9CA3AF",
    marginBottom: 4,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },

 
});
