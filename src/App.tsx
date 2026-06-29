import { useState, useEffect, lazy, Suspense } from 'react';
import { AnimatePresence } from 'framer-motion';
import { InputPhase } from './components/InputPhase';
import { ReadingPhase } from './components/ReadingPhase';
import { Navbar } from './components/Navbar';
import { MobileOptimizedBackground } from './components/MobileOptimizedBackground';
import { ProtectedRoute } from './components/ProtectedRoute';
import { SelectedCard, ReadingInput, Spread, ReadingRecord } from './types';
import { getAIInterpretation } from './services/aiService';
import { saveReadingRecord, createReadingRecord } from './services/historyService';
import { useAuthStore } from './store/authStore';

// 懒加载历史记录页面，减少首屏加载时间
const HistoryPage = lazy(() => import('./components/HistoryPage').then(m => ({ default: m.HistoryPage })));
const HistoryDetailPage = lazy(() => import('./components/HistoryDetailPage').then(m => ({ default: m.HistoryDetailPage })));

type View = 'home' | 'history-detail' | 'new-reading' | 'reading';

function App() {
  const [selectedCards, setSelectedCards] = useState<SelectedCard[]>([]);
  const [interpretation, setInterpretation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [view, setView] = useState<View>('home');
  const [spread, setSpread] = useState<Spread | undefined>(undefined);
  const [currentRecord, setCurrentRecord] = useState<ReadingRecord | null>(null);
  const [currentUserContext, setCurrentUserContext] = useState('');
  const [orderId, setOrderId] = useState('');

  const { checkAuth, isAuthenticated } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleSubmit = async (input: ReadingInput) => {
    setSelectedCards(input.selectedCards);
    setSpread(input.spread);
    setCurrentUserContext(input.userContext);
    setOrderId(input.orderId || '');
    setView('reading');
    setIsLoading(true);

    try {
      const reading = await getAIInterpretation(input);
      setInterpretation(reading);
    } catch (error) {
      console.error('Failed to get AI interpretation:', error);
      setInterpretation('抱歉，AI解读暂时无法获取，请稍后再试。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveReading = async (uploadedImage?: string) => {
    const record: ReadingRecord = {
      id: Date.now().toString(),
      spread,
      selectedCards,
      interpretation,
      userContext: currentUserContext,
      uploadedImage,
      createdAt: new Date().toISOString(),
      orderId,
    };
    // Always save to localStorage as fallback
    saveReadingRecord(record);
    // If authenticated, also save to backend
    if (isAuthenticated) {
      try {
        await createReadingRecord(selectedCards, interpretation, currentUserContext, spread, orderId);
      } catch (error) {
        console.error('Failed to save reading to backend:', error);
      }
    }
  };

  const handleContinueReading = () => {
    setSelectedCards([]);
    setInterpretation('');
    setCurrentUserContext('');
    setOrderId('');
    setView('home');
  };

  const handleViewHistoryDetail = (record: ReadingRecord) => {
    setCurrentRecord(record);
    setView('history-detail');
  };

  const renderContent = () => {
    switch (view) {
      case 'home':
        return (
          <Suspense
            fallback={
              <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                  <div className="relative w-16 h-16 mx-auto mb-4">
                    <div className="absolute inset-0 border-4 border-tarot-gold/20 rounded-full" />
                    <div className="absolute inset-2 border-4 border-tarot-gold/40 rounded-full animate-spin" style={{ animationDuration: '1.5s' }} />
                  </div>
                  <p className="text-tarot-gray/60 font-crimson">加载中...</p>
                </div>
              </div>
            }
          >
            <HistoryPage
              onViewDetail={handleViewHistoryDetail}
              onNewReading={() => setView('new-reading')}
            />
          </Suspense>
        );
      case 'history-detail':
        return currentRecord ? (
          <Suspense
            fallback={
              <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                  <div className="relative w-16 h-16 mx-auto mb-4">
                    <div className="absolute inset-0 border-4 border-tarot-gold/20 rounded-full" />
                    <div className="absolute inset-2 border-4 border-tarot-gold/40 rounded-full animate-spin" style={{ animationDuration: '1.5s' }} />
                  </div>
                  <p className="text-tarot-gray/60 font-crimson">加载中...</p>
                </div>
              </div>
            }
          >
            <HistoryDetailPage
              record={currentRecord}
              onBack={() => setView('home')}
            />
          </Suspense>
        ) : null;
      case 'new-reading':
        return (
          <ProtectedRoute>
            <AnimatePresence mode="wait">
              <div
                key="input"
                className="animate-fade-in-left"
              >
                <InputPhase onSubmit={handleSubmit} />
              </div>
            </AnimatePresence>
          </ProtectedRoute>
        );
      case 'reading':
        return (
          <ProtectedRoute>
            <AnimatePresence mode="wait">
              <div
                key="reading"
                className="animate-fade-in-right"
              >
                {isLoading ? (
                  <LoadingState />
                ) : (
                  <ReadingPhase
                    selectedCards={selectedCards}
                    interpretation={interpretation}
                    spread={spread}
                    onContinue={handleContinueReading}
                    onGoBack={() => setView('new-reading')}
                    onSave={handleSaveReading}
                  />
                )}
              </div>
            </AnimatePresence>
          </ProtectedRoute>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white relative overflow-hidden">
      <MobileOptimizedBackground />

      <Navbar setView={setView} />

      <div className="relative z-10 py-24 md:py-32">
        {renderContent()}
      </div>

      <footer className="relative z-10 text-center py-8 text-tarot-gray/50 font-crimson text-sm">
        <div className="flex justify-center gap-4 mb-2">
          <span className="text-tarot-gold/60">✦</span>
          <span>塔罗解读</span>
          <span className="text-tarot-gold/60">✦</span>
        </div>
        <p>神秘的智慧等待着你去发现</p>
      </footer>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-decorative text-tarot-gray mb-4 animate-pulse-soft">
          宇宙正在解读...
        </h1>
        <p className="text-tarot-gray/70 font-crimson text-lg">
          星辰之力正在汇聚塔罗的智慧
        </p>
      </div>

      <div className="flex justify-center items-center py-20">
        <div className="relative w-32 h-32 animate-spin-slow">
          <div className="absolute inset-0 border-4 border-tarot-gold/20 rounded-full" />
          <div className="absolute inset-4 border-4 border-tarot-gold/40 rounded-full" />
          <div className="absolute inset-8 border-4 border-tarot-gold/60 rounded-full" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-tarot-gold text-3xl">✧</span>
          </div>
        </div>
      </div>

      <div className="text-center text-tarot-gray/50 font-crimson">
        <p className="animate-pulse-soft">
          请稍候，神秘的指引即将揭晓...
        </p>
      </div>
    </div>
  );
}

export default App;
