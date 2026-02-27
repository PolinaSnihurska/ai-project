'use client'
import React, { useState } from 'react'

const WorkingChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false)

  const handleToggleChat = () => {
    console.log('Chat button clicked! Current state:', isOpen)
    setIsOpen(!isOpen)
  }

  return (
    <div className="fixed bottom-0 right-0 z-50 p-4">
      {/* Floating Chat Icon */}
      <button
        onClick={handleToggleChat}
        className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 mb-4"
        style={{ width: '60px', height: '60px' }}
      >
        {isOpen ? (
          // Close icon (X)
          <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          // Chat icon
          <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </button>

      {/* Chat Dialog Box */}
      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden" 
             style={{ width: '380px', height: '500px' }}>
          
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">AI Shopping Assistant</h3>
                  <p className="text-blue-100 text-sm">Online • Ready to help</p>
                </div>
              </div>
              <button
                onClick={handleToggleChat}
                className="text-white/80 hover:text-white transition-colors p-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Chat Messages Area */}
          <div className="p-4 bg-gray-50" style={{ height: '320px', overflowY: 'auto' }}>
            {/* Welcome Message */}
            <div className="mb-4">
              <div className="bg-white rounded-2xl rounded-bl-md p-3 shadow-sm max-w-xs">
                <p className="text-gray-800 text-sm">
                  👋 Hi! I'm your AI shopping assistant. How can I help you find the perfect product today?
                </p>
              </div>
              <p className="text-xs text-gray-500 mt-1 ml-2">Just now</p>
            </div>

            {/* Suggested Actions */}
            <div className="space-y-2">
              <p className="text-xs text-gray-500 font-medium">Quick actions:</p>
              <div className="flex flex-wrap gap-2">
                <button className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs hover:bg-blue-200 transition-colors">
                  Find products
                </button>
                <button className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs hover:bg-blue-200 transition-colors">
                  Check deals
                </button>
                <button className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs hover:bg-blue-200 transition-colors">
                  Track order
                </button>
              </div>
            </div>
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex items-center space-x-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Type your message..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </button>
              </div>
              <button className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default WorkingChatAssistant