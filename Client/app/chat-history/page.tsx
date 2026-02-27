'use client'
import React from 'react'
import { useRouter } from 'next/navigation'

const ChatHistoryPage = () => {
  const router = useRouter()

  // Sample chat history data
  const chatHistory = [
    {
      id: 1,
      title: 'Пошук телефону',
      preview: 'Рекомендую розглянути Samsung A15/A25...',
      date: '2024-01-27',
      messageCount: 5
    },
    {
      id: 2,
      title: 'Вибір ноутбука',
      preview: 'Для роботи підійде MacBook Air або...',
      date: '2024-01-26',
      messageCount: 8
    },
    {
      id: 3,
      title: 'Геймерське крісло',
      preview: 'Рекомендую крісла з хорошою підтримкою...',
      date: '2024-01-25',
      messageCount: 3
    }
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center p-4">
          <button 
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-800 transition-colors mr-4"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-semibold text-gray-800">Історія чатів</h1>
        </div>
      </div>

      {/* Chat History List */}
      <div className="p-4">
        {chatHistory.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-gray-500 text-lg">Поки що немає історії чатів</p>
            <p className="text-gray-400 text-sm mt-2">Ваші розмови з'являться тут після першого повідомлення</p>
          </div>
        ) : (
          <div className="space-y-3">
            {chatHistory.map((chat) => (
              <div 
                key={chat.id}
                className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => {
                  // Navigate to specific chat - for now just go back to main page
                  router.push('/')
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800 mb-1">{chat.title}</h3>
                    <p className="text-gray-500 text-sm line-clamp-2 mb-2">{chat.preview}</p>
                    <div className="flex items-center text-xs text-gray-400">
                      <span>{chat.messageCount} повідомлень</span>
                      <span className="mx-2">•</span>
                      <span>{new Date(chat.date).toLocaleDateString('uk-UA')}</span>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600 transition-colors p-1">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatHistoryPage