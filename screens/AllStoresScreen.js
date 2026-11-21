import { View } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Store } from 'lucide-react-native'
import Text from '../components/ui/Text'
import { useAppTheme } from '../hooks/useAppTheme'

const AllStoresScreen = () => {
    const { colors } = useAppTheme()

    return (
        <SafeAreaView edges={['top']} className="flex-1 items-center justify-center bg-background px-8 dark:bg-background-dark">
            <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-brand-soft dark:bg-brand-soft-dark">
                <Store size={36} strokeWidth={2} color={colors.brand} />
            </View>
            <Text className="mb-1 text-lg font-bold">All stores</Text>
            <Text className="text-center text-muted dark:text-muted-dark">The full store list is coming soon.</Text>
        </SafeAreaView>
    )
}

export default AllStoresScreen
