# Frontend Phase 3 Plan: Direct Messaging and Chat System

## Phase 3 Objectives
Build the complete messaging interface for VibesMatch, including message requests, real-time chat, and conversation management. This phase introduces the core communication features that enable users to connect and build relationships.

## Screen Structure

### Messages Tab (`app/(tabs)/messages.tsx`)
Main messaging hub with four sub-tabs:
- **Chats**: Active conversations
- **Requests**: Received and sent message requests
- **Viewed**: Profile view tracking (I Viewed, Viewed Me) - Displays profiles the user has viewed and profiles that have viewed the user. Requires API calls to `GET /api/v1/users/profile-views` for "who viewed me" and `GET /api/v1/users/my-views` for "who I viewed".

### Chat Screen (`app/chat/[conversationId].tsx`)
Real-time messaging interface for individual conversations.

### Message Request Screen (`app/messages/request/[userId].tsx`)
Interface for composing and sending message requests.

### Profile Actions Screen (`app/profile/[userId]/actions.tsx`) 
Action sheet for matched/pending users implemented as a bottom sheet or modal containing options like "Block User," "Report User," "Unmatch," and "Cancel Request," each with confirmation dialogs. The specific options displayed depend on the relationship status between the current user and the profile being viewed.

## API Integration

### Message API Client
```typescript
// services/messages.ts
export interface MessageRequest {
  id: string;
  sender: {
    id: string;
    name: string;
    profile_photos: string[];
    age: number;
    is_online: boolean;
    last_active: string;
  };
  receiver?: {
    id: string;
    name: string;
    profile_photos: string[];
  };
  preview_text: string;
  status: 'pending' | 'accepted' | 'declined' | 'cancelled';
  created_at: string;
}

export interface Conversation {
  id: string;
  user: {
    id: string;
    name: string;
    profile_photos: string[];
    is_online: boolean;
    last_active: string;
  };
  last_message: {
    id: string;
    content: string;
    sender_id: string;
    created_at: string;
    is_read: boolean;
  };
  unread_count: number;
  last_activity: string;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  message_type: 'text' | 'image' | 'emoji';
  is_request: boolean;
  request_status?: 'pending' | 'accepted' | 'declined' | 'cancelled';
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

export const messagesAPI = {
  async sendMessageRequest(receiverId: string, content: string): Promise<APIResponse<{
    request_id: string;
    message_id: string;
    message: string;
    preview_text: string;
    status: string;
  }>> {
    return apiClient.request('/messages/request', {
      method: 'POST',
      body: JSON.stringify({
        receiver_id: receiverId,
        content,
      }),
    });
  },

  async respondToRequest(requestId: string, action: 'accept' | 'decline'): Promise<APIResponse<{
    message: string;
    conversation_id?: string;
    match_created?: boolean;
    match_id?: string;
  }>> {
    return apiClient.request(`/messages/request/${requestId}/respond`, {
      method: 'POST',
      body: JSON.stringify({ action }),
    });
  },

  async sendMessage(receiverId: string, content: string, messageType: string = 'text'): Promise<APIResponse<{
    message_id: string;
    conversation_id: string;
    message: string;
    created_at: string;
  }>> {
    return apiClient.request('/messages/send', {
      method: 'POST',
      body: JSON.stringify({
        receiver_id: receiverId,
        content,
        message_type: messageType,
      }),
    });
  },

  async getConversations(limit: number = 20, cursor?: string, type: string = 'active'): Promise<APIResponse<{
    conversations: Conversation[];
    meta: {
      pagination: {
        cursor: string;
        hasMore: boolean;
      };
    };
  }>> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      type,
      ...(cursor && { cursor }),
    });
    
    return apiClient.request(`/conversations?${params}`);
  },

  async getMessages(conversationId: string, limit: number = 50, cursor?: string): Promise<APIResponse<{
    messages: Message[];
    meta: {
      pagination: {
        cursor: string;
        hasMore: boolean;
      };
    };
  }>> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      ...(cursor && { cursor }),
    });
    
    return apiClient.request(`/conversations/${conversationId}/messages?${params}`);
  },

  async getMessageRequests(type: 'received' | 'sent' = 'received', status: string = 'pending', limit: number = 20): Promise<APIResponse<{
    requests: MessageRequest[];
    meta: {
      pagination: {
        cursor: string;
        hasMore: boolean;
      };
    };
  }>> {
    const params = new URLSearchParams({
      type,
      status,
      limit: limit.toString(),
    });
    
    return apiClient.request(`/messages/requests?${params}`);
  },

  async markMessageAsRead(messageId: string): Promise<APIResponse<{
    message: string;
    read_at: string;
  }>> {
    return apiClient.request(`/messages/${messageId}/read`, {
      method: 'PUT',
    });
  },

  async blockUser(userId: string, reason?: string): Promise<APIResponse<{
    message: string;
  }>> {
    return apiClient.request(`/users/${userId}/block`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  async reportUser(userId: string, reason: string, description?: string): Promise<APIResponse<{
    message: string;
    report_id: string;
  }>> {
    return apiClient.request(`/users/${userId}/report`, {
      method: 'POST',
      body: JSON.stringify({ reason, description }),
    });
  },

  async unmatchUser(matchId: string): Promise<APIResponse<{
    message: string;
  }>> {
    return apiClient.request(`/matches/${matchId}`, {
      method: 'DELETE',
    });
  },
};
```

