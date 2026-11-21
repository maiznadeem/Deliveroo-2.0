import { FlatList } from 'react-native'
import React from 'react'
import CategoryCard from './CategoryCard'

const Categories = ({ categories }) => {
    return (
        <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={categories}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8, gap: 12 }}
            renderItem={({ item }) => (
                <CategoryCard imgUrl={item.image} title={item.name} />
            )}
        />
    )
}

export default Categories
