// chat/chat-client.ts
import { StreamChat } from 'stream-chat';

const STREAM_KEY = process.env.EXPO_PUBLIC_STREAM_KEY;

if (!STREAM_KEY) {
  console.warn("❌ STREAM KEY MISSING in EXPO_PUBLIC_STREAM_KEY");
}

export const chatClient = StreamChat.getInstance(STREAM_KEY);
