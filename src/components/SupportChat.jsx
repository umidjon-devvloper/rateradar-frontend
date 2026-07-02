import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { aiApi } from '@/lib/api';
import { useLang } from '@/lib/i18n';

const WELCOME = {
  uz: 'Salom! Men TheHotelSaaS yordamchi assistentiman. Savollaringizga javob berishga tayyorman. Nima haqida ma\'lumot olmoqchisiz?',
  ru: 'Здравствуйте! Я помощник TheHotelSaaS. Готов ответить на ваши вопросы. О чём хотите узнать?',
  en: 'Hello! I\'m the TheHotelSaaS support assistant. I\'m ready to answer your questions. What would you like to know?',
};

const PLACEHOLDER = {
  uz: 'Savol yozing...',
  ru: 'Напишите вопрос...',
  en: 'Type a question...',
};

const TITLE = {
  uz: 'TheHotelSaaS Yordam',
  ru: 'Помощь TheHotelSaaS',
  en: 'TheHotelSaaS Support',
};

const SUBTITLE = {
  uz: 'AI yordamchi • Onlayn',
  ru: 'AI-помощник • Онлайн',
  en: 'AI Assistant • Online',
};

export function SupportChat() {
  const lang = useLang((s) => s.lang);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: WELCOME[lang] || WELCOME.uz },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');

    const userMsg = { role: 'user', content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setLoading(true);

    try {
      const reply = await aiApi.chat(next);
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            lang === 'uz'
              ? 'Xatolik yuz berdi. Iltimos qayta urinib ko\'ring yoki:\n• Telegram: @rateradar_support\n• Email: info@thehotelsaas.com'
              : lang === 'ru'
              ? 'Произошла ошибка. Попробуйте снова или:\n• Telegram: @rateradar_support\n• Email: info@thehotelsaas.com'
              : 'An error occurred. Please try again or:\n• Telegram: @rateradar_support\n• Email: info@thehotelsaas.com',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function onKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-200',
          'bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 active:scale-95',
          open && 'rotate-90 opacity-0 pointer-events-none scale-75'
        )}
        aria-label="Support chat"
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {/* Chat panel */}
      <div
        className={cn(
          'fixed bottom-6 right-6 z-50 w-80 sm:w-96 rounded-2xl shadow-2xl border bg-card flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right',
          open
            ? 'opacity-100 scale-100 pointer-events-auto'
            : 'opacity-0 scale-90 pointer-events-none'
        )}
        style={{ maxHeight: 'min(520px, calc(100vh - 100px))' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Bot className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-semibold leading-none">{TITLE[lang] || TITLE.uz}</div>
              <div className="text-[10px] mt-0.5 opacity-80">{SUBTITLE[lang] || SUBTITLE.uz}</div>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-1 rounded-md hover:bg-white/20 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 min-h-0">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn('flex gap-2', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}
            >
              <div
                className={cn(
                  'w-6 h-6 rounded-full shrink-0 flex items-center justify-center mt-0.5',
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {msg.role === 'user' ? (
                  <User className="h-3 w-3" />
                ) : (
                  <Bot className="h-3 w-3" />
                )}
              </div>
              <div
                className={cn(
                  'max-w-[78%] rounded-2xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap',
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-tr-sm'
                    : 'bg-muted text-foreground rounded-tl-sm'
                )}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-2">
              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center mt-0.5">
                <Bot className="h-3 w-3 text-muted-foreground" />
              </div>
              <div className="bg-muted rounded-2xl rounded-tl-sm px-3 py-2.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="shrink-0 border-t px-3 py-2.5 flex items-end gap-2 bg-card">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={PLACEHOLDER[lang] || PLACEHOLDER.uz}
            rows={1}
            className="flex-1 resize-none rounded-xl border bg-muted/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 min-h-[36px] max-h-24 leading-snug"
            style={{ height: 'auto' }}
            onInput={(e) => {
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 96) + 'px';
            }}
          />
          <button
            onClick={send}
            disabled={!input.trim() || loading}
            className={cn(
              'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all',
              input.trim() && !loading
                ? 'bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            )}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>
    </>
  );
}