### WebSocket Integration
```typescript
// services/websocket.ts
import io, { Socket } from 'socket.io-client';
import Constants from 'expo-constants';

export interface WebSocketMessage {
  message_id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string; // Explicitly included for type safety
  content: string;
  message_type: string;
  created_at: string;
}

export interface TypingStatus {
  conversation_id: string;
  user_id: string;
  is_typing: boolean;
}

export interface OnlineStatus {
  user_id: string;
  is_online: boolean;
  last_active?: string;
}

class WebSocketService {
  private socket: Socket | null = null;
  private isConnected = false;

  connect(token: string) {
    this.socket = io(process.env.EXPO_PUBLIC_WS_URL || 'ws://localhost:3001', {
      auth: { token },
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      this.isConnected = true;
      console.log('WebSocket connected');
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
      console.log('WebSocket disconnected');
    });

    this.socket.on('authenticated', (data) => {
      console.log('WebSocket authenticated:', data);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Message events
  onNewMessage(callback: (message: WebSocketMessage) => void) {
    this.socket?.on('new_message', callback);
  }

  onMessageRead(callback: (data: { message_id: string; read_by: string; read_at: string }) => void) {
    this.socket?.on('message_read', callback);
  }

  sendMessage(conversationId: string, receiverId: string, content: string, messageType: string = 'text') {
    this.socket?.emit('send_message', {
      conversation_id: conversationId,
      receiver_id: receiverId,
      content,
      message_type: messageType,
    });
  }

  markMessageRead(messageId: string) {
    this.socket?.emit('mark_read', { message_id: messageId });
  }

  // Typing events
  onTypingStatus(callback: (status: TypingStatus) => void) {
    this.socket?.on('user_typing', callback);
  }

  startTyping(conversationId: string) {
    this.socket?.emit('typing_start', { conversation_id: conversationId });
  }

  stopTyping(conversationId: string) {
    this.socket?.emit('typing_stop', { conversation_id: conversationId });
  }

  // Presence events
  onUserOnline(callback: (data: OnlineStatus) => void) {
    this.socket?.on('user_online', callback);
  }

  onUserOffline(callback: (data: OnlineStatus) => void) {
    this.socket?.on('user_offline', callback);
  }

  // Utility
  isSocketConnected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }
}

export const webSocketService = new WebSocketService();
```

## State Management

