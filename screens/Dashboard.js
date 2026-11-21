import { View, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import React, { useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronDown, Search, SlidersHorizontal, Menu, Sun, Moon } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

import Categories from '../components/Categories';
import FeaturedRow from '../components/FeaturedRow';
import StorageImage from '../components/StorageImage';
import Text from '../components/ui/Text';
import IconButton from '../components/ui/IconButton';

import { prefetchDishes, useCatalogue } from '../helpers/catalogue';
import { hideSplash } from '../helpers/splash';
import { useAppTheme } from '../hooks/useAppTheme';
import { perfMark } from '../helpers/perf';
import { fontFamilies } from '../core/theme';

const FIRST_IMAGE_GRACE_MS = 450

const Dashboard = () => {

    const navigation = useNavigation()
    const { isDark, colors, toggleScheme } = useAppTheme()

    // Categories, featured rows and the restaurants they reference are read once and shared (helpers/catalogue.js).
    const { categories, sections, loading, error } = useCatalogue()
    const ready = !loading || !!error

    // The native splash stays up until there is something to show: the content is ready and the first image has
    // had a moment to come from the disk cache (StorageImage hides the splash as soon as one has loaded).
    useEffect(() => {
        if (!ready) return undefined
        const timer = setTimeout(hideSplash, error ? 0 : FIRST_IMAGE_GRACE_MS)
        return () => clearTimeout(timer)
    }, [ready, error])

    // Once the dashboard is on screen, fill the dish cache so opening a restaurant needs no reads.
    useEffect(() => {
        if (!loading && !error) prefetchDishes()
    }, [loading, error])

    // Reads failed (e.g. permission-denied when not signed in): say so instead of spinning forever
    if (error) {
        return (
          <SafeAreaView edges={['top']} className="flex-1 items-center justify-center bg-background px-8 dark:bg-background-dark">
            <Text className="mb-2 text-center text-lg font-bold">Couldn't load restaurants</Text>
            <Text className="text-center text-muted dark:text-muted-dark">
              {String(error.code).includes('permission-denied')
                ? 'You need to be signed in to view restaurants.'
                : 'Please check your connection and try again later.'}
            </Text>
          </SafeAreaView>
        );
    }

    // If not loaded, return loading indicator
    if (loading) {
        return (
          <SafeAreaView edges={['top']} className="flex-1 items-center justify-center bg-background dark:bg-background-dark">
            <ActivityIndicator size="large" color={colors.brand} />
          </SafeAreaView>
        );
    }

    perfMark('dashboard-rendered')
    return (
        <View className="flex-1 bg-background dark:bg-background-dark">
            <SafeAreaView edges={['top']} className="border-b border-border bg-surface pb-3 dark:border-border-dark dark:bg-surface-dark">

                {/* Top bar */}
                <View className="flex-row items-center gap-1 pl-2 pr-2 pt-2">
                    <IconButton accessibilityLabel="Open menu" onPress={() => navigation.openDrawer()}>
                        <Menu size={24} strokeWidth={2} color={colors.brand} />
                    </IconButton>
                    <StorageImage
                        source={require('../assets/rider.webp')}
                        className="h-9 w-9 rounded-full"
                        resizeMode="cover"
                    />
                    <View className="ml-2 flex-1">
                        <Text className="text-xs font-semibold text-muted dark:text-muted-dark" numberOfLines={1}>Deliver Now!</Text>
                        <View className="flex-row items-center gap-1">
                            <Text className="shrink text-base font-bold" numberOfLines={1}>Current Location</Text>
                            <ChevronDown size={20} strokeWidth={2} color={colors.brand} />
                        </View>
                    </View>
                    <IconButton
                        accessibilityLabel={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                        onPress={toggleScheme}
                    >
                        {isDark
                            ? <Sun size={24} strokeWidth={2} color={colors.brand} />
                            : <Moon size={24} strokeWidth={2} color={colors.brand} />}
                    </IconButton>
                </View>

                {/* Search */}
                <View className="mt-1 flex-row items-center gap-2 pl-4 pr-2">
                    <View className="h-11 flex-1 flex-row items-center gap-2 rounded-xl bg-surface-alt px-3 dark:bg-surface-alt-dark">
                        <Search size={20} strokeWidth={2} color={colors.muted} />
                        <TextInput
                            className="h-11 flex-1 text-sm text-text dark:text-text-dark"
                            style={{ fontFamily: fontFamilies.regular }}
                            placeholder="Restaurants and Cuisines"
                            placeholderTextColor={colors.muted}
                            keyboardType="default"
                            selectionColor={colors.brand}
                        />
                    </View>
                    <View className="h-11 w-11 items-center justify-center">
                        <SlidersHorizontal size={24} strokeWidth={2} color={colors.brand} />
                    </View>
                </View>
            </SafeAreaView>

            {/* Body */}
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 8, paddingBottom: 24 }}>

                {/* Categories */}
                <Categories categories={categories} />

                {/* Featured Rows */}
                {sections.map((section) => (
                <FeaturedRow
                    key={section.id}
                    title={section.title}
                    description={section.description}
                    restaurants={section.restaurants}
                />
                ))}

            </ScrollView>
        </View>
    )
}

export default Dashboard
