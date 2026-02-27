'use client'
import React, { createContext, useContext, useState, ReactNode } from 'react'

interface Message {
  id: string
  text: string
  sender: 'user' | 'assistant'
  timestamp: Date
}

interface ChatContextType {
  messages: Message[]
  isTyping: boolean
  addMessage: (text: string, sender: 'user' | 'assistant') => void
  setTyping: (typing: boolean) => void
  clearMessages: () => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export const useChatContext = () => {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider')
  }
  return context
}

interface ChatProviderProps {
  children: ReactNode
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)

  const addMessage = (text: string, sender: 'user' | 'assistant') => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, newMessage])
  }

  const setTyping = (typing: boolean) => {
    setIsTyping(typing)
  }

  const clearMessages = () => {
    setMessages([])
  }

  const value: ChatContextType = {
    messages,
    isTyping,
    addMessage,
    setTyping,
    clearMessages
  }

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  )
}

export default ChatProvider