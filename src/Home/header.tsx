import React from "react";
import {
  View,
  Text,
  Animated,
  StyleSheet,
} from "react-native";

type Props = {
  fadeAnim: Animated.Value;
  slideUpAnim: Animated.Value;
  children: React.ReactNode;
};

function getGreeting() {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) return "Good Morning";
  if (hour >= 12 && hour < 17) return "Good Afternoon";
  return "Good Evening";
}

export default function HomeLayout({
  fadeAnim,
  slideUpAnim,
  children,
}: Props) {
  const greeting = getGreeting();

  return (
    <Animated.View
      style={[
        styles.header,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideUpAnim }],
        },
      ]}
    >
      <View>
        <Text style={styles.greeting}>{greeting}</Text>
        <Text style={styles.headerText}>Hard working Man</Text>
      </View>

      {children}
    </Animated.View>
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
