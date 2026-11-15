import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { DriverDetailScreen } from "../screens/customer/DriverDetailScreen";
import { MyProfileScreen } from "../screens/customer/MyProfileScreen";
import { ReportDriverScreen } from "../screens/customer/ReportDriverScreen";
import { ResultsScreen } from "../screens/customer/ResultsScreen";
import { SearchHomeScreen } from "../screens/customer/SearchHomeScreen";
import type { CustomerStackParamList } from "./types";

const Stack = createNativeStackNavigator<CustomerStackParamList>();

export function CustomerNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#fff" },
        headerTitleStyle: { fontWeight: "700", fontSize: 18 },
        headerBackTitle: "Back",
      }}
    >
      <Stack.Screen
        name="SearchHome"
        component={SearchHomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Results"
        component={ResultsScreen}
        options={{ title: "Drivers" }}
      />
      <Stack.Screen
        name="DriverDetail"
        component={DriverDetailScreen}
        options={{ title: "Driver" }}
      />
      <Stack.Screen
        name="MyProfile"
        component={MyProfileScreen}
        options={{ title: "My profile" }}
      />
      <Stack.Screen
        name="ReportDriver"
        component={ReportDriverScreen}
        options={{ title: "Report" }}
      />
    </Stack.Navigator>
  );
}