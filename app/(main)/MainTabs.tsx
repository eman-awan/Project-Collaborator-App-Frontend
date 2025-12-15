import { useAppSelector } from '@/store/hooks';
import AppColor from '@/utils/AppColor';
import Ionicons from '@expo/vector-icons/Ionicons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import ChatHomeRedirect from './chat-home-redirect';
import Home from './home';
import MyApplications from './my-applications';
import MyProjects from './my-projects';
import Profile from './profile';

const Tab = createBottomTabNavigator();

export default function MainTabs() {

  const theme = useAppSelector(state => state.theme.mode);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = 'home-outline';
          else if (route.name === 'Create') iconName='add';
          else if (route.name === 'Applications') iconName = 'documents-outline';
          else if (route.name === 'Profile') iconName = 'person-outline';
          else if (route.name === 'ChatHomeRedirect') iconName = 'chatbubble-outline';
          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: AppColor.tabs[theme].active,
        tabBarInactiveTintColor: AppColor.tabs[theme].inactive,
      })}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Create" component={MyProjects} />
      <Tab.Screen name="Applications" component={MyApplications} />
      <Tab.Screen name="Profile" component={Profile} />
      <Tab.Screen name="ChatHomeRedirect" component={ChatHomeRedirect} />
    </Tab.Navigator>
  );
}
