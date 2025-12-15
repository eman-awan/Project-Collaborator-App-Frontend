// src/chat/ThreadScreen.tsx
import { useSearchParams } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Channel, MessageInput, Thread } from "stream-chat-expo";
import ChatProvider from "../app/(main)/chat/ChatProvider";

export default function ThreadScreen() {
  const { channelId, parentId } = useSearchParams();

  if (!channelId || !parentId) return null;

  return (
    <ChatProvider>
      <Channel channelId={String(channelId)}>
        <View style={styles.container}>
          <Thread threadId={String(parentId)} />
          <MessageInput focusAfterSend />
        </View>
      </Channel>
    </ChatProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
