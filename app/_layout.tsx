import "../global.css";

import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";

import { AuthProvider } from "@/context/supabase-provider";
import { useColorScheme } from "@/lib/useColorScheme";
import { colors } from "@/constants/colors";
import { getEventContext } from "@/lib/storage";

export default function AppLayout() {
	const { colorScheme } = useColorScheme();
	const [isCheckingEvent, setIsCheckingEvent] = useState(true);
	const router = useRouter();
	const segments = useSegments();

	// Check for existing event context on app startup
	useEffect(() => {
		async function checkEventContext() {
			try {
				const eventContext = await getEventContext();
				setIsCheckingEvent(false);
				
				// If no event context and not on join-event page, redirect
				const isOnJoinEvent = segments.join('/').includes('join-event');
				if (!eventContext && !isOnJoinEvent) {
					// Small delay to ensure navigation is ready
					setTimeout(() => {
						router.replace('/join-event');
					}, 100);
				}
			} catch (error) {
				console.error('Error checking event context:', error);
				setIsCheckingEvent(false);
			}
		}
		
		checkEventContext();
	}, []);

	if (isCheckingEvent) {
		// You could add a loading screen here
		return null;
	}

	return (
		<AuthProvider>
			<Stack screenOptions={{ headerShown: false, gestureEnabled: false }}>
				<Stack.Screen name="(protected)" />
				<Stack.Screen name="welcome" />
				<Stack.Screen name="join-event" />
				<Stack.Screen
					name="sign-up"
					options={{
						presentation: "modal",
						headerShown: true,
						headerTitle: "Sign Up",
						headerStyle: {
							backgroundColor:
								colorScheme === "dark"
									? colors.dark.background
									: colors.light.background,
						},
						headerTintColor:
							colorScheme === "dark"
								? colors.dark.foreground
								: colors.light.foreground,
						gestureEnabled: true,
					}}
				/>
				<Stack.Screen
					name="sign-in"
					options={{
						presentation: "modal",
						headerShown: true,
						headerTitle: "Sign In",
						headerStyle: {
							backgroundColor:
								colorScheme === "dark"
									? colors.dark.background
									: colors.light.background,
						},
						headerTintColor:
							colorScheme === "dark"
								? colors.dark.foreground
								: colors.light.foreground,
						gestureEnabled: true,
					}}
				/>
			</Stack>
		</AuthProvider>
	);
}
