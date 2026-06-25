import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { InputPhase } from './components/InputPhase';
import { ReadingPhase } from './components/ReadingPhase';
import { Login } from './components/Auth/Login';
import { Register } from './components/Auth/Register';
import { Navbar } from './components/Navbar';
import { HistoryPage } from './components/HistoryPage';
import { HistoryDetailPage } from './components/HistoryDetailPage';
import { SelectedCard, Phase, ReadingInput, Spread, ReadingRecord } from './types';
import { getAIInterpretation } from './services/aiService';
import { saveReadingRecord } from './services/historyService';
import { useAuthStore } from './store/authStore';

type View = 'home' | 'login' | 'register' | 'history' | 'history-detail';
type HistoryStack = 'home' | 'spread-selector' | 'card-selection' | 'reading';

function StarryBackground() {
  const [stars, setStars] = useState<Array<{ id: number; x: number; y: number; size: number; delay: number }>>([]);
  
  useEffect(() => {
    const newStars = Array.from({ length: 80 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 4
    }));
    setStars(newStars);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            background: 'linear-gradient(135deg, #FFD700, #FF69B4, #00CED1)',
            boxShadow: `0 0 ${star.size * 2}px rgba(255, 215, 0, 0.6)`
          }}
          animate={{
            opacity: [0.2, 1, 0.2],
            scale: [1, 1.3, 1],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: 3 + Math.random() * 3,
            delay: star.delay,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}
      
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={`shooting-star-${i}`}
          className="absolute w-1 h-1 rounded-full"
          animate={{
            top: ['-10%', '110%'],
            left: [`${20 + i * 15}%`, `${25 + i * 15}%`],
            opacity: [0, 1, 1, 0],
            scale: [0.5, 1, 1, 0.5]
          }}
          transition={{
            duration: 6 + i,
            repeat: Infinity,
            repeatDelay: 8 + i * 2
          }}
          style={{
            boxShadow: '0 0 15px 3px rgba(255, 215, 0, 0.8), 0 0 30px 6px rgba(255, 105, 180, 0.6)'
          }}
        />
      ))}
      
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`orb-${i}`}
          className="absolute rounded-full"
          style={{
            width: `${20 + Math.random() * 30}px`,
            height: `${20 + Math.random() * 30}px`,
            background: `radial-gradient(circle, ${
              i % 3 === 0 ? 'rgba(255, 215, 0, 0.3)' : 
              i % 3 === 1 ? 'rgba(255, 105, 180, 0.3)' : 
              'rgba(0, 206, 209, 0.3)'
            }, transparent)`,
            filter: 'blur(20px)'
          }}
          animate={{
            y: [0, -50, 0],
            x: [0, 20, 0, -20, 0],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 10 + i * 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          initial={{ x: `${10 + i * 12}%`, y: `${20 + (i % 3) * 25}%` }}
        />
      ))}
    </div>
  );
}

function MysticalOverlay() {
  return (
    <div className="fixed inset-0 pointer-events-none">
      <svg className="absolute inset-0 w-full h-full opacity-8" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="sacred-geometry" patternUnits="userSpaceOnUse" width="150" height="150">
            <circle cx="75" cy="75" r="70" fill="none" stroke="url(#geometry-gradient)" strokeWidth="0.6"/>
            <circle cx="75" cy="75" r="55" fill="none" stroke="url(#geometry-gradient)" strokeWidth="0.5"/>
            <circle cx="75" cy="75" r="40" fill="none" stroke="url(#geometry-gradient)" strokeWidth="0.4"/>
            <polygon points="75,10 135,115 15,115" fill="none" stroke="url(#geometry-gradient)" strokeWidth="0.5"/>
            <polygon points="75,140 15,35 135,35" fill="none" stroke="url(#geometry-gradient)" strokeWidth="0.5"/>
            <circle cx="75" cy="75" r="25" fill="none" stroke="url(#geometry-gradient)" strokeWidth="0.3"/>
          </pattern>
          <linearGradient id="geometry-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d4af37" stopOpacity="0.7"/>
            <stop offset="50%" stopColor="#c4a77d" stopOpacity="0.5"/>
            <stop offset="100%" stopColor="#d4af37" stopOpacity="0.7"/>
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#sacred-geometry)" />
      </svg>
      
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(212, 175, 55, 0.08), rgba(147, 112, 219, 0.05), transparent 70%)',
          filter: 'blur(60px)'
        }}
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
          scale: [1, 1.1, 1],
          rotate: [0, 5, 0]
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        initial={{ top: '-10%', left: '-10%' }}
      />
      
      <motion.div
        className="absolute w-[800px] h-[800px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(255, 182, 193, 0.06), rgba(176, 224, 230, 0.05), transparent 70%)',
          filter: 'blur(80px)'
        }}
        animate={{
          x: [0, -60, 0],
          y: [0, -40, 0],
          scale: [1, 1.15, 1],
          rotate: [0, -5, 0]
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        initial={{ bottom: '-20%', right: '-15%' }}
      />
    </div>
  );
}

