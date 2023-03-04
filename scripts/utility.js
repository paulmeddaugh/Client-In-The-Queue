import { Alert, Platform } from "react-native";

// Utility function for showing alerts on all platforms
export function alert(mobileTitle, message, mobileButtons) {
    if (Platform.OS !== 'web') { // Alert for mobile
        Alert.alert(
            mobileTitle,
            message,
            mobileButtons
        );
    } else { // Alert for web
        window.confirm(mobileTitle + "\n" + message);
    }
} 