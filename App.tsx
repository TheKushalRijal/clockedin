import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import HomeScreen from "./src/Home/Homepage";
export type RootStackParamList = {
  Home: undefined; // Bottom Tabs
  Quiz: undefined;
  Results: { hobby?: string };
  Profilepage: { courseId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {/* Bottom Tabs */}
          <Stack.Screen name="Home" component={HomeScreen} />

          {/* Other screens (push on top later) */}
          {/* <Stack.Screen name="Quiz" component={QuizScreen} /> */}
          {/* <Stack.Screen name="Results" component={ResultsScreen} /> */}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
