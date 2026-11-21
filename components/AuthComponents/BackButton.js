import React from 'react'
import { ArrowLeft } from 'lucide-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import IconButton from '../ui/IconButton'

// Sits on the hero photo, so it is a translucent dark circle with a white arrow in both themes.
export default function BackButton({ goBack }) {
  const insets = useSafeAreaInsets()
  return (
    <IconButton
      accessibilityLabel="Go back"
      onPress={goBack}
      className="absolute left-4 z-10 rounded-full bg-black/30"
      style={{ top: insets.top + 8 }}
    >
      <ArrowLeft size={24} strokeWidth={2.25} color="#FFFFFF" />
    </IconButton>
  )
}
