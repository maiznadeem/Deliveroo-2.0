import { View, FlatList } from 'react-native'
import React, { memo } from 'react'
import { ArrowRight } from 'lucide-react-native'
import RestaurantCard from './RestaurantCard'
import Text from './ui/Text'
import { useAppTheme } from '../hooks/useAppTheme'
import { perfMark } from '../helpers/perf'

const listStyle = { paddingHorizontal: 16, paddingVertical: 12, gap: 12 }
const keyExtractor = (item) => item.id.toString()
const renderItem = ({ item }) => (
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
)

// One horizontal row of restaurants. The restaurants are already resolved (see helpers/catalogue.js).
const FeaturedRow = ({ title, description, restaurants }) => {
  const { colors } = useAppTheme()
  perfMark('featured-row-ready')

  return (
    <View className="mt-4">
      <View className="flex-row items-center justify-between gap-3 px-4">
        <Text className="flex-1 text-lg font-bold" numberOfLines={1}>{title}</Text>
        <ArrowRight size={20} strokeWidth={2} color={colors.brand} />
      </View>
      <Text className="mt-0.5 px-4 text-xs text-muted dark:text-muted-dark" numberOfLines={2}>{description}</Text>
      <FlatList
        horizontal
        contentContainerStyle={listStyle}
        showsHorizontalScrollIndicator={false}
        data={restaurants}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        initialNumToRender={3}
        maxToRenderPerBatch={3}
        windowSize={5}
      />
    </View>
  )
}

export default memo(FeaturedRow)