### Messages Store
```typescript
// stores/messagesStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface MessagesState {
  conversations: Conversation[];
  currentConversation: string | null;
  messages: Record<string, Message[]>; // conversationId -> messages
  messageRequests: {
    received: MessageRequest[];
    sent: MessageRequest[];
  };
  unreadCounts: Record<string, number>; // conversationId -> count
  typingUsers: Record<string, string[]>; // conversationId -> userIds
  onlineUsers: Set<string>;
  isLoading: boolean;
  isLoadingMessages: boolean;
  error: string | null;
}

interface MessagesActions {
  // Conversations
  fetchConversations: () => Promise<void>;
  setCurrentConversation: (conversationId: string | null) => void;
  
  // Messages
  fetchMessages: (conversationId: string, loadMore?: boolean) => Promise<void>;
  sendMessage: (receiverId: string, content: string) => Promise<void>;
  addMessage: (message: Message) => void;
  markMessageAsRead: (messageId: string) => void;
  
  // Message Requests
  fetchMessageRequests: (type: 'received' | 'sent') => Promise<void>;
  sendMessageRequest: (receiverId: string, content: string) => Promise<void>;
  respondToRequest: (requestId: string, action: 'accept' | 'decline') => Promise<void>;
  
  // Real-time updates
  handleNewMessage: (message: WebSocketMessage) => void;
  handleMessageRead: (data: { message_id: string; read_by: string; read_at: string }) => void;
  handleTypingStatus: (status: TypingStatus) => void;
  handleUserOnline: (data: OnlineStatus) => void;
  handleUserOffline: (data: OnlineStatus) => void;
  
  // Utility
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useMessagesStore = create<MessagesState & MessagesActions>()(
  persist(
    (set, get) => ({
      conversations: [],
      currentConversation: null,
      messages: {},
      messageRequests: { received: [], sent: [] },
      unreadCounts: {},
      typingUsers: {},
      onlineUsers: new Set(),
      isLoading: false,
      isLoadingMessages: false,
      error: null,

      fetchConversations: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await messagesAPI.getConversations();
          if (response.success && response.data) {
            const conversations = response.data.conversations;
            const unreadCounts: Record<string, number> = {};
            
            conversations.forEach(conv => {
              unreadCounts[conv.id] = conv.unread_count;
            });
            
            set({
              conversations,
              unreadCounts,
              isLoading: false,
            });
          } else {
            set({ error: response.error?.message || 'Failed to load conversations', isLoading: false });
          }
        } catch (error) {
          set({ error: 'Network error', isLoading: false });
        }
      },

      setCurrentConversation: (conversationId: string | null) => {
        set({ currentConversation: conversationId });
      },

      fetchMessages: async (conversationId: string, loadMore = false) => {
        set({ isLoadingMessages: true, error: null });
        try {
          const existingMessages = get().messages[conversationId] || [];
          const cursor = loadMore && existingMessages.length > 0 
            ? existingMessages[0].id 
            : undefined;

          const response = await messagesAPI.getMessages(conversationId, 50, cursor);
          
          if (response.success && response.data) {
            const newMessages = response.data.messages;
            
            set(state => ({
              messages: {
                ...state.messages,
                [conversationId]: loadMore 
                  ? [...newMessages, ...existingMessages]
                  : newMessages,
              },
              isLoadingMessages: false,
            }));
          } else {
            set({ error: response.error?.message || 'Failed to load messages', isLoadingMessages: false });
          }
        } catch (error) {
          set({ error: 'Network error', isLoadingMessages: false });
        }
      },

      sendMessage: async (receiverId: string, content: string) => {
        try {
          const response = await messagesAPI.sendMessage(receiverId, content);
          
          if (response.success && response.data) {
            // Message will be added via WebSocket event
            // Optionally update conversation list
            get().fetchConversations();
          } else {
            set({ error: response.error?.message || 'Failed to send message' });
          }
        } catch (error) {
          set({ error: 'Network error' });
        }
      },

      addMessage: (message: Message) => {
        const conversationId = get().currentConversation;
        if (!conversationId) return;

        set(state => ({
          messages: {
            ...state.messages,
            [conversationId]: [...(state.messages[conversationId] || []), message],
          },
        }));
      },

      markMessageAsRead: async (messageId: string) => {
        try {
          await messagesAPI.markMessageAsRead(messageId);
          // Update will come via WebSocket
        } catch (error) {
          console.error('Failed to mark message as read:', error);
        }
      },

      fetchMessageRequests: async (type: 'received' | 'sent') => {
        try {
          const response = await messagesAPI.getMessageRequests(type);
          
          if (response.success && response.data) {
            set(state => ({
              messageRequests: {
                ...state.messageRequests,
                [type]: response.data!.requests,
              },
            }));
          }
        } catch (error) {
          set({ error: 'Failed to load message requests' });
        }
      },

      sendMessageRequest: async (receiverId: string, content: string) => {
        try {
          const response = await messagesAPI.sendMessageRequest(receiverId, content);
          
          if (response.success) {
            // Refresh sent requests
            get().fetchMessageRequests('sent');
          } else {
            set({ error: response.error?.message || 'Failed to send message request' });
          }
        } catch (error) {
          set({ error: 'Network error' });
        }
      },

      respondToRequest: async (requestId: string, action: 'accept' | 'decline') => {
        try {
          const response = await messagesAPI.respondToRequest(requestId, action);
          
          if (response.success) {
            // Refresh requests and conversations
            get().fetchMessageRequests('received');
            get().fetchConversations();
          } else {
            set({ error: response.error?.message || 'Failed to respond to request' });
          }
        } catch (error) {
          set({ error: 'Network error' });
        }
      },

      handleNewMessage: (wsMessage: WebSocketMessage) => {
        const message: Message = {
          id: wsMessage.message_id,
          sender_id: wsMessage.sender_id,
          receiver_id: '', // Will be filled by backend
          content: wsMessage.content,
          message_type: wsMessage.message_type as 'text' | 'image' | 'emoji',
          is_request: false,
          is_read: false,
          created_at: wsMessage.created_at,
        };

        set(state => ({
          messages: {
            ...state.messages,
            [wsMessage.conversation_id]: [
              ...(state.messages[wsMessage.conversation_id] || []),
              message,
            ],
          },
        }));

        // Update conversation list
        get().fetchConversations();
      },

      handleMessageRead: (data: { message_id: string; read_by: string; read_at: string }) => {
        const { messages } = get();
        
        Object.keys(messages).forEach(conversationId => {
          const conversationMessages = messages[conversationId];
          const messageIndex = conversationMessages.findIndex(m => m.id === data.message_id);
          
          if (messageIndex !== -1) {
            set(state => ({
              messages: {
                ...state.messages,
                [conversationId]: state.messages[conversationId].map(msg =>
                  msg.id === data.message_id
                    ? { ...msg, is_read: true, read_at: data.read_at }
                    : msg
                ),
              },
            }));
          }
        });
      },

      handleTypingStatus: (status: TypingStatus) => {
        set(state => {
          const currentTyping = state.typingUsers[status.conversation_id] || [];
          
          if (status.is_typing) {
            if (!currentTyping.includes(status.user_id)) {
              return {
                typingUsers: {
                  ...state.typingUsers,
                  [status.conversation_id]: [...currentTyping, status.user_id],
                },
              };
            }
          } else {
            return {
              typingUsers: {
                ...state.typingUsers,
                [status.conversation_id]: currentTyping.filter(id => id !== status.user_id),
              },
            };
          }
          
          return state;
        });
      },

      handleUserOnline: (data: OnlineStatus) => {
        set(state => ({
          onlineUsers: new Set([...state.onlineUsers, data.user_id]),
        }));
      },

      handleUserOffline: (data: OnlineStatus) => {
        set(state => {
          const newOnlineUsers = new Set(state.onlineUsers);
          newOnlineUsers.delete(data.user_id);
          return { onlineUsers: newOnlineUsers };
        });
      },

      setError: (error: string | null) => set({ error }),
      
      reset: () => set({
        conversations: [],
        currentConversation: null,
        messages: {},
        messageRequests: { received: [], sent: [] },
        unreadCounts: {},
        typingUsers: {},
        onlineUsers: new Set(),
        isLoading: false,
        isLoadingMessages: false,
        error: null,
      }),
    }),
    {
      name: 'messages-store',
      partialize: (state) => ({
        conversations: state.conversations,
        messages: state.messages,
        unreadCounts: state.unreadCounts,
      }),
    }
  )
);
```

