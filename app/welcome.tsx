import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";

import { Image } from "@/components/image";
import { SafeAreaView } from "@/components/safe-area-view";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1, Lead, Muted } from "@/components/ui/typography";
import { useColorScheme } from "@/lib/useColorScheme";
import { getEventContext } from "@/lib/storage";

export default function WelcomeScreen() {
	const router = useRouter();
	const { colorScheme } = useColorScheme();
	const [eventContext, setEventContext] = useState<any>(null);
	const [isLoading, setIsLoading] = useState(true);
	
	const appIcon =
		colorScheme === "dark"
			? require("@/assets/icon.png")
			: require("@/assets/icon-dark.png");

	useEffect(() => {
		// Check if user has joined an event
		async function checkEvent() {
			try {
				const context = await getEventContext();
				setEventContext(context);
			} catch (error) {
				console.error('Error checking event context:', error);
			} finally {
				setIsLoading(false);
			}
		}
		checkEvent();
	}, []);

	if (isLoading) {
		return null;
	}

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
				
				{eventContext ? (
					<>
						{/* Event Confirmation Badge */}
						<View className="bg-primary/10 px-6 py-3 rounded-full mb-4 border border-primary/20">
							<Text className="text-primary font-semibold">
								✓ Joined: {eventContext.eventName}
							</Text>
						</View>
						
						<H1 className="text-center">Welcome to {eventContext.eventName}</H1>
						<Lead className="text-center text-lg px-4">
							You've successfully joined the event! Sign in or create an account to start 
							connecting with attendees and completing quests.
						</Lead>
						
						{/* Event Details Card */}
						<View className="bg-card p-4 rounded-2xl border border-border w-full max-w-sm mt-2">
							<Text className="text-sm font-semibold text-muted-foreground mb-2">Event Details</Text>
							<View className="space-y-1">
								<Text className="font-medium">{eventContext.eventName}</Text>
								<Text className="text-sm text-muted-foreground">
									{new Date(eventContext.eventStartDate).toLocaleDateString()} - {new Date(eventContext.eventEndDate).toLocaleDateString()}
								</Text>
							</View>
						</View>
					</>
				) : (
					<>
						<H1 className="text-center">Welcome to EventOS</H1>
						<Lead className="text-center text-lg px-4">
							Transform any event into a gamified social experience. Connect with attendees, 
							complete quests, and make lasting connections through AI-powered discovery.
						</Lead>
					</>
				)}
			</View>
			<View className="flex flex-col gap-y-4 web:m-4">
				{!eventContext && (
					<Button
						size="default"
						variant="default"
						onPress={() => {
							router.push("/join-event");
						}}
					>
						<Text>Join Event</Text>
					</Button>
				)}
				<View className="flex flex-row items-center gap-x-2 py-2">
					<View className="flex-1 h-[1px] bg-border" />
					<Muted>{eventContext ? "Sign in to continue" : "or create an account"}</Muted>
					<View className="flex-1 h-[1px] bg-border" />
				</View>
				<Button
					size="default"
					variant={eventContext ? "default" : "secondary"}
					onPress={() => {
						router.push("/sign-up");
					}}
				>
					<Text>Sign Up</Text>
				</Button>
				<Button
					size="default"
					variant={eventContext ? "secondary" : "outline"}
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
