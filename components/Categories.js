import { FlatList } from 'react-native'
import React, { memo } from 'react'
import CategoryCard from './CategoryCard'

const listStyle = { paddingHorizontal: 16, paddingVertical: 8, gap: 12 }
const keyExtractor = (item) => item.id.toString()
const renderItem = ({ item }) => <CategoryCard imgUrl={item.image} title={item.name} />

const Categories = ({ categories }) => {
    return (
        <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={categories}
            keyExtractor={keyExtractor}
            contentContainerStyle={listStyle}
            renderItem={renderItem}
            initialNumToRender={4}
            maxToRenderPerBatch={4}
            windowSize={5}
        />
    )
}

export default memo(Categories)