## Screen Components

### Messages Tab Screen
```typescript
// app/(tabs)/messages.tsx
import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useMessagesStore } from '@/stores/messagesStore';
import { webSocketService } from '@/services/websocket';
import { useAuthStore } from '@/stores/authStore';
import { ChatsTab } from '@/components/messages/ChatsTab';
import { RequestsTab } from '@/components/messages/RequestsTab';
import { ViewedTab } from '@/components/messages/ViewedTab';

const Tab = createMaterialTopTabNavigator();

export default function MessagesScreen() {
  const { accessToken } = useAuthStore();
  const { 
    fetchConversations, 
    fetchMessageRequests,
    handleNewMessage,
    handleMessageRead,
    handleTypingStatus,
    handleUserOnline,
    handleUserOffline,
  } = useMessagesStore();

  useEffect(() => {
    // Initialize WebSocket connection
    if (accessToken) {
      webSocketService.connect(accessToken);
      
      // Set up WebSocket event listeners
      webSocketService.onNewMessage(handleNewMessage);
      webSocketService.onMessageRead(handleMessageRead);
      webSocketService.onTypingStatus(handleTypingStatus);
      webSocketService.onUserOnline(handleUserOnline);
      webSocketService.onUserOffline(handleUserOffline);
    }

    // Fetch initial data
    fetchConversations();
    fetchMessageRequests('received');
    fetchMessageRequests('sent');

    return () => {
      webSocketService.disconnect();
    };
  }, [accessToken]);

  return (
    <View style={styles.container}>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#E91E63',
          tabBarInactiveTintColor: '#666',
          tabBarIndicatorStyle: { backgroundColor: '#E91E63' },
          tabBarStyle: { backgroundColor: '#fff' },
        }}
      >
        <Tab.Screen name="Chats" component={ChatsTab} />
        <Tab.Screen name="Requests" component={RequestsTab} />
        <Tab.Screen name="Viewed" component={ViewedTab} />
      </Tab.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
```

