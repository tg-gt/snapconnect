import React from "react";
import { View } from "react-native";
import { SafeAreaView } from "@/components/safe-area-view";
import { Text } from "@/components/ui/text";

export default function SearchScreen() {
	return (
		<SafeAreaView className="flex-1 bg-background">
			<View className="flex-1 px-4 py-6">
				<Text className="text-2xl font-bold mb-4">Explore</Text>
				<Text className="text-muted-foreground">
					Search and discover content coming soon...
				</Text>
			</View>
		</SafeAreaView>
	);
} 