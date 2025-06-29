import React from 'react';
import { View, TouchableOpacity, Animated } from 'react-native';
import { Text } from '@/components/ui/text';
import { FeedType } from '@/lib/types';

interface FeedToggleProps {
  activeTab: FeedType;
  onTabChange: (tab: FeedType) => void;
}

export function FeedToggle({ activeTab, onTabChange }: FeedToggleProps) {
  const animatedValue = React.useRef(new Animated.Value(activeTab === 'following' ? 0 : 1)).current;
  
  React.useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: activeTab === 'following' ? 0 : 1,
      useNativeDriver: false,
      tension: 68,
      friction: 12,
    }).start();
  }, [activeTab, animatedValue]);

  return (
    <View className="bg-secondary/50 rounded-2xl p-1.5 mx-4 mb-4 shadow-sm">
      <View className="flex-row">
        <TouchableOpacity
          onPress={() => onTabChange('following')}
          className={`flex-1 py-3 px-4 rounded-xl ${
            activeTab === 'following' ? '' : ''
          }`}
        >
          <View className={`${activeTab === 'following' ? 'gradient-primary rounded-xl py-3 px-4 -m-3 -mx-4 shadow-lg shadow-primary/20' : ''}`}>
            <Text
              className={`text-center font-semibold ${
                activeTab === 'following' ? 'text-white' : 'text-muted-foreground'
              }`}
            >
              Following
            </Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => onTabChange('discovery')}
          className={`flex-1 py-3 px-4 rounded-xl ${
            activeTab === 'discovery' ? '' : ''
          }`}
        >
          <View className={`${activeTab === 'discovery' ? 'gradient-primary rounded-xl py-3 px-4 -m-3 -mx-4 shadow-lg shadow-primary/20' : ''}`}>
            <Text
              className={`text-center font-semibold ${
                activeTab === 'discovery' ? 'text-white' : 'text-muted-foreground'
              }`}
            >
              Discovery
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
} 