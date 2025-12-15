// src/chat/NewChannelScreen.tsx
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Button, StyleSheet, TextInput, View } from "react-native";
import ChatProvider from "..../app/(main)/chat/chat-clienthat/ChatProvider";
import { chatClient } from "./chat-client"; // optional: global client

export default function NewChannelScreen() {
  const [name, setName] = useState("");
  const router = useRouter();

  const createChannel = async () => {
    if (!name) return;
    const channel = chatClient?.channel("messaging", { name, members: ["<YOUR_USER_ID>"] });
    await channel?.create();
    router.push(`chat/channel?channelId=${channel?.id}`);
  };

  return (
    <ChatProvider>
      <View style={styles.container}>
        <TextInput placeholder="Channel Name" value={name} onChangeText={setName} style={styles.input} />
        <Button title="Create Channel" onPress={createChannel} />
      </View>
    </ChatProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  input: { borderWidth: 1, borderColor: "#ccc", marginBottom: 20, padding: 10, borderRadius: 8 },
});
