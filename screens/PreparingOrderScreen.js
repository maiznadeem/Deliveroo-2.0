import React, { useEffect } from 'react'
import { View } from 'react-native'
import { useVideoPlayer, VideoView } from 'expo-video';
import { StatusBar } from 'expo-status-bar'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as Animatable from 'react-native-animatable'
import * as Progress from 'react-native-progress'
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import Text from '../components/ui/Text';
import { clearBasket } from '../features/basketSlice';

const PreparingOrderScreen = () => {

    const navigation = useNavigation()
    const dispatch = useDispatch()

    const player = useVideoPlayer(require('../assets/Order.mp4'), (p) => {
        p.loop = true
        p.muted = true
        p.play()
    })

    useEffect(()=>{
        const timer = setTimeout(() => {
            dispatch(clearBasket())
            navigation.navigate("DeliveryScreen")
        }, 4000)
        return () => clearTimeout(timer)
    }, [])

    return (
        <SafeAreaView className="flex-1 items-center justify-center bg-brand px-4">
            <StatusBar style="light" />
            <Animatable.View animation="slideInUp" iterationCount={1}>
                <VideoView
                    player={player}
                    contentFit="cover"
                    nativeControls={false}
                    style={{ width: 320, height: 320 }} // NativeWind className isn't mapped onto VideoView
                />
            </Animatable.View>
            <Animatable.View animation="slideInUp" iterationCount={1}>
                <Text className="text-center text-xl font-bold text-white">
                    Waiting for Restaurant{'\n'}
                    to accept your order...
                </Text>
            </Animatable.View>
            <Animatable.View animation="slideInUp" iterationCount={1}>
                <View className="m-8">
                    <Progress.Circle size={60} indeterminate={true} color="white" />
                </View>
            </Animatable.View>
        </SafeAreaView>
    )
}

export default PreparingOrderScreen
