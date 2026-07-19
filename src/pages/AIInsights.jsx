import { useState, useEffect, useRef } from 'react';
import {
  Sparkles, TrendingUp, Target, Lightbulb,
  ThumbsUp, ThumbsDown, AlertCircle, RefreshCw,
  ChevronUp, ChevronDown, Minus, MessageCircle, Send, Bot,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useT, useLang } from '@/lib/i18n';
import { aiApi } from '@/lib/api';

const PRIORITY_COLOR = { 1: 'text-red-500', 2: 'text-yellow-500', 3: 'text-green-500' };
const SENTIMENT_CONFIG = {
  positive: { icon: ThumbsUp, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-950/30', label: { uz: 'Ijobiy', en: 'Positive', ru: 'Положительный' } },
  neutral:  { icon: Minus,    color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-950/30', label: { uz: 'Neytral', en: 'Neutral', ru: 'Нейтральный' } },
  negative: { icon: ThumbsDown, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950/30', label: { uz: 'Salbiy', en: 'Negative', ru: 'Отрицательный' } },
  unknown:  { icon: Minus,    color: 'text-muted-foreground', bg: 'bg-muted/30', label: { uz: 'Nomalum', en: 'Unknown', ru: 'Неизвестно' } },
};

function PriorityIcon({ priority }) {
  if (priority === 1) return <ChevronUp className="h-4 w-4 text-red-500" />;
  if (priority === 3) return <ChevronDown className="h-4 w-4 text-green-500" />;
  return <Minus className="h-4 w-4 text-yellow-500" />;
}

export default function AIInsights() {
  const t = useT();
  const lang = useLang((s) => s.lang);

  const [aiEnabled, setAiEnabled] = useState(null);
  const [priceData, setPriceData] = useState(null);
  const [reviewSummary, setReviewSummary] = useState(null);
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [analyzeResult, setAnalyzeResult] = useState(null);
  const [loadingAnalyze, setLoadingAnalyze] = useState(false);
  const [error, setError] = useState('');

  // ── AI CHAT (yordamchi) ──
  const [chatMessages, setChatMessages] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('rr_ai_chat') || '[]'); } catch { return []; }
  });
  const [chatInput, setChatInput] = useState('');
  const [chatBusy, setChatBusy] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    try { sessionStorage.setItem('rr_ai_chat', JSON.stringify(chatMessages.slice(-30))); } catch {}
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [chatMessages, chatBusy]);

  async function sendChat() {
    const text = chatInput.trim();
    if (!text || chatBusy) return;
    const next = [...chatMessages, { role: 'user', content: text }];
    setChatMessages(next);
    setChatInput('');
    setChatBusy(true);
    try {
      const reply = await aiApi.assistantChat(next.slice(-16), lang);
      setChatMessages((p) => [...p, { role: 'assistant', content: reply }]);
    } catch {
      setChatMessages((p) => [...p, {
        role: 'assistant',
        content: lang === 'uz' ? 'Xatolik — qayta urinib ko\'ring.' : lang === 'ru' ? 'Ошибка — попробуйте снова.' : 'Error — try again.',
      }]);
    } finally {
      setChatBusy(false);
    }
  }

  useEffect(() => {
    aiApi.status()
      .then((d) => setAiEnabled(d.enabled))
      .catch(() => setAiEnabled(false));
  }, []);

  async function loadPriceRecommendations() {
    setLoadingPrice(true);
    setError('');
    try {
      const data = await aiApi.priceRecommendations(lang);
      setPriceData(data);
    } catch {
      setError(lang === 'uz' ? 'AI tavsiyalarini olishda xato' : lang === 'ru' ? 'Ошибка загрузки' : 'Failed to load');
    } finally {
      setLoadingPrice(false);
    }
  }

  async function loadReviewSummary() {
    setLoadingReviews(true);
    setError('');
    try {
      const data = await aiApi.summarizeReviews(lang);
      setReviewSummary(data);
    } catch {
      setError(lang === 'uz' ? 'Sharhlarni tahlil qilishda xato' : lang === 'ru' ? 'Ошибка анализа' : 'Failed to analyze');
    } finally {
      setLoadingReviews(false);
    }
  }

  async function handleAnalyzeReview() {
    if (!reviewText.trim()) return;
    setLoadingAnalyze(true);
    setAnalyzeResult(null);
    try {
      const data = await aiApi.analyzeReview(reviewText, lang);
      setAnalyzeResult(data);
    } catch {
      setError(lang === 'uz' ? 'Sharh tahlilida xato' : lang === 'ru' ? 'Ошибка' : 'Error');
    } finally {
      setLoadingAnalyze(false);
    }
  }

  if (aiEnabled === null) {
    return (
      <div className="flex items-center justify-center h-40 text-muted-foreground">
        <RefreshCw className="h-5 w-5 animate-spin mr-2" />
        {t('loading')}
      </div>
    );
  }

  if (!aiEnabled) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">{t('aiAnalysis')}</h1>
          </div>
        </div>
        <Card>
          <CardContent className="py-12">
            <div className="max-w-md mx-auto text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 flex items-center justify-center mb-5">
                <AlertCircle className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-semibold mb-2">OpenAI API kaliti sozlanmagan</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Backend <code className="bg-muted px-1 rounded">.env</code> fayliga{' '}
                <code className="bg-muted px-1 rounded">OPENAI_API_KEY=sk-...</code> qo'shing,
                so'ng serverni qayta ishga tushiring.
              </p>
              <p className="text-xs text-muted-foreground mt-3">
                Kalit olish: platform.openai.com/api-keys
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const sentCfg = analyzeResult ? (SENTIMENT_CONFIG[analyzeResult.sentiment] || SENTIMENT_CONFIG.unknown) : null;
  const SentIcon = sentCfg?.icon;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">{t('aiAnalysis')}</h1>
        </div>
        <p className="text-sm text-muted-foreground mt-1">{t('phase3AITitle')}</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 dark:bg-red-950/30 px-4 py-3 rounded-lg">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* AI YORDAMCHI CHAT — istalgan travel/hotel savoli, hotel konteksti bilan */}
      <Card variant="glass" className="hover-lift">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-primary" />
            {lang === 'uz' ? 'AI yordamchi — savolingizni yozing' : lang === 'ru' ? 'AI-помощник — задайте вопрос' : 'AI Assistant — ask anything'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="max-h-80 overflow-y-auto space-y-3 pr-1">
            {chatMessages.length === 0 && (
              <div className="text-sm text-muted-foreground">
                <p className="mb-2">
                  {lang === 'uz'
                    ? 'Mehmonxonangiz, narx strategiyasi, OTA kanallar, marketing yoki travel bo\'yicha istalgan savolni bering. AI mehmonxonangiz ma\'lumotlarini biladi.'
                    : lang === 'ru'
                    ? 'Задайте любой вопрос об отеле, ценах, OTA-каналах, маркетинге или путешествиях. AI знает данные вашего отеля.'
                    : 'Ask anything about your hotel, pricing, OTA channels, marketing or travel. The AI knows your hotel context.'}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {(lang === 'uz'
                    ? ['Narxni qachon oshirsam bo\'ladi?', 'Booking\'da ko\'rinishni qanday oshiraman?', 'Past sezonda nima qilay?']
                    : lang === 'ru'
                    ? ['Когда поднять цены?', 'Как поднять видимость на Booking?', 'Что делать в низкий сезон?']
                    : ['When should I raise prices?', 'How to rank higher on Booking?', 'What to do in low season?']
                  ).map((q) => (
                    <button key={q} onClick={() => setChatInput(q)}
                      className="px-2.5 py-1 rounded-full border text-xs text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors">
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {chatMessages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm whitespace-pre-wrap leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-md'
                    : 'bg-muted text-foreground rounded-bl-md'
                }`}>
                  {m.role === 'assistant' && <Bot className="h-3.5 w-3.5 inline mr-1.5 -mt-0.5 text-primary" />}
                  {m.content}
                </div>
              </div>
            ))}
            {chatBusy && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-2xl rounded-bl-md px-3.5 py-2.5">
                  <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="flex gap-2">
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat(); } }}
              placeholder={lang === 'uz' ? 'Savolingizni yozing...' : lang === 'ru' ? 'Напишите вопрос...' : 'Type your question...'}
              className="flex-1 px-3.5 py-2.5 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <Button onClick={sendChat} disabled={chatBusy || !chatInput.trim()} className="px-4">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Narx tavsiyalari */}
      <Card variant="glass" className="hover-lift">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              {lang === 'uz' ? 'Narx strategiyasi tavsiyalari' : lang === 'ru' ? 'Рекомендации по ценам' : 'Price Recommendations'}
            </CardTitle>
            <Button size="sm" variant="outline" onClick={loadPriceRecommendations} disabled={loadingPrice}>
              {loadingPrice
                ? <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                : <><Sparkles className="h-3.5 w-3.5 mr-1.5" />{lang === 'uz' ? 'Tahlil qil' : lang === 'ru' ? 'Анализ' : 'Analyze'}</>
              }
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!priceData ? (
            <p className="text-sm text-muted-foreground">
              {lang === 'uz'
                ? 'Raqiblar narxlari asosida AI strategiya olish uchun "Tahlil qil" tugmasini bosing.'
                : lang === 'ru'
                ? 'Нажмите "Анализ" для получения AI-рекомендаций на основе цен конкурентов.'
                : 'Click "Analyze" to get AI pricing strategy based on competitor prices.'}
            </p>
          ) : (
            <div className="space-y-4">
              {priceData.summary && (
                <p className="text-sm text-muted-foreground border-l-2 border-primary/30 pl-3 italic">
                  {priceData.summary}
                </p>
              )}
              <div className="space-y-3">
                {(priceData.recommendations || []).map((rec, i) => (
                  <div key={i} className="flex gap-3 p-3 rounded-lg border bg-card">
                    <div className="mt-0.5 shrink-0">
                      <PriorityIcon priority={rec.priority} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{rec.title}</span>
                        <Badge variant="secondary" className="text-[10px]">{rec.platform}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{rec.description}</p>
                      {(rec.suggestedPrice > 0) && (
                        <div className="flex gap-3 mt-2 text-xs">
                          {rec.currentPrice > 0 && (
                            <span className="text-muted-foreground line-through">${rec.currentPrice}</span>
                          )}
                          <span className="text-green-600 font-medium">${rec.suggestedPrice}</span>
                          {rec.expectedImpact && (
                            <span className="text-muted-foreground">→ {rec.expectedImpact}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sharhlar xulosa */}
      <Card variant="glass" className="hover-lift">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              {lang === 'uz' ? 'Sharhlar tahlili' : lang === 'ru' ? 'Анализ отзывов' : 'Review Analysis'}
            </CardTitle>
            <Button size="sm" variant="outline" onClick={loadReviewSummary} disabled={loadingReviews}>
              {loadingReviews
                ? <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                : <><Sparkles className="h-3.5 w-3.5 mr-1.5" />{lang === 'uz' ? 'Tahlil qil' : lang === 'ru' ? 'Анализ' : 'Analyze'}</>
              }
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!reviewSummary ? (
            <p className="text-sm text-muted-foreground">
              {lang === 'uz'
                ? 'Oxirgi 20 ta sharh asosida kuchli va zaif tomonlarni tahlil qilish uchun tugmani bosing.'
                : lang === 'ru'
                ? 'Нажмите для анализа сильных и слабых сторон на основе последних 20 отзывов.'
                : 'Click to analyze strengths and weaknesses based on the latest 20 reviews.'}
            </p>
          ) : (
            <div className="space-y-4">
              {reviewSummary.summary && (
                <p className="text-sm text-muted-foreground border-l-2 border-primary/30 pl-3 italic">
                  {reviewSummary.summary}
                </p>
              )}
              <div className="grid sm:grid-cols-2 gap-3">
                {reviewSummary.strengths?.length > 0 && (
                  <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200/50 dark:border-green-800/50">
                    <div className="flex items-center gap-1.5 mb-2 text-green-700 dark:text-green-400 text-xs font-semibold uppercase tracking-wide">
                      <ThumbsUp className="h-3 w-3" />
                      {lang === 'uz' ? 'Kuchli tomonlar' : lang === 'ru' ? 'Плюсы' : 'Strengths'}
                    </div>
                    <ul className="space-y-1">
                      {reviewSummary.strengths.map((s, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                          <span className="text-green-500 mt-0.5">•</span>{s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {reviewSummary.weaknesses?.length > 0 && (
                  <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200/50 dark:border-red-800/50">
                    <div className="flex items-center gap-1.5 mb-2 text-red-700 dark:text-red-400 text-xs font-semibold uppercase tracking-wide">
                      <ThumbsDown className="h-3 w-3" />
                      {lang === 'uz' ? 'Kamchiliklar' : lang === 'ru' ? 'Минусы' : 'Weaknesses'}
                    </div>
                    <ul className="space-y-1">
                      {reviewSummary.weaknesses.map((w, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                          <span className="text-red-500 mt-0.5">•</span>{w}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              {reviewSummary.recommendedActions?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    {lang === 'uz' ? 'Tavsiyalar' : lang === 'ru' ? 'Рекомендации' : 'Actions'}
                  </p>
                  <ul className="space-y-1">
                    {reviewSummary.recommendedActions.map((a, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                        <Lightbulb className="h-3 w-3 text-yellow-500 shrink-0 mt-0.5" />{a}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bitta sharh tahlili */}
      <Card variant="glass" className="hover-lift">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-primary" />
            {lang === 'uz' ? 'Bitta sharh tahlili' : lang === 'ru' ? 'Анализ отзыва' : 'Single Review Analysis'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <textarea
            rows={4}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground"
            placeholder={
              lang === 'uz'
                ? 'Mehmonxona sharhini yozing yoki joylashtiring...'
                : lang === 'ru'
                ? 'Вставьте или введите отзыв об отеле...'
                : 'Paste or type a hotel review...'
            }
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
          />
          <Button
            size="sm"
            onClick={handleAnalyzeReview}
            disabled={loadingAnalyze || !reviewText.trim()}
          >
            {loadingAnalyze
              ? <><RefreshCw className="h-3.5 w-3.5 animate-spin mr-1.5" />{lang === 'uz' ? 'Tahlil qilinmoqda...' : lang === 'ru' ? 'Анализирую...' : 'Analyzing...'}</>
              : <><Sparkles className="h-3.5 w-3.5 mr-1.5" />{lang === 'uz' ? 'Tahlil qil' : lang === 'ru' ? 'Анализировать' : 'Analyze'}</>
            }
          </Button>

          {analyzeResult && sentCfg && (
            <div className={`rounded-lg p-4 border space-y-3 ${sentCfg.bg}`}>
              <div className="flex flex-wrap gap-3 items-center">
                <div className={`flex items-center gap-1.5 text-sm font-medium ${sentCfg.color}`}>
                  <SentIcon className="h-4 w-4" />
                  {sentCfg.label[lang] || sentCfg.label.en}
                </div>
                <div className="text-xs text-muted-foreground">
                  {lang === 'uz' ? 'Ball' : 'Score'}: {(analyzeResult.sentimentScore >= 0 ? '+' : '') + analyzeResult.sentimentScore.toFixed(2)}
                </div>
                <div className="flex flex-wrap gap-1">
                  {(analyzeResult.topics || []).map((topic) => (
                    <Badge key={topic} variant="secondary" className="text-[10px]">{topic}</Badge>
                  ))}
                </div>
              </div>
              {analyzeResult.aiSummary && (
                <p className="text-sm leading-relaxed">{analyzeResult.aiSummary}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
