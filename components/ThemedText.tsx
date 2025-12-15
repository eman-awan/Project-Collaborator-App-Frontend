import { StyleSheet, Text, TextStyle, type TextProps } from 'react-native';

import { Fonts } from '@/fonts/font';
import { useAppSelector } from '@/store/hooks';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
} & TextStyle;

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  fontSize,
  fontFamily,
  ...rest
}: ThemedTextProps) {
  const theme = useAppSelector(state => state.theme.mode);
  const color =
    rest.color ??
    (theme === 'light'
      ? lightColor ?? 'black'
      : darkColor ?? 'white');
  return (
    <Text
      style={[
        { color, fontFamily: fontFamily ?? Fonts.Instrument.Sans.Regular },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        style,
        fontSize ? { fontSize } : undefined,

      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: '#0a7ea4',
  },
});
