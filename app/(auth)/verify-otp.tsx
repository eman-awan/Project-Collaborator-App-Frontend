import { resendVerificationEmail, verifyOTP } from '@/api/authApi';
import { AuthButton } from '@/components/auth/AuthButton';
import { ThemedText } from '@/components/ThemedText';
import ThemeToggleButton from '@/components/ThemeToggleButton';
import { Box } from '@/components/ui/box';
import { FormControl } from '@/components/ui/form-control';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Fonts } from '@/fonts/font';
import { useThemedStyle } from '@/hooks/useThemedStyle';
import { AuthNavigationProp } from '@/routes/AuthNavigationProp';
import { useAppSelector } from '@/store/hooks';
import AppColor from '@/utils/AppColor';
import { useRoute } from '@react-navigation/native';
import { useMutation } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, NativeSyntheticEvent, Platform, ScrollView, StyleSheet, TextInput, TextInputKeyPressEventData, TextStyle, ViewStyle } from 'react-native';
import { useAuth } from './auth-provider';


export default function VerifyOtp() {
  const theme = useAppSelector(state => state.theme.mode);
  const navigation = useNavigation<AuthNavigationProp>();
  const { auth, resetAuth } = useAuth();
  const route = useRoute();
  const { message } = route.params as { message: string } || { message: '' };
  const [code, setCode] = useState<string[]>(['', '', '', '']);
  const inputs = useRef<TextInput[]>([]);

  useEffect(() => {
    if (message.length !== 0)
      alert(message);
  }, [])

  const { mutate: mutateResendVerificationEmail, isPending: isResendingEmail } = useMutation({
    mutationFn: resendVerificationEmail,
    onSuccess: () => alert('Otp Has been resent to your email'),
    onError: (error: Error) => {
      alert(error.message || 'Something went wrong');
    }
  });

  const { mutate, isPending } = useMutation({
    mutationFn: verifyOTP,
    onSuccess: () => {
      const email = auth.email;
      resetAuth();
      navigation.navigate('SignIn', { email });
    },
    onError: (error: Error) => {
      alert(error.message || 'Something went wrong');
    }
  });

  const handleResendVerification = () => {
    setCode(['', '', '', '']);
    inputs?.current[0]?.focus();
    mutateResendVerificationEmail(auth.email)
  }

  const handleVerifyOTP = () => {
    const otp = code.join('');
    if (!/^\d{4}$/.test(otp)) {
      alert("Please enter a valid 4-digit code.");
      return;
    }
    mutate({ email: auth.email, otp });
  };

  const inputContainerStyle = useThemedStyle<ViewStyle>(
    { backgroundColor: AppColor.primary.light },
    { backgroundColor: AppColor.primary.dark },
    { width: 65, height: 60, borderRadius: 8, flexDirection: 'row', alignItems: 'center' }
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
      if (text && index < 3) {
        inputs.current[index + 1].focus();
      }
    }
  }

  const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && index > 0) {
      inputs.current[index - 1].focus();
    }
  }

  const anyLoading: boolean = isPending || isResendingEmail;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingTop: 80, paddingBottom: 10 }}
        keyboardShouldPersistTaps="handled"
      >
        <VStack space="md" style={styles.container}>
          <ThemedText lightColor="black" darkColor="white" style={styles.title}>
            ENTER OTP
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            A 4-digit code has just been sent to your email address. Enter it down below to continue.
          </ThemedText>

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
              <Box width="100%" alignItems='center' marginTop={30} style={{ display: 'flex' }}>
                <LinearGradient
                  colors={theme === 'light' ? ['#5F4366', '#707A8D'] : ['#DAEADA', 'gray']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ borderRadius: 8, width: '100%', display: 'flex', alignItems: 'center' }}
                >
                  <AuthButton isLoading={anyLoading} disabled={anyLoading} onPress={handleVerifyOTP} >
                    Verify Otp
                  </AuthButton>
                </LinearGradient>
              </Box>
              <HStack
                alignSelf="center"
                marginTop={20}
                justifyContent="center"
                columnGap={7}
              >
                <ThemedText lightColor="black" darkColor="white">
                  Didn't recieve a code?
                </ThemedText>
                <ThemedText lightColor={AppColor.links.light} darkColor={AppColor.links.dark} onPress={handleResendVerification}>
                  Resend
                </ThemedText>
              </HStack>
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
    fontSize: 52,
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
