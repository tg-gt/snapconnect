import React, { useState } from 'react';
import { Modal, View, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text } from '@/components/ui/text';
import { Ionicons } from '@expo/vector-icons';
import { queryEventData } from '@/lib/chat-assistant';
import { useColorScheme } from '@/lib/useColorScheme';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface EventAssistantProps {
  visible: boolean;
  onClose: () => void;
}

export function EventAssistant({ visible, onClose }: EventAssistantProps) {
  const { colorScheme } = useColorScheme();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '👋 Hi! I can help you with questions about your quest progress, rankings, and achievements. What would you like to know?',
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMessage: Message = { 
      role: 'user', 
      content: input,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    
    try {
      const response = await queryEventData(input);
      const assistantMessage: Message = { 
        role: 'assistant', 
        content: response,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = { 
        role: 'assistant', 
        content: 'Sorry, something went wrong. Please try again.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setMessages([{
      role: 'assistant',
      content: '👋 Hi! I can help you with questions about your quest progress, rankings, and achievements. What would you like to know?',
      timestamp: new Date().toISOString()
    }]);
    setInput('');
    setLoading(false);
    onClose();
  };

  const suggestedQuestions = [
    "What's my current ranking?",
    "Who completed the most quests?",
    "What achievements can I still unlock?",
    "Show me the leaderboard"
  ];

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 bg-background"
      >
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-border bg-card">
          <View className="flex-row items-center">
            <View className="w-8 h-8 rounded-full bg-primary/20 items-center justify-center mr-3">
              <Text className="text-lg">🤖</Text>
            </View>
            <Text className="text-lg font-semibold">Event Assistant</Text>
          </View>
          <TouchableOpacity onPress={handleClose}>
            <Ionicons 
              name="close" 
              size={24} 
              color={colorScheme === 'dark' ? '#FFFFFF' : '#000000'} 
            />
          </TouchableOpacity>
        </View>

        {/* Messages */}
        <ScrollView className="flex-1 p-4">
          {messages.map((message, index) => (
            <View
              key={index}
              className={`mb-4 ${
                message.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <View
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-primary'
                    : 'bg-muted'
                }`}
              >
                <Text
                  className={
                    message.role === 'user'
                      ? 'text-primary-foreground'
                      : 'text-foreground'
                  }
                >
                  {message.content}
                </Text>
              </View>
            </View>
          ))}
          
          {loading && (
            <View className="items-start mb-4">
              <View className="bg-muted p-3 rounded-lg">
                <Text className="text-muted-foreground">Thinking...</Text>
              </View>
            </View>
          )}

          {/* Suggested Questions */}
          {messages.length === 1 && !loading && (
            <View className="mt-4">
              <Text className="text-sm text-muted-foreground mb-2">Try asking:</Text>
              {suggestedQuestions.map((question, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setInput(question)}
                  className="bg-muted/50 p-2 rounded-lg mb-2 border border-border"
                >
                  <Text className="text-sm text-foreground">{question}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <View className="flex-row items-center p-4 border-t border-border bg-card">
          <TextInput
            className="flex-1 border border-border rounded-lg px-3 py-2 mr-2 bg-background text-foreground"
            placeholder="Ask about your progress..."
            placeholderTextColor={colorScheme === 'dark' ? '#888888' : '#666666'}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={handleSend}
            multiline={false}
            editable={!loading}
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={loading || !input.trim()}
            className={`p-2 rounded-lg ${
              loading || !input.trim() 
                ? 'bg-muted' 
                : 'bg-primary'
            }`}
          >
            <Ionicons 
              name="send" 
              size={20} 
              color={loading || !input.trim() ? '#888888' : 'white'}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
} 