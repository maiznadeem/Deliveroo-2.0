import { View, Image, Text, TextInput, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import React, { useLayoutEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    ChevronDownIcon,
    MagnifyingGlassIcon,
    AdjustmentsVerticalIcon,
    Bars3Icon,
} from 'react-native-heroicons/outline';

import Categories from '../components/Categories';
import FeaturedRow from '../components/FeaturedRow';

import useFirestoreData from '../hooks/UseFirestoreData';
import { useNavigation } from '@react-navigation/native';

const Dashboard = () => {

    const navigation = useNavigation()

    // Firestore Data Fetching
    const { loading: restaurantsLoading, error: restaurantsError } = useFirestoreData('Restaurant')
    const { data: categories, loading: categoriesLoading, error: categoriesError } = useFirestoreData('Categories')
    const { data: featured, loading: featuredLoading, error: featuredError } = useFirestoreData('Featured')

    const error = restaurantsError || categoriesError || featuredError

    // Reads failed (e.g. permission-denied when not signed in): say so instead of spinning forever
    if (error) {
        return (
          <SafeAreaView style={{flex: 1}} className="items-center justify-center px-8">
            <Text className="text-lg font-bold mb-2 text-center">Couldn't load restaurants</Text>
            <Text className="text-gray-500 text-center">
              {String(error.code).includes('permission-denied')
                ? 'You need to be signed in to view restaurants.'
                : 'Please check your connection and try again later.'}
            </Text>
          </SafeAreaView>
        );
    }

    // If not loaded, return loading indicator
    if ( restaurantsLoading || categoriesLoading || featuredLoading ) {
        return (
          <SafeAreaView style={{flex: 1}}>
            <ActivityIndicator style={{flex: 1, justifyContent: 'center', alignItems: 'center'}} size="large" color="#00B8C0" />
          </SafeAreaView>
        );
    }

    return (
        <SafeAreaView>
            <StatusBar backgroundColor="white" barStyle="dark-content" />
            <View className='bg-white pt-5'>

                {/* Top View */}
                <View className='flex-row items-center mx-4 space-x-3'>
                    <TouchableOpacity
                        onPress={() => navigation.openDrawer()}
                    >
                        <Bars3Icon color='#00B8C0' size={27}/>
                    </TouchableOpacity>
                    <Image
                        source={{uri: 'https://firebasestorage.googleapis.com/v0/b/deliveroo-2-c6550.appspot.com/o/Delivery%20Guy.png?alt=media&token=3111e8f6-a485-43db-8353-4a534e643fd7'}}
                        className='h-7 w-7 bg-gray-300 p-4 rounded-full'
                    />
                    <View className='flex-1'>
                        <Text className='font-bold text-gray-400 text-xs'>Deliver Now!</Text>
                        <View className='flex-row items-center'>
                            <Text className='font-bold text-lg'>Current Location</Text>
                            <ChevronDownIcon style={{ marginLeft: 4 }} size={20} color='#00B8C0' />
                        </View>
                    </View>
                </View>

                {/* Search */}
                <View className='flex-row items-center space-x-2 pb-2 mx-4 mt-2'>
                    <View className='flex-row flex-1 space-x-2 bg-gray-200 p-3 items-center rounded-md'>
                        <MagnifyingGlassIcon size={20} color='gray' />
                        <TextInput 
                            placeholder='Restaurants and Cuisines'
                            keyboardType='default'
                        />
                    </View>
                    <AdjustmentsVerticalIcon size={35} color='#00B8C0' />
                </View>
            </View>

            {/* Body */}
            <ScrollView showsVerticalScrollIndicator={false}>
                
                {/* Categories */}
                <Categories categories={categories} />

                {/* Featured Rows */}

                {featured.map((item) => (
                <FeaturedRow
                    key={item.id}
                    id={item.id}
                    title={item.title}
                    description={item.description}
                    data={item.restaurant}
                />
                ))}

                <View className="p-10 m-10"></View>

            </ScrollView>

        </SafeAreaView>
    )
}

export default Dashboard