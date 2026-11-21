import React, { useState } from 'react'
import Background from '../components/AuthComponents/Background'
import Logo from '../components/AuthComponents/Logo'
import Header from '../components/AuthComponents/Header'
import TextInput from '../components/AuthComponents/TextInput'
import Button from '../components/AuthComponents/Button'
import { emailValidator } from '../helpers/emailValidator'

export default function ResetPasswordScreen({ navigation }) {
  const [email, setEmail] = useState({ value: '', error: '' })

  const sendResetPasswordEmail = () => {
    const emailError = emailValidator(email.value)
    if (emailError) {
      setEmail({ ...email, error: emailError })
      return
    }
    navigation.popTo('LoginScreen') // React Navigation 7: navigate() would push a second LoginScreen
  }

  return (
    <Background onBack={navigation.goBack}>
      <Logo size={128} />
      <Header>Restore Password</Header>
      <TextInput
        label="E-mail address"
        returnKeyType="done"
        value={email.value}
        onChangeText={(text) => setEmail({ value: text, error: '' })}
        error={!!email.error}
        errorText={email.error}
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
        keyboardType="email-address"
        description="You will receive email with password reset link."
      />
      <Button
        mode="contained"
        onPress={sendResetPasswordEmail}
        style={{ marginTop: 8 }}
      >
        Send Instructions
      </Button>
    </Background>
  )
}
