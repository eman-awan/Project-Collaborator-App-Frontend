// app/(main)/chat/_layout.tsx

import { Stack } from "expo-router";
import ChatProvider from "./ChatProvider";

export default function ChatLayout() {
  return (
    <ChatProvider>
      <Stack initialRouteName="index">
        <Stack.Screen name="index" options={{ title: "Messages" }} />
        <Stack.Screen name="new" options={{ title: "New Chat" }} />
        <Stack.Screen name="channel" options={{ title: "Chat" }} />
        <Stack.Screen name="thread" options={{ title: "Thread" }} />
      </Stack>
    </ChatProvider>
  );
}
