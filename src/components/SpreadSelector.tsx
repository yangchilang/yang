import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { spreadsByCategory, spreads } from '../data/spreads';
import { Spread } from '../types';

interface SpreadSelectorProps {
  onSelectSpread: (spread: Spread) => void;
}

export function SpreadSelector({ onSelectSpread }: SpreadSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSpread, setSelectedSpread] = useState<Spread | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [customPositions, setCustomPositions] = useState<string[]>(['', '', '']);
  const [showCustomSpread, setShowCustomSpread] = useState(false);

  const categories = Object.keys(spreadsByCategory);

  const handleSelectSpread = (spread: Spread) => {
    setSelectedSpread(spread);
    setShowCustomSpread(false);
  };

  const handleConfirm = () => {
    if (selectedSpread) {
      onSelectSpread(selectedSpread);
    }
  };

  const handleCustomSpreadConfirm = () => {
    const validPositions = customPositions.filter(p => p.trim() !== '');
    if (validPositions.length >= 2) {
      const customSpread: Spread = {
        id: 'custom-spread',
        name: '自定义牌阵',
        description: '自定义牌位含义的牌阵',
        category: '自定义',
        positions: validPositions.map((meaning, index) => ({
          position: index + 1,
          meaning
        }))
      };
      onSelectSpread(customSpread);
    }
  };

  const addPosition = () => {
    setCustomPositions([...customPositions, '']);
  };

  const removePosition = (index: number) => {
    if (customPositions.length > 2) {
      setCustomPositions(customPositions.filter((_, i) => i !== index));
    }
  };

  const updatePosition = (index: number, value: string) => {
    const newPositions = [...customPositions];
    newPositions[index] = value;
    setCustomPositions(newPositions);
  };

  const filteredSpreads = spreads.filter(spread =>
    spread.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    spread.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    spread.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredByCategory = selectedCategory
    ? filteredSpreads.filter(spread => spread.category === selectedCategory)
    : [];

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

      {/* 自定义牌阵 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="bg-white rounded-xl p-6 border-2 border-tarot-gold/30">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-decorative text-tarot-gray">自定义牌阵</h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCustomSpread(!showCustomSpread)}
              className="text-tarot-gold font-crimson px-4 py-2 rounded-lg bg-tarot-gold/10 hover:bg-tarot-gold/20 transition-all"
            >
              {showCustomSpread ? '收起' : '展开'}
            </motion.button>
          </div>

          <AnimatePresence>
            {showCustomSpread && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <p className="text-tarot-gray/60 font-crimson text-sm mb-4">
                  自定义牌位含义，默认3张牌，可增减卡牌数量（最少2张）
                </p>

                <div className="space-y-3 mb-4">
                  {customPositions.map((position, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <span className="text-tarot-gold font-bold min-w-[32px] text-center">
                        {index + 1}.
                      </span>
                      <input
                        type="text"
                        value={position}
                        onChange={(e) => updatePosition(index, e.target.value)}
                        placeholder={`第${index + 1}张牌的含义`}
                        className="flex-1 px-4 py-2 rounded-lg border-2 border-tarot-gold/30 focus:border-tarot-gold focus:outline-none font-crimson text-sm"
                      />
                      {customPositions.length > 2 && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => removePosition(index)}
                          className="text-red-400 hover:text-red-600 font-crimson px-2 py-1"
                        >
                          删除
                        </motion.button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={addPosition}
                    className="px-6 py-3 rounded-lg font-crimson bg-tarot-gold/10 text-tarot-gold border-2 border-tarot-gold/30 hover:border-tarot-gold transition-all"
                  >
                    + 添加一张牌
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCustomSpreadConfirm}
                    disabled={customPositions.filter(p => p.trim() !== '').length < 2}
                    className="px-6 py-3 rounded-lg font-decorative bg-gradient-to-r from-tarot-gold to-yellow-500 text-white hover:shadow-lg hover:shadow-tarot-gold/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    确认自定义牌阵
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* 搜索框 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="max-w-md mx-auto">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索牌阵模板..."
              className="w-full px-4 py-3 pl-10 rounded-lg border-2 border-tarot-gold/30 focus:border-tarot-gold focus:outline-none font-crimson text-sm bg-white"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-tarot-gold/50">
              🔍
            </div>
          </div>
          {searchQuery && (
            <p className="text-tarot-gray/50 font-crimson text-xs mt-2 text-center">
              找到 {filteredSpreads.length} 个相关牌阵
            </p>
          )}
        </div>
      </motion.div>

    {/* 三张牌牌阵 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-xl font-decorative text-tarot-gray mb-4 text-center">三张牌</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSpreads.filter(spread => spread.category === '三张牌').map((spread) => (
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
              <p className="text-tarot-gray/60 font-crimson text-sm">{spread.description}</p>
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
              {filteredByCategory.map((spread) => (
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
                  <p className="text-tarot-gray/60 font-crimson text-sm">{spread.description}</p>
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
          <div className="text-tarot-gold/30 text-4xl mb-4">🎴</div>
          <p className="text-tarot-gray/50 font-crimson">请选择一个牌阵开始解读</p>
        </motion.div>
      )}
    </motion.div>
  );
}
