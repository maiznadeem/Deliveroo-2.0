import React, { useState } from 'react'
import { Mail } from 'lucide-react-native'
import { getAuth, sendPasswordResetEmail } from '@react-native-firebase/auth'
import AuthLayout from '../components/AuthComponents/AuthLayout'
import TextInput from '../components/AuthComponents/TextInput'
import Button from '../components/AuthComponents/Button'
import { emailValidator } from '../helpers/emailValidator'

export default function ResetPasswordScreen({ navigation }) {
  const [email, setEmail] = useState({ value: '', error: '' })
  const [loading, setLoading] = useState(false)

  const sendResetPasswordEmail = () => {
    const emailError = emailValidator(email.value)
    if (emailError) {
      setEmail({ ...email, error: emailError })
      return
    }
    setLoading(true)
    sendPasswordResetEmail(getAuth(), email.value.trim())
      .then(() => {
        alert('If an account exists for this email, a reset link is on its way.')
        navigation.popTo('LoginScreen') // React Navigation 7: navigate() would push a second LoginScreen
      })
      .catch((error) => {
        setLoading(false)
        alert(error.message)
      })
  }

  return (
    <AuthLayout
      onBack={navigation.goBack}
      title="Reset your password"
      subtitle="Enter your email and we'll send you a link to choose a new one."
    >
      <TextInput
        label="Email"
        icon={Mail}
        placeholder="you@example.com"
        returnKeyType="done"
        value={email.value}
        onChangeText={(text) => setEmail({ value: text, error: '' })}
        onSubmitEditing={sendResetPasswordEmail}
        error={!!email.error}
        errorText={email.error}
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
        keyboardType="email-address"
      />
      <Button mode="contained" onPress={sendResetPasswordEmail} loading={loading} className="mt-2">
        Send reset link
      </Button>
    </AuthLayout>
  )
}
