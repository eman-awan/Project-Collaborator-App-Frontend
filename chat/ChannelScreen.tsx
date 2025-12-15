import React from "react";
import { View, StyleSheet } from "react-native";
import { Channel, MessageList, MessageInput, TypingIndicator } from "stream-chat-expo";
import { useSearchParams } from "expo-router";
import { useAppSelector } from "@/store/hooks";

export default function ChannelScreen() {
  const { channelId } = useSearchParams();
  const theme = useAppSelector((s) => s.theme.mode);

  if (!channelId) return null;

  return (
    <Channel channelId={String(channelId)}>
      <View style={[styles.container, { backgroundColor: theme === "dark" ? "#0d0d0d" : "#f2f2f2" }]}>
        <MessageList onThreadSelect={(msg) => {}} />
        <TypingIndicator />
        <MessageInput focusAfterSend />
      </View>
    </Channel>
  );
}

const styles = StyleSheet.create({ container: { flex: 1 } });
