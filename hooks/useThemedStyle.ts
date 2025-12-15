import { useAppSelector } from '@/store/hooks';
import { type TextStyle, type ViewStyle } from 'react-native';

/**
 * Returns a style object that adapts automatically to system theme
 * @param lightStyle - style object for light theme
 * @param darkStyle - style object for dark theme
 * @param commonStyle - style object shared across both
 */
export function useThemedStyle<T extends ViewStyle | TextStyle>(
  lightStyle: T,
  darkStyle: T,
  commonStyle?: T
): T {
  const theme = useAppSelector(state => state.theme.mode);

  return {
    ...(commonStyle ?? {}),
    ...(theme === 'light' ? lightStyle : darkStyle),
  };
}
