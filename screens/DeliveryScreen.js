import { View, TouchableOpacity, BackHandler, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { useSelector } from 'react-redux'
import { selectRestaurant } from '../features/restaurantSlice'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { Phone, X } from 'lucide-react-native'
import * as Progress from 'react-native-progress'
import MapView, { Marker, Polyline } from 'react-native-maps'
import Text from '../components/ui/Text'
import IconButton from '../components/ui/IconButton'
import { getRouteCoordinates } from '../helpers/directions'
import { popToDashboardTab } from '../helpers/navigation'
import { darkMapStyle } from '../core/mapStyles'
import { useAppTheme } from '../hooks/useAppTheme'
import Constants from 'expo-constants'

// Same env var feeds the manifest key (react-native-maps plugin) and this flag (app.config.js extra).
const hasMapsKey = Boolean(Constants.expoConfig?.extra?.googleMapsAndroidApiKey)

const DeliveryScreen = () => {

    const navigation = useNavigation()
    const insets = useSafeAreaInsets()
    const { isDark, colors } = useAppTheme()
    const restaurant = useSelector(selectRestaurant)

    const initialRegion = {
        latitude: 31.401867,
        longitude: 74.209619,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
    };
    // Plain { latitude, longitude } produced at the read boundary (see FeaturedRow / helpers/geo.js)
    const markerCoordinate = restaurant.geopointObject ?? null;
    const [routeCoordinates, setRouteCoordinates] = useState([]);

    useEffect(() => {
        const backHandler = BackHandler.addEventListener(
          'hardwareBackPress',
          handleGoBack
        );
        return () => backHandler.remove();
    }, []);

    useEffect(() => {
        if (!markerCoordinate) return;
        let cancelled = false;
        getRouteCoordinates(initialRegion, markerCoordinate).then((coordinates) => {
            if (!cancelled) setRouteCoordinates(coordinates);
        });
        return () => { cancelled = true; };
    }, [markerCoordinate?.latitude, markerCoordinate?.longitude]);

    const handleGoBack = () => {
        popToDashboardTab(navigation);
        return true; // Return true to prevent default back button behavior
    };

    return (
        <View className="flex-1 bg-background dark:bg-background-dark">
            <StatusBar style="light" />
            {/* Teal header: status-bar inset, close row, ETA card */}
            <SafeAreaView edges={['top']} className="bg-brand">
                <View className="flex-row items-center justify-between px-2">
                    <IconButton accessibilityLabel="Close" onPress={() => popToDashboardTab(navigation)}>
                        <X size={24} strokeWidth={2} color="#FFFFFF" />
                    </IconButton>
                    <Text className="mr-2 text-base font-semibold text-white">Order Help</Text>
                </View>
                <View className="mx-4 mb-4 mt-1 rounded-2xl bg-surface p-4 dark:bg-surface-dark">
                    <View className="flex-row items-center justify-between gap-3">
                        <View className="flex-1">
                            <Text className="text-sm text-muted dark:text-muted-dark">Estimated Arrival</Text>
                            <Text className="text-2xl font-extrabold" numberOfLines={1} adjustsFontSizeToFit>30-45 Minutes</Text>
                        </View>
                        <Image source={require('../assets/bike.webp')} className="h-16 w-16" resizeMode="contain" />
                    </View>
                    <View className="my-3">
                        <Progress.Bar width={null} height={6} borderWidth={0} borderRadius={3} indeterminate={true} color={colors.brand} unfilledColor={colors.surfaceAlt} />
                    </View>
                    <Text className="text-sm text-muted dark:text-muted-dark" numberOfLines={2}>
                        Your order at {restaurant.title} is being prepared.
                    </Text>
                </View>
            </SafeAreaView>

            {!hasMapsKey ? (
            // Google Maps throws (and kills the app) when no API key is in the manifest, so builds made
            // without GOOGLE_MAPS_ANDROID_API_KEY show this placeholder instead of the map.
            <View className="flex-1 items-center justify-center bg-surface-alt px-10 dark:bg-surface-alt-dark">
                <Text className="text-center text-muted dark:text-muted-dark">The live map isn't available in this build.</Text>
            </View>
            ) : (
            <MapView
                initialRegion={initialRegion}
                style={{ flex: 1 }}
                customMapStyle={isDark ? darkMapStyle : undefined}
            >
                {routeCoordinates.length > 0 && (
                <Polyline
                    coordinates={routeCoordinates}
                    strokeColor={colors.brand}
                    strokeWidth={4}
                />
                )}
                <Marker
                coordinate={initialRegion}
                title="Your Location"
                pinColor={colors.brand}
                >
                </Marker>
                {markerCoordinate && (
                <Marker
                coordinate={markerCoordinate}
                title={restaurant.title}
                description={restaurant.short_description}
                pinColor={colors.brand}
                />
                )}
            </MapView>
            )}

            {/* Rider bar: padded by the bottom inset (edge-to-edge); a fixed-height SafeAreaView used to hide the text. */}
            <View
                className="flex-row items-center gap-4 border-t border-border bg-surface px-4 pt-4 dark:border-border-dark dark:bg-surface-dark"
                style={{ paddingBottom: insets.bottom + 16 }}
            >
                <Image
                    source={require('../assets/rider.webp')}
                    className="h-12 w-12 rounded-full"
                    resizeMode="cover"
                />
                <View className="flex-1">
                    <Text className="text-base font-semibold" numberOfLines={1}>David Kushner</Text>
                    <Text className="text-sm text-muted dark:text-muted-dark">Your Rider</Text>
                </View>
                <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel="Call your rider"
                    className="min-h-11 flex-row items-center gap-2 rounded-full border border-brand px-4"
                >
                    <Phone size={20} strokeWidth={2} color={colors.brand} />
                    <Text className="font-bold text-link dark:text-link-dark">Call</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default DeliveryScreen
