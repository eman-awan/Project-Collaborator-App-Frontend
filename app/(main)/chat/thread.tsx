import { useChatClient } from "@/app/(main)/chat/ChatProvider";
import { useLocalSearchParams } from "expo-router";
import { Thread } from "stream-chat-expo";

export default function ThreadScreen() {
  const { cid } = useLocalSearchParams();
  const chatClient = useChatClient();

  const channel = chatClient.channel("messaging", cid);

  return <Thread channel={channel} />;
}
