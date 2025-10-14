"use client";

import { ChatKit, useChatKit } from '@openai/chatkit-react';

export default function ChatInterface() {
  const { control } = useChatKit({
    api: {
      async getClientSecret(existing) {
        if (existing) {
          // implement session refresh
        }
        const res = await fetch('/api/chatkit/session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const { client_secret } = await res.json();
        return client_secret;
      },
    },
  });
  
  return <ChatKit control={control} className="h-full w-full" />;
}