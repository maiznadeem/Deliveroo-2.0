import React from 'react';
import { Text as RNText } from 'react-native';
import { fontFamilies } from '../../core/palette';

// App-wide Text: defaults to Plus Jakarta Sans Regular and the theme's text color. Weight classes
// (font-medium / font-semibold / font-bold / font-extrabold) pick the matching font file, see tailwind.config.js.
// Do not nest <Text> inside <Text> without giving the inner one a color class: its default color would win.

const HAS_FONT = /(^|\s)(?:[\w-]+:)*font-(?:medium|semibold|bold|extrabold)(?=\s|$)/;
const NON_COLOR_SUFFIX = /^(?:xs|sm|base|md|lg|\d?xl|left|right|center|justify|start|end|wrap|nowrap|balance|pretty|clip|ellipsis|\[\d.*)$/;

function hasTextColor(className) {
  return className.split(/\s+/).some((token) => {
    const utility = token.split(':').pop();
    return utility.startsWith('text-') && !NON_COLOR_SUFFIX.test(utility.slice(5));
  });
}

// The regular font is set through style: a style prop beats className, so it is only added when no weight class is present.
export default function Text({ className = '', style, ...props }) {
  const defaultColor = hasTextColor(className) ? '' : 'text-text dark:text-text-dark';
  const regularFont = HAS_FONT.test(className) ? null : { fontFamily: fontFamilies.regular };
  return <RNText className={`${defaultColor} ${className}`.trim()} style={regularFont ? [regularFont, style] : style} {...props} />;
}
