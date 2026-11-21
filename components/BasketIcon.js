import { View, TouchableOpacity } from 'react-native'
import React from 'react'
import { useNavigation } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useSelector } from 'react-redux'
import Text from './ui/Text'
import { formatCurrency } from '../helpers/formatCurrency'
import { popToDashboardTab } from '../helpers/navigation'
import { selectBasketTotal, selectBasketItems } from '../features/basketSlice'

// Floating "View Basket" bar. Badge and total sit in equal-width slots so the label stays centered.
const BasketIcon = () => {

    const items = useSelector(selectBasketItems)
    const basketTotal = useSelector(selectBasketTotal)
    const navigation = useNavigation()
    const insets = useSafeAreaInsets()

    if (items.length === 0) return null

    return (
        <View
            className="absolute left-4 right-4 z-50"
            style={{ bottom: insets.bottom + 16 }}
            pointerEvents="box-none"
        >
            <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={`View basket, ${items.length} items`}
                activeOpacity={0.85}
                className="h-14 flex-row items-center rounded-2xl bg-brand px-3"
                style={{ elevation: 6, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } }}
                onPress={() => popToDashboardTab(navigation, 'BasketScreen')}
            >
                <View className="w-24 flex-row">
                    <View className="h-8 min-w-8 items-center justify-center rounded-lg bg-brand-pressed px-2">
                        <Text className="text-base font-bold text-white">{items.length}</Text>
                    </View>
                </View>
                <Text className="flex-1 text-center text-base font-bold text-white" numberOfLines={1}>View Basket</Text>
                <View className="w-24 items-end">
                    <Text className="text-base font-bold text-white" numberOfLines={1}>
                        {formatCurrency(basketTotal)}
                    </Text>
                </View>
            </TouchableOpacity>
        </View>
    )
}

export default BasketIcon
