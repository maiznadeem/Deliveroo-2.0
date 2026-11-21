import { View, TouchableOpacity } from 'react-native'
import React, { memo, useState } from 'react'
import { CircleMinus, CirclePlus } from 'lucide-react-native'
import { useDispatch, useSelector } from 'react-redux'
import StorageImage from './StorageImage'
import Text from './ui/Text'
import { formatCurrency } from '../helpers/formatCurrency'
import { useAppTheme } from '../hooks/useAppTheme'
import { addToBasket, removeFromBasket, selectBasketCountWithID } from '../features/basketSlice'


const DishRow = ({id, name, description, price, image, onAddToCart}) => {

    const [isPressed, setIsPressed] = useState(false)
    const count = useSelector(state => selectBasketCountWithID(state, id))
    const dispatch = useDispatch()
    const { colors } = useAppTheme()

    const addItemToBasket = () => {
        if (onAddToCart())
            dispatch(addToBasket({ id, name, description, price, image }))
    }

    const removeItemFromBasket = () => {
        if (count <= 0) return
        dispatch(removeFromBasket({ id }))
    }

    return (
        <View className="border-b border-border bg-surface dark:border-border-dark dark:bg-surface-dark">
            <TouchableOpacity
                accessibilityRole="button"
                accessibilityState={{ expanded: isPressed }}
                activeOpacity={0.7}
                onPress={() => setIsPressed(!isPressed)}
                className="flex-row items-center gap-3 px-4 py-4"
            >
                <View className="flex-1">
                    <Text className="text-base font-semibold" numberOfLines={2}>{name}</Text>
                    <Text className="mt-1 text-sm text-muted dark:text-muted-dark" numberOfLines={2}>{description}</Text>
                    <Text className="mt-2 text-sm font-semibold">{formatCurrency(price)}</Text>
                </View>
                <StorageImage
                    source={{ uri: image }}
                    className="h-20 w-20 rounded-xl"
                    resizeMode="cover"
                />
            </TouchableOpacity>

            {isPressed && (
                <View className="flex-row items-center gap-1 px-3 pb-3">
                    <TouchableOpacity
                        accessibilityRole="button"
                        accessibilityLabel={`Remove one ${name}`}
                        className="h-11 w-11 items-center justify-center"
                        onPress={removeItemFromBasket}
                        disabled={count === 0}
                    >
                        <CircleMinus size={32} strokeWidth={2} color={count > 0 ? colors.brand : colors.outline} />
                    </TouchableOpacity>
                    <Text className="min-w-8 text-center text-base font-bold">{count}</Text>
                    <TouchableOpacity
                        accessibilityRole="button"
                        accessibilityLabel={`Add one ${name}`}
                        className="h-11 w-11 items-center justify-center"
                        onPress={addItemToBasket}
                    >
                        <CirclePlus size={32} strokeWidth={2} color={colors.brand} />
                    </TouchableOpacity>
                </View>
            )}
        </View>
    )

}

export default memo(DishRow)
