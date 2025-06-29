import React, { useState } from 'react';
import { Alert, View, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from '@/components/safe-area-view';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DEMO_EVENT_CONTEXT } from '@/lib/types';

const { height } = Dimensions.get('window');

export default function JoinEventScreen() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleJoin = async () => {
    setError('');
    
    if (!code.trim()) {
      setError('Please enter an event code');
      return;
    }
    
    if (code.toUpperCase() !== 'SNAP24') {
      setError('Invalid event code. Please try again.');
      return;
    }

    setLoading(true);

    try {
      // Save event context to AsyncStorage
      const eventContext = {
        ...DEMO_EVENT_CONTEXT,
        joinedAt: new Date().toISOString()
      };
      
      await AsyncStorage.setItem('eventContext', JSON.stringify(eventContext));
      
      // Navigate to the main app
      router.replace('/(protected)/(tabs)');
    } catch (err) {
      console.error('Error joining event:', err);
      Alert.alert('Error', 'Failed to join event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="absolute top-0 left-0 right-0 h-96 gradient-primary opacity-20" />
      
      <View className="flex-1 p-6 justify-center">
        <View className="max-w-sm w-full mx-auto">
          <View className="bg-card rounded-3xl p-8 shadow-xl shadow-black/10 border border-border/50">
            <View className="items-center mb-6">
              <View className="w-24 h-24 gradient-primary rounded-full items-center justify-center mb-4 shadow-lg shadow-primary/30">
                <Text className="text-white font-bold text-lg">EventOS</Text>
              </View>
              <Text className="text-3xl font-bold text-center mb-2">Join Event</Text>
              <Text className="text-muted-foreground text-center text-base">
                Enter your event code to start connecting and completing quests
              </Text>
            </View>
            
            <View className="space-y-4">
              <View>
                <Input
                  value={code}
                  onChangeText={(text) => {
                    setCode(text);
                    setError(''); // Clear error when user types
                  }}
                  placeholder="Enter event code"
                  autoCapitalize="characters"
                  autoCorrect={false}
                  editable={!loading}
                  className="text-center text-xl tracking-widest font-semibold h-14 border-2 focus:border-primary"
                  style={{
                    borderColor: error ? '#ef4444' : undefined,
                  }}
                />
                
                {error ? (
                  <Text className="text-destructive text-sm text-center mt-2 font-medium">{error}</Text>
                ) : null}
              </View>
              
              <Button 
                onPress={handleJoin} 
                disabled={loading}
                className="w-full h-14"
                size="lg"
              >
                <Text className="text-lg font-semibold">
                  {loading ? 'Joining...' : 'Join Event'}
                </Text>
              </Button>
            </View>
          </View>
          
          <Text className="text-sm text-muted-foreground text-center mt-8 px-4">
            Don't have an event code? Ask your event organizer.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
} 