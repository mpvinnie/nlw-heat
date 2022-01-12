import { View } from 'react-native'
import { Header } from '../../components/Header'
import { MessageList } from '../../components/MessageList/index'
import { SendMessageForm } from '../../components/SendMessageForm'

import { styles } from './styles'

export function Home() {
  return (
    <View style={styles.container}>
      <Header />
      <MessageList />
      <SendMessageForm />
    </View>
  )
}