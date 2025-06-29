import React, { useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from '@/components/safe-area-view';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DEMO_EVENT_CONTEXT } from '@/lib/types';

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
      <div className="flex-1 p-6 justify-center">
        <div className="max-w-sm w-full mx-auto">
          <Text className="text-3xl font-bold text-center mb-2">Join Event</Text>
          <Text className="text-muted-foreground text-center mb-8">
            Enter your event code to start connecting and completing quests
          </Text>
          
          <div className="space-y-4">
            <Input
              value={code}
              onChangeText={setCode}
              placeholder="Enter event code"
              autoCapitalize="characters"
              autoCorrect={false}
              editable={!loading}
              className="text-center text-xl tracking-widest"
            />
            
            {error ? (
              <Text className="text-destructive text-sm text-center">{error}</Text>
            ) : null}
            
            <Button 
              onPress={handleJoin} 
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Joining...' : 'Join Event'}
            </Button>
          </div>
          
          <Text className="text-xs text-muted-foreground text-center mt-8">
            Don't have an event code? Ask your event organizer.
          </Text>
        </div>
      </div>
    </SafeAreaView>
  );
} 