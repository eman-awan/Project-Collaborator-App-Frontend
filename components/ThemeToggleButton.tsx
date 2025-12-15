import { toggleTheme } from '@/store/features/theme/themeSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

export default function ThemeToggleButton() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.theme.mode);

  const handleToggle = () => {
    dispatch(toggleTheme());
  };

  return (
    <TouchableOpacity
      onPress={handleToggle}
      style={[
        styles.button,
        { backgroundColor: theme === 'light' ? '#222' : '#fff' },
      ]}
    >
      <Ionicons
        name={theme === 'light' ? 'moon' : 'sunny'}
        size={24}
        color={theme === 'light' ? '#fff' : '#000'}
      />
      <Text style={[styles.label, { color: theme === 'light' ? '#fff' : '#000' }]}>
        {theme === 'light' ? 'Dark' : 'Light'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    top: 30,
    right: 20,
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
  },
  label: {
    marginLeft: 6,
    fontWeight: 'bold',
  },
});
