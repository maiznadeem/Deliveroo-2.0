import { View, TouchableOpacity, Switch } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { deleteUser, getAuth, signOut } from '@react-native-firebase/auth'
import { useNavigation } from '@react-navigation/native'
import { LogOut, Moon, Sun } from 'lucide-react-native'
import Text from '../components/ui/Text'
import { cardShadow } from '../core/theme'
import { useAppTheme } from '../hooks/useAppTheme'

const ProfileScreen = () => {

    const navigation = useNavigation()
    const { isDark, colors, toggleScheme } = useAppTheme()
    const user = getAuth().currentUser
    const isDemo = !!user?.isAnonymous
    const email = isDemo ? 'Demo account' : user?.email

    // Demo (anonymous) users can't sign back in, so delete them instead of leaving orphans behind.
    const handleSignOut = () => {
        const done = isDemo ? deleteUser(user).catch(() => signOut(getAuth())) : signOut(getAuth())
        done
            .then(()=>{
                navigation.replace("LoginScreen")
            })
            .catch(error => alert(error.message))
    }

    const cardClass = 'rounded-2xl border border-transparent bg-surface dark:border-border-dark dark:bg-surface-dark'
    const ThemeIcon = isDark ? Moon : Sun

    return (
        <SafeAreaView edges={['top']} className="flex-1 bg-background dark:bg-background-dark">
            <View className="px-4 pb-2 pt-4">
                <Text className="text-2xl font-extrabold">Profile</Text>
            </View>

            <View className="gap-4 px-4 pt-2">
                <View className={`${cardClass} flex-row items-center gap-4 p-4`} style={isDark ? undefined : cardShadow}>
                    <View className="h-14 w-14 items-center justify-center rounded-full bg-brand-soft dark:bg-brand-soft-dark">
                        <Text className="text-xl font-bold text-link dark:text-link-dark">{(email ?? '?').charAt(0).toUpperCase()}</Text>
                    </View>
                    <View className="flex-1">
                        <Text className="text-xs text-muted dark:text-muted-dark">Signed in as</Text>
                        <Text className="text-base font-semibold" numberOfLines={1}>{email}</Text>
                    </View>
                </View>

                <View className={`${cardClass} min-h-14 flex-row items-center gap-3 px-4 py-2`} style={isDark ? undefined : cardShadow}>
                    <ThemeIcon size={20} strokeWidth={2} color={colors.brand} />
                    <View className="flex-1">
                        <Text className="text-base font-semibold">Dark mode</Text>
                        <Text className="text-xs text-muted dark:text-muted-dark">{isDark ? 'On' : 'Off'}</Text>
                    </View>
                    <Switch
                        accessibilityLabel="Dark mode"
                        value={isDark}
                        onValueChange={toggleScheme}
                        trackColor={{ false: colors.outline, true: colors.brand }}
                        thumbColor="#FFFFFF"
                    />
                </View>

                <TouchableOpacity
                    accessibilityRole="button"
                    activeOpacity={0.85}
                    className="h-12 flex-row items-center justify-center gap-2 rounded-xl bg-brand"
                    onPress={handleSignOut}
                >
                    <LogOut size={20} strokeWidth={2} color="#FFFFFF" />
                    <Text className="font-bold text-white">Sign Out</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}

export default ProfileScreen
