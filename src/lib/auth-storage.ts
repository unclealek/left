import AsyncStorage from "@react-native-async-storage/async-storage";

// Web remains subject to browser/XSS protections. Native resolves auth-storage.native.ts.
export const authStorage = AsyncStorage;
