import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../hooks/useAuth";
import { RoleDetailsScreen } from "../screens/RoleDetailsScreen";
import { WelcomeScreen } from "../screens/WelcomeScreen";
import type { AuthStackParamList } from "./types";

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthNavigator() {
  const { state } = useAuth();
  const startOnRole =
    state.status === "needsProfile" ? "RoleDetails" : "Welcome";

  return (
    <Stack.Navigator
      key={startOnRole}
      initialRouteName={startOnRole}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="RoleDetails" component={RoleDetailsScreen} />
    </Stack.Navigator>
  );
}