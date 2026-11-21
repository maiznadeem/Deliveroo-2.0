import React from 'react'
import Text from '../ui/Text'

export default function Paragraph({ children }) {
  return <Text className="mb-4 text-center text-base text-muted dark:text-muted-dark">{children}</Text>
}
