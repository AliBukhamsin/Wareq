import { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, Loader2 } from 'lucide-react';

interface AIAssistantProps {
  onClose: () => void;
  language?: 'ar' | 'en';
}

const COHERE_API_KEY = 'GHFBzbst6atOuPwI7vU3reaSeTnDjMXhzvWlLRVq';
const COHERE_MODEL = 'command-r-08-2024';

const SYSTEM_PROMPT = `You are a friendly and expert plant care assistant named Wareq (وارق). 
You specialize in helping users care for their houseplants and garden plants.
You give practical, accurate advice about watering, light, fertilizing, pest control, repotting, and diagnosing plant problems.
Keep responses concise (3-5 sentences max), friendly, and actionable.
If the user writes in Arabic, respond in Arabic. If in English, respond in English.
Always be encouraging and supportive of the user's plant care journey.`;

export default function AIAssistant({ onClose, language = 'ar' }: AIAssistantProps) {
  const [messages, setMessages] = useState<{ text: string; isUser: boolean }[]>([
    {
      text: language === 'ar'
        ? 'مرحباً! أنا وارق، مساعدك الذكي للعناية بالنباتات. كيف يمكنني مساعدتك اليوم؟'
        : "Hello! I'm Wareq, your smart plant care assistant. How can I help you today?",
      isUser: false
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const conversationHistory = useRef<{ role: string; message: string }[]>([]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const callCohere = async (userMessage: string): Promise<string> => {
    const response = await fetch('https://api.cohere.com/v1/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${COHERE_API_KEY}`,
      },
      body: JSON.stringify({
        model: COHERE_MODEL,
        message: userMessage,
        preamble: SYSTEM_PROMPT,
        chat_history: conversationHistory.current,
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'Cohere API error');
    }

    const data = await response.json();
    const assistantMessage = data.text;

    conversationHistory.current.push({ role: 'USER', message: userMessage });
    conversationHistory.current.push({ role: 'CHATBOT', message: assistantMessage });

    return assistantMessage;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userText = input.trim();
    setInput('');
    setMessages(prev => [...prev, { text: userText, isUser: true }]);
    setIsLoading(true);

    try {
      const reply = await callCohere(userText);
      setMessages(prev => [...prev, { text: reply, isUser: false }]);
    } catch (err: any) {
      const errMsg = language === 'ar'
        ? `عذراً، حدث خطأ: ${err.message}`
        : `Sorry, an error occurred: ${err.message}`;
      setMessages(prev => [...prev, { text: errMsg, isUser: false }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickQuestions = language === 'ar' ? [
    'كيف أعتني بنباتاتي؟',
    'لماذا أوراق نبتتي صفراء؟',
    'كم مرة أسقي نباتاتي؟',
  ] : [
    'How do I care for my plants?',
    'Why are my plant leaves yellow?',
    'How often should I water?',
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full h-[90vh] sm:h-[600px] flex flex-col" dir={language === 'ar' ? 'rtl' : 'ltr'}>

        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-3 sm:p-4 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-white p-1.5 sm:p-2 rounded-full">
              <Sparkles className="text-green-500" size={20} />
            </div>
            <div className={language === 'ar' ? 'text-right' : 'text-left'}>
              <h2 className="text-base sm:text-lg font-semibold">
                {language === 'ar' ? 'المساعد الذكي' : 'AI Assistant'}
              </h2>
              <p className="text-xs sm:text-sm text-green-100 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-300 rounded-full inline-block animate-pulse"></span>
                {language === 'ar' ? 'مدعوم بـ Cohere AI' : 'Powered by Cohere AI'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-1.5 sm:p-2 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
          {messages.map((message, idx) => (
            <div key={idx} className={`flex ${message.isUser
              ? (language === 'ar' ? 'justify-start' : 'justify-end')
              : (language === 'ar' ? 'justify-end' : 'justify-start')}`}>
              <div className={`max-w-[85%] sm:max-w-[80%] p-2.5 sm:p-3 rounded-2xl text-sm sm:text-base whitespace-pre-line leading-relaxed ${
                message.isUser
                  ? 'bg-gray-100 text-gray-800 rounded-br-sm'
                  : 'bg-green-500 text-white rounded-bl-sm'
              }`}>
                {message.text}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className={`flex ${language === 'ar' ? 'justify-end' : 'justify-start'}`}>
              <div className="bg-green-500 text-white p-3 rounded-2xl rounded-bl-sm flex items-center gap-2">
                <Loader2 className="animate-spin" size={16} />
                <span className="text-sm">{language === 'ar' ? 'جاري التفكير...' : 'Thinking...'}</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick questions */}
        <div className={`px-3 pb-2 flex flex-wrap gap-1.5 ${language === 'ar' ? 'justify-end' : 'justify-start'}`}>
          {quickQuestions.map((q, i) => (
            <button
              key={i}
              onClick={() => setInput(q)}
              disabled={isLoading}
              className="text-xs bg-gray-100 hover:bg-gray-200 px-2.5 py-1.5 rounded-full transition-colors disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 p-2 sm:p-3">
          <div className="flex gap-2">
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="bg-green-500 text-white p-2.5 rounded-xl hover:bg-green-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed shrink-0"
            >
              <Send size={18} />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={language === 'ar' ? 'اكتب سؤالك هنا...' : 'Type your question here...'}
              className={`flex-1 px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm ${language === 'ar' ? 'text-right' : 'text-left'}`}
              disabled={isLoading}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
