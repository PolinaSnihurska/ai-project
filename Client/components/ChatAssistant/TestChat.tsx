'use client'
import React, { useState } from 'react'

const TestChat = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => {
          console.log('Button clicked!')
          setIsOpen(!isOpen)
        }}
        className="bg-red-500 text-white p-4 rounded-full shadow-lg"
      >
        CHAT {isOpen ? 'OPEN' : 'CLOSED'}
      </button>
      
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 h-96 bg-white border-2 border-gray-300 rounded-lg shadow-xl p-4">
          <h3 className="text-lg font-bold mb-2">Test Chat Window</h3>
          <p>This is a test chat window. If you can see this, the click functionality is working!</p>
          <button 
            onClick={() => setIsOpen(false)}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
          >
            Close
          </button>
        </div>
      )}
    </div>
  )
}

export default TestChat