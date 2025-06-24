import { AppState, Platform } from "react-native";

import "react-native-get-random-values";
import * as aesjs from "aes-js";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string;

class LargeSecureStore {
	private async _encrypt(key: string, value: string) {
		const encryptionKey = crypto.getRandomValues(new Uint8Array(256 / 8));
		const cipher = new aesjs.ModeOfOperation.ctr(
			encryptionKey,
			new aesjs.Counter(1),
		);
		const encryptedBytes = cipher.encrypt(aesjs.utils.utf8.toBytes(value));

		// Only use SecureStore on native platforms
		if (Platform.OS !== "web") {
			await SecureStore.setItemAsync(
				key,
				aesjs.utils.hex.fromBytes(encryptionKey),
			);
		} else {
			// On web, store encryption key in AsyncStorage with a prefix
			await AsyncStorage.setItem(
				`${key}_encryption_key`,
				aesjs.utils.hex.fromBytes(encryptionKey),
			);
		}
		return aesjs.utils.hex.fromBytes(encryptedBytes);
	}

	private async _decrypt(key: string, value: string) {
		let encryptionKeyHex: string | null;

		// Get encryption key based on platform
		if (Platform.OS !== "web") {
			encryptionKeyHex = await SecureStore.getItemAsync(key);
		} else {
			encryptionKeyHex = await AsyncStorage.getItem(`${key}_encryption_key`);
		}

		if (!encryptionKeyHex) {
			return encryptionKeyHex;
		}
		const cipher = new aesjs.ModeOfOperation.ctr(
			aesjs.utils.hex.toBytes(encryptionKeyHex),
			new aesjs.Counter(1),
		);
		const decryptedBytes = cipher.decrypt(aesjs.utils.hex.toBytes(value));
		return aesjs.utils.utf8.fromBytes(decryptedBytes);
	}

	async getItem(key: string) {
		const encrypted = await AsyncStorage.getItem(key);
		if (!encrypted) {
			return encrypted;
		}
		return await this._decrypt(key, encrypted);
	}

	async removeItem(key: string) {
		await AsyncStorage.removeItem(key);
		// Only use SecureStore on native platforms
		if (Platform.OS !== "web") {
			await SecureStore.deleteItemAsync(key);
		} else {
			await AsyncStorage.removeItem(`${key}_encryption_key`);
		}
	}

	async setItem(key: string, value: string) {
		const encrypted = await this._encrypt(key, value);
		await AsyncStorage.setItem(key, encrypted);
	}
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
	auth: {
		storage: new LargeSecureStore(),
		autoRefreshToken: true,
		persistSession: true,
		detectSessionInUrl: false,
	},
});

AppState.addEventListener("change", (state) => {
	if (state === "active") {
		supabase.auth.startAutoRefresh();
	} else {
		supabase.auth.stopAutoRefresh();
	}
});
