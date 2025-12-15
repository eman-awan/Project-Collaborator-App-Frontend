import { ENV_CONFIG } from "@/env_config";
import { JWTStorage } from "@/secure-storage/jwt-storage";
import axios from "axios";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { useChatContext } from "./ChatProvider"; // adjust path if needed

export default function NewChat() {
  console.log("🟦 NewChat Screen Mounted");
  const { chatClient } = useChatContext();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    if (!chatClient) {
      return;
    }

    const loadUsers = async () => {
      try {
        console.log("📥 Fetching user list...");
        const token = await JWTStorage.getToken();

        const res = await axios.get(`${ENV_CONFIG.API_URL}/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUsers(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load users:", err);
      }
    };

    loadUsers();
  }, [chatClient]);


  const handleStartChat = async (otherUserId: string) => {
    try {

      if (!chatClient) {
        return;
      }

      const currentUserId = chatClient.user?.id;

      const channel = chatClient.channel("messaging", {
        members: [String(currentUserId), String(otherUserId)],
      });

      console.log("📡 Watching channel...");
      await channel.watch();


      router.push({
        pathname: "/(main)/chat/channel",
        params: { cid: channel.cid },
      });

    } catch (error: any) {
      console.error("Error creating channel:", error);
    }
  };


  if (!chatClient) {
    return <Text style={{ marginTop: 40, textAlign: "center" }}>Loading chat...</Text>;
  }

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 20 }}>
        Start a New Chat
      </Text>

      {loading ? (
        <Text>Loading users...</Text>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={{
                padding: 15,
                backgroundColor: "#f2f2f2",
                marginBottom: 10,
                borderRadius: 8,
              }}
              onPress={() => handleStartChat(item.id)}
            >
              <Text style={{ fontWeight: "600" }}>{item.firstName} {item.lastName}</Text>
              <Text style={{ opacity: 0.7 }}>{item.email}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}
