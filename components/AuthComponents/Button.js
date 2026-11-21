import React from 'react'
import { Button as PaperButton } from 'react-native-paper'
import { fontFamilies, palette } from '../../core/theme'

export default function Button({ mode, style, ...props }) {
  return (
    <PaperButton
      mode={mode}
      style={[
        { width: '100%', marginVertical: 6, borderRadius: 12 },
        mode === 'outlined' && { borderColor: palette.brand, borderWidth: 1.5 },
        style,
      ]}
      contentStyle={{ height: 48 }}
      labelStyle={{ fontFamily: fontFamilies.bold, fontSize: 15, lineHeight: 22, marginVertical: 0 }}
      {...props}
    />
  )
}
