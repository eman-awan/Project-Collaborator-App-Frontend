import React from "react";
import { View, StyleSheet } from "react-native";
import { ChannelList, ChannelPreviewMessenger } from "stream-chat-expo";
import { useRouter } from "expo-router";

export default function ChannelListScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <ChannelList
        Preview={ChannelPreviewMessenger}
        filters={{ type: "messaging" }}
        sort={[{ last_message_at: -1 }]}
        onSelect={(channel) => router.push(`/chat/channel?channelId=${channel.id}`)}
      />
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1 } });
