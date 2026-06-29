import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { spreadsByCategory } from '../data/spreads';
import { Spread } from '../types';

interface SpreadSelectorProps {
  onSelectSpread: (spread: Spread) => void;
}

export function SpreadSelector({ onSelectSpread }: SpreadSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSpread, setSelectedSpread] = useState<Spread | null>(null);

  const categories = Object.keys(spreadsByCategory);

  const handleSelectSpread = (spread: Spread) => {
    setSelectedSpread(spread);
  };

  const handleConfirm = () => {
    if (selectedSpread) {
      onSelectSpread(selectedSpread);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-5xl mx-auto px-4"
    >
      <div className="text-center mb-8">
        <motion.h1
          className="text-4xl md:text-5xl font-decorative text-tarot-gray mb-4"
          animate={{ opacity: [0, 1], scale: [0.9, 1] }}
          transition={{ duration: 0.8 }}
        >
          选择牌阵
        </motion.h1>
        <p className="text-tarot-gray/70 font-crimson text-lg">
          请选择适合您问题的牌阵类型
        </p>
      </div>

     {/* 三张牌牌阵 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-xl font-decorative text-tarot-gray mb-4 text-center">三张牌</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {spreadsByCategory['三张牌']?.map((spread) => (
            <motion.div
              key={spread.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelectSpread(spread)}
              className={`cursor-pointer rounded-xl p-6 transition-all ${
                selectedSpread?.id === spread.id
                  ? 'bg-tarot-gold/10 border-2 border-tarot-gold shadow-lg'
                  : 'bg-gradient-to-br from-tarot-gold/20 to-yellow-50 border-2 border-tarot-gold/40 hover:border-tarot-gold'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-decorative text-tarot-gray">{spread.name}</h3>
                <span className="text-tarot-gold font-crimson text-sm bg-tarot-gold/10 px-2 py-1 rounded">
                  {spread.positions.length}张牌
                </span>
              </div>
              <p className="text-tarot-gray/60 font-crimson text-sm mb-3">{spread.description}</p>
              <div className="text-tarot-gray/50 text-xs font-crimson">
                位置含义：{spread.positions.slice(0, 2).map(p => p.meaning).join('、')}...
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* 特殊牌阵分割线 */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <div className="w-16 h-px bg-tarot-gold/30"></div>
        <span className="text-tarot-gold/60 font-decorative">特殊牌阵</span>
        <div className="w-16 h-px bg-tarot-gold/30"></div>
      </div>

      {/* 类别选择 */}
      <div className="mb-8">
        <h2 className="text-xl font-decorative text-tarot-gray mb-4 text-center">选择特殊牌阵类别</h2>
        <div className="flex flex-wrap justify-center gap-3">
          {categories.map((category) => (
            <motion.button
              key={category}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
              className={`px-6 py-3 rounded-lg font-crimson transition-all ${
                selectedCategory === category
                  ? 'bg-tarot-gold text-white shadow-lg shadow-tarot-gold/30'
                  : 'bg-white border-2 border-tarot-gold/30 text-tarot-gray hover:border-tarot-gold'
              }`}
            >
              {category}
            </motion.button>
          ))}
        </div>
      </div>

      {/* 牌阵列表 */}
      <AnimatePresence mode="wait">
        {selectedCategory && (
          <motion.div
            key={selectedCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-8"
          >
            <h2 className="text-xl font-decorative text-tarot-gray mb-4 text-center">
              {selectedCategory}牌阵
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {spreadsByCategory[selectedCategory].map((spread) => (
                <motion.div
                  key={spread.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelectSpread(spread)}
                  className={`cursor-pointer rounded-xl p-6 transition-all ${
                    selectedSpread?.id === spread.id
                      ? 'bg-tarot-gold/10 border-2 border-tarot-gold shadow-lg'
                      : 'bg-white border-2 border-tarot-gold/20 hover:border-tarot-gold/50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-decorative text-tarot-gray">{spread.name}</h3>
                    <span className="text-tarot-gold font-crimson text-sm bg-tarot-gold/10 px-2 py-1 rounded">
                      {spread.positions.length}张牌
                    </span>
                  </div>
                  <p className="text-tarot-gray/60 font-crimson text-sm mb-3">{spread.description}</p>
                  <div className="text-tarot-gray/50 text-xs font-crimson">
                    位置含义：{spread.positions.slice(0, 2).map(p => p.meaning).join('、')}...
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 选中牌阵详情 */}
      <AnimatePresence>
        {selectedSpread && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-xl p-6 border-2 border-tarot-gold/30 mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-decorative text-tarot-gray">{selectedSpread.name}</h3>
              <span className="text-tarot-gold font-crimson bg-tarot-gold/10 px-3 py-1 rounded-lg">
                需要 {selectedSpread.positions.length} 张牌
              </span>
            </div>
            <p className="text-tarot-gray/70 font-crimson mb-4">{selectedSpread.description}</p>
            
            <div className="bg-tarot-lightgray/30 rounded-lg p-4 mb-6">
              <h4 className="text-tarot-gray font-decorative mb-3">牌位含义：</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {selectedSpread.positions.map((pos) => (
                  <div key={pos.position} className="flex items-start gap-2">
                    <span className="text-tarot-gold font-bold min-w-[24px]">{pos.position}.</span>
                    <span className="text-tarot-gray/80 font-crimson text-sm">{pos.meaning}</span>
                  </div>
                ))}
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleConfirm}
              className="w-full py-4 rounded-xl font-decorative text-xl bg-gradient-to-r from-tarot-gold to-yellow-500 text-white hover:shadow-xl hover:shadow-tarot-gold/30 transition-all"
            >
              确认选择此牌阵
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 提示 */}
      {!selectedCategory && !selectedSpread && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="text-tarot-gold/30 text-6xl mb-4">🎴</div>
          <p className="text-tarot-gray/50 font-crimson">请选择一个牌阵开始解读</p>
        </motion.div>
      )}
    </motion.div>
  );
}
