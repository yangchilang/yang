import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { tarotCards } from '../data/tarotCards';
import { TarotCard } from './TarotCard';
import { SpreadSelector } from './SpreadSelector';
import { SelectedCard, ReadingInput, Spread } from '../types';

interface InputPhaseProps {
  onSubmit: (input: ReadingInput) => void;
  onGoBack: () => void;
}

export function InputPhase({ onSubmit, onGoBack }: InputPhaseProps) {
  const [selectedSpread, setSelectedSpread] = useState<Spread | null>(null);
  const [selectedCards, setSelectedCards] = useState<SelectedCard[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [isReversed, setIsReversed] = useState(false);
  const [userContext, setUserContext] = useState('');
  
  const selectedCardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () => {
      window.scrollTo(0, 0);
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const handleSelectSpread = (spread: Spread) => {
    setSelectedSpread(spread);
    setSelectedCards([]);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const handleBackToSpreadSelection = () => {
    setSelectedSpread(null);
    setSelectedCards([]);
    setSelectedCardId(null);
    setIsReversed(false);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const handleAddCard = () => {
    if (selectedCardId === null || !selectedSpread) return;
    
    const card = tarotCards.find(c => c.id === selectedCardId);
    if (!card) return;
    
    const currentPosition = selectedCards.length + 1;
    const positionMeaning = selectedSpread.positions[currentPosition - 1]?.meaning || '';
    
    const newCard: SelectedCard = {
      card,
      isReversed,
      position: currentPosition,
      positionMeaning
    };
    
    setSelectedCards(prev => [...prev, newCard]);
    setSelectedCardId(null);
    setIsReversed(false);
    
    setTimeout(() => {
      if (selectedCardsRef.current) {
        selectedCardsRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 200);
  };

  const handleRemoveCard = (position: number) => {
    setSelectedCards(prev => prev.filter(c => c.position !== position));
  };

  const handleClearAll = () => {
    setSelectedCards([]);
  };

  // 如果还没选择牌阵，显示牌阵选择器
  if (!selectedSpread) {
    return <SpreadSelector onSelectSpread={handleSelectSpread} />;
  }

  // 已选择牌阵，显示选牌界面
  const requiredCards = selectedSpread.positions.length;
  const isComplete = selectedCards.length === requiredCards;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto px-4"
    >
      {/* 返回按钮 */}
      <button
        onClick={onGoBack}
        className="flex items-center gap-2 text-tarot-gray hover:text-tarot-gold transition-colors font-crimson mb-6"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        返回
      </button>

      {/* 牌阵信息 */}
      <div className="text-center mb-6">
        <motion.h1
          className="text-3xl md:text-4xl font-decorative text-tarot-gray mb-2"
          animate={{ opacity: [0, 1], scale: [0.9, 1] }}
          transition={{ duration: 0.8 }}
        >
          {selectedSpread.name}
        </motion.h1>
        <p className="text-tarot-gray/70 font-crimson">
          需要 {requiredCards} 张牌 · 已选择 {selectedCards.length} 张
        </p>
        <button
          onClick={handleBackToSpreadSelection}
          className="mt-2 text-tarot-gold hover:text-yellow-600 font-crimson text-sm underline transition-colors"
        >
          更换牌阵
        </button>
      </div>

      {/* 牌位含义提示 */}
      {selectedCards.length < requiredCards && (
        <div className="bg-tarot-gold/10 rounded-xl p-4 mb-6 border border-tarot-gold/30">
          <div className="text-center">
            <span className="text-tarot-gold font-decorative">第 {selectedCards.length + 1} 张牌：</span>
            <span className="text-tarot-gray font-crimson ml-2">
              {selectedSpread.positions[selectedCards.length]?.meaning}
            </span>
          </div>
        </div>
      )}

      {/* 选牌区域 */}
      <div className="bg-white rounded-xl p-6 mb-8 border border-tarot-gold/20 shadow-sm">
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="w-full md:w-1/3">
            <label className="block text-tarot-gray/80 font-decorative mb-2 text-sm">选择塔罗牌</label>
            <select
              value={selectedCardId ?? ''}
              onChange={(e) => setSelectedCardId(e.target.value ? Number(e.target.value) : null)}
              className="w-full bg-tarot-lightgray/30 border-2 border-tarot-gold/40 rounded-lg px-4 py-3 text-tarot-gray font-crimson focus:border-tarot-gold focus:outline-none transition-colors"
            >
              <option value="">请选择一张牌...</option>
              {tarotCards.map(card => (
                <option key={card.id} value={card.id}>
                  {String(card.id + 1).padStart(2, '0')} - {card.nameCn}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full md:w-1/3">
            <label className="block text-tarot-gray/80 font-decorative mb-2 text-sm">正逆位</label>
            <div className="flex gap-4">
              <button
                onClick={() => setIsReversed(false)}
                className={`flex-1 py-3 rounded-lg font-decorative transition-all ${
                  !isReversed
                    ? 'bg-tarot-gold text-white'
                    : 'bg-white border-2 border-tarot-gold/50 text-tarot-gray'
                }`}
              >
                正位
              </button>
              <button
                onClick={() => setIsReversed(true)}
                className={`flex-1 py-3 rounded-lg font-decorative transition-all ${
                  isReversed
                    ? 'bg-tarot-gold text-white'
                    : 'bg-white border-2 border-tarot-gold/50 text-tarot-gray'
                }`}
              >
                逆位
              </button>
            </div>
          </div>

          <div className="w-full md:w-1/3">
            <label className="block text-tarot-gray/80 font-decorative mb-2 text-sm">&nbsp;</label>
            <button
              onClick={handleAddCard}
              disabled={selectedCardId === null || isComplete}
              className="w-full py-3 rounded-lg font-decorative bg-gradient-to-r from-tarot-gold to-yellow-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg hover:shadow-tarot-gold/30"
            >
              添加牌卡
            </button>
          </div>
        </div>
      </div>

      {/* 已选择的牌卡 */}
      <div ref={selectedCardsRef} className="bg-white rounded-xl p-6 border border-tarot-gold/20 shadow-sm mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-decorative text-tarot-gray">已选择的牌卡</h2>
          {selectedCards.length > 0 && (
            <button
              onClick={handleClearAll}
              className="text-red-500 hover:text-red-700 transition-colors text-sm font-crimson"
            >
              清空全部
            </button>
          )}
        </div>

        <AnimatePresence>
          {selectedCards.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="text-tarot-gold/20 text-6xl mb-4">🎴</div>
              <p className="text-tarot-gray/50 font-crimson">请选择塔罗牌开始解读</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
              {selectedCards.map((selectedCard, index) => (
                <motion.div
                  key={selectedCard.position}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative group"
                >
                  <TarotCard
                    card={selectedCard.card}
                    isReversed={selectedCard.isReversed}
                    size="small"
                  />
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-tarot-gold rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {index + 1}
                  </div>
                  <button
                    onClick={() => handleRemoveCard(selectedCard.position)}
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                  {/* 显示位置含义 */}
                  <div className="mt-2 text-center">
                    <p className="text-tarot-gray/60 text-xs font-crimson line-clamp-2">
                      {selectedCard.positionMeaning}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>

        {isComplete && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setTimeout(() => {
                onSubmit({ selectedCards, userContext, spread: selectedSpread });
              }, 500);
            }}
            className="w-full py-4 rounded-xl font-decorative text-xl bg-gradient-to-r from-tarot-gold to-yellow-500 text-white hover:shadow-xl hover:shadow-tarot-gold/30 transition-all"
          >
            开始 AI 解读
          </motion.button>
        )}
      </div>

      {/* 占卜背景 */}
      <div className="bg-white rounded-xl p-6 mb-8 border border-tarot-gold/20 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-decorative text-tarot-gray">占卜背景（选填）</h2>
          <span className="text-tarot-gray/50 text-sm font-crimson">帮助AI更精准地解读</span>
        </div>
        <textarea
          value={userContext}
          onChange={(e) => setUserContext(e.target.value)}
          placeholder="请描述您想要占卜的问题、领域或困惑，以及当前的个人情况、心境或处境..."
          className="w-full h-32 bg-tarot-lightgray/30 border-2 border-tarot-gold/30 rounded-lg px-4 py-3 text-tarot-gray font-crimson placeholder:text-tarot-gray/40 focus:border-tarot-gold focus:outline-none transition-colors resize-none"
        />
        <p className="text-tarot-gray/40 text-xs mt-2 font-crimson">
          例如：我想了解我在事业发展方面的前景 / 我最近在感情上遇到困惑 / 我的财务状况需要改善
        </p>
      </div>
    </motion.div>
  );
}
