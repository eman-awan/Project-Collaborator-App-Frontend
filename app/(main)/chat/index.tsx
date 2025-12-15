import { Button } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import { useAppSelector } from "@/store/hooks";
import AppColor from "@/utils/AppColor";
import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ChannelList } from "stream-chat-expo";
import { useChatContext } from "./ChatProvider";

export default function ChatHome() {
  const { chatClient } = useChatContext();
  const theme = useAppSelector(state => state.theme.mode);


  if (!chatClient) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <HStack style={styles.backBox}>
          <Button onPress={() => router.back()}>
            <Icon as={ArrowLeft} size="xl" stroke={AppColor.icons[theme]} />
          </Button>
        </HStack>
        <Text style={{ fontSize: 16 }}>Loading chat...</Text>
      </View>
    );
  }

  const userId = chatClient.user?.id;

  if (!userId) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ fontSize: 16 }}>Connecting...</Text>
      </View>
    );
  }

  const filters = {
    type: "messaging",
    members: { $in: [userId] },
  };

  const sort = { last_message_at: -1 };

  return (
    <View style={{ flex: 1 }}>
      {/* CHANNEL LIST */}
      <ChannelList
        filters={filters}
        sort={sort}
        onSelect={(channel) => {
          router.push({
            pathname: "/(main)/chat/channel",
            params: { cid: channel.cid },
          });
        }}
        EmptyStateIndicator={() => (
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 20,
            }}
          >
            <Text style={{ fontSize: 16, marginBottom: 10 }}>
              No chats yet
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: "#6A4DE8",
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 10,
              }}
              onPress={() => router.push("/(main)/chat/new")}
            >
              <Text style={{ color: "white", fontWeight: "bold" }}>
                Start New Chat
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* FLOATING + BUTTON */}
      <TouchableOpacity
        onPress={() => router.push("/(main)/chat/new")}
        style={{
          position: "absolute",
          bottom: 30,
          right: 25,
          backgroundColor: "#6A4DE8",
          width: 55,
          height: 55,
          borderRadius: 30,
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#000",
          shadowOpacity: 0.3,
          shadowRadius: 4,
        }}
      >
        <Text style={{ color: "white", fontSize: 28 }}>+</Text>
      </TouchableOpacity>
    </View>
  );
}


const styles = StyleSheet.create({
  backBox: {
    marginBottom: 5,
    width: "100%",
    padding: 10,
    paddingLeft: 18,
    justifyContent: "flex-start",
    alignItems: "center"
  },
})