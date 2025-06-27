import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Alert } from 'react-native';
import * as Location from 'expo-location';
import { Quest, LocationData } from '@/lib/types';

interface LocationTrackerProps {
  quest: Quest;
  onLocationUpdate: (location: LocationData, distance: number, inRange: boolean) => void;
  children?: React.ReactNode;
}

export function LocationTracker({ quest, onLocationUpdate, children }: LocationTrackerProps) {
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean>(false);

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  // Request location permissions
  const requestLocationPermission = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setLocationError('Location permission denied');
        Alert.alert(
          'Location Required',
          'This quest requires location access to verify completion. Please enable location permissions in your device settings.',
          [{ text: 'OK' }]
        );
        return false;
      }
      
      setLocationPermission(true);
      setLocationError(null);
      return true;
    } catch (error) {
      console.error('Error requesting location permission:', error);
      setLocationError('Failed to request location permission');
      return false;
    }
  }, []);

  // Get current location
  const getCurrentLocation = useCallback(async () => {
    try {
      if (!locationPermission) {
        const hasPermission = await requestLocationPermission();
        if (!hasPermission) return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced, // Good balance of accuracy and battery usage
      });

      const locationData: LocationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || undefined,
        timestamp: location.timestamp,
      };

      setCurrentLocation(locationData);

      // Calculate distance to quest location
      if (quest.location_latitude && quest.location_longitude) {
        const distance = calculateDistance(
          locationData.latitude,
          locationData.longitude,
          quest.location_latitude,
          quest.location_longitude
        );

        const inRange = distance <= quest.location_radius_meters;
        onLocationUpdate(locationData, distance, inRange);
      }
    } catch (error) {
      console.error('Error getting current location:', error);
      setLocationError('Failed to get current location');
    }
  }, [locationPermission, quest, onLocationUpdate, requestLocationPermission]);

  // Set up location tracking
  useEffect(() => {
    let locationSubscription: Location.LocationSubscription | null = null;

    const startLocationTracking = async () => {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) return;

      try {
        // Start watching position with moderate accuracy for battery efficiency
        locationSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 5000, // Update every 5 seconds
            distanceInterval: 10, // Update when moved 10 meters
          },
          (location) => {
            const locationData: LocationData = {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              accuracy: location.coords.accuracy || undefined,
              timestamp: location.timestamp,
            };

            setCurrentLocation(locationData);

            // Calculate distance to quest location
            if (quest.location_latitude && quest.location_longitude) {
              const distance = calculateDistance(
                locationData.latitude,
                locationData.longitude,
                quest.location_latitude,
                quest.location_longitude
              );

              const inRange = distance <= quest.location_radius_meters;
              onLocationUpdate(locationData, distance, inRange);
            }
          }
        );
      } catch (error) {
        console.error('Error starting location tracking:', error);
        setLocationError('Failed to start location tracking');
      }
    };

    // Only start tracking if quest has location requirements
    if (quest.location_latitude && quest.location_longitude) {
      startLocationTracking();
    }

    // Cleanup
    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, [quest, onLocationUpdate, requestLocationPermission]);

  // Manual location refresh
  const refreshLocation = useCallback(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  // Provide location context to children
  const locationContext = {
    currentLocation,
    locationError,
    locationPermission,
    refreshLocation,
    hasLocationRequirement: !!(quest.location_latitude && quest.location_longitude),
  };

  return (
    <View>
      {children}
      
      {/* Location Status Display */}
      {quest.location_latitude && quest.location_longitude && (
        <View className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <Text className="text-blue-800 dark:text-blue-200 font-medium text-sm mb-1">
            Location Tracking
          </Text>
          
          {locationError ? (
            <Text className="text-red-600 dark:text-red-400 text-sm">
              {locationError}
            </Text>
          ) : currentLocation ? (
            <Text className="text-blue-600 dark:text-blue-300 text-sm">
              GPS Active • Accuracy: ±{Math.round(currentLocation.accuracy || 0)}m
            </Text>
          ) : (
            <Text className="text-blue-600 dark:text-blue-300 text-sm">
              Getting location...
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

// Export location context type for use in other components
export interface LocationContext {
  currentLocation: LocationData | null;
  locationError: string | null;
  locationPermission: boolean;
  refreshLocation: () => void;
  hasLocationRequirement: boolean;
} 