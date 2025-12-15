import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type RootStackParamList = {
  "(main)": undefined;
  Home: undefined;
  MainTabs: undefined;
  "two-factor-authentication": undefined;
  onboarding: undefined;
  settings: undefined;

  // ✅ Chat Routes
  ChatList: undefined;
  ChatChannel: {
    channelId: string;  
  };
  NewChat: undefined;    
};

export type ProjectNavigationProps = NativeStackNavigationProp<RootStackParamList>;