function App() {
  const [phase, setPhase] = useState<Phase>('input');
  const [selectedCards, setSelectedCards] = useState<SelectedCard[]>([]);
  const [interpretation, setInterpretation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [view, setView] = useState<View>('home');
  const [spread, setSpread] = useState<Spread | undefined>(undefined);
  const [historyStack, setHistoryStack] = useState<HistoryStack>('spread-selector');
  const [currentRecord, setCurrentRecord] = useState<ReadingRecord | null>(null);
  const [currentUserContext, setCurrentUserContext] = useState('');

  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleSubmit = async (input: ReadingInput) => {
    setSelectedCards(input.selectedCards);
    setSpread(input.spread);
    setCurrentUserContext(input.userContext);
    setPhase('reading');
    setHistoryStack('reading');
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

  const handleSaveReading = (uploadedImage?: string) => {
    const record: ReadingRecord = {
      id: Date.now().toString(),
      spread,
      selectedCards,
      interpretation,
      userContext: currentUserContext,
      uploadedImage,
      createdAt: new Date().toISOString(),
    };
    saveReadingRecord(record);
  };

  const handleContinueReading = () => {
    setSelectedCards([]);
    setInterpretation('');
    setCurrentUserContext('');
    setPhase('input');
    setHistoryStack('spread-selector');
  };

  const handleViewHistoryDetail = (record: ReadingRecord) => {
    setCurrentRecord(record);
    setView('history-detail');
  };

  const handleGoBack = () => {
    switch (historyStack) {
      case 'reading':
        setPhase('input');
        setHistoryStack('card-selection');
        break;
      case 'card-selection':
        setPhase('input');
        setHistoryStack('spread-selector');
        break;
      case 'spread-selector':
        break;
      default:
        break;
    }
  };

  const renderContent = () => {
    switch (view) {
      case 'login':
        return <Login onNavigateToRegister={() => setView('register')} />;
      case 'register':
        return <Register onNavigateToLogin={() => setView('login')} />;
      case 'history':
        return (
          <HistoryPage
            onBack={() => setView('home')}
            onViewDetail={handleViewHistoryDetail}
          />
        );
      case 'history-detail':
        return currentRecord ? (
          <HistoryDetailPage
            record={currentRecord}
            onBack={() => setView('history')}
          />
        ) : null;
      default:
        return (
          <AnimatePresence mode="wait">
            {phase === 'input' ? (
              <motion.div
                key="input"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <InputPhase onSubmit={handleSubmit} onGoBack={handleGoBack} />
              </motion.div>
            ) : (
              <motion.div
                key="reading"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {isLoading ? (
                  <LoadingState />
                ) : (
                  <ReadingPhase
                    selectedCards={selectedCards}
                    interpretation={interpretation}
                    spread={spread}
                    onContinue={handleContinueReading}
                    onGoBack={handleGoBack}
                    onSave={handleSaveReading}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white relative overflow-hidden">
      <StarryBackground />
      <MysticalOverlay />
      
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%20400%20400%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Ccircle%20cx%3D%22200%22%20cy%3D%22200%22%20r%3D%2230%22%20fill%3D%22none%22%20stroke%3D%22%23d4af37%22%20stroke-width%3D%220.3%22%2F%3E%3Ccircle%20cx%3D%22200%22%20cy%3D%22200%22%20r%3D%2260%22%20fill%3D%22none%22%20stroke%3D%22%23d4af37%22%20stroke-width%3D%220.3%22%2F%3E%3Ccircle%20cx%3D%22200%22%20cy%3D%22200%22%20r%3D%2290%22%20fill%3D%22none%22%20stroke%3D%22%23d4af37%22%20stroke-width%3D%220.3%22%2F%3E%3Ccircle%20cx%3D%22200%22%20cy%3D%22200%22%20r%3D%22120%22%20fill%3D%22none%22%20stroke%3D%22%23d4af37%22%20stroke-width%3D%220.3%22%2F%3E%3C/svg%3E')] opacity-8"></div>

      <Navbar view={view} setView={setView} />

      <div className="relative z-10 py-24 md:py-32">
        {renderContent()}
      </div>

      <footer className="relative z-10 text-center py-8 text-tarot-gray/50 font-crimson text-sm">
        <div className="flex justify-center gap-4 mb-2">
          <span className="text-tarot-gold/60">✦</span>
          <span>AI 塔罗解读</span>
          <span className="text-tarot-gold/60">✦</span>
        </div>
        <p>神秘的智慧等待着你去发现</p>
      </footer>
    </div>
  );
}

function LoadingState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-4xl mx-auto px-4"
    >
      <div className="text-center mb-8">
        <motion.h1
          className="text-4xl md:text-5xl font-decorative text-tarot-gray mb-4"
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          宇宙正在解读...
        </motion.h1>
        <p className="text-tarot-gray/70 font-crimson text-lg">
          星辰之力正在汇聚塔罗的智慧
        </p>
      </div>

      <div className="flex justify-center items-center py-20">
        <motion.div
          className="relative w-32 h-32"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute inset-0 border-4 border-tarot-gold/20 rounded-full"></div>
          <div className="absolute inset-4 border-4 border-tarot-gold/40 rounded-full"></div>
          <div className="absolute inset-8 border-4 border-tarot-gold/60 rounded-full"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-tarot-gold text-3xl">✧</span>
          </div>
        </motion.div>
      </div>

      <div className="text-center text-tarot-gray/50 font-crimson">
        <motion.p
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          请稍候，神秘的指引即将揭晓...
        </motion.p>
      </div>
    </motion.div>
  );
}

export default App;
