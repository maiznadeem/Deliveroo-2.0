import React, { useContext, useMemo } from 'react'
import { View, TouchableOpacity, Image, ScrollView } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs'
import { CircleX, Minus, Plus } from 'lucide-react-native'
import StorageImage from '../components/StorageImage'
import Text from '../components/ui/Text'
import IconButton from '../components/ui/IconButton'
import { formatCurrency } from '../helpers/formatCurrency'
import { navigateToDashboardTab } from '../helpers/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { selectRestaurant } from '../features/restaurantSlice'
import { removeFromBasket, selectBasketItems, addToBasket, selectBasketTotal } from '../features/basketSlice'
import { useAppTheme } from '../hooks/useAppTheme'

const DELIVERY_FEE = 5.99

const BasketScreen = () => {

    const navigation = useNavigation()
    const { colors } = useAppTheme()
    const insets = useSafeAreaInsets()
    // Inside the tab bar the bar already covers the gesture inset; as a drawer screen it does not.
    const inTabs = useContext(BottomTabBarHeightContext) !== undefined
    const restaurant = useSelector(selectRestaurant)
    const items = useSelector(selectBasketItems)
    const basketTotal = useSelector(selectBasketTotal)
    const dispatch = useDispatch()

    const groupedItemsInBasket = useMemo(() => items.reduce((results, item) => {
        (results[item.id] = results[item.id] || []).push(item)
        return results
    }, {}), [items])

    if (items.length == 0) {
        return (
            <SafeAreaView edges={['top']} className="flex-1 items-center justify-center bg-background px-8 dark:bg-background-dark">
                <Image
                    source={require("../assets/Basket.png")}
                    className="h-40 w-40"
                    resizeMode="contain"
                />
                <Text className="px-4 py-4 text-lg text-muted dark:text-muted-dark">Looks empty in here...</Text>
                <TouchableOpacity
                    accessibilityRole="button"
                    activeOpacity={0.85}
                    className="h-12 items-center justify-center rounded-xl bg-brand px-6"
                    onPress={() => navigateToDashboardTab(navigation)}
                >
                    <Text className="font-bold text-white">Order Now</Text>
                </TouchableOpacity>
            </SafeAreaView>
        )
    }

    const sectionClass = 'bg-surface dark:bg-surface-dark'
    const borderClass = 'border-border dark:border-border-dark'

    return (
        <View className="flex-1 bg-background dark:bg-background-dark">
            {/* Header: title centered, close button in a fixed slot on the right */}
            <SafeAreaView edges={['top']} className={`${sectionClass} border-b-2 border-brand`}>
                <View className="flex-row items-center px-2 py-2">
                    <View className="w-11" />
                    <View className="flex-1 items-center px-2">
                        <Text className="text-lg font-bold">Basket</Text>
                        <Text className="text-xs text-muted dark:text-muted-dark" numberOfLines={1}>{restaurant.title}</Text>
                    </View>
                    <IconButton accessibilityLabel="Close basket" onPress={() => navigation.goBack()}>
                        <CircleX size={28} strokeWidth={2} color={colors.brand} />
                    </IconButton>
                </View>
            </SafeAreaView>

            <View className={`${sectionClass} ${borderClass} mt-4 flex-row items-center gap-3 border-y px-4 py-2`}>
                <Image
                    source={require('../assets/rider.webp')}
                    className="h-10 w-10 rounded-full"
                    resizeMode="cover"
                />
                <Text className="flex-1 text-sm">Delivery in 30-45 min</Text>
                <TouchableOpacity accessibilityRole="button" className="min-h-11 justify-center pl-2">
                    <Text className="text-sm font-semibold text-link dark:text-link-dark">Change</Text>
                </TouchableOpacity>
            </View>

            <ScrollView className="mt-4 flex-1" contentContainerStyle={{ paddingBottom: 16 }}>
                <View className={`${sectionClass} ${borderClass} border-y`}>
                    {Object.entries(groupedItemsInBasket).map(([key, group], index) => (
                        <View
                            key={key}
                            className={`${borderClass} flex-row items-center gap-3 px-4 py-3 ${index > 0 ? 'border-t' : ''}`}
                        >
                            <StorageImage
                                source={{ uri: group[0]?.image }}
                                className="h-12 w-12 rounded-full"
                                resizeMode="cover"
                            />
                            <View className="flex-1">
                                <Text className="text-sm font-semibold" numberOfLines={2}>{group[0]?.name}</Text>
                                <Text className="mt-0.5 text-xs text-muted dark:text-muted-dark">
                                    {formatCurrency(group[0]?.price)}
                                </Text>
                            </View>
                            <View className="flex-row items-center">
                                <TouchableOpacity
                                    accessibilityRole="button"
                                    accessibilityLabel={`Remove one ${group[0]?.name}`}
                                    className="h-11 w-11 items-center justify-center"
                                    onPress={() => dispatch(removeFromBasket({ id: key }))}
                                >
                                    <Minus size={20} strokeWidth={2} color={colors.brand} />
                                </TouchableOpacity>
                                <Text className="min-w-6 text-center text-base font-bold">{group.length}</Text>
                                <TouchableOpacity
                                    accessibilityRole="button"
                                    accessibilityLabel={`Add one ${group[0]?.name}`}
                                    className="h-11 w-11 items-center justify-center"
                                    onPress={() => dispatch(addToBasket(group[0]))}
                                >
                                    <Plus size={20} strokeWidth={2} color={colors.brand} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>

            <View
                className={`${sectionClass} ${borderClass} gap-3 border-t px-4 pt-4`}
                style={{ paddingBottom: 16 + (inTabs ? 0 : insets.bottom) }}
            >
                <View className="flex-row justify-between">
                    <Text className="text-muted dark:text-muted-dark">Subtotal</Text>
                    <Text className="text-muted dark:text-muted-dark">{formatCurrency(basketTotal)}</Text>
                </View>
                <View className="flex-row justify-between">
                    <Text className="text-muted dark:text-muted-dark">Delivery Fee</Text>
                    <Text className="text-muted dark:text-muted-dark">{formatCurrency(DELIVERY_FEE)}</Text>
                </View>
                <View className="flex-row justify-between">
                    <Text className="font-semibold">Order Total</Text>
                    <Text className="font-extrabold">{formatCurrency(basketTotal + DELIVERY_FEE)}</Text>
                </View>
                <TouchableOpacity
                    accessibilityRole="button"
                    activeOpacity={0.85}
                    className="mt-1 h-12 items-center justify-center rounded-xl bg-brand"
                    onPress={() => navigation.navigate("PreparingOrderScreen")}
                >
                    <Text className="text-base font-bold text-white">Place Order</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default BasketScreen
