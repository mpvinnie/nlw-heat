import { useEffect, useState } from "react";
import { ScrollView } from "react-native";
import { io } from 'socket.io-client'
import { api } from "../../services/api";

import { styles } from "./styles";

import { Message, MessageProps } from "../Message";

let messagesQueue: MessageProps[] = []

const socket = io(String(api.defaults.baseURL))
socket.on('new_message', (newMessage) => {
  messagesQueue.push(newMessage)
})

export function MessageList() {
  const [messages, setMessages] = useState<MessageProps[]>([])

  useEffect(() => {
    api.get<MessageProps[]>('/messages/last3').then(response => {
      setMessages(response.data)
    }).catch(err => {
      console.log(err.message)
    }) 
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      if (messagesQueue.length > 0) {
        setMessages(prevState => [messagesQueue[0], prevState[0], prevState[1]])
        messagesQueue.shift()
      }
    }, 3000)

    return () => clearInterval(timer)
  })
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps='never'
    >
      { messages.map(message => 
        <Message key={message.id} data={message} />
      )}

    </ScrollView>
  )
}