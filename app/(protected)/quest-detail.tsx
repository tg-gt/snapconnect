import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from '@/components/safe-area-view';
import { QuestProgress } from '@/components/quests/QuestProgress';
import { LocationTracker } from '@/components/quests/LocationTracker';
import { Quest, QuestProgress as QuestProgressType, LocationData } from '@/lib/types';
import { cn } from '@/lib/utils';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { supabase } from '@/config/supabase';
import { saveQuestCompletion, isQuestCompleted } from '@/lib/storage';

export default function QuestDetailScreen() {
  const params = useLocalSearchParams();
  const questId = params.questId as string;
  
  // Mock quest data - in real app, this would come from API
  const [quest] = useState<Quest>({
    id: questId || 'demo-quest-1',
    event_id: '550e8400-e29b-41d4-a716-446655440000',
    title: 'Find the Main Stage',
    description: 'Navigate to the main stage area and take a photo of the stage setup. This quest will help you get familiar with the venue layout.',
    quest_type: 'location',
    points_reward: 50,
    location_latitude: 37.7749, // Example coordinates (San Francisco)
    location_longitude: -122.4194,
    location_radius_meters: 100,
    required_photo: true,
    is_active: true,
    order_index: 1,
    created_at: new Date().toISOString(),
  });

  const [questProgress, setQuestProgress] = useState<QuestProgressType>({
    quest,
    is_in_range: false,
    can_complete: false,
    progress_percentage: 20,
    distance_to_location: undefined,
  });

  const [isCompleting, setIsCompleting] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Check if quest is already completed on mount
  useEffect(() => {
    async function checkCompletion() {
      const completed = await isQuestCompleted(quest.id);
      if (completed) {
        setIsCompleted(true);
        setQuestProgress(prev => ({
          ...prev,
          completion: {
            id: 'completion-existing',
            quest_id: quest.id,
            participant_id: 'demo-participant-123',
            points_earned: quest.points_reward,
            completed_at: new Date().toISOString(),
            verified: true,
          },
          progress_percentage: 100,
          can_complete: false,
        }));
      }
    }
    checkCompletion();
  }, [quest.id]);

  // Handle location updates from LocationTracker
  const handleLocationUpdate = (location: LocationData, distance: number, inRange: boolean) => {
    setQuestProgress(prev => ({
      ...prev,
      distance_to_location: distance,
      is_in_range: inRange,
      can_complete: inRange && quest.required_photo ? (capturedPhoto !== null) : inRange, // Need photo if required
      progress_percentage: inRange ? (quest.required_photo ? (capturedPhoto ? 100 : 75) : 100) : Math.max(20, 100 - (distance / quest.location_radius_meters) * 80),
    }));
  };

  // Handle quest completion
  const handleCompleteQuest = async () => {
    if (!questProgress.can_complete) {
      Alert.alert(
        'Cannot Complete Quest',
        'You need to be in range of the quest location to complete it.',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsCompleting(true);
    
    try {
      // Haptic feedback
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // Mock completion logic - in real app, this would call API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update quest progress to completed
      setQuestProgress(prev => ({
        ...prev,
        completion: {
          id: 'completion-' + Date.now(),
          quest_id: quest.id,
          participant_id: 'demo-participant-123',
          points_earned: quest.points_reward,
          completed_at: new Date().toISOString(),
          verified: true,
        },
        progress_percentage: 100,
        can_complete: false,
      }));

      Alert.alert(
        'Quest Completed! 🎉',
        `You earned ${quest.points_reward} points!`,
        [
          {
            text: 'Awesome!',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error('Error completing quest:', error);
      Alert.alert('Error', 'Failed to complete quest. Please try again.');
    } finally {
      setIsCompleting(false);
    }
  };

  // Handle photo capture and verification
  const handleTakePhoto = async () => {
    try {
      // Request camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Camera permission is needed to take photos for quests.');
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8, // Reduce quality to keep file size manageable
      });

      if (!result.canceled && result.assets[0]) {
        const photoUri = result.assets[0].uri;
        setCapturedPhoto(photoUri);
        
        // Verify the photo
        await verifyAndCompleteQuest(photoUri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  // Verify photo with AI and complete quest
  const verifyAndCompleteQuest = async (photoUri: string) => {
    setIsVerifying(true);
    
    try {
      // Convert photo to base64
      const base64 = await FileSystem.readAsStringAsync(photoUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      console.log('Sending photo for verification...');
      
      // Call edge function
      const { data, error } = await supabase.functions.invoke('verify-quest-photo', {
        body: {
          photoBase64: base64,
          questRequirements: quest.description
        }
      });
      
      if (error) {
        throw error;
      }
      
      console.log('Verification result:', data);
      
      if (data.verified) {
        // Save completion to storage
        await saveQuestCompletion(quest.id, {
          photoUrl: photoUri,
          completedAt: new Date().toISOString(),
          pointsEarned: quest.points_reward
        });
        
        // Haptic feedback
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        
        // Update UI state
        setIsCompleted(true);
        setQuestProgress(prev => ({
          ...prev,
          completion: {
            id: 'completion-' + Date.now(),
            quest_id: quest.id,
            participant_id: 'demo-participant-123',
            points_earned: quest.points_reward,
            completed_at: new Date().toISOString(),
            verified: true,
          },
          progress_percentage: 100,
          can_complete: false,
        }));
        
        Alert.alert(
          'Quest Completed! 🎉',
          `${data.reason}\n\nYou earned ${quest.points_reward} points!`,
          [
            {
              text: 'Awesome!',
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        Alert.alert(
          'Try Again',
          data.reason || 'Photo doesn\'t match quest requirements. Please try again.',
          [
            {
              text: 'Retake Photo',
              onPress: () => {
                setCapturedPhoto(null);
                handleTakePhoto();
              }
            },
            { text: 'Cancel', style: 'cancel' }
          ]
        );
      }
    } catch (error) {
      console.error('Verification error:', error);
      Alert.alert('Verification Failed', 'Unable to verify photo. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle view on map
  const handleViewOnMap = () => {
    // Navigate to map screen (to be implemented in Week 3)
    Alert.alert('Coming Soon', 'Map functionality will be available soon!');
    // router.push({
    //   pathname: '/(protected)/event-map',
    //   params: { questId: quest.id },
    // });
  };

  const getQuestTypeDisplay = () => {
    switch (quest.quest_type) {
      case 'location':
        return { icon: 'location', label: 'Location Quest' };
      case 'photo':
        return { icon: 'camera', label: 'Photo Quest' };
      case 'social':
        return { icon: 'people', label: 'Social Quest' };
      case 'scavenger':
        return { icon: 'search', label: 'Scavenger Hunt' };
      case 'sponsor':
        return { icon: 'storefront', label: 'Sponsor Quest' };
      default:
        return { icon: 'trophy', label: 'Quest' };
    }
  };

  const questTypeDisplay = getQuestTypeDisplay();

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Ionicons name="chevron-back" size={24} className="text-gray-600 dark:text-gray-300" />
        </TouchableOpacity>
        
        <Text className="text-lg font-semibold text-gray-900 dark:text-white">
          Quest Details
        </Text>
        
        <TouchableOpacity onPress={handleViewOnMap} className="p-2">
          <Ionicons name="map-outline" size={24} className="text-blue-600" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-4 space-y-6">
          {/* Quest Header */}
          <View className="bg-white dark:bg-gray-800 rounded-xl p-6">
            <View className="flex-row items-center mb-3">
              <Ionicons 
                name={questTypeDisplay.icon as any} 
                size={24} 
                className="text-blue-600 mr-3" 
              />
              <Text className="text-sm text-blue-600 font-medium">
                {questTypeDisplay.label}
              </Text>
            </View>
            
            <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              {quest.title}
            </Text>
            
            <Text className="text-gray-600 dark:text-gray-300 text-base leading-relaxed">
              {quest.description}
            </Text>
          </View>

          {/* Location Tracker */}
          {quest.location_latitude && quest.location_longitude && (
            <LocationTracker quest={quest} onLocationUpdate={handleLocationUpdate}>
              <View className="bg-white dark:bg-gray-800 rounded-xl p-4">
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-lg font-semibold text-gray-900 dark:text-white">
                    Location
                  </Text>
                  <TouchableOpacity 
                    onPress={handleViewOnMap}
                    className="flex-row items-center"
                  >
                    <Text className="text-blue-600 font-medium mr-1">View Map</Text>
                    <Ionicons name="map-outline" size={16} className="text-blue-600" />
                  </TouchableOpacity>
                </View>
                
                <View className="flex-row items-center">
                  <Ionicons name="location-outline" size={16} className="text-gray-500 mr-2" />
                  <Text className="text-gray-600 dark:text-gray-300">
                    Target Location • {quest.location_radius_meters}m range
                  </Text>
                </View>
                
                {questProgress.distance_to_location && (
                  <View className="mt-2 flex-row items-center">
                    <Ionicons 
                      name={questProgress.is_in_range ? "checkmark-circle" : "radio-button-off"} 
                      size={16} 
                      className={questProgress.is_in_range ? "text-green-600" : "text-gray-400"}
                    />
                    <Text className={cn(
                      "ml-2 text-sm font-medium",
                      questProgress.is_in_range ? "text-green-600" : "text-gray-600 dark:text-gray-300"
                    )}>
                      {questProgress.is_in_range 
                        ? "You're in range!" 
                        : `${Math.round(questProgress.distance_to_location)}m away`
                      }
                    </Text>
                  </View>
                )}
              </View>
            </LocationTracker>
          )}

          {/* Quest Progress */}
          <QuestProgress questProgress={questProgress} />

          {/* Photo Section */}
          {quest.required_photo && !isCompleted && (
            <View className="bg-white dark:bg-gray-800 rounded-xl p-4">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-lg font-semibold text-gray-900 dark:text-white">
                  Photo Required
                </Text>
                <Ionicons name="camera-outline" size={20} className="text-blue-600" />
              </View>
              
              <Text className="text-gray-600 dark:text-gray-300 mb-4">
                Take a photo to complete this quest. Make sure to capture what's described in the quest.
              </Text>
              
              {capturedPhoto && (
                <View className="mb-4">
                  <Image 
                    source={{ uri: capturedPhoto }} 
                    className="w-full h-48 rounded-lg mb-2"
                    resizeMode="cover"
                  />
                  {isVerifying && (
                    <View className="flex-row items-center justify-center py-2">
                      <Text className="text-blue-600 font-medium">AI Verifying Photo...</Text>
                    </View>
                  )}
                </View>
              )}
              
              <TouchableOpacity
                onPress={handleTakePhoto}
                disabled={!questProgress.is_in_range || isVerifying}
                className={cn(
                  'flex-row items-center justify-center py-3 px-4 rounded-lg',
                  questProgress.is_in_range && !isVerifying
                    ? 'bg-blue-600'
                    : 'bg-gray-300 dark:bg-gray-600'
                )}
              >
                <Ionicons 
                  name="camera" 
                  size={20} 
                  className={questProgress.is_in_range && !isVerifying ? "text-white mr-2" : "text-gray-500 mr-2"} 
                />
                <Text className={cn(
                  'font-medium',
                  questProgress.is_in_range && !isVerifying ? 'text-white' : 'text-gray-500'
                )}>
                  {capturedPhoto ? 'Retake Photo' : 'Take Photo'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Completion Button */}
          {!questProgress.completion?.verified && !isCompleted && (
            <TouchableOpacity
              onPress={handleCompleteQuest}
              disabled={!questProgress.can_complete || isCompleting}
              className={cn(
                'flex-row items-center justify-center py-4 px-6 rounded-xl',
                questProgress.can_complete
                  ? 'bg-green-600'
                  : 'bg-gray-300 dark:bg-gray-600'
              )}
            >
              {isCompleting ? (
                <View className="flex-row items-center">
                  <Text className="text-white font-semibold text-lg mr-2">Completing...</Text>
                </View>
              ) : (
                <View className="flex-row items-center">
                  <Ionicons 
                    name="trophy" 
                    size={24} 
                    className={questProgress.can_complete ? "text-white mr-3" : "text-gray-500 mr-3"} 
                  />
                  <Text className={cn(
                    'font-bold text-lg',
                    questProgress.can_complete ? 'text-white' : 'text-gray-500'
                  )}>
                    Complete Quest ({quest.points_reward} pts)
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}

          {/* Completed State */}
          {questProgress.completion?.verified && (
            <View className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 items-center">
              <Ionicons name="checkmark-circle" size={48} className="text-green-600 mb-3" />
              <Text className="text-xl font-bold text-green-800 dark:text-green-200 mb-2">
                Quest Completed! 🎉
              </Text>
              <Text className="text-green-700 dark:text-green-300 text-center">
                You earned {quest.points_reward} points
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 