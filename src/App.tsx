import { useEffect, useRef, useState } from 'react'

interface Message {
  sender: 'user' | 'bot'
  text: string
}

function App() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const sendMessage = async () => {
    if (!input.trim()) return

    const userMsg: Message = { sender: 'user', text: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
          "HTTP-Referer": "http://localhost:5173", // change this when deployed
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "mistralai/mistral-7b-instruct",
          messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: input }
          ]
        })
      })

      const data = await response.json()
      const botReply = data.choices[0].message.content
      const botMsg: Message = { sender: 'bot', text: botReply }
      setMessages(prev => [...prev, botMsg])
    } catch (err) {
      console.error("API error:", err)
      setMessages(prev => [...prev, { sender: 'bot', text: "Sorry, something went wrong." } as const])
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') sendMessage()
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white border rounded shadow p-4">
        <h1 className="text-xl font-bold mb-4 text-center">💬 Simple AI Chatbot</h1>
        <div className="h-96 overflow-y-auto mb-4 space-y-2">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`px-4 py-2 rounded-lg text-white ${
                  msg.sender === 'user' ? 'bg-blue-500' : 'bg-gray-600'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="flex">
          <input
            type="text"
            className="flex-grow border rounded-l px-3 py-2 focus:outline-none"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            onClick={sendMessage}
            className="bg-blue-500 text-white px-4 py-2 rounded-r"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
