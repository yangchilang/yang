import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { tarotCards } from '../data/tarotCards';
import { SpreadSelector } from './SpreadSelector';
import { SelectedCard, ReadingInput, Spread } from '../types';

interface InputPhaseProps {
  onSubmit: (input: ReadingInput) => void;
  onSave?: () => void;
}

type Step = 'spread' | 'combined';

export function InputPhase({ onSubmit, onSave }: InputPhaseProps) {
  const [step, setStep] = useState<Step>('spread');
  const [selectedSpread, setSelectedSpread] = useState<Spread | null>(null);
  const [selectedCards, setSelectedCards] = useState<SelectedCard[]>([]);
  const [cardInputValues, setCardInputValues] = useState<Record<number, string>>({});
  
  const [title, setTitle] = useState('');
  const [orderId, setOrderId] = useState('');
  const [customerGender, setCustomerGender] = useState('');
  const [relatedOrderId, setRelatedOrderId] = useState('');
  const [customerInfo, setCustomerInfo] = useState('');
  const [customerStatement, setCustomerStatement] = useState('');
  const [customerQuestion, setCustomerQuestion] = useState('');
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const handleSelectSpread = (spread: Spread) => {
    setSelectedSpread(spread);
    const initialCards: SelectedCard[] = spread.positions.map((pos) => ({
      card: tarotCards[0],
      isReversed: false,
      position: pos.position,
      positionMeaning: pos.meaning
    }));
    setSelectedCards(initialCards);
    const initialInputValues: Record<number, string> = {};
    spread.positions.forEach(pos => {
      initialInputValues[pos.position] = '';
    });
    setCardInputValues(initialInputValues);
    setTitle(spread.name);
    setStep('combined');
  };

  const handleBackToSpreadSelection = () => {
    setStep('spread');
    setSelectedSpread(null);
    setSelectedCards([]);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) {
      newErrors.title = '标题不能为空';
    }
    if (!orderId.trim()) {
      newErrors.orderId = '订单号不能为空';
    }
    if (!customerQuestion.trim()) {
      newErrors.customerQuestion = '客户想问的问题不能为空';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateReversed = (position: number, isReversed: boolean) => {
    setSelectedCards(prev => prev.map(c => 
      c.position === position ? { ...c, isReversed } : c
    ));
  };

  const handleUpdatePositionMeaning = (position: number, newMeaning: string) => {
    setSelectedCards(prev => prev.map(card => 
      card.position === position ? { ...card, positionMeaning: newMeaning } : card
    ));
  };

  const handleClearAll = () => {
    if (!selectedSpread) return;
    const initialCards: SelectedCard[] = selectedSpread.positions.map((pos) => ({
      card: tarotCards[0],
      isReversed: false,
      position: pos.position,
      positionMeaning: pos.meaning
    }));
    setSelectedCards(initialCards);
  };

  const handleCardInputChange = (position: number, value: string) => {
    const card = tarotCards.find(c => c.nameCn.includes(value) || c.name.includes(value));
    if (card) {
      setSelectedCards(prev => prev.map(c => 
        c.position === position ? { ...c, card } : c
      ));
      setCardInputValues(prev => ({ ...prev, [position]: '' }));
    } else {
      setCardInputValues(prev => ({ ...prev, [position]: value }));
    }
  };

  if (step === 'spread') {
    return <SpreadSelector onSelectSpread={handleSelectSpread} />;
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
          className="text-3xl md:text-4xl font-decorative text-tarot-gray mb-2"
          animate={{ opacity: [0, 1], scale: [0.9, 1] }}
          transition={{ duration: 0.8 }}
        >
          {selectedSpread?.name}
        </motion.h1>
        <p className="text-tarot-gray/70 font-crimson">
          共 {requiredCards} 张牌，请编辑每张牌的内容
        </p>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-xl p-6 md:p-8 border border-tarot-gold/20 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-tarot-gold/20 rounded-full flex items-center justify-center">
              <span className="text-tarot-gold font-decorative text-lg">✧</span>
            </div>
            <h2 className="text-xl font-decorative text-tarot-gray">基本信息</h2>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <label className="block text-tarot-gray/80 font-decorative text-sm">标题</label>
                <span className="text-red-500 text-xs">*</span>
              </div>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) setErrors(prev => ({ ...prev, title: '' }));
                }}
                placeholder="请输入标题"
                className={`w-full bg-tarot-lightgray/30 border-2 rounded-lg px-4 py-3 text-tarot-gray font-crimson placeholder:text-tarot-gray/40 focus:outline-none transition-colors ${
                  errors.title ? 'border-red-400' : 'border-tarot-gold/40 focus:border-tarot-gold'
                }`}
              />
              {errors.title && (
                <p className="text-red-500 text-xs mt-1 font-crimson">{errors.title}</p>
              )}
            </div>

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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <label className="block text-tarot-gray/80 font-decorative text-sm mb-2">关联上一单（可选）</label>
                <input
                  type="text"
                  value={relatedOrderId}
                  onChange={(e) => setRelatedOrderId(e.target.value)}
                  placeholder="输入订单号搜索"
                  className="w-full bg-tarot-lightgray/30 border-2 border-tarot-gold/40 rounded-lg px-4 py-3 text-tarot-gray font-crimson placeholder:text-tarot-gray/40 focus:border-tarot-gold focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 md:p-8 border border-tarot-gold/20 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-tarot-gold/20 rounded-full flex items-center justify-center">
              <span className="text-tarot-gold font-decorative text-lg">🌙</span>
            </div>
            <h2 className="text-xl font-decorative text-tarot-gray">客户信息</h2>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-tarot-gray/70 font-crimson text-sm mb-2">客户主体及客户语境中的客体信息</label>
              <textarea
                value={customerInfo}
                onChange={(e) => setCustomerInfo(e.target.value)}
                placeholder="例如：&#10;占卜者年龄：22&#10;对方年龄：22&#10;现在是什么关系：分手&#10;是否在正常联系：否"
                className="w-full h-32 bg-tarot-lightgray/30 border-2 border-tarot-gold/30 rounded-lg px-4 py-3 text-tarot-gray font-crimson text-sm placeholder:text-tarot-gray/40 focus:border-tarot-gold focus:outline-none transition-colors resize-none"
              />
            </div>

            <div>
              <label className="block text-tarot-gray/70 font-crimson text-sm mb-2">客户自述</label>
              <textarea
                value={customerStatement}
                onChange={(e) => setCustomerStatement(e.target.value)}
                placeholder="请描述客户的情况..."
                className="w-full h-24 bg-tarot-lightgray/30 border-2 border-tarot-gold/30 rounded-lg px-4 py-3 text-tarot-gray font-crimson text-sm placeholder:text-tarot-gray/40 focus:border-tarot-gold focus:outline-none transition-colors resize-none"
              />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <label className="block text-tarot-gray/70 font-crimson text-sm">客户想问的问题</label>
                <span className="text-red-500 text-xs">*</span>
              </div>
              <textarea
                value={customerQuestion}
                onChange={(e) => {
                  setCustomerQuestion(e.target.value);
                  if (errors.customerQuestion) setErrors(prev => ({ ...prev, customerQuestion: '' }));
                }}
                placeholder="请输入客户想问的问题..."
                className={`w-full h-32 bg-tarot-lightgray/30 border-2 rounded-lg px-4 py-3 text-tarot-gray font-crimson text-sm placeholder:text-tarot-gray/40 focus:outline-none transition-colors resize-none ${
                  errors.customerQuestion ? 'border-red-400' : 'border-tarot-gold/30 focus:border-tarot-gold'
                }`}
              />
              {errors.customerQuestion && (
                <p className="text-red-500 text-xs mt-1 font-crimson">{errors.customerQuestion}</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 md:p-8 border border-tarot-gold/20 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-tarot-gold/20 rounded-full flex items-center justify-center">
              <span className="text-tarot-gold font-decorative text-lg">🎴</span>
            </div>
            <h2 className="text-xl font-decorative text-tarot-gray">卡牌详细</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {selectedSpread?.positions.map((pos, index) => {
              const selectedCard = selectedCards.find(c => c.position === index + 1);
              return (
                <motion.div
                  key={pos.position}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-tarot-lightgray/20 rounded-xl p-4 border-2 transition-all ${
                    selectedCard 
                      ? 'border-tarot-gold/40' 
                      : 'border-tarot-gold/10'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-tarot-gold/20 rounded-lg flex items-center justify-center">
                      <span className="text-tarot-gold font-decorative font-bold text-sm">{pos.position}</span>
                    </div>
                    <span className="font-decorative text-tarot-gray text-sm">第 {pos.position} 张牌</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-tarot-gray/60 text-xs font-crimson mb-1">牌面</label>
                      <input
                        type="text"
                        value={cardInputValues[pos.position] || selectedCard?.card.nameCn || ''}
                        onChange={(e) => handleCardInputChange(pos.position, e.target.value)}
                        placeholder={`请输入第 ${pos.position} 张牌`}
                        className="w-full bg-white/80 border border-tarot-gold/30 rounded-lg px-3 py-2 text-sm font-crimson text-tarot-gray placeholder:text-tarot-gray/40 focus:border-tarot-gold focus:outline-none transition-colors"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateReversed(pos.position, false)}
                        className={`flex-1 py-2 rounded-lg font-decorative text-xs transition-all ${
                          selectedCard?.isReversed === false || !selectedCard
                            ? 'bg-green-100 text-green-600 border border-green-200'
                            : 'bg-white border border-tarot-gold/30 text-tarot-gray/60'
                        }`}
                      >
                        正位
                      </button>
                      <button
                        onClick={() => handleUpdateReversed(pos.position, true)}
                        className={`flex-1 py-2 rounded-lg font-decorative text-xs transition-all ${
                          selectedCard?.isReversed === true
                            ? 'bg-red-100 text-red-600 border border-red-200'
                            : 'bg-white border border-tarot-gold/30 text-tarot-gray/60'
                        }`}
                      >
                        逆位
                      </button>
                    </div>

                    <div>
                      <label className="block text-tarot-gray/60 text-xs font-crimson mb-1">对应信息</label>
                      <input
                        type="text"
                        value={selectedCard?.positionMeaning || pos.meaning}
                        onChange={(e) => handleUpdatePositionMeaning(pos.position, e.target.value)}
                        className="w-full bg-white/80 border border-tarot-gold/30 rounded-lg px-3 py-2 text-sm font-crimson text-tarot-gray placeholder:text-tarot-gray/40 focus:border-tarot-gold focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {selectedCards.length > 0 && (
            <div className="flex justify-end mt-4">
              <button
                onClick={handleClearAll}
                className="text-red-500 hover:text-red-700 transition-colors text-sm font-crimson"
              >
                清空全部
              </button>
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={onSave}
            className="flex-1 py-4 rounded-xl font-decorative text-xl bg-white border-2 border-tarot-gold/50 text-tarot-gray hover:border-tarot-gold hover:text-tarot-gold transition-all"
          >
            保存草稿
          </motion.button>
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => {
              if (validateForm() && isComplete) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setTimeout(() => {
                  onSubmit({ 
                    selectedCards, 
                    userContext: '', 
                    spread: selectedSpread!, 
                    orderId,
                    title,
                    customerGender,
                    relatedOrderId,
                    customerInfo,
                    customerStatement,
                    customerQuestion
                  });
                }, 500);
              }
            }}
            disabled={!isComplete}
            className="flex-1 py-4 rounded-xl font-decorative text-xl bg-gradient-to-r from-tarot-gold to-yellow-500 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl hover:shadow-tarot-gold/30 transition-all"
          >
            {isComplete ? '开始解读' : `请选择 ${requiredCards} 张牌卡`}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}