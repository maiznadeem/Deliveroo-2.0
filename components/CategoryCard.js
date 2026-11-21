import { View, TouchableOpacity, StyleSheet } from 'react-native'
import React from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import StorageImage from './StorageImage'
import Text from './ui/Text'

// White title over a photo: a bottom gradient keeps it readable on any image.
const CategoryCard = ({ imgUrl, title }) => {
  return (
    <TouchableOpacity activeOpacity={0.85} accessibilityRole="button" accessibilityLabel={title}>
      <View className="h-28 w-28 overflow-hidden rounded-2xl">
        <StorageImage source={{ uri: imgUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        <LinearGradient
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.75)']}
          locations={[0.25, 1]}
          style={StyleSheet.absoluteFill}
        />
        <Text className="absolute bottom-2 left-3 right-3 text-sm font-bold text-white" numberOfLines={1}>
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  )
}

export default CategoryCard
