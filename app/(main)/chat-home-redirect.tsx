import ThemeToggleButton from "@/components/ThemeToggleButton";
import { useAppSelector } from "@/store/hooks";
import AppColor from "@/utils/AppColor";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";

export default function ChatHomeRedirect() {
  const theme = useAppSelector(state => state.theme.mode);

  const handleChatNavigation = () => {
    router.push("/(main)/chat");
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingTop: 80, paddingBottom: 10, alignItems: 'center' }}
        keyboardShouldPersistTaps="handled"
      >
        <LinearGradient
          colors={theme === "light" ? ['#5F4366', '#707A8D'] : [AppColor.primary.light, 'gray']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.button}
        >
          <TouchableOpacity style={styles.buttonInner} onPress={handleChatNavigation}>
            <Text style={styles.buttonText}>Chat</Text>
          </TouchableOpacity>
        </LinearGradient>

        <ThemeToggleButton />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  button: {
    width: "80%",
    borderRadius: 8,
    marginBottom: 30,
  },
  buttonInner: {
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  }
});