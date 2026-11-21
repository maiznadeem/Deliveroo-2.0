import { View, Text, TouchableOpacity, BackHandler, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { useSelector } from 'react-redux'
import { selectRestaurant } from '../features/restaurantSlice'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { PhoneIcon, XMarkIcon } from 'react-native-heroicons/solid'
import * as Progress from 'react-native-progress'
import MapView, { Marker, Polyline } from 'react-native-maps'
import { getRouteCoordinates } from '../helpers/directions'
import { popToDashboardTab } from '../helpers/navigation'
import Constants from 'expo-constants'

// Same env var feeds the manifest key (react-native-maps plugin) and this flag (app.config.js extra).
const hasMapsKey = Boolean(Constants.expoConfig?.extra?.googleMapsAndroidApiKey)

const DeliveryScreen = () => {

    const navigation = useNavigation()
    const insets = useSafeAreaInsets()
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
        <View className="bg-[#00B8C0] flex-1">
            <StatusBar backgroundColor="#00B8C0" barStyle="dark-content" />
            <SafeAreaView className="z-50">
                <View className="flex-row justify-between items-center p-5">
                    <TouchableOpacity onPress={() => popToDashboardTab(navigation)} >
                        <XMarkIcon color="white" size={30} />
                    </TouchableOpacity>
                    <Text className="font-light text-white text-lg">Order Help</Text>
                </View>
                <View className="bg-white mx-5 my-2 rounded-md p-6 z-50">
                    <View className="flex-row justify-between">
                        <View>
                            <Text className="text-lg text-gray-400">Estimated Arrival</Text>
                            <Text className="text-4xl font-bold">30-45 Minutes</Text>
                        </View>
                        <Image 
                            source={require('../assets/bike.webp')}
                            className="h-20 w-20"
                        />
                    </View>
                    <Progress.Bar size={30} indeterminate={true} color='#00B8C0'/>
                    <Text className="mt-3 text-gray-400">Your order at {restaurant.title} is being prepared. </Text>
                </View>
            </SafeAreaView>

            {!hasMapsKey ? (
            // Google Maps throws (and kills the app) when no API key is in the manifest, so builds made
            // without GOOGLE_MAPS_ANDROID_API_KEY show this placeholder instead of the map.
            <View className="flex-1 bg-gray-100 items-center justify-center px-10">
                <Text className="text-gray-500 text-center">The live map isn't available in this build.</Text>
            </View>
            ) : (
            <MapView
                initialRegion={initialRegion}
                style={{ flex: 1 }}
                mapType="mutedStandard"
            >
                {routeCoordinates.length > 0 && (
                <Polyline
                    coordinates={routeCoordinates}
                    strokeColor="#00B8C0"
                    strokeWidth={3}
                />
                )}
                <Marker
                coordinate={initialRegion}
                title="Your Location"
                pinColor="#00B8C0"
                >
                </Marker>
                {markerCoordinate && (
                <Marker
                coordinate={markerCoordinate}
                title={restaurant.title}
                description={restaurant.short_description}
                pinColor="#00B8C0"
                />
                )}
            </MapView>
            )}

            {/* Plain row padded by the bottom inset (edge-to-edge); the old fixed-height SafeAreaView hid the text. */}
            <View className="flex-row bg-white items-center px-5 pt-5" style={{ paddingBottom: insets.bottom + 20 }}>
                <Image
                    source={{ uri: 'https://firebasestorage.googleapis.com/v0/b/deliveroo-2-c6550.appspot.com/o/Delivery%20Guy.png?alt=media&token=3111e8f6-a485-43db-8353-4a534e643fd7' }}
                    className="h-12 w-12 bg-gray-300 rounded-full"
                />
                <View className="flex-1 ml-5">
                    <Text className="text-lg">David Kushner</Text>
                    <Text className="text-gray-400">Your Rider</Text>
                </View>
                <TouchableOpacity className="flex-row items-center">
                    <PhoneIcon size={25} color='#00B8C0'/>
                    <Text className="text-[#00B8C0] text-lg ml-1 font-bold">Call</Text>
                </TouchableOpacity>
            </View>

        </View>
    )
}

export default DeliveryScreen
