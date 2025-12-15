import { fetchUserData, signinFn } from '@/api/authApi';
import { AuthButton } from '@/components/auth/AuthButton';
import { ThemedText } from '@/components/ThemedText';
import ThemeToggleButton from '@/components/ThemeToggleButton';
import { Box } from '@/components/ui/box';
import { FormControl, FormControlLabel, FormControlLabelText } from '@/components/ui/form-control';
import { HStack } from '@/components/ui/hstack';
import { EyeIcon, EyeOffIcon, Icon } from '@/components/ui/icon';
import { Input, InputField, InputSlot } from '@/components/ui/input';
import { VStack } from '@/components/ui/vstack';
import { ENV_CONFIG } from '@/env_config';
import { Fonts } from '@/fonts/font';
import { useThemedStyle } from '@/hooks/useThemedStyle';
import { AuthNavigationProp } from '@/routes/AuthNavigationProp';
import { ProjectNavigationProps } from '@/routes/ProjectNavigationProps';
import { AuthSchema } from '@/schema/auth/auth.schema';
import { JWTStorage } from '@/secure-storage/jwt-storage';
import { signin } from '@/store/features/auth/authSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import AppColor from '@/utils/AppColor';
import { useRoute } from '@react-navigation/native';
import { useMutation } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Image, KeyboardAvoidingView,
  Platform, ScrollView, StyleSheet, TextStyle, ViewStyle
} from 'react-native';
import { useAuth } from './auth-provider';


const SignUpImage = require('../../assets/images/auth/signin-logo.png');

export default function SignIn() {
  const theme = useAppSelector(state => state.theme.mode);
  const navigation = useNavigation<AuthNavigationProp>();
  const mainNavigation = useNavigation<ProjectNavigationProps>();
  const [showPassword, setShowPassword] = React.useState(false);
  const route = useRoute();
  const { email: incomingEmail } = route.params as { email: string } || { email: '' };
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('')

  useEffect(() => {
    if (incomingEmail) setEmail(incomingEmail);
  }, [incomingEmail]);

  const { setAuth } = useAuth();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (ENV_CONFIG.DEV_MODE) {
      setEmail(ENV_CONFIG.TEST_EMAIL);
      setPassword(ENV_CONFIG.TEST_PASSWORD)
    }
  }, [ENV_CONFIG])

  const { mutate, isPending } = useMutation({
    mutationFn: signinFn,
    onSuccess: async (payload) => {
      try {
        const token = payload.access_token;
        if (!token) {
          alert('Missing token');
          return;
        }

        await JWTStorage.saveToken(token);
        
        const [userData] = await Promise.all([
          fetchUserData(),
          new Promise((res) => setTimeout(res, 200))
        ]);
        
        dispatch(signin(userData));
        console.log('User data:', userData);
        
        if (userData.isTwoFactorAuthenticationEnabled) {
          navigation.reset({ index: 0, routes: [{ name: 'TwoFaLogin' }] });
        } else {
          mainNavigation.reset({ index: 0, routes: [{ name: '(main)' }] });
        }
      } catch (error: any) {
        console.error('Error in onSuccess:', error);
        alert(error?.message || 'Failed to fetch user data');
      }
    },
    onError: (error: Error) => {
      console.error('Signin error:', error);
      const message = error.message.trim();
      if (message
        .includes('Please verify your email before signing in. Check your inbox for the new OTP.')
      ) {
        setAuth(prev => ({ ...prev, email }));
        navigation.navigate('VerifyOtp', { message });
      } else {
        alert(message || 'Something went wrong');
      }
    }
  })

  const handleSignIn = () => {
    const payload = { email, password }
    const result = AuthSchema.safeParse(payload);
    if (!result.success) {
      const message = result.error.issues[0].message;
      alert(message);
      return;
    }
    mutate(payload);
  }

  const inputContainerStyle = useThemedStyle<ViewStyle>(
    { backgroundColor: AppColor.primary.light },
    { backgroundColor: AppColor.primary.dark },
    { paddingHorizontal: 12, height: 48, borderRadius: 8, flexDirection: 'row', alignItems: 'center' }
  );

  const inputFieldStyle = useThemedStyle<TextStyle>(
    { color: 'black' },
    { color: 'white' },
    { height: 48, fontSize: 16, flex: 1 }
  );

  const placeholderTextColor = theme !== 'dark' ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)';

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
            WELCOME BACK
          </ThemedText>
          {/* <ThemedText style={styles.subtitle}>Welcome Back</ThemedText> */}

          <Image source={SignUpImage} style={styles.image} resizeMode="contain" />
          <FormControl style={styles.formControl}>
            <VStack style={{ rowGap: 10 }}>
              <FormControlLabel>
                <FormControlLabelText>
                  <ThemedText lightColor="black" darkColor="white" style={styles.labelStyle}>
                    Email
                  </ThemedText>
                </FormControlLabelText>
              </FormControlLabel>
              <Input style={inputContainerStyle} variant="outline" size="md">
                <InputField
                  style={inputFieldStyle}
                  placeholderTextColor={placeholderTextColor}
                  placeholder="Enter Your Email"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                />
              </Input>

              {/* Password Field */}
              <FormControlLabel>
                <FormControlLabelText>
                  <ThemedText lightColor="black" darkColor="white" style={styles.labelStyle}>
                    Password
                  </ThemedText>
                </FormControlLabelText>
              </FormControlLabel>
              <Input style={inputContainerStyle} variant="outline" size="md">
                <InputField
                  style={inputFieldStyle}
                  placeholderTextColor={placeholderTextColor}
                  placeholder="Enter your password"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <InputSlot onPress={() => setShowPassword(!showPassword)}>
                  <Icon
                    color={inputFieldStyle.color as string}
                    as={showPassword ? EyeOffIcon : EyeIcon}
                    style={styles.eyeIcon}
                  />
                </InputSlot>
              </Input>
              <Box alignSelf="flex-end">
                <ThemedText lightColor={AppColor.links.light} darkColor={AppColor.links.dark} fontSize={13}>
                  Forgot Password?
                </ThemedText>
              </Box>
              <Box width="100%" alignItems='center' marginTop={30} style={{ display: 'flex' }}>
                <LinearGradient
                  colors={theme === 'light' ? ['#5F4366', '#707A8D'] : [AppColor.primary.light, 'gray']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ borderRadius: 8, width: '100%', display: 'flex', alignItems: 'center' }}
                >
                  <AuthButton disabled={isPending} isLoading={isPending} onPress={handleSignIn}>
                    Sign In
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
                  Don't have an account?
                </ThemedText>
                <ThemedText lightColor={AppColor.links.light} darkColor={AppColor.links.dark} onPress={() => navigation.navigate('SignUp')}>
                  Sign Up
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
  },
  title: {
    fontSize: 42,
    lineHeight: 42,
    marginBottom: 8,
    fontFamily: Fonts.Instrument.Serif.Regular
  },
  subtitle: {
    fontSize: 22,
    marginBottom: 5,
    fontFamily: Fonts.Instrument.Serif.Regular
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
