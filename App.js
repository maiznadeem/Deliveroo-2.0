import './global.css';
import { hideSplash } from './helpers/splash'; // first: keeps the native splash up
import './firebase/appCheck'; // App Check must be set up before any Firestore/Auth call
import { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { store } from './store';
import { Provider as ReduxProvider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { getAuth } from '@react-native-firebase/auth';
import { House, ShoppingCart, CircleUser, Store } from 'lucide-react-native';

import {
    StartScreen,
    LoginScreen,
    RegisterScreen,
    ResetPasswordScreen,
    Dashboard,
    RestaurantScreen,
    BasketScreen,
    PreparingOrderScreen,
    DeliveryScreen,
    ProfileScreen,
    AllStoresScreen,
} from './screens';

import Logo from './components/AuthComponents/Logo';
import Text from './components/ui/Text';
import { createNavigationTheme, fontFamilies } from './core/theme';
import { restoreColorScheme, useAppTheme } from './hooks/useAppTheme';
import { perfMark } from './helpers/perf';
import { preloadCatalogue } from './helpers/catalogue';
import { prewarmStorageHeaders } from './hooks/useStorageAuthHeaders';

perfMark('app-module-evaluated');

// Everything below starts at import time and runs in parallel: the saved color scheme (the splash covers the
// wait), and, for a user who is already signed in, the tokens for Storage images and the catalogue reads.
const schemeRestored = restoreColorScheme();
if (getAuth().currentUser) {
    prewarmStorageHeaders();
    preloadCatalogue();
}

// Safety net: never leave the app behind the splash if the first screen never reports ready.
const SPLASH_TIMEOUT_MS = 5000;

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

function CustomDrawerContent({ navigation, state }) {
    const { colors } = useAppTheme();
    const user = getAuth().currentUser;
    const email = user?.isAnonymous ? 'Demo account' : user?.email;
    const active = state.routeNames[state.index];

    const itemProps = (routeName) => ({
        focused: active === routeName,
        activeTintColor: colors.brand,
        inactiveTintColor: colors.muted,
        activeBackgroundColor: colors.brandSoft,
        labelStyle: { fontFamily: fontFamilies.semibold, fontSize: 15 },
        style: { borderRadius: 12, marginVertical: 2 },
    });

    return (
        <DrawerContentScrollView contentContainerStyle={{ paddingHorizontal: 12 }}>
            <View className="mb-3 items-center border-b border-border px-2 pb-4 dark:border-border-dark">
                <Logo size={96} />
                {email ? (
                    <Text className="text-xs text-muted dark:text-muted-dark" numberOfLines={1}>{email}</Text>
                ) : null}
            </View>

            <DrawerItem
                {...itemProps('DashboardTab')}
                label="Dashboard"
                icon={({ color, size }) => <House size={size} strokeWidth={2} color={color} />}
                onPress={() => navigation.navigate('DashboardTab', { screen: 'Dashboard' })}
            />
            <DrawerItem
                {...itemProps('ProfileScreen')}
                label="Profile"
                icon={({ color, size }) => <CircleUser size={size} strokeWidth={2} color={color} />}
                onPress={() => navigation.navigate('ProfileScreen')}
            />
            <DrawerItem
                {...itemProps('BasketScreen')}
                label="Basket"
                icon={({ color, size }) => <ShoppingCart size={size} strokeWidth={2} color={color} />}
                onPress={() => navigation.navigate('BasketScreen')}
            />
        </DrawerContentScrollView>
    );
}

export default function App() {
    const { isDark, colors } = useAppTheme();
    const [ready, setReady] = useState(false);
    // A saved session (including a demo session) opens the app directly, without flashing the Start screen.
    const [initialRoute] = useState(() => (getAuth().currentUser ? 'DashboardDrawer' : 'StartScreen'));

    useEffect(() => {
        schemeRestored.finally(() => setReady(true));
        const timer = setTimeout(hideSplash, SPLASH_TIMEOUT_MS);
        return () => clearTimeout(timer);
    }, []);

    // Root view background (behind the keyboard, during transitions) follows the theme.
    useEffect(() => {
        SystemUI.setBackgroundColorAsync(colors.background).catch(() => {});
    }, [colors.background]);

    const navigationTheme = useMemo(() => createNavigationTheme(isDark), [isDark]);

    if (!ready) return null;

    return (
        <SafeAreaProvider>
            <ReduxProvider store={store}>
                <StatusBar style={isDark ? 'light' : 'dark'} />
                <NavigationContainer theme={navigationTheme}>
                    <Stack.Navigator
                        initialRouteName={initialRoute}
                        screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}
                    >
                        <Stack.Screen name="StartScreen" component={StartScreen} />
                        <Stack.Screen name="LoginScreen" component={LoginScreen} />
                        <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
                        <Stack.Screen name="RestaurantScreen" component={RestaurantScreen} />
                        <Stack.Screen name="ResetPasswordScreen" component={ResetPasswordScreen} />
                        <Stack.Screen name="PreparingOrderScreen" component={PreparingOrderScreen} />
                        <Stack.Screen name="DeliveryScreen" component={DeliveryScreen} />
                        <Stack.Screen name="DashboardDrawer" component={DashboardDrawer} />
                    </Stack.Navigator>
                </NavigationContainer>
            </ReduxProvider>
        </SafeAreaProvider>
    );
}

// Wrapper component for Dashboard screen to render Drawer Navigator
function DashboardDrawer() {
    const { colors } = useAppTheme();
    return (
        <Drawer.Navigator
            initialRouteName="DashboardTab"
            drawerContent={(props) => <CustomDrawerContent {...props} />}
            screenOptions={{
                headerShown: false,
                drawerStyle: { backgroundColor: colors.surface },
                sceneStyle: { backgroundColor: colors.background },
            }}
        >
            <Drawer.Screen name="DashboardTab" component={DashboardTabs} />
            <Drawer.Screen name="ProfileScreen" component={ProfileScreen} />
            <Drawer.Screen name="BasketScreen" component={BasketScreen} />
        </Drawer.Navigator>
    );
}


// Wrapper component for Dashboard screen to render Tab Navigator
function DashboardTabs() {
    const { colors } = useAppTheme();
    return (
        <Tab.Navigator
            initialRouteName="Dashboard"
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarShowLabel: false,
                tabBarActiveTintColor: colors.brand,
                tabBarInactiveTintColor: colors.muted,
                // No fixed height: the bar adds the gesture-navigation inset itself.
                tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
                sceneStyle: { backgroundColor: colors.background },
                tabBarIcon: ({ color }) => {
                    if (route.name === 'Dashboard') {
                        return <House color={color} size={24} strokeWidth={2} />;
                    } else if (route.name === 'BasketScreen') {
                        return <ShoppingCart color={color} size={24} strokeWidth={2} />;
                    } else if (route.name === 'ProfileScreen') {
                        return <CircleUser color={color} size={24} strokeWidth={2} />;
                    } else if (route.name === 'AllStoresScreen') {
                        return <Store color={color} size={24} strokeWidth={2} />;
                    }
                },
            })}
        >
            <Tab.Screen name="Dashboard" component={Dashboard} options={{ tabBarAccessibilityLabel: 'Home' }} />
            <Tab.Screen name="AllStoresScreen" component={AllStoresScreen} options={{ tabBarAccessibilityLabel: 'All stores' }} />
            <Tab.Screen name="BasketScreen" component={BasketScreen} options={{ tabBarAccessibilityLabel: 'Basket' }} />
            <Tab.Screen name="ProfileScreen" component={ProfileScreen} options={{ tabBarAccessibilityLabel: 'Profile' }} />
        </Tab.Navigator>
    );
}
