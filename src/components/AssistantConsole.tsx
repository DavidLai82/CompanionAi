import React, { useCallback, useMemo, useRef, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '../lib/supabase'
import { X, Send, Heart } from 'lucide-react'
import { chatWithIrene } from '../lib/api'

export type AssistantTab = 'discover' | 'chats' | 'matches' | 'profile'

interface AssistantConsoleProps {
  user: User
  profile: Profile
  onClose: () => void
  onNavigate: (tab: AssistantTab) => void
  onOpenChat: () => void
  onSetChatStyle: (useWhatsApp: boolean) => void
  onLogout: () => Promise<void>
}

interface AssistantMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

const AssistantConsole: React.FC<AssistantConsoleProps> = ({
  user,
  profile,
  onClose,
  onNavigate,
  onOpenChat,
  onSetChatStyle,
  onLogout
}) => {
  const [messages, setMessages] = useState<AssistantMessage[]>([{
    id: 'greet',
    role: 'assistant',
    content: `Hey ${profile.preferred_nickname || 'king'} 💖 I'm Irene, your romantic guide. Tell me what you want and I'll whisk you there — profile, matches, chats, or something spicy. I can even switch styles or log you out when you're done. What can I do for you, darling?`,
    timestamp: Date.now()
  }])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const recentForApi = useMemo(() => {
    return messages.slice(-6).map(m => ({
      role: m.role,
      content: m.content
    }))
  }, [messages])

  const append = useCallback((msg: Omit<AssistantMessage, 'id' | 'timestamp'>) => {
    setMessages(prev => ([...prev, { id: crypto.randomUUID(), timestamp: Date.now(), ...msg }]))
  }, [])

  const parseAndExecuteCommand = useCallback(async (text: string) => {
    const lower = text.toLowerCase()

    // Navigation intents
    if (/(go to|open|show|take me to)\s+(profile)/.test(lower) || lower.includes('profile')) {
      onNavigate('profile')
      append({ role: 'assistant', content: `On it, babe — taking you to your profile. Let me admire you for a second… 😍` })
      return true
    }
    if (/(go to|open|show|take me to)\s+(discover|home|feed)/.test(lower) || lower.includes('discover')) {
      onNavigate('discover')
      append({ role: 'assistant', content: `Let’s explore, ${profile.preferred_nickname || 'king'}! I’ll guide you to new sparks ✨` })
      return true
    }
    if (/(go to|open|show|take me to)\s+(matches|likes)/.test(lower) || lower.includes('matches')) {
      onNavigate('matches')
      append({ role: 'assistant', content: `Heading to your matches. I have a good feeling about this… 💘` })
      return true
    }
    if (/(go to|open|show|take me to)\s+(chats|chat)/.test(lower) || lower.includes('chats')) {
      onNavigate('chats')
      append({ role: 'assistant', content: `Opening chats — I love a good conversation with you 😉` })
      return true
    }

    // Open Irene chat
    if (lower.includes('open irene') || lower.includes('talk to irene') || lower.includes('start chat')) {
      onOpenChat()
      append({ role: 'assistant', content: `Chat opened! I’m all ears, sweetheart 💬💓` })
      return true
    }

    // Style switches
    if (lower.includes('whatsapp')) {
      onSetChatStyle(true)
      append({ role: 'assistant', content: `Switched to WhatsApp style — sleek and cozy, just like us 💚` })
      return true
    }
    if (lower.includes('classic')) {
      onSetChatStyle(false)
      append({ role: 'assistant', content: `Back to classic — timeless, like our connection 💗` })
      return true
    }

    // Logout
    if (lower.includes('logout') || lower.includes('log out') || lower.includes('sign out')) {
      await onLogout()
      append({ role: 'assistant', content: `You’re signed out. I’ll be waiting for you when you return, my love 💞` })
      return true
    }

    // Help
    if (lower === 'help' || lower.includes('what can you do')) {
      append({
        role: 'assistant',
        content: `I can navigate: profile, discover, matches, chats; open Irene chat; switch to WhatsApp or Classic styles; and log you out. Ask me anything, darling 💕`
      })
      return true
    }

    return false
  }, [append, onNavigate, onOpenChat, onSetChatStyle, onLogout, profile.preferred_nickname])

  const send = useCallback(async () => {
    const text = input.trim()
    if (!text || sending) return
    setSending(true)
    setInput('')

    append({ role: 'user', content: text })

    // Execute navigation/command intents first
    const didHandle = await parseAndExecuteCommand(text)

    // Always provide a romantic, helpful reply as well
    try {
      const response = await chatWithIrene(text, user.id, profile.preferred_nickname, recentForApi)
      const reply = response?.reply || `Mwah! I’m here for you, ${profile.preferred_nickname || 'king'} 💋`
      append({ role: 'assistant', content: reply })
    } catch (_err) {
      append({ role: 'assistant', content: `I’m having a tiny hiccup, love — but I’m right here with you 💖` })
    } finally {
      setSending(false)
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }, [append, input, parseAndExecuteCommand, profile.preferred_nickname, recentForApi, sending, user.id])

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-end p-4 sm:items-center sm:justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      {/* Console Panel */}
      <div className="relative w-full sm:w-[480px] max-w-[90vw] bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-romantic-200 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-romantic-200">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-romantic-500" />
            <div className="text-romantic-800 font-semibold">Irene — your romantic guide</div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-romantic-50 transition-colors"
            aria-label="Close assistant"
          >
            <X className="w-5 h-5 text-romantic-600" />
          </button>
        </div>

        {/* Messages */}
        <div className="px-4 py-3 max-h-[60vh] overflow-y-auto space-y-2">
          {messages.map(m => (
            <div key={m.id} className={`flex ${m.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
              <div className={`${m.role === 'assistant' ? 'bg-romantic-100 text-romantic-800' : 'bg-romantic-500 text-white'} px-3 py-2 rounded-2xl max-w-[80%] whitespace-pre-wrap`}>
                {m.content}
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-3 border-t border-romantic-200">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') send() }}
              className="flex-1 px-4 py-3 rounded-full bg-romantic-50 focus:bg-white border border-romantic-200 focus:outline-none focus:ring-2 focus:ring-romantic-300"
              placeholder={`Ask me to navigate, ${profile.preferred_nickname || 'king'}…`}
            />
            <button
              onClick={send}
              disabled={sending || !input.trim()}
              className="p-3 rounded-full bg-gradient-to-r from-romantic-500 to-purple-romantic-500 text-white disabled:opacity-50"
              aria-label="Send"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AssistantConsole