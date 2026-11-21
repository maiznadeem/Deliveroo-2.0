import { useCallback, useMemo } from 'react';
import { colorScheme, useColorScheme } from 'nativewind';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getColors } from '../core/theme';

const STORAGE_KEY = 'deliveroo.colorScheme';

// Until the user toggles, nothing is stored and NativeWind follows the system scheme.
export async function restoreColorScheme() {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') colorScheme.set(stored);
  } catch (error) {
    console.warn('[theme] could not read the saved color scheme:', error);
  }
}

export function useAppTheme() {
  const { colorScheme: scheme } = useColorScheme();
  const isDark = scheme === 'dark';

  const setScheme = useCallback(async (next) => {
    colorScheme.set(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, next);
    } catch (error) {
      console.warn('[theme] could not save the color scheme:', error);
    }
  }, []);

  const toggleScheme = useCallback(() => setScheme(isDark ? 'light' : 'dark'), [isDark, setScheme]);
  const colors = useMemo(() => getColors(isDark), [isDark]);

  return { isDark, colors, setScheme, toggleScheme };
}
