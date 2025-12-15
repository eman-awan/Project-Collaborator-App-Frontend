// app/(main)/chat/ChatProvider.tsx
import { ENV_CONFIG } from "@/env_config";
import { JWTStorage } from "@/secure-storage/jwt-storage";
import { useAppSelector } from "@/store/hooks";
import axios from "axios";
import React, { createContext, useContext, useEffect, useState } from "react";
import { StreamChat } from "stream-chat";

export const ChatContext = createContext<{
  chatClient: StreamChat | null;
}>({
  chatClient: null,
});

export const useChatContext = () => useContext(ChatContext);

export default function ChatProvider({ children }: { children: any }) {
  const user = useAppSelector((state) => state.auth);
  const [chatClient, setChatClient] = useState<StreamChat | null>(null);

  useEffect(() => {
    let mounted = true;
    let client: StreamChat | null = null;

    const init = async () => {
      if (!user?.id) return;

      try {
        const token = await JWTStorage.getToken();
        if (!token) return;

        const res = await axios.post(
          `${ENV_CONFIG.API_URL}/chat/token`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const { streamToken } = res.data;

        client = StreamChat.getInstance(ENV_CONFIG.STREAM_API_KEY as string);

        // 🛑 FIX: Prevent double login
        if (client.userID) {
          console.log("⚠️ User already connected → disconnecting first");
          await client.disconnectUser();
        }

        console.log("🔌 Connecting user to Stream…", user.id);

        await client.connectUser(
          {
            id: String(user.id),
            name: `${user.firstName} ${user.lastName}`,
          },
          streamToken
        );

        if (mounted) {
          setChatClient(client);
        }

      } catch (err) {
        console.log("💥 Stream chat error:", err);
      }
    };

    init();

    // 🧹 CLEANUP FIX — guaranteed disconnect
    return () => {
      mounted = false;
      if (client) {
        console.log("🔻 Disconnecting Stream user on cleanup…");
        client.disconnectUser();
      }
    };
  }, [user?.id]);

  return (
    <ChatContext.Provider value={{ chatClient }}>
      {children}
    </ChatContext.Provider>
  );
}
