import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../hooks/useAuth";
import { SplashScreen } from "../screens/SplashScreen";
import { CustomerNavigator } from "./CustomerNavigator";
import { DriverNavigator } from "./DriverNavigator";
import { AuthNavigator } from "./AuthNavigator";
import type { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { state } = useAuth();

  if (state.status === "loading") {
    return <SplashScreen />;
  }

  const showAuth =
    state.status === "signedOut" || state.status === "needsProfile";

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {showAuth ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : null}
        {state.status === "signedIn" && state.user.role === "customer" ? (
          <Stack.Screen name="CustomerMain" component={CustomerNavigator} />
        ) : null}
        {state.status === "signedIn" &&
        (state.user.role === "driver" || state.user.role === "admin") ? (
          <Stack.Screen name="DriverMain" component={DriverNavigator} />
        ) : null}
      </Stack.Navigator>
    </NavigationContainer>
  );
}