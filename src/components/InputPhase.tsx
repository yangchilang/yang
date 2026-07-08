import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { tarotCards } from '../data/tarotCards';
import { SpreadSelector } from './SpreadSelector';
import { SelectedCard, ReadingInput, Spread } from '../types';

interface InputPhaseProps {
  onSubmit: (input: ReadingInput) => void;
}

type Step = 'spread' | 'info' | 'cards';

export function InputPhase({ onSubmit }: InputPhaseProps) {
  const [step, setStep] = useState<Step>('spread');
  const [selectedSpread, setSelectedSpread] = useState<Spread | null>(null);
  const [selectedCards, setSelectedCards] = useState<SelectedCard[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [isReversed, setIsReversed] = useState(false);
  const [userContext, setUserContext] = useState('');
  
  const [orderId, setOrderId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerGender, setCustomerGender] = useState('');
  const [customerAge, setCustomerAge] = useState<number | null>(null);
  const [relatedOrderId, setRelatedOrderId] = useState('');
  
  const selectedCardsRef = useRef<HTMLDivElement>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const handleSelectSpread = (spread: Spread) => {
    setSelectedSpread(spread);
    setSelectedCards([]);
    setStep('info');
  };

  const handleBackToSpreadSelection = () => {
    setStep('spread');
    setSelectedSpread(null);
    setSelectedCards([]);
    setSelectedCardId(null);
    setIsReversed(false);
  };

  const handleBackToInfo = () => {
    setStep('info');
    setSelectedCards([]);
    setSelectedCardId(null);
    setIsReversed(false);
  };

  const validateInfoForm = () => {
    const newErrors: Record<string, string> = {};
    if (!orderId.trim()) {
      newErrors.orderId = '订单号不能为空';
    }
    if (customerAge !== null && (customerAge < 1 || customerAge > 150)) {
      newErrors.customerAge = '年龄必须在1-150之间';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInfoSubmit = () => {
    if (validateInfoForm()) {
      setStep('cards');
    }
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

  const handleUpdatePositionMeaning = (position: number, newMeaning: string) => {
    setSelectedCards(prev => prev.map(card => 
      card.position === position ? { ...card, positionMeaning: newMeaning } : card
    ));
  };

  const handleRemoveCard = (position: number) => {
    setSelectedCards(prev => prev.filter(c => c.position !== position));
  };

  const handleClearAll = () => {
    setSelectedCards([]);
  };

  if (step === 'spread') {
    return <SpreadSelector onSelectSpread={handleSelectSpread} />;
  }

  if (step === 'info') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl mx-auto px-4"
      >
        <button
          onClick={handleBackToSpreadSelection}
          className="flex items-center gap-2 text-tarot-gray hover:text-tarot-gold transition-colors font-crimson mb-6"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回
        </button>

        <div className="text-center mb-8">
          <motion.h1
            className="text-4xl md:text-5xl font-decorative text-tarot-gray mb-4"
            animate={{ opacity: [0, 1], scale: [0.9, 1] }}
            transition={{ duration: 0.8 }}
          >
            基本信息
          </motion.h1>
          <p className="text-tarot-gray/70 font-crimson text-lg">
            请填写解读的基本信息
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 md:p-8 border border-tarot-gold/20 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-tarot-gold/20 rounded-full flex items-center justify-center">
              <span className="text-tarot-gold font-decorative text-lg">✧</span>
            </div>
            <h2 className="text-xl font-decorative text-tarot-gray">基本信息</h2>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <label className="block text-tarot-gray/80 font-decorative text-sm">订单号</label>
                <span className="text-red-500 text-xs">*</span>
              </div>
              <input
                type="text"
                value={orderId}
                onChange={(e) => {
                  setOrderId(e.target.value);
                  if (errors.orderId) setErrors(prev => ({ ...prev, orderId: '' }));
                }}
                placeholder="请输入订单号，如 d26053001"
                className={`w-full bg-tarot-lightgray/30 border-2 rounded-lg px-4 py-3 text-tarot-gray font-crimson placeholder:text-tarot-gray/40 focus:outline-none transition-colors ${
                  errors.orderId ? 'border-red-400' : 'border-tarot-gold/40 focus:border-tarot-gold'
                }`}
              />
              {errors.orderId && (
                <p className="text-red-500 text-xs mt-1 font-crimson">{errors.orderId}</p>
              )}
            </div>

            <div>
              <label className="block text-tarot-gray/80 font-decorative text-sm mb-2">关联上一单（可选）</label>
              <div className="text-tarot-gray/50 text-xs font-crimson mb-2">
                搜索并选择已有订单，创建后自动关联。此处不是填写本单订单号。
              </div>
              <input
                type="text"
                value={relatedOrderId}
                onChange={(e) => setRelatedOrderId(e.target.value)}
                placeholder="输入订单号搜索，如 u26052401"
                className="w-full bg-tarot-lightgray/30 border-2 border-tarot-gold/40 rounded-lg px-4 py-3 text-tarot-gray font-crimson placeholder:text-tarot-gray/40 focus:border-tarot-gold focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-tarot-gray/80 font-decorative text-sm mb-2">顾客姓名</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="请输入顾客姓名"
                className="w-full bg-tarot-lightgray/30 border-2 border-tarot-gold/40 rounded-lg px-4 py-3 text-tarot-gray font-crimson placeholder:text-tarot-gray/40 focus:border-tarot-gold focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-tarot-gray/80 font-decorative text-sm mb-2">性别</label>
              <select
                value={customerGender}
                onChange={(e) => setCustomerGender(e.target.value)}
                className="w-full bg-tarot-lightgray/30 border-2 border-tarot-gold/40 rounded-lg px-4 py-3 text-tarot-gray font-crimson focus:border-tarot-gold focus:outline-none transition-colors appearance-none cursor-pointer"
              >
                <option value="">选择性别</option>
                <option value="男">男</option>
                <option value="女">女</option>
              </select>
            </div>

            <div>
              <label className="block text-tarot-gray/80 font-decorative text-sm mb-2">年龄</label>
              <div className="flex items-center">
                <button
                  onClick={() => setCustomerAge(prev => prev ? Math.max(1, prev - 1) : null)}
                  className="w-10 h-12 bg-tarot-lightgray/30 border-2 border-tarot-gold/40 rounded-l-lg flex items-center justify-center text-tarot-gold hover:bg-tarot-gold/10 transition-colors"
                >
                  -
                </button>
                <input
                  type="number"
                  value={customerAge || ''}
                  onChange={(e) => {
                    const val = e.target.value ? parseInt(e.target.value) : null;
                    setCustomerAge(val);
                    if (errors.customerAge) setErrors(prev => ({ ...prev, customerAge: '' }));
                  }}
                  className={`flex-1 h-12 bg-tarot-lightgray/30 border-y-2 border-tarot-gold/40 px-4 text-tarot-gray font-crimson text-center focus:border-tarot-gold focus:outline-none transition-colors ${
                    errors.customerAge ? 'border-y-red-400' : ''
                  }`}
                />
                <button
                  onClick={() => setCustomerAge(prev => prev ? Math.min(150, prev + 1) : 1)}
                  className="w-10 h-12 bg-tarot-lightgray/30 border-2 border-tarot-gold/40 rounded-r-lg flex items-center justify-center text-tarot-gold hover:bg-tarot-gold/10 transition-colors"
                >
                  +
                </button>
              </div>
              {errors.customerAge && (
                <p className="text-red-500 text-xs mt-1 font-crimson">{errors.customerAge}</p>
              )}
            </div>
          </div>

          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={handleInfoSubmit}
            className="w-full mt-8 py-4 rounded-xl font-decorative text-xl bg-gradient-to-r from-tarot-gold to-yellow-500 text-white hover:shadow-xl hover:shadow-tarot-gold/30 transition-all"
          >
            继续选择牌卡
          </motion.button>
        </div>
      </motion.div>
    );
  }

  const requiredCards = selectedSpread?.positions.length || 0;
  const isComplete = selectedCards.length === requiredCards;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto px-4"
    >
      <button
        onClick={handleBackToInfo}
        className="flex items-center gap-2 text-tarot-gray hover:text-tarot-gold transition-colors font-crimson mb-6"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        返回
      </button>

      <div className="text-center mb-6">
        <motion.h1
          className="text-3xl md:text-4xl font-decorative text-tarot-gray mb-2"
          animate={{ opacity: [0, 1], scale: [0.9, 1] }}
          transition={{ duration: 0.8 }}
        >
          {selectedSpread?.name}
        </motion.h1>
        <p className="text-tarot-gray/70 font-crimson">
          需要 {requiredCards} 张牌 · 已选择 {selectedCards.length} 张
        </p>
        <button
          onClick={handleBackToInfo}
          className="mt-2 text-tarot-gold hover:text-yellow-600 font-crimson text-sm underline transition-colors"
        >
          修改基本信息
        </button>
      </div>

      {selectedCards.length < requiredCards && (
        <div className="bg-tarot-gold/10 rounded-xl p-4 mb-6 border border-tarot-gold/30">
          <div className="text-center">
            <span className="text-tarot-gold font-decorative">第 {selectedCards.length + 1} 张牌：</span>
            <span className="text-tarot-gray font-crimson ml-2">
              {selectedSpread?.positions[selectedCards.length]?.meaning}
            </span>
          </div>
        </div>
      )}

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
            <div className="space-y-3 mb-6">
              {selectedCards.map((selectedCard, index) => (
                <motion.div
                  key={selectedCard.position}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-tarot-lightgray/20 rounded-xl p-4 border border-tarot-gold/20 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-tarot-gold/20 rounded-lg flex items-center justify-center">
                        <span className="text-tarot-gold font-decorative font-bold">{index + 1}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-decorative text-tarot-gray">
                            {String(selectedCard.card.id + 1).padStart(2, '0')} - {selectedCard.card.nameCn}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            selectedCard.isReversed 
                              ? 'bg-red-100 text-red-600' 
                              : 'bg-green-100 text-green-600'
                          }`}>
                            {selectedCard.isReversed ? '逆位' : '正位'}
                          </span>
                        </div>
                        <div className="flex gap-2 mt-1">
                          {selectedCard.card.keywords.slice(0, 2).map((keyword, i) => (
                            <span key={i} className="text-xs text-tarot-gray/50 bg-white/50 px-2 py-0.5 rounded">
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveCard(selectedCard.position)}
                      className="text-tarot-gray/30 hover:text-red-500 transition-colors p-2"
                      title="删除此牌"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  <div className="mt-3">
                    <label className="block text-tarot-gray/60 text-xs font-crimson mb-1">牌位含义</label>
                    <input
                      type="text"
                      value={selectedCard.positionMeaning}
                      onChange={(e) => handleUpdatePositionMeaning(selectedCard.position, e.target.value)}
                      className="w-full bg-white/80 border border-tarot-gold/30 rounded-lg px-3 py-2 text-sm font-crimson text-tarot-gray placeholder:text-tarot-gray/40 focus:border-tarot-gold focus:outline-none transition-colors"
                      placeholder="输入牌位含义..."
                    />
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
                onSubmit({ 
                  selectedCards, 
                  userContext, 
                  spread: selectedSpread!, 
                  orderId,
                  customerName,
                  customerGender,
                  customerAge: customerAge ?? undefined,
                  relatedOrderId
                });
              }, 500);
            }}
            className="w-full py-4 rounded-xl font-decorative text-xl bg-gradient-to-r from-tarot-gold to-yellow-500 text-white hover:shadow-xl hover:shadow-tarot-gold/30 transition-all"
          >
            开始 AI 解读
          </motion.button>
        )}
      </div>

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