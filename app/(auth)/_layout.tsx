import React from 'react';

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthProvider from './auth-provider';
import SignIn from './signin';
import SignUp from './signup';
import SignUpDetails from './signup-details';
import TwoFaLogin from './two-fa-login';
import VerifyOtp from './verify-otp';

export default function AuthStack() {
  const Stack = createNativeStackNavigator();

  return (
    <AuthProvider>
      <Stack.Navigator
        initialRouteName='SignIn'
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name='SignIn' component={SignIn} />
        <Stack.Screen name='SignUp' component={SignUp} />
        <Stack.Screen name='SignUpDetails' component={SignUpDetails} />
        <Stack.Screen name='VerifyOtp' component={VerifyOtp} />
        <Stack.Screen name='TwoFaLogin' component={TwoFaLogin}/>
      </Stack.Navigator>
    </AuthProvider>
  );
}
