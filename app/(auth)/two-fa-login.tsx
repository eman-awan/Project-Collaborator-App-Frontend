import { authenticateWith2FA } from '@/api/authApi';
import { AuthButton } from '@/components/auth/AuthButton';
import { ThemedText } from '@/components/ThemedText';
import ThemeToggleButton from '@/components/ThemeToggleButton';
import { Box } from '@/components/ui/box';
import { FormControl } from '@/components/ui/form-control';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Fonts } from '@/fonts/font';
import { useThemedStyle } from '@/hooks/useThemedStyle';
import { JWTStorage } from '@/secure-storage/jwt-storage';
import { authenticateViaTwoFa } from '@/store/features/auth/authSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import AppColor from '@/utils/AppColor';
import { useMutation } from '@tanstack/react-query';
import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, NativeSyntheticEvent, Platform, Pressable, ScrollView, StyleSheet, TextInput, TextInputKeyPressEventData, TextStyle, ViewStyle } from 'react-native';

export default function TwoFaLogin() {
  const theme = useAppSelector(state => state.theme.mode);
  const [code, setCode] = useState<string[]>(['', '', '', '', '', '']);
  const inputs = useRef<TextInput[]>([]);
  const dispatch = useAppDispatch();

  const { mutate, isPending: isAuthenticatingWith2Fa } = useMutation({
    mutationFn: authenticateWith2FA,
    onSuccess: async (data) => {
      dispatch(authenticateViaTwoFa())
      JWTStorage.saveToken(data.access_token)
        .then(() => {
          router.replace('/(main)/MainTabs');
        })
    },
    onError: (error: Error) => {
      alert(error.message || 'Something went wrong');
    }
  });

  const handleVerifyOTP = () => {
    const authCode = code.join('');
    if (!/^\d{6}$/.test(authCode)) {
      alert("Please enter a valid 6-digit code.");
      return;
    }
    mutate({ twoFactorAuthenticationCode: authCode });
  };

  const inputContainerStyle = useThemedStyle<ViewStyle>(
    { backgroundColor: AppColor.primary.light },
    { backgroundColor: AppColor.primary.dark },
    { width: 45, height: 40, borderRadius: 8, flexDirection: 'row', alignItems: 'center' }
  );

  const inputFieldStyle = useThemedStyle<TextStyle>(
    { color: 'black' },
    { color: 'white' },
    {
      height: 60, fontSize: 27, fontFamily: Fonts.Instrument.Sans.Bold,
      width: '100%', textAlign: 'center'
    }
  );



  const handleTextChange = (text: string, index: number) => {
    if (/^\d?$/.test(text)) { // only allow single digit
      const newCode = [...code];
      newCode[index] = text;
      setCode(newCode);
      if (text && index < 5) {
        inputs.current[index + 1].focus();
      }
    }
  }

  const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && index > 0) {
      inputs.current[index - 1].focus();
    }
  }

  const pasteFromClipboard = async () => {
    const clipboardContent = await Clipboard.getStringAsync();
    if (clipboardContent.length === 6) {
      setCode(clipboardContent.split(''));
    } else if (clipboardContent.length < 6) {
      setCode(clipboardContent.split(''));
    } else {
      Alert.alert('Invalid code', 'Clipboard content must be 6 characters or less.');
    }
  };

  const anyLoading: boolean = isAuthenticatingWith2Fa;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingTop: 170, paddingBottom: 10 }}
        keyboardShouldPersistTaps="handled"
      >
        <VStack space="md" style={styles.container}>
          <ThemedText lightColor="black" darkColor="white" style={styles.title}>
            Enter Auth Code
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            A 6-digit code should be available in your authenticator app.
          </ThemedText>
          {/* <ThemedText style={styles.subtitle} marginTop={20}>Please Enter it below</ThemedText> */}

          <FormControl style={styles.formControl}>
            <VStack style={{ rowGap: 10 }}>
              <HStack justifyContent="space-between" marginTop={80} marginBottom={20}>
                {code.map((digit, i) => {
                  return (
                    <Box key={i} style={inputContainerStyle}>
                      <TextInput
                        ref={el => { inputs.current[i] = el! }}
                        selection={{ start: 1 }}
                        autoFocus={i === 0}
                        onChangeText={text => handleTextChange(text, i)}
                        value={digit}
                        onKeyPress={(e) => handleKeyPress(e, i)}
                        maxLength={1}
                        keyboardType="number-pad"
                        style={inputFieldStyle}
                      />
                    </Box>
                  )
                })}
              </HStack>
              <Box alignSelf='center'>
                <Pressable onPress={pasteFromClipboard}>
                  <ThemedText style={{textDecorationLine:'underline'}} color={AppColor.links[theme]}>Paste from clipboard</ThemedText>
                </Pressable>
              </Box>
              <Box width="100%" alignItems='center' marginTop={30} style={{ display: 'flex' }}>
                <LinearGradient
                  colors={theme === 'light' ? ['#5F4366', '#707A8D'] : ['#DAEADA', 'gray']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ borderRadius: 8, width: '100%', display: 'flex', alignItems: 'center' }}
                >
                  <AuthButton isLoading={anyLoading} disabled={anyLoading} onPress={handleVerifyOTP} >
                    Submit Code
                  </AuthButton>
                </LinearGradient>
              </Box>
            </VStack>
          </FormControl>
          <ThemeToggleButton />
        </VStack>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 42,
    lineHeight: 52,
    marginBottom: 8,
    fontFamily: Fonts.Instrument.Serif.Regular
  },
  subtitle: {
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 5,
    fontFamily: Fonts.Instrument.Serif.Regular,
    width: '70%'
  },
  image: {
    width: 280,
    height: 140,
    marginVertical: 10,
  },
  formControl: {
    width: 300,
  },
  labelStyle: {
    fontSize: 17
  },
  eyeIcon: {
    width: 24,
    height: 24,
  },
  formSubmitButton: {
    backgroundColor: 'transparent',
    display: 'flex',
    paddingVertical: 7,
    width: '100%',
  }
});