### Chat Screen
```typescript
// app/chat/[conversationId].tsx
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { Send, MoreVertical } from 'lucide-react-native';
import { useMessagesStore } from '@/stores/messagesStore';
import { webSocketService } from '@/services/websocket';
import { MessageBubble } from '@/components/messages/MessageBubble';
import { TypingIndicator } from '@/components/messages/TypingIndicator';
import { useAuthStore } from '@/stores/authStore';

export default function ChatScreen() {
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const {
    messages,
    conversations,
    typingUsers,
    onlineUsers,
    fetchMessages,
    setCurrentConversation,
    sendMessage,
    markMessageAsRead,
  } = useMessagesStore();

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const conversation = conversations.find(c => c.id === conversationId);
  const conversationMessages = messages[conversationId!] || [];
  const otherUser = conversation?.user;
  const isOtherUserTyping = typingUsers[conversationId!]?.some(id => id !== user?.id);
  const isOtherUserOnline = otherUser ? onlineUsers.has(otherUser.id) : false;

  useEffect(() => {
    if (conversationId) {
      setCurrentConversation(conversationId);
      fetchMessages(conversationId);
      
      // Set navigation title
      navigation.setOptions({
        title: otherUser?.name || 'Chat',
        headerRight: () => (
          <TouchableOpacity onPress={() => {/* Open profile actions */}}>
            <MoreVertical size={24} color="#333" />
          </TouchableOpacity>
        ),
      });
    }

    return () => {
      setCurrentConversation(null);
    };
  }, [conversationId, otherUser]);

  useEffect(() => {
    // Mark messages as read when they come into view
    const unreadMessages = conversationMessages.filter(m => !m.is_read && m.sender_id !== user?.id);
    unreadMessages.forEach(message => {
      markMessageAsRead(message.id);
    });
  }, [conversationMessages]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || !otherUser) return;

    const messageContent = inputText.trim();
    setInputText('');
    
    // Stop typing indicator
    if (isTyping) {
      webSocketService.stopTyping(conversationId!);
      setIsTyping(false);
    }

    await sendMessage(otherUser.id, messageContent);
    
    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleInputChange = (text: string) => {
    setInputText(text);
    
    // Handle typing indicator
    if (text.length > 0 && !isTyping) {
      setIsTyping(true);
      webSocketService.startTyping(conversationId!);
    } else if (text.length === 0 && isTyping) {
      setIsTyping(false);
      webSocketService.stopTyping(conversationId!);
    }

    // Reset typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        webSocketService.stopTyping(conversationId!);
      }
    }, 3000);
  };

  const renderMessage = ({ item: message }: { item: Message }) => (
    <MessageBubble
      message={message}
      isOwn={message.sender_id === user?.id}
      showReadReceipt={message.sender_id === user?.id && message.is_read}
    />
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <Text style={styles.userName}>{otherUser?.name}</Text>
        {isOtherUserOnline && (
          <Text style={styles.onlineStatus}>Online now</Text>
        )}
      </View>

      <FlatList
        ref={flatListRef}
        data={conversationMessages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
      />

      {isOtherUserTyping && (
        <TypingIndicator userName={otherUser?.name || 'User'} />
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={handleInputChange}
          placeholder="Type a message..."
          multiline
          maxLength={1000}
        />
        <TouchableOpacity
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={handleSendMessage}
          disabled={!inputText.trim()}
        >
          <Send size={20} color={inputText.trim() ? '#E91E63' : '#ccc'} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  onlineStatus: {
    fontSize: 14,
    color: '#4CAF50',
    marginTop: 2,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
```

