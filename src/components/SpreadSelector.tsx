import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { spreadsByCategory, spreads, threeCardSpreads } from '../data/spreads';
import { listCustomSpreads, deleteCustomSpread } from '../services/customSpreadService';
import { Spread } from '../types';

interface SpreadSelectorProps {
  onSelectSpread: (spread: Spread) => void;
}

export function SpreadSelector({ onSelectSpread }: SpreadSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [customSpreads, setCustomSpreads] = useState<Spread[]>([]);

  useEffect(() => {
    setCustomSpreads(listCustomSpreads());
  }, []);

  const categories = [
    ...Object.keys(spreadsByCategory),
    ...(customSpreads.length > 0 ? ['自定义'] : []),
  ];

  const handleSelectSpread = (spread: Spread) => {
    onSelectSpread(spread);
  };

  const handleCreateCustomSpread = () => {
    const customSpread: Spread = {
      id: 'custom-spread',
      name: '自定义牌阵',
      description: '自定义牌位含义的牌阵',
      category: '自定义',
      positions: []
    };
    onSelectSpread(customSpread);
  };

  const handleDeleteCustomSpread = (id: string) => {
    if (!window.confirm('确定删除这个自定义牌阵吗？')) return;
    const remaining = deleteCustomSpread(id);
    setCustomSpreads(remaining);
    if (remaining.length === 0) setSelectedCategory(null);
  };

  const filteredSpreads = spreads.filter(spread =>
    spread.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    spread.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    spread.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredByCategory = selectedCategory
    ? selectedCategory === '自定义'
      ? customSpreads
      : filteredSpreads.filter(spread => spread.category === selectedCategory)
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
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleCreateCustomSpread}
          className="w-full py-6 rounded-xl bg-gradient-to-r from-tarot-gold/20 to-yellow-50 border-2 border-tarot-gold/40 hover:border-tarot-gold transition-all"
        >
          <span className="text-xl font-decorative text-tarot-gray">创建自定义牌阵</span>
          <p className="text-tarot-gray/60 font-crimson text-sm mt-2">自定义牌位含义，进入后添加卡牌</p>
        </motion.button>
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

    {/* 三张牌基础牌阵 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-xl font-decorative text-tarot-gray mb-4 text-center">三张牌基础牌阵</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {threeCardSpreads.map((spread) => (
            <motion.div
              key={spread.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelectSpread(spread)}
              className="cursor-pointer rounded-xl p-6 bg-gradient-to-br from-tarot-gold/20 to-yellow-50 border-2 border-tarot-gold/40 hover:border-tarot-gold transition-all"
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
        <h2 className="text-xl font-decorative text-tarot-gray mb-4 text-center">选择牌阵类别</h2>
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
                  className="cursor-pointer rounded-xl p-6 bg-white border-2 border-tarot-gold/20 hover:border-tarot-gold/50 transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-decorative text-tarot-gray">{spread.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-tarot-gold font-crimson text-sm bg-tarot-gold/10 px-2 py-1 rounded">
                        {spread.positions.length}张牌
                      </span>
                      {selectedCategory === '自定义' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCustomSpread(spread.id);
                          }}
                          className="text-tarot-gray/40 hover:text-red-500 transition-colors"
                          title="删除此牌阵"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-tarot-gray/60 font-crimson text-sm">{spread.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 提示 */}
      {!selectedCategory && (
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
