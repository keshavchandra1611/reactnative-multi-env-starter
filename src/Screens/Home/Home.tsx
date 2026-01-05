import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";

export default function Home({ navigation }: any) {
    return (
        <View style={styles.container}>
            <StatusBar style="auto" />
            <Text style={styles.successText}>🎉 Successfully Logged In!</Text>
            <Text style={styles.welcomeText}>Welcome to Leap Clicker</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#e6ffe6", // light green for success
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
    },
    successText: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#2ecc71", // green
        marginBottom: 10,
        textAlign: "center",
    },
    welcomeText: {
        fontSize: 18,
        color: "#333",
        marginBottom: 30,
        textAlign: "center",
    },
});
