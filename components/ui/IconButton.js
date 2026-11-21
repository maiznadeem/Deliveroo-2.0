import React from 'react';
import { TouchableOpacity } from 'react-native';

// Round-or-square icon button with a 44x44 minimum touch target.
export default function IconButton({ children, className = '', ...props }) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      activeOpacity={0.7}
      className={`h-11 w-11 items-center justify-center ${className}`}
      {...props}
    >
      {children}
    </TouchableOpacity>
  );
}
