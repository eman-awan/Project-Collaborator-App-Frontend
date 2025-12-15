import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

export function usePageUnmount(cleanupFn: () => void, deps: any[] = []) {
  useFocusEffect(
    useCallback(() => {
      return () => {
        cleanupFn();
      };
    }, deps)
  );
}
