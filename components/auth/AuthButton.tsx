import { Button, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Spinner } from '@/components/ui/spinner';
import { Fonts } from '@/fonts/font';
import React from 'react';
import { TextStyle, ViewStyle } from 'react-native';

interface AuthButtonPassThrough {
  spinner?: ViewStyle;
  loadingText?: TextStyle | ViewStyle;
  buttonText?: TextStyle | ViewStyle;
}

interface AuthButtonProps {
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  children?: React.ReactNode;
  loadingMessage?: string;
  pt?: AuthButtonPassThrough;
}

export const AuthButton: React.FC<AuthButtonProps> = ({
  children,
  onPress,
  isLoading = false,
  disabled = false,
  style,
  loadingMessage = 'Loading...',
  pt,
}) => {
  return (
    <Button
      onPress={onPress}
      variant="solid"
      action="primary"
      size="lg"
      disabled={disabled}
      style={[{ paddingVertical: 5, width: '100%' }, style]}
    >
      {isLoading ? (
        <HStack alignItems="center" justifyContent="center" style={pt?.spinner}>
          <Spinner color="white" size="large" />
          <ButtonText
            style={[
              {
                fontFamily: Fonts.Instrument.Sans.Bold,
                backgroundColor: 'transparent',
                marginLeft: 8,
                fontSize: 23,
                color: 'white',
              },
              pt?.loadingText as any,
            ]}
          >
            {loadingMessage}
          </ButtonText>
        </HStack>
      ) : (
        <ButtonText
          style={[
            {
              fontFamily: Fonts.Instrument.Sans.Bold,
              fontSize: 23,
              paddingVertical: 2,
              color: 'white',
              backgroundColor: 'transparent',
              alignSelf: 'center',
            },
            pt?.buttonText as any,
          ]}
        >
          {children}
        </ButtonText>
      )}
    </Button>
  );
};
