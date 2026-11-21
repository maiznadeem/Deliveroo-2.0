import { View, FlatList } from 'react-native'
import React, { useEffect, useState } from 'react'
import { ArrowRight } from 'lucide-react-native'
import { getDoc } from '@react-native-firebase/firestore'
import RestaurantCard from './RestaurantCard'
import Text from './ui/Text'
import { toLatLng } from '../helpers/geo'
import { useAppTheme } from '../hooks/useAppTheme'

const FeaturedRow = ({ id, title, description, data }) => {
  const [restaurants, setRestaurants] = useState([]);
  const { colors } = useAppTheme()

  useEffect(() => {
    // Fetch the restaurant data using the references
    const fetchRestaurants = async () => {
      const fetchedRestaurants = await Promise.all(data.map(async (ref) => {
        try {
          const doc = await getDoc(ref);
          if (doc.exists()) {
            const restaurant = doc.data();
            // GeoPoint -> plain { latitude, longitude } at the read boundary (serializable for Redux)
            return { ...restaurant, location: toLatLng(restaurant.location) };
          }
        } catch (error) {
          console.log('Error getting restaurant:', error);
        }
      }));
      setRestaurants(fetchedRestaurants.filter(Boolean));
    };

    fetchRestaurants();
  }, [data]);

  return (
    <View className="mt-4">
      <View className="flex-row items-center justify-between gap-3 px-4">
        <Text className="flex-1 text-lg font-bold" numberOfLines={1}>{title}</Text>
        <ArrowRight size={20} strokeWidth={2} color={colors.brand} />
      </View>
      <Text className="mt-0.5 px-4 text-xs text-muted dark:text-muted-dark" numberOfLines={2}>{description}</Text>
      <FlatList
        horizontal
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, gap: 12 }}
        showsHorizontalScrollIndicator={false}
        data={restaurants}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <RestaurantCard
            id={item.id}
            imgUrl={item.image}
            title={item.name}
            rating={item.rating}
            genre={item.genre}
            address={item.address}
            short_description={item['short description']}
            dishes={item.dish}
            geopoint={item.location}
          />
        )}
      />
    </View>
  )
}

export default FeaturedRow
