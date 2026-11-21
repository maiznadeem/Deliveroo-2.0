import React from 'react'
import { Image } from 'react-native'

// logo.png carries a lot of transparent padding, so the box is larger than the visible mark.
export default function Logo({ size = 144 }) {
  return (
    <Image
      accessibilityLabel="Deliveroo"
      source={require('../../assets/logo.png')}
      style={{ width: size, height: size }}
      resizeMode="contain"
    />
  )
}
