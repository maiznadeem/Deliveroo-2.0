import './global.css';
import './firebase/appCheck'; // App Check must be set up before any Firestore/Auth call
import { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { store } from './store';
import { Provider as ReduxProvider } from 'react-redux';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import { getAuth } from '@react-native-firebase/auth';
import { House, ShoppingCart, CircleUser, Store, Eye, EyeOff, X, Check, ChevronDown, ArrowLeft, Search } from 'lucide-react-native';

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
import { createNavigationTheme, createPaperTheme, fontFamilies } from './core/theme';
import { restoreColorScheme, useAppTheme } from './hooks/useAppTheme';

// Keep the native splash up until the saved color scheme is applied, so there is no light -> dark flash.
SplashScreen.preventAutoHideAsync().catch(() => {});

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

// lucide replaces vector-icons: Paper looks icons up through this (TextInput.Icon, Button icon, ...).
const paperIcons = {
    eye: Eye,
    'eye-off': EyeOff,
    close: X,
    check: Check,
    'chevron-down': ChevronDown,
    'menu-down': ChevronDown,
    'arrow-left': ArrowLeft,
    magnify: Search,
};
function PaperIcon({ name, color, size }) {
    const Icon = paperIcons[name];
    return Icon ? <Icon color={color} size={size} strokeWidth={2} /> : null;
}

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

    useEffect(() => {
        restoreColorScheme().finally(() => setReady(true));
    }, []);

    useEffect(() => {
        if (ready) SplashScreen.hideAsync().catch(() => {});
    }, [ready]);

    // Root view background (behind the keyboard, during transitions) follows the theme.
    useEffect(() => {
        SystemUI.setBackgroundColorAsync(colors.background).catch(() => {});
    }, [colors.background]);

    const navigationTheme = useMemo(() => createNavigationTheme(isDark), [isDark]);
    const paperTheme = useMemo(() => createPaperTheme(isDark), [isDark]);

    if (!ready) return null;

    return (
        <SafeAreaProvider>
            <ReduxProvider store={store}>
                <PaperProvider theme={paperTheme} settings={{ icon: PaperIcon }}>
                    <StatusBar style={isDark ? 'light' : 'dark'} />
                    <NavigationContainer theme={navigationTheme}>
                        <Stack.Navigator
                            initialRouteName="StartScreen"
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
                </PaperProvider>
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
