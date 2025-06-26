import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { FeedType } from '@/lib/types';

interface FeedToggleProps {
  activeTab: FeedType;
  onTabChange: (tab: FeedType) => void;
}

export function FeedToggle({ activeTab, onTabChange }: FeedToggleProps) {
  return (
    <View className="flex-row bg-muted rounded-lg p-1 mx-4 mb-3">
      <TouchableOpacity
        onPress={() => onTabChange('following')}
        className={`flex-1 py-2 px-4 rounded-md ${
          activeTab === 'following' ? 'bg-background shadow-sm' : ''
        }`}
      >
        <Text
          className={`text-center font-medium ${
            activeTab === 'following' ? 'text-foreground' : 'text-muted-foreground'
          }`}
        >
          Following
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        onPress={() => onTabChange('discovery')}
        className={`flex-1 py-2 px-4 rounded-md ${
          activeTab === 'discovery' ? 'bg-background shadow-sm' : ''
        }`}
      >
        <Text
          className={`text-center font-medium ${
            activeTab === 'discovery' ? 'text-foreground' : 'text-muted-foreground'
          }`}
        >
          Discovery
        </Text>
      </TouchableOpacity>
    </View>
  );
} 