### Message Request Screen
```typescript
// app/messages/request/[userId].tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useMessagesStore } from '@/stores/messagesStore';
import { useDiscoveryStore } from '@/stores/discoveryStore';

export default function MessageRequestScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const [message, setMessage] = useState('');
  const { sendMessageRequest } = useMessagesStore();
  const { profiles } = useDiscoveryStore();

  const targetUser = profiles.find(p => p.id === userId);
  const characterLimit = 250;
  const remainingChars = characterLimit - message.length;

  const handleSendRequest = async () => {
    if (!message.trim()) {
      Alert.alert('Error', 'Please enter a message');
      return;
    }

    if (message.length > characterLimit) {
      Alert.alert('Error', `Message must be ${characterLimit} characters or less`);
      return;
    }

    try {
      await sendMessageRequest(userId!, message.trim());
      Alert.alert(
        'Request Sent!',
        `Your message request has been sent to ${targetUser?.name}`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to send message request. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Send Message Request</Text>
        <Text style={styles.subtitle}>
          Send a message to {targetUser?.name} to start a conversation
        </Text>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={message}
          onChangeText={setMessage}
          placeholder="Write your message here..."
          multiline
          maxLength={characterLimit}
          textAlignVertical="top"
        />
        <Text style={[
          styles.characterCount,
          remainingChars < 20 && styles.characterCountWarning
        ]}>
          {remainingChars} characters remaining
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]}
          onPress={handleSendRequest}
          disabled={!message.trim()}
        >
          <Text style={styles.sendButtonText}>Send Request</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  inputContainer: {
    flex: 1,
    marginBottom: 20,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  characterCount: {
    textAlign: 'right',
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  characterCountWarning: {
    color: '#E91E63',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E91E63',
  },
  cancelButtonText: {
    color: '#E91E63',
    fontSize: 16,
    fontWeight: '600',
  },
  sendButton: {
    flex: 1,
    backgroundColor: '#E91E63',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
```

## UI Components

