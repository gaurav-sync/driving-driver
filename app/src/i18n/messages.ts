export type Locale = "en" | "mr" | "hi";

export type MessageKey =
  | "appName"
  | "welcomeTagline"
  | "continueGoogle"
  | "findDriver"
  | "searchDrivers"
  | "callDriver"
  | "reportDriver"
  | "signOut"
  | "networkError"
  | "retry"
  | "driverHome"
  | "registerDriver"
  | "editProfile";

const en: Record<MessageKey, string> = {
  appName: "Local Drivers",
  welcomeTagline:
    "Find car owners with drivers in Karmala and nearby talukas. Call directly to book.",
  continueGoogle: "Continue with Google",
  findDriver: "Find a driver",
  searchDrivers: "Search drivers",
  callDriver: "Call driver",
  reportDriver: "Report this driver",
  signOut: "Sign out",
  networkError: "Could not reach the server. Check your connection.",
  retry: "Retry",
  driverHome: "Driver home",
  registerDriver: "Register as driver",
  editProfile: "Edit profile",
};

const mr: Record<MessageKey, string> = {
  appName: "लोकल ड्रायव्हर्स",
  welcomeTagline:
    "करमाळा आणि आसपासच्या तालुक्यांत ड्रायव्हरसह गाड्या शोधा. थेट कॉल करा.",
  continueGoogle: "Google सोबत सुरू ठेवा",
  findDriver: "ड्रायव्हर शोधा",
  searchDrivers: "ड्रायव्हर शोधा",
  callDriver: "ड्रायव्हरला कॉल करा",
  reportDriver: "या ड्रायव्हरची तक्रार करा",
  signOut: "बाहेर पडा",
  networkError: "सर्व्हरशी संपर्क होत नाही. इंटरनेट तपासा.",
  retry: "पुन्हा प्रयत्न",
  driverHome: "ड्रायव्हर होम",
  registerDriver: "ड्रायव्हर म्हणून नोंदणी",
  editProfile: "प्रोफाइल बदला",
};

const hi: Record<MessageKey, string> = {
  appName: "लोकल ड्राइवर्स",
  welcomeTagline:
    "करमाला और नज़दीकी तालुकाओं में ड्राइवर वाली गाड़ियाँ खोजें। सीधे कॉल करें।",
  continueGoogle: "Google से जारी रखें",
  findDriver: "ड्राइवर खोजें",
  searchDrivers: "ड्राइवर खोजें",
  callDriver: "ड्राइवर को कॉल करें",
  reportDriver: "इस ड्राइवर की शिकायत करें",
  signOut: "साइन आउट",
  networkError: "सर्वर तक नहीं पहुँच सके। कनेक्शन जाँचें।",
  retry: "फिर कोशिश करें",
  driverHome: "ड्राइवर होम",
  registerDriver: "ड्राइवर के रूप में रजिस्टर करें",
  editProfile: "प्रोफ़ाइल संपादित करें",
};

export const catalogs = { en, mr, hi };