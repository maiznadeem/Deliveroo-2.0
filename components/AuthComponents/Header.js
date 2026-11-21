import React from 'react'
import Text from '../ui/Text'

export default function Header({ children }) {
  return (
    <Text accessibilityRole="header" className="py-3 text-center text-2xl font-extrabold text-link dark:text-link-dark">
      {children}
    </Text>
  )
}
