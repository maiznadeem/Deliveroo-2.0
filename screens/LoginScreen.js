import React, { useEffect, useState } from 'react'
import { TouchableOpacity, View } from 'react-native'
import Text from '../components/ui/Text'
import Background from '../components/AuthComponents/Background'
import Logo from '../components/AuthComponents/Logo'
import Header from '../components/AuthComponents/Header'
import Button from '../components/AuthComponents/Button'
import TextInput from '../components/AuthComponents/TextInput'
import DemoButton from '../components/AuthComponents/DemoButton'
import { emailValidator } from '../helpers/emailValidator'
import { passwordValidator } from '../helpers/passwordValidator'
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword } from '@react-native-firebase/auth'

export default function LoginScreen({ navigation }) {

    const [email, setEmail] = useState({ value: '', error: '' })
    const [password, setPassword] = useState({ value: '', error: '' })

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

        signInWithEmailAndPassword(getAuth(), email.value, password.value)
            .then(userCredentials => {
                const user = userCredentials.user
            })
            .catch(error => alert(error.message))

    }

    return (

        <Background onBack={navigation.goBack}>
            <Logo size={128} />
            <Header>Welcome back.</Header>
            <TextInput
                label="Email"
                returnKeyType="next"
                value={email.value}
                onChangeText={(text) => setEmail({ value: text, error: '' })}
                error={!!email.error}
                errorText={email.error}
                autoCapitalize="none"
                autoComplete="email"
                textContentType="emailAddress"
                keyboardType="email-address"
            />
            <TextInput
                label="Password"
                returnKeyType="done"
                value={password.value}
                onChangeText={(text) => setPassword({ value: text, error: '' })}
                error={!!password.error}
                errorText={password.error}
                secureTextEntry
            />
            <View className="mb-4 w-full items-end">
                <TouchableOpacity
                    accessibilityRole="link"
                    className="min-h-11 justify-center"
                    onPress={() => navigation.navigate('ResetPasswordScreen')}
                >
                    <Text className="text-sm text-muted dark:text-muted-dark">Forgot your password?</Text>
                </TouchableOpacity>
            </View>
            <Button mode="contained" onPress={onLoginPressed}>
                Login
            </Button>
            <DemoButton navigation={navigation} />
            <View className="mt-2 flex-row items-center">
                <Text className="text-muted dark:text-muted-dark">Don’t have an account? </Text>
                <TouchableOpacity accessibilityRole="link" className="min-h-11 justify-center" onPress={() => navigation.replace('RegisterScreen')}>
                    <Text className="font-bold text-link dark:text-link-dark">Sign up</Text>
                </TouchableOpacity>
            </View>
        </Background>
    )
}
