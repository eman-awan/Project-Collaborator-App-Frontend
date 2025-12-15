import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  View,
  Platform,
  Text,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import {
  Channel,
  MessageList,
  MessageInput,
  TypingIndicator,
} from "stream-chat-expo";
import { useChatContext } from "./ChatProvider";

export default function ChannelScreen() {
  const { cid } = useLocalSearchParams();
  const { chatClient } = useChatContext();
  const insets = useSafeAreaInsets();

  const channelRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [otherUser, setOtherUser] = useState(null);

  useEffect(() => {
    if (!chatClient || !cid) return;

    const init = async () => {
      if (channelRef.current) return;

      const [type, channelId] = cid.split(":");
      const ch = chatClient.channel(type, channelId);

      await ch.watch();
      channelRef.current = ch;

      const members = Object.values(ch.state.members);
      const me = chatClient.user.id;
      setOtherUser(members.find((m) => m.user?.id !== me)?.user);

      setLoaded(true);
    };

    init();
  }, [chatClient, cid]);

  if (!loaded || !channelRef.current) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const channel = channelRef.current;

  const androidBottomOffset = Platform.OS === "android" ? insets.bottom  : 0;

  return (
    <View style={{ flex: 1, backgroundColor: "white", paddingBottom: insets.bottom }}>
      <Channel
        channel={channel}
        keyboardVerticalOffset={
          Platform.OS === "ios" ? insets.top + 60 : androidBottomOffset
        }
      >
        {otherUser && (
          <View
            style={{
              padding: 12,
              borderBottomWidth: 1,
              borderColor: "#ddd",
              backgroundColor: "white",
            }}
          >
            <Text style={{ fontWeight: "600", fontSize: 18 }}>
              {otherUser.name}
            </Text>

            <Text style={{ fontSize: 13, color: "gray" }}>
              {otherUser.online ? "Online" : "Last seen recently"}
            </Text>
          </View>
        )}

        <MessageList
          TypingIndicator={TypingIndicator}
          readEventsEnabled
          markReadOnScroll
          keyboardShouldPersistTaps="handled"
        />

      

        <View
          style={{
            paddingBottom: androidBottomOffset,
            backgroundColor: "white",
          }}
        >
          <MessageInput />
        </View>
      </Channel>
    </View>
  );
}
