import React from 'react';
import { CommonActions } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BottomNavigation } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useConversationsContext } from '../features/home/conversations-context';
import { HomeScreen } from '../features/home/screens/home-screen';
import { ContactsScreen } from '../features/contacts/screens/contacts-screen';
import { NotificationsScreen } from '../features/notifications/screens/notifications-screen';
import { SettingsScreen } from '../features/settings/screens/settings-screen';
import { icons } from '../theme/icons';
import type { TabParamList } from './types';

const Tab = createBottomTabNavigator<TabParamList>();

const tabIcons: Record<keyof TabParamList, string> = {
  Home: icons.tabChat,
  Contacts: icons.tabContacts,
  Notifications: icons.tabNotifications,
  Settings: icons.tabSettings,
};

function renderTabIcon({
  route,
  color,
}: {
  route: { name: string };
  color: string;
}) {
  return (
    <MaterialCommunityIcons
      name={tabIcons[route.name as keyof TabParamList]}
      size={24}
      color={color}
    />
  );
}

function PaperTabBar({
  navigation,
  state,
  descriptors,
  insets,
}: BottomTabBarProps) {
  return (
    <BottomNavigation.Bar
      navigationState={state}
      safeAreaInsets={insets}
      onTabPress={({ route, preventDefault }) => {
        const event = navigation.emit({
          type: 'tabPress',
          target: route.key,
          canPreventDefault: true,
        });
        if (event.defaultPrevented) {
          preventDefault();
        } else {
          navigation.dispatch({
            ...CommonActions.navigate(route.name, route.params),
            target: state.key,
          });
        }
      }}
      renderIcon={renderTabIcon}
      getLabelText={({ route }) =>
        descriptors[route.key].options.title ?? route.name
      }
      getBadge={({ route }) =>
        descriptors[route.key].options.tabBarBadge as
          | number
          | string
          | undefined
      }
    />
  );
}

export function TabNavigator() {
  const { totalUnread } = useConversationsContext();
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }} tabBar={PaperTabBar}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Trò chuyện',
          tabBarBadge:
            totalUnread > 0
              ? totalUnread > 99
                ? '99+'
                : totalUnread
              : undefined,
        }}
      />
      <Tab.Screen
        name="Contacts"
        component={ContactsScreen}
        options={{ title: 'Danh bạ' }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ title: 'Thông báo' }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Cài đặt' }}
      />
    </Tab.Navigator>
  );
}
