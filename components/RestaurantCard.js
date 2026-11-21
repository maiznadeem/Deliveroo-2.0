import { View, TouchableOpacity } from 'react-native'
import React from 'react'
import { Star, MapPin } from 'lucide-react-native'
import { useNavigation } from '@react-navigation/native'
import { getDoc } from '@react-native-firebase/firestore'
import StorageImage from './StorageImage'
import Text from './ui/Text'
import { cardShadow } from '../core/theme'
import { useAppTheme } from '../hooks/useAppTheme'

const RestaurantCard = ({
    id,
    imgUrl,
    title,
    rating,
    genre,
    address,
    short_description,
    dishes,
    geopoint,
}) => {

    const navigation = useNavigation()
    const { isDark, colors } = useAppTheme()
    const geopointObject = geopoint // already a plain { latitude, longitude } (see FeaturedRow)

    const fetchDishes = () => {

        const dishPromises = (dishes ?? []).map((dishRef) => {
            return getDoc(dishRef)
                .then((dishSnapshot) => {
                    if (dishSnapshot.exists()) {
                        return dishSnapshot.data();
                    } else {
                        console.log('Document does not exist');
                        return null;
                    }
                })
                .catch((error) => {
                    console.log('Error getting document:', error);
                    return null;
                });
        });

        Promise.all(dishPromises)
            .then((dishDataArray) => {
                // Navigate to RestaurantScreen with the fetched dishes
                navigation.navigate("RestaurantScreen", {
                    id,
                    imgUrl,
                    title,
                    rating,
                    genre,
                    address,
                    short_description,
                    dishesArray: dishDataArray,
                    geopointObject,
                });
            });
    }

    return (
        <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={title}
            activeOpacity={0.85}
            className="w-64 rounded-2xl border border-transparent bg-surface dark:border-border-dark dark:bg-surface-dark"
            style={isDark ? undefined : cardShadow}
            onPress={fetchDishes}
        >
            <View className="overflow-hidden rounded-2xl">
                <StorageImage source={{ uri: imgUrl }} className="h-36 w-full" resizeMode="cover" />
                <View className="gap-1 px-3 pb-3 pt-2.5">
                    <Text className="text-base font-bold" numberOfLines={1}>{title}</Text>
                    <View className="flex-row items-center gap-1">
                        <Star size={14} strokeWidth={2} color={colors.star} fill={colors.star} />
                        <Text className="shrink text-xs text-muted dark:text-muted-dark" numberOfLines={1}>
                            <Text className="font-semibold text-star">{rating}</Text> · {genre}
                        </Text>
                    </View>
                    <View className="flex-row items-center gap-1">
                        <MapPin size={14} strokeWidth={2} color={colors.muted} />
                        <Text className="shrink text-xs text-muted dark:text-muted-dark" numberOfLines={1}>Nearby · {address}</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    )
}

export default RestaurantCard