### Message Bubble Component
```typescript
// components/messages/MessageBubble.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Check, CheckCheck } from 'lucide-react-native';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showReadReceipt?: boolean;
  message,
  isOwn,
  showReadReceipt,
  onRead
export function MessageBubble({ message, isOwn, showReadReceipt }: MessageBubbleProps) {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={[styles.container, isOwn ? styles.ownMessage : styles.otherMessage]}>
      <View style={[styles.bubble, isOwn ? styles.ownBubble : styles.otherBubble]}>
        {message.is_request && (
          <Text style={styles.requestLabel}>Message Request</Text>
        )}
        <Text style={[styles.messageText, isOwn ? styles.ownText : styles.otherText]}>
          {message.content}
        </Text>
        <View style={styles.messageFooter}>
          <Text style={[styles.timestamp, isOwn ? styles.ownTimestamp : styles.otherTimestamp]}>
            {formatTime(message.created_at)}
          </Text>
          {isOwn && showReadReceipt && (
            <View style={styles.readReceipt}>
              {message.is_read ? (
                <CheckCheck size={16} color="#4CAF50" />
              ) : (
                <Check size={16} color="#666" />
              )}
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    paddingHorizontal: 10,
  },
  ownMessage: {
    alignItems: 'flex-end',
  },
  otherMessage: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
  },
  ownBubble: {
    backgroundColor: '#E91E63',
    borderBottomRightRadius: 5,
  },
  otherBubble: {
    backgroundColor: '#f0f0f0',
    borderBottomLeftRadius: 5,
  },
  requestLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 5,
    textAlign: 'center',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  ownText: {
    color: '#fff',
  },
  otherText: {
    color: '#333',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    gap: 5,
  },
  timestamp: {
    fontSize: 12,
  },
  ownTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  otherTimestamp: {
    color: '#666',
  },
  readReceipt: {
    marginLeft: 5,
  },
});
```

### Typing Indicator Component
```typescript
// components/messages/TypingIndicator.tsx
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

interface TypingIndicatorProps {
  userName: string;
}

export function TypingIndicator({ userName }: TypingIndicatorProps) {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animateDots = () => {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(dot1, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(dot2, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(dot3, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(dot1, { toValue: 0, duration: 400, useNativeDriver: true }),
          Animated.timing(dot2, { toValue: 0, duration: 400, useNativeDriver: true }),
          Animated.timing(dot3, { toValue: 0, duration: 400, useNativeDriver: true }),
        ])
      );
      animation.start();
      return animation;
    };

    const animation = animateDots();
    return () => animation.stop();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.bubble}>
        <Text style={styles.text}>{userName} is typing</Text>
        <View style={styles.dotsContainer}>
          <Animated.View style={[styles.dot, { opacity: dot1 }]} />
          <Animated.View style={[styles.dot, { opacity: dot2 }]} />
          <Animated.View style={[styles.dot, { opacity: dot3 }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: 'flex-start',
  },
  bubble: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    borderBottomLeftRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontSize: 14,
    color: '#666',
    marginRight: 10,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 3,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#666',
  },
});
```

## Navigation Updates

### Tab Navigation
```typescript
// app/(tabs)/_layout.tsx (UPDATED)
import { Tabs } from 'expo-router';
import { Heart, MessageCircle, User, Settings } from 'lucide-react-native';
import { useMessagesStore } from '@/stores/messagesStore';

export default function TabLayout() {
  const { unreadCounts } = useMessagesStore();
  const totalUnread = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#E91E63',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#f0f0f0',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Discovery',
          tabBarIcon: ({ size, color }) => (
            <Heart size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ size, color }) => (
            <MessageCircle size={size} color={color} />
          ),
          tabBarBadge: totalUnread > 0 ? totalUnread : undefined,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ size, color }) => (
            <User size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ size, color }) => (
            <Settings size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
```

## Error Handling

### Message Error Handling
```typescript
// utils/messageErrorHandler.ts
export const handleMessageError = (error: any) => {
  if (error.code === 'MESSAGE_REQUEST_EXISTS') {
    return {
      title: 'Request Already Sent',
      message: 'You have already sent a message request to this user.',
      action: 'ok',
    };
  }
  
  if (error.code === 'USER_BLOCKED') {
    return {
      title: 'Unable to Message',
      message: 'This user is not available for messaging.',
      action: 'ok',
    };
  }
  
  if (error.code === 'CONTENT_TOO_LONG') {
    return {
      title: 'Message Too Long',
      message: 'Please shorten your message and try again.',
      action: 'retry',
    };
  }
  
  if (error.code === 'RATE_LIMIT_EXCEEDED') {
    return {
      title: 'Too Many Messages',
      message: 'Please wait a moment before sending another message.',
      action: 'wait',
    };
  }
  
  return {
    title: 'Something went wrong',
    message: error.message || 'Please try again later.',
    action: 'retry',
  };
};
```

