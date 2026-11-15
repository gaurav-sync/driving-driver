import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RegistrationProvider } from "../context/RegistrationContext";
import { DriverHomeScreen } from "../screens/driver/DriverHomeScreen";
import { DriverPreviewScreen } from "../screens/driver/DriverPreviewScreen";
import { RegAreasScreen } from "../screens/driver/registration/RegAreasScreen";
import { RegPersonalScreen } from "../screens/driver/registration/RegPersonalScreen";
import { RegPhotosScreen } from "../screens/driver/registration/RegPhotosScreen";
import { RegRatesScreen } from "../screens/driver/registration/RegRatesScreen";
import { RegReviewScreen } from "../screens/driver/registration/RegReviewScreen";
import { RegVehicleScreen } from "../screens/driver/registration/RegVehicleScreen";
import type { DriverStackParamList } from "./types";

const Stack = createNativeStackNavigator<DriverStackParamList>();

function DriverStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerTitleStyle: { fontWeight: "700" },
        headerBackTitle: "Back",
      }}
    >
      <Stack.Screen
        name="DriverHome"
        component={DriverHomeScreen}
        options={{ title: "Driver" }}
      />
      <Stack.Screen name="RegPersonal" component={RegPersonalScreen} options={{ title: "Register" }} />
      <Stack.Screen name="RegAreas" component={RegAreasScreen} options={{ title: "Places" }} />
      <Stack.Screen name="RegVehicle" component={RegVehicleScreen} options={{ title: "Vehicle" }} />
      <Stack.Screen name="RegRates" component={RegRatesScreen} options={{ title: "Rates" }} />
      <Stack.Screen name="RegPhotos" component={RegPhotosScreen} options={{ title: "Photos" }} />
      <Stack.Screen name="RegReview" component={RegReviewScreen} options={{ title: "Review" }} />
      <Stack.Screen
        name="DriverPreview"
        component={DriverPreviewScreen}
        options={{ title: "Preview" }}
      />
    </Stack.Navigator>
  );
}

export function DriverNavigator() {
  return (
    <RegistrationProvider>
      <DriverStack />
    </RegistrationProvider>
  );
}