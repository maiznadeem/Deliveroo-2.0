import React, { useEffect, useRef, useState } from 'react'
import { TouchableOpacity, View } from 'react-native'
import { Lock, Mail } from 'lucide-react-native'
import Text from '../components/ui/Text'
import AuthLayout from '../components/AuthComponents/AuthLayout'
import Button from '../components/AuthComponents/Button'
import TextInput from '../components/AuthComponents/TextInput'
import DemoButton from '../components/AuthComponents/DemoButton'
import OrDivider from '../components/AuthComponents/OrDivider'
import { emailValidator } from '../helpers/emailValidator'
import { passwordValidator } from '../helpers/passwordValidator'
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword } from '@react-native-firebase/auth'

export default function LoginScreen({ navigation }) {

    const [email, setEmail] = useState({ value: '', error: '' })
    const [password, setPassword] = useState({ value: '', error: '' })
    const [loading, setLoading] = useState(false)
    const passwordRef = useRef(null)

    useEffect(()=>{
        const unsubscribe = onAuthStateChanged(getAuth(), (user => {
            if (user) {
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'DashboardDrawer' }],
                })
            }
        }))

        return unsubscribe
    },[])

    const onLoginPressed = () => {

        const emailError = emailValidator(email.value)
        const passwordError = passwordValidator(password.value)
        if (emailError || passwordError) {
            setEmail({ ...email, error: emailError })
            setPassword({ ...password, error: passwordError })
            return
        }

        setLoading(true)
        signInWithEmailAndPassword(getAuth(), email.value, password.value)
            .catch(error => alert(error.message))
            .finally(() => setLoading(false))

    }

    return (
        <AuthLayout onBack={navigation.goBack} title="Welcome back" subtitle="Log in to keep your orders and favourites close.">
            <TextInput
                label="Email"
                icon={Mail}
                placeholder="you@example.com"
                returnKeyType="next"
                value={email.value}
                onChangeText={(text) => setEmail({ value: text, error: '' })}
                onSubmitEditing={() => passwordRef.current?.focus()}
                submitBehavior="submit"
                error={!!email.error}
                errorText={email.error}
                autoCapitalize="none"
                autoComplete="email"
                textContentType="emailAddress"
                keyboardType="email-address"
            />
            <TextInput
                ref={passwordRef}
                label="Password"
                icon={Lock}
                placeholder="Your password"
                returnKeyType="done"
                value={password.value}
                onChangeText={(text) => setPassword({ value: text, error: '' })}
                onSubmitEditing={onLoginPressed}
                error={!!password.error}
                errorText={password.error}
                autoComplete="current-password"
                textContentType="password"
                secureTextEntry
            />
            <View className="mb-3 w-full items-end">
                <TouchableOpacity
                    accessibilityRole="link"
                    className="min-h-11 justify-center"
                    onPress={() => navigation.navigate('ResetPasswordScreen')}
                >
                    <Text className="text-sm font-semibold text-link dark:text-link-dark">Forgot your password?</Text>
                </TouchableOpacity>
            </View>
            <Button mode="contained" onPress={onLoginPressed} loading={loading}>
                Log in
            </Button>
            <OrDivider />
            <DemoButton navigation={navigation} />
            <View className="mt-3 flex-row items-center justify-center">
                <Text className="text-muted dark:text-muted-dark">New here? </Text>
                <TouchableOpacity accessibilityRole="link" className="min-h-11 justify-center" onPress={() => navigation.replace('RegisterScreen')}>
                    <Text className="font-bold text-link dark:text-link-dark">Create an account</Text>
                </TouchableOpacity>
            </View>
        </AuthLayout>
    )
}
