import { NativeStackNavigationProp } from '@react-navigation/native-stack';


type RootStackParamList = {
  "(auth)" : undefined;
  SignIn: { email: string } | undefined;   // no params
  SignUp: undefined;   // no params
  VerifyOtp: { message: string } | undefined;
  SignUpDetails: undefined;
  TwoFaLogin: undefined;
};



export type AuthNavigationProp = NativeStackNavigationProp<RootStackParamList>;


