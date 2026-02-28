"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

const ReactMarkdown = require("react-markdown").default;
const MinimalistChat = () => {
  console.log("MinimalistChat rendered");
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      text: "Привіт!👋 Чим Вам допомогти?",
      showButtons: false,
    },
    {
      id: 2,
      type: "bot",
      text: "Пропоную Вам кілька пристроїв, про які Ви можете мене запитати...",
      showButtons: true,
    },
  ]);
  const [showWelcome, setShowWelcome] = useState(true);

  // Sample chat history data
  const chatHistory = [
    {
      id: 1,
      title: "Пошук телефону",
      preview: "Рекомендую розглянути Samsung A15/A25...",
      date: "2024-01-27",
      messageCount: 5,
    },
    {
      id: 2,
      title: "Вибір ноутбука",
      preview: "Для роботи підійде MacBook Air або...",
      date: "2024-01-26",
      messageCount: 8,
    },
    {
      id: 3,
      title: "Геймерське крісло",
      preview: "Рекомендую крісла з хорошою підтримкою...",
      date: "2024-01-25",
      messageCount: 3,
    },
  ];

  // const sendMessage = (text: string) => {
  //   if (!text.trim()) return

  //   const userMessage = {
  //     id: Date.now(),
  //     type: 'user',
  //     text: text,
  //     showButtons: false
  //   }

  //   setMessages(prev => [...prev, userMessage])
  //   setMessage('')
  //   setShowWelcome(false)

  const sendMessage = async (text: string) => {
    console.log("🚀 sendMessage called with:", text);
    if (!text.trim()) {
      console.log("⛔ empty message");
      return;
    }

    const userMessage = {
      id: Date.now(),
      type: "user",
      text,
      showButtons: false,
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setShowWelcome(false);

    try {
      const res = await fetch(
        process.env.NEXT_PUBLIC_API_URL + "/api/chat/message",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: text,
            sessionId: "frontend-session-1",
          }),
        }
      );

      const data = await res.json();

      const botResponse = {
        id: Date.now() + 1,
        type: "bot",
        text: data.reply || "Помилка відповіді від сервера",
        showButtons: false,
      };

      setMessages((prev) => [...prev, botResponse]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 2,
          type: "bot",
          text: "❌ Не вдалося підключитись до сервера",
          showButtons: false,
        },
      ]);
    }
  };

  // setTimeout(() => {
  //   const botResponse = {
  //     id: Date.now() + 1,
  //     type: 'bot',
  //     text: getBotResponse(text),
  //     showButtons: false
  //   }
  //   setMessages(prev => [...prev, botResponse])
  // }, 1000)
  // }

  // const getBotResponse = (userText: string) => {
  //   const lowerText = userText.toLowerCase()
  //   if (lowerText.includes('телефон') || lowerText.includes('phone')) {
  //     return 'Рекомендую Samsung A15/A25, Xiaomi Redmi Note 13 або Realme C67 — вони мають хорошу батарею, камеру, стабільну роботу та якісний екран у вашому бюджеті. Якщо уточните, що важливіше — камера чи автономність, підберу ще точніше.'
  //   }
  //   return 'Дякую за ваше запитання! Чим ще можу допомогти?'
  // }

  return (
    <>
      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes bounce {
          0%,
          20%,
          50%,
          80%,
          100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
          60% {
            transform: translateY(-5px);
          }
        }
      `}</style>

      {/* Floating Chat Icon */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`bg-white hover:bg-gray-50 text-gray-800 rounded-full p-1 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 ${
            isOpen ? "scale-0" : "scale-100"
          }`}
          style={{ width: "70px", height: "70px" }}
        >
          <div className="w-10 h-6 mx-auto relative">
            <img
              src="/bot_1.png"
              alt="Bot 1"
              className="absolute top-0 left-0 w-6 h-6 object-contain animate-bounce"
              style={{ animationDelay: "0s" }}
            />
            <img
              src="/bot_2.png"
              alt="Bot 2"
              className="absolute top-0 right-0 w-6 h-6 object-contain animate-bounce"
              style={{ animationDelay: "0.2s" }}
            />
          </div>
        </button>
      </div>

      {/* Full Screen Chat Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-end"
          onClick={(e) => e.target === e.currentTarget && setIsOpen(false)}
        >
          <div
            className="w-full md:max-w-md h-full bg-gray-100 shadow-2xl flex flex-col"
            style={{ animation: "slideInRight 0.5s ease-out forwards" }}
          >
            {/* Chat Header */}
            <div
              className="p-4 border-b border-gray-100 relative"
              style={{ backgroundColor: "#F7F7F7" }}
            >
              <div className="flex items-center justify-between">
                {showChatHistory ? (
                  // Chat History Header
                  <>
                    <button
                      onClick={() => setShowChatHistory(false)}
                      className="text-gray-500 hover:text-gray-700 transition-colors p-2"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    </button>
                    <div className="text-center p-4 flex-1">
                      <h2 className="text-lg font-semibold text-gray-800">
                        Історія чатів
                      </h2>
                    </div>
                    <div className="p-1 w-10"></div>{" "}
                    {/* Spacer for alignment */}
                  </>
                ) : (
                  // Regular Chat Header
                  <>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="text-gray-500 hover:text-gray-700 transition-colors p-2"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                    <div className="text-center flex-1">
                      <h2 className="text-lg font-semibold text-gray-800">
                        Chatbot AI
                      </h2>
                    </div>
                    <div className="p-2 text-gray-500">
                      <button
                        className="text-gray-500 hover:text-gray-700 transition-colors p-2"
                        onClick={() => setShowChatHistory(true)}
                      >
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          />
                        </svg>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Chat Messages Area */}
            <div
              className="flex-1 p-6 overflow-y-scroll"
              style={{ backgroundColor: "#F7F7F7" }}
            >
              {showChatHistory ? (
                // Chat History View
                <div className="space-y-3">
                  {chatHistory.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-gray-400 mb-4">
                        <svg
                          className="w-16 h-16 mx-auto"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          />
                        </svg>
                      </div>
                      <p className="text-gray-500 text-lg">
                        Поки що немає історії чатів
                      </p>
                      <p className="text-gray-400 text-sm mt-2">
                        Ваші розмови з'являться тут після першого повідомлення
                      </p>
                    </div>
                  ) : (
                    chatHistory.map((chat) => (
                      <div
                        key={chat.id}
                        className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => {
                          // Go back to chat view and potentially load specific conversation
                          setShowChatHistory(false);
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-800 mb-1">
                              {chat.title}
                            </h3>
                            <p className="text-gray-500 text-sm line-clamp-2 mb-2">
                              {chat.preview}
                            </p>
                            <div className="flex items-center text-xs text-gray-400">
                              <span>{chat.messageCount} повідомлень</span>
                              <span className="mx-2">•</span>
                              <span>
                                {new Date(chat.date).toLocaleDateString(
                                  "uk-UA"
                                )}
                              </span>
                            </div>
                          </div>
                          <button className="text-gray-400 hover:text-gray-600 transition-colors p-1">
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                // Regular Chat View
                <>
                  {showWelcome && (
                    <div className="text-center mb-8">
                      <div className="w-42 h-42 mx-auto mt-40 mb-4 bg-none rounded-full flex items-center justify-center">
                        <img
                          src="/say-hi.png"
                          alt="Say Hi"
                          className="w-42 h-42 object-contain"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-4 mb-6">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${
                          msg.type === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        {msg.type === "bot" ? (
                          <div className="flex items-start space-x-3 max-w-[420px]">
                            {/* ТУТ ЗМІНЕНО: bg-white встановлено для всіх повідомлень бота */}
                            <div className="bg-white rounded-2xl rounded-tl-md px-4 py-2.5 shadow-sm">
                              <div
                                className={`flex items-start space-x-2 ${
                                  msg.showButtons ? "mb-3" : "mb-0"
                                }`}
                              >
                                <img
                                  src="/sparkles-sharp.png"
                                  alt="✨"
                                  className="w-4 h-4 object-contain mt-1 flex-shrink-0"
                                />
                                <div className="text-gray-600 leading-relaxed">
                                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                                </div>
                              </div>

                              {msg.showButtons && (
                                <div className="flex flex-wrap gap-2">
                                  {[
                                    "Телефон",
                                    "Ноутбук",
                                    "Навушники",
                                    "Стіл",
                                    "Геймерське крісло",
                                    "Клавіатура",
                                  ].map((item) => (
                                    <button
                                      key={item}
                                      className="bg-white hover:bg-gray-50 text-gray-600 px-3 py-2 rounded-full border border-black transition-colors text-sm whitespace-nowrap"
                                      onClick={() => sendMessage(item)}
                                    >
                                      {item}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start space-x-3 max-w-[420px]">
                            <div className="bg-black text-white rounded-2xl rounded-tr-md p-4 shadow-sm">
                              <p>{msg.text}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Chat Input Area */}
            <div className="p-4" style={{ backgroundColor: "#F7F7F7" }}>
              {!isVoiceOpen ? (
                <div className="flex items-center space-x-3">
                  <div className="flex-1 relative flex items-center">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" &&
                        message.trim() &&
                        sendMessage(message)
                      }
                      placeholder="Введіть ваше повідомлення..."
                      className="w-full px-4 py-3 bg-white border-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-300 text-gray-800 placeholder-gray-500 shadow-sm"
                    />
                    <button
                      className="p-3 text-gray-500 hover:text-gray-700 transition-colors"
                      onClick={() => setIsVoiceOpen(!isVoiceOpen)}
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                        />
                      </svg>
                    </button>
                  </div>
                  <button
                    className="bg-gray-800 hover:bg-gray-900 text-white p-3 rounded-2xl transition-all duration-200 shadow-lg"
                    onClick={() => message.trim() && sendMessage(message)}
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="text-center bg-white rounded-2xl py-10 px-6 shadow-sm">
                  <p className="text-gray-600 mb-8 text-lg font-medium max-w-[220px] mx-auto leading-tight">
                    Ви можете запитати мене все про пристрої
                  </p>
                  <button
                    className="w-20 h-20 mx-auto bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-gray-400 hover:border-gray-600 transition-colors"
                    onClick={() => setIsVoiceOpen(false)}
                  >
                    <svg
                      className="w-10 h-10 text-black"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                      <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MinimalistChat;
