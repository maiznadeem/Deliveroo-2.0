import React, { useRef, useState } from 'react'
import { View, TouchableOpacity } from 'react-native'
import { Lock, Mail, User } from 'lucide-react-native'
import Text from '../components/ui/Text'
import AuthLayout from '../components/AuthComponents/AuthLayout'
import Button from '../components/AuthComponents/Button'
import TextInput from '../components/AuthComponents/TextInput'
import { emailValidator } from '../helpers/emailValidator'
import { passwordValidator } from '../helpers/passwordValidator'
import { nameValidator } from '../helpers/nameValidator'
import { getAuth, createUserWithEmailAndPassword } from '@react-native-firebase/auth'

export default function RegisterScreen({ navigation }) {

    const [name, setName] = useState({ value: '', error: '' })
    const [email, setEmail] = useState({ value: '', error: '' })
    const [password, setPassword] = useState({ value: '', error: '' })
    const [loading, setLoading] = useState(false)
    const emailRef = useRef(null)
    const passwordRef = useRef(null)

    const onSignUpPressed = () => {
        const nameError = nameValidator(name.value)
        const emailError = emailValidator(email.value)
        const passwordError = passwordValidator(password.value)
        if (emailError || passwordError || nameError) {
            setName({ ...name, error: nameError })
            setEmail({ ...email, error: emailError })
            setPassword({ ...password, error: passwordError })
            return
        }
        setLoading(true)
        createUserWithEmailAndPassword(getAuth(), email.value, password.value)
            .then(() => {
                // Only enter the app once the account exists (Firestore requires a signed-in user)
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'DashboardDrawer' }],
                })
            })
            .catch(error => {
                setLoading(false)
                alert(error.message)
            })
    }

    return (
        <AuthLayout onBack={navigation.goBack} title="Create your account" subtitle="It takes less than a minute.">
            <TextInput
                label="Name"
                icon={User}
                placeholder="Your name"
                returnKeyType="next"
                value={name.value}
                onChangeText={(text) => setName({ value: text, error: '' })}
                onSubmitEditing={() => emailRef.current?.focus()}
                submitBehavior="submit"
                error={!!name.error}
                errorText={name.error}
                autoComplete="name"
                textContentType="name"
            />
            <TextInput
                ref={emailRef}
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
                placeholder="At least 6 characters"
                returnKeyType="done"
                value={password.value}
                onChangeText={(text) => setPassword({ value: text, error: '' })}
                onSubmitEditing={onSignUpPressed}
                error={!!password.error}
                errorText={password.error}
                autoComplete="new-password"
                textContentType="newPassword"
                secureTextEntry
            />
            <Button mode="contained" onPress={onSignUpPressed} loading={loading} className="mt-2">
                Create account
            </Button>
            <View className="mt-3 flex-row items-center justify-center">
                <Text className="text-muted dark:text-muted-dark">Already have an account? </Text>
                <TouchableOpacity accessibilityRole="link" className="min-h-11 justify-center" onPress={() => navigation.replace('LoginScreen')}>
                    <Text className="font-bold text-link dark:text-link-dark">Log in</Text>
                </TouchableOpacity>
            </View>
        </AuthLayout>
    )

}
