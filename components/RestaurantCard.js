import { View, TouchableOpacity } from 'react-native'
import React, { memo } from 'react'
import { Star, MapPin } from 'lucide-react-native'
import { useNavigation } from '@react-navigation/native'
import StorageImage from './StorageImage'
import Text from './ui/Text'
import { cardShadow } from '../core/theme'
import { useAppTheme } from '../hooks/useAppTheme'
import { loadDishes } from '../helpers/catalogue'

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

    // Dish documents are memoised and prefetched (helpers/catalogue.js), so this usually resolves immediately.
    const openRestaurant = () => {
        loadDishes(dishes).then((dishDataArray) => {
            navigation.navigate("RestaurantScreen", {
                id,
                imgUrl,
                title,
                rating,
                genre,
                address,
                short_description,
                dishesArray: dishDataArray.filter(Boolean),
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
            onPress={openRestaurant}
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

export default memo(RestaurantCard)
