import { ScrollView, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Star, ChevronRight, MapPin, CircleHelp } from 'lucide-react-native';
import BasketIcon from '../components/BasketIcon';
import DishRow from '../components/DishRow';
import ConfirmationModal from '../components/ConfirmationModal'
import StorageImage from '../components/StorageImage';
import Text from '../components/ui/Text';
import IconButton from '../components/ui/IconButton';
import { useDispatch, useSelector } from 'react-redux';
import { setRestaurant } from '../features/restaurantSlice';
import { clearBasket, selectBasketItems } from '../features/basketSlice';
import { useAppTheme } from '../hooks/useAppTheme';

const RestaurantScreen = () => {

    const [dishes, setDishes] = useState(null)
    const [showConfirmation, setShowConfirmation] = useState(false);

    const basketItems = useSelector(selectBasketItems)

    const navigation = useNavigation()
    const route = useRoute();
    const dispatch = useDispatch()
    const insets = useSafeAreaInsets()
    const { colors } = useAppTheme()

    const {
        id,
        imgUrl,
        title,
        rating,
        genre,
        address,
        short_description,
        dishesArray,
        geopointObject,
    } = route.params;

    useEffect(() => {
        setDishes(dishesArray);
    }, []);

    const handleAddToCart = () => {
        if (basketItems.length === 0) {
          // Basket is empty, so set the restaurant
        dispatch (
            setRestaurant({
              id,
              imgUrl,
              title,
              rating,
              genre,
              address,
              short_description,
              dishesArray,
              geopointObject,
            })
        );
            return true;
        }

        else {
            // Check if any dishes from the restaurant are in the basket
            const isDishInBasket = basketItems.some((item) => {
                return dishesArray.some((dish) => dish.id === item.id);
            });
            if (!isDishInBasket) {
                // Show the confirmation modal
                setShowConfirmation(true);
            } else {
                return true;
            }
        }
    };

    const handleConfirm = () => {
        // Handle the confirmation logic here
        // ...

        dispatch(clearBasket());

        // Dispatch setRestaurant after confirmation
        dispatch(
            setRestaurant({
                id,
                imgUrl,
                title,
                rating,
                genre,
                address,
                short_description,
                dishesArray,
                geopointObject,
            })
        );

        // Close the confirmation modal
        setShowConfirmation(false);
        return true;
    };

    const handleCancel = () => {
        // Close the confirmation modal
        setShowConfirmation(false);
        return false;
    };


    return (
        <View className="flex-1 bg-background dark:bg-background-dark">
            {/* The photo sits under the status bar, so its icons stay light. */}
            <StatusBar style="light" />
            <ConfirmationModal
                isVisible={showConfirmation}
                message="Are you sure you want to discard your current selection?"
                onConfirm={handleConfirm}
                onCancel={handleCancel}
            />
            <BasketIcon />
            {/* Leave room for the floating basket bar so it never covers the last dish. */}
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: basketItems.length > 0 ? 112 : 24 }}>
                <View>
                    <StorageImage
                        source={{ uri: imgUrl }}
                        className="h-64 w-full"
                        resizeMode="cover"
                    />
                    <LinearGradient
                        colors={['rgba(0,0,0,0.45)', 'rgba(0,0,0,0)']}
                        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: insets.top + 72 }}
                        pointerEvents="none"
                    />
                    <IconButton
                        accessibilityLabel="Go back"
                        className="absolute left-4 rounded-full bg-surface dark:bg-surface-dark"
                        style={{ top: insets.top + 8 }}
                        onPress={() => navigation.goBack()}
                    >
                        <ArrowLeft size={24} strokeWidth={2} color={colors.brand} />
                    </IconButton>
                </View>

                <View className="bg-surface px-4 pb-4 pt-4 dark:bg-surface-dark">
                    <Text className="text-2xl font-extrabold" numberOfLines={2}>{title}</Text>
                    <View className="mt-2 flex-row flex-wrap items-center gap-x-4 gap-y-1">
                        <View className="flex-row items-center gap-1">
                            <Star size={14} strokeWidth={2} color={colors.star} fill={colors.star} />
                            <Text className="text-xs text-muted dark:text-muted-dark">
                                <Text className="font-semibold text-star">{rating}</Text> · {genre}
                            </Text>
                        </View>
                        <View className="shrink flex-row items-center gap-1">
                            <MapPin size={14} strokeWidth={2} color={colors.muted} />
                            <Text className="shrink text-xs text-muted dark:text-muted-dark" numberOfLines={1}>Nearby · {address}</Text>
                        </View>
                    </View>
                    <Text className="mt-3 text-sm text-muted dark:text-muted-dark">{short_description}</Text>
                </View>

                <TouchableOpacity
                    accessibilityRole="button"
                    activeOpacity={0.7}
                    className="min-h-14 flex-row items-center gap-3 border-y border-border bg-surface px-4 dark:border-border-dark dark:bg-surface-dark"
                >
                    <CircleHelp size={20} strokeWidth={2} color={colors.muted} />
                    <Text className="flex-1 text-base font-semibold">Have a food allergy?</Text>
                    <ChevronRight size={20} strokeWidth={2} color={colors.brand} />
                </TouchableOpacity>

                <Text className="px-4 pb-3 pt-6 text-xl font-bold">Menu</Text>

                {/* Dish Rows */}
                <View className="border-t border-border dark:border-border-dark" style={{ paddingBottom: insets.bottom + 96 }}>
                    {dishes ? (
                        dishes.map((dish) => (
                            <DishRow
                                key={dish.id}
                                id={dish.id}
                                name={dish.name}
                                description={dish['short description']}
                                price={dish.price}
                                image={dish.image}
                                onAddToCart={handleAddToCart}
                            />
                        ))
                    ) : (
                        <ActivityIndicator className="py-8" size="large" color={colors.brand} />
                    )}
                </View>
            </ScrollView>
        </View>
    );
};

export default RestaurantScreen;
