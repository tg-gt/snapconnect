import React from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";

import { Image } from "@/components/image";
import { SafeAreaView } from "@/components/safe-area-view";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1, Lead, Muted } from "@/components/ui/typography";
import { useColorScheme } from "@/lib/useColorScheme";

export default function WelcomeScreen() {
	const router = useRouter();
	const { colorScheme } = useColorScheme();
	const appIcon =
		colorScheme === "dark"
			? require("@/assets/icon.png")
			: require("@/assets/icon-dark.png");

	return (
		<SafeAreaView className="flex flex-1 bg-background p-4">
			<View className="flex flex-1 items-center justify-center gap-y-4 web:m-4">
				{/* Stylish EventOS Logo */}
				<View className="mb-6 items-center">
					<View className="flex-row">
						<Text className="text-6xl font-black text-purple-600">Event</Text>
						<Text className="text-6xl font-black text-blue-600">OS</Text>
					</View>
					<View className="flex-row mt-2 gap-1">
						<View className="h-1 w-20 bg-purple-600 rounded-full" />
						<View className="h-1 w-20 bg-blue-600 rounded-full" />
					</View>
				</View>
				
				<H1 className="text-center">Welcome to EventOS</H1>
				<Lead className="text-center text-lg px-4">
					Transform any event into a gamified social experience. Connect with attendees, 
					complete quests, and make lasting connections through AI-powered discovery.
				</Lead>
			</View>
			<View className="flex flex-col gap-y-4 web:m-4">
				<Button
					size="default"
					variant="default"
					onPress={() => {
						router.push("/join-event");
					}}
				>
					<Text>Join Event</Text>
				</Button>
				<View className="flex flex-row items-center gap-x-2 py-2">
					<View className="flex-1 h-[1px] bg-border" />
					<Muted>or create an account</Muted>
					<View className="flex-1 h-[1px] bg-border" />
				</View>
				<Button
					size="default"
					variant="secondary"
					onPress={() => {
						router.push("/sign-up");
					}}
				>
					<Text>Sign Up</Text>
				</Button>
				<Button
					size="default"
					variant="outline"
					onPress={() => {
						router.push("/sign-in");
					}}
				>
					<Text>Sign In</Text>
				</Button>
			</View>
		</SafeAreaView>
	);
}