## Performance Optimizations

### Message List Optimization
```typescript
// hooks/useMessageOptimization.ts
import { useCallback, useMemo } from 'react';
import { Message } from '@/types/messages';

export function useMessageOptimization(messages: Message[]) {
  const getItemLayout = useCallback((data: any, index: number) => ({
    length: 80, // Estimated message height
    offset: 80 * index,
    index,
  }), []);

  const keyExtractor = useCallback((item: Message) => item.id, []);

  const memoizedMessages = useMemo(() => messages, [messages]);

  return {
    getItemLayout,
    keyExtractor,
    messages: memoizedMessages,
  };
}
```

### WebSocket Connection Management
```typescript
// hooks/useWebSocketConnection.ts
import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { webSocketService } from '@/services/websocket';
import { useAuthStore } from '@/stores/authStore';

export function useWebSocketConnection() {
  const { accessToken } = useAuthStore();
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // App came to foreground, reconnect WebSocket
        if (accessToken && !webSocketService.isSocketConnected()) {
          webSocketService.connect(accessToken);
        }
      } else if (nextAppState.match(/inactive|background/)) {
        // App went to background, disconnect WebSocket
        webSocketService.disconnect();
      }
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [accessToken]);
}
```

## File Structure
```
app/
├── (tabs)/
│   └── messages.tsx # Messages tab with sub-tabs (UPDATED)
├── chat/
│   └── [conversationId].tsx # Individual chat screen (NEW)
├── messages/
│   └── request/
│       └── [userId].tsx # Message request screen (NEW)
└── profile/
    └── [userId]/
        └── actions.tsx # Profile actions (NEW)

components/
├── messages/
│   ├── ChatsTab.tsx # Chats list (NEW)
│   ├── RequestsTab.tsx # Message requests (NEW)
│   ├── ViewedTab.tsx # Profile views (NEW)
│   ├── MessageBubble.tsx # Message display (NEW)
│   ├── TypingIndicator.tsx # Typing animation (NEW)
│   ├── ConversationItem.tsx # Conversation list item (NEW)
│   └── RequestItem.tsx # Request list item (NEW)

services/
├── messages.ts # Message API client (NEW)
├── websocket.ts # WebSocket service (NEW)
└── api.ts # Base API client (UPDATED)

stores/
├── messagesStore.ts # Messages state management (NEW)
└── authStore.ts # Authentication store (UPDATED)

types/
├── messages.ts # Message types (NEW)
├── conversation.ts # Conversation types (NEW)
└── websocket.ts # WebSocket types (NEW)

hooks/
├── useMessageOptimization.ts # Message list optimization (NEW)
├── useWebSocketConnection.ts # WebSocket management (NEW)
└── useTypingIndicator.ts # Typing indicator logic (NEW)

utils/
├── messageErrorHandler.ts # Message error handling (NEW)
└── messageHelpers.ts # Message utility functions (NEW)
```

## Testing Requirements

### Unit Tests
- Test message store actions and state updates
- Test WebSocket service connection and events
- Test message API client functions
- Test utility functions and error handlers

### Integration Tests
- Test complete message request flow
- Test real-time messaging with WebSocket
- Test conversation management
- Test blocking and reporting functionality

### UI Tests
- Test message bubble rendering
- Test typing indicator animation
- Test conversation list display
- Test message request interface

### Performance Tests
- Test message list scrolling performance
- Test WebSocket connection stability
- Test memory usage during long conversations
- Test real-time message delivery latency

## Accessibility Features
- Screen reader support for all message elements
- Proper focus management in chat interface
- High contrast mode support for message bubbles
- Voice control compatibility for message actions

## Security Considerations
- Message content validation and sanitization
- WebSocket authentication and authorization
- Rate limiting for message sending
- Blocked user interaction prevention
- Secure message storage and transmission

Phase 3 frontend implementation focuses on creating a comprehensive messaging system that provides real-time communication, intuitive user interfaces, and seamless integration with the backend messaging APIs.