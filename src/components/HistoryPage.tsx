import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ReadingRecord } from '../types';
import {
  getReadingHistory,
  deleteReadingRecord,
  clearReadingHistory,
  fetchReadingHistory,
  deleteBackendReading,
  searchReadingByOrderId,
} from '../services/historyService';
import { useAuthStore } from '../store/authStore';

interface HistoryPageProps {
  onBack: () => void;
  onViewDetail: (record: ReadingRecord) => void;
  onNewReading: () => void;
}

export function HistoryPage({ onBack, onViewDetail, onNewReading }: HistoryPageProps) {
  const [records, setRecords] = useState<ReadingRecord[]>([]);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchOrderId, setSearchOrderId] = useState('');
  const [searchResult, setSearchResult] = useState<ReadingRecord | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const { isAuthenticated } = useAuthStore();

  const loadRecords = async () => {
    setIsLoading(true);
    if (isAuthenticated) {
      const data = await fetchReadingHistory();
      if (data) {
        const mapped: ReadingRecord[] = data.readings.map((r) => ({
          id: String(r.id),
          selectedCards: JSON.parse(r.cards),
          interpretation: r.interpretation,
          userContext: r.user_context || '',
          createdAt: r.created_at,
          orderId: r.order_id,
        }));
        setRecords(mapped);
      } else {
        setRecords([]);
      }
    } else {
      setRecords(getReadingHistory());
    }
    setIsLoading(false);
  };

  const handleSearchByOrderId = async () => {
    if (!searchOrderId.trim()) {
      setSearchResult(null);
      return;
    }
    setIsSearching(true);
    const result = await searchReadingByOrderId(searchOrderId.trim());
    setSearchResult(result);
    setIsSearching(false);
  };

  const handleClearSearch = () => {
    setSearchOrderId('');
    setSearchResult(null);
  };

  useEffect(() => {
    loadRecords();
  }, [isAuthenticated]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isAuthenticated) {
      const numId = parseInt(id, 10);
      if (!isNaN(numId)) {
        await deleteBackendReading(numId);
      }
    } else {
      deleteReadingRecord(id);
    }
    await loadRecords();
  };

  const handleClearAll = async () => {
    if (isAuthenticated) {
      // Backend doesn't support bulk delete; delete individually
      for (const record of records) {
        const numId = parseInt(record.id, 10);
        if (!isNaN(numId)) {
          await deleteBackendReading(numId);
        }
      }
    } else {
      clearReadingHistory();
    }
    setRecords([]);
    setShowClearConfirm(false);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto px-4"
    >
      <div className="text-center mb-8">
        <motion.h1
          className="text-3xl md:text-4xl font-decorative text-tarot-gray mb-2"
          animate={{ opacity: [0, 1], scale: [0.9, 1] }}
          transition={{ duration: 0.8 }}
        >
          历史解读记录
        </motion.h1>
        <p className="text-tarot-gray/70 font-crimson">
          共 {records.length} 条记录
          {!isAuthenticated && '（本地存储）'}
        </p>
      </div>

      {/* 订单号搜索 */}
      <div className="bg-white rounded-xl p-4 mb-6 border border-tarot-gold/20 shadow-sm">
        <div className="flex gap-3">
          <input
            type="text"
            value={searchOrderId}
            onChange={(e) => setSearchOrderId(e.target.value)}
            placeholder="输入订单号搜索..."
            className="flex-1 bg-tarot-lightgray/30 border-2 border-tarot-gold/30 rounded-lg px-4 py-2 text-tarot-gray font-crimson placeholder:text-tarot-gray/40 focus:border-tarot-gold focus:outline-none transition-colors"
          />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSearchByOrderId}
            disabled={isSearching}
            className="px-6 py-2 rounded-lg font-crimson bg-tarot-gold text-white hover:shadow-lg hover:shadow-tarot-gold/30 transition-all disabled:opacity-50"
          >
            {isSearching ? '搜索中...' : '搜索'}
          </motion.button>
          {searchOrderId && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleClearSearch}
              className="px-4 py-2 rounded-lg font-crimson border-2 border-tarot-gold/30 text-tarot-gray hover:border-tarot-gold transition-colors"
            >
              清除
            </motion.button>
          )}
        </div>
      </div>

      {/* 搜索结果 */}
      <AnimatePresence>
        {searchResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-tarot-gold/10 rounded-xl p-6 mb-6 border-2 border-tarot-gold"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-decorative text-tarot-gold">搜索结果</h3>
              <span className="text-tarot-gold/60 font-crimson text-sm">
                订单号: {searchResult.orderId}
              </span>
            </div>
            <div
              onClick={() => onViewDetail(searchResult)}
              className="cursor-pointer"
            >
              <p className="text-tarot-gray/70 font-crimson text-sm mb-2">
                {formatDate(searchResult.createdAt)}
              </p>
              <p className="text-tarot-gray/60 font-crimson line-clamp-2">
                {searchResult.interpretation.substring(0, 100)}...
              </p>
              <div className="mt-3 text-tarot-gold font-crimson text-sm flex items-center gap-1">
                查看详情
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </motion.div>
        )}
        {searchOrderId && !searchResult && !isSearching && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-4 mb-6 text-tarot-gray/50 font-crimson"
          >
            未找到订单号为 "{searchOrderId}" 的记录
          </motion.div>
        )}
      </AnimatePresence>

      {/* 新建解读按钮 */}
      <div className="flex justify-center mb-6">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onNewReading}
          className="px-8 py-3 rounded-xl font-decorative bg-gradient-to-r from-tarot-gold to-yellow-500 text-white hover:shadow-lg hover:shadow-tarot-gold/30 transition-all"
        >
          新建解读
        </motion.button>
      </div>

      {records.length > 0 && (
        <div className="flex justify-end mb-6">
          <button
            onClick={() => setShowClearConfirm(true)}
            className="text-red-500 hover:text-red-700 font-crimson text-sm transition-colors"
          >
            清空全部记录
          </button>
        </div>
      )}

      <AnimatePresence>
        {showClearConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowClearConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-sm mx-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-decorative text-tarot-gray mb-4">确认清空</h3>
              <p className="text-tarot-gray/70 font-crimson mb-6">
                确定要清空所有历史记录吗？此操作不可撤销。
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 py-2 rounded-lg font-crimson border-2 border-tarot-gold/30 text-tarot-gray hover:border-tarot-gold transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleClearAll}
                  className="flex-1 py-2 rounded-lg font-crimson bg-red-500 text-white hover:bg-red-600 transition-colors"
                >
                  确认清空
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="text-center py-20">
          <motion.div
            className="w-12 h-12 border-4 border-tarot-gold/20 border-t-tarot-gold rounded-full mx-auto"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <p className="text-tarot-gray/50 font-crimson mt-4">加载中...</p>
        </div>
      ) : records.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <div className="text-tarot-gold/30 text-6xl mb-4">📜</div>
          <p className="text-tarot-gray/50 font-crimson mb-6">暂无历史记录</p>
          <button
            onClick={onNewReading}
            className="px-6 py-2 rounded-lg font-decorative bg-gradient-to-r from-tarot-gold to-yellow-500 text-white hover:shadow-lg hover:shadow-tarot-gold/30 transition-all"
          >
            开始第一次解读
          </button>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {records.map((record, index) => (
            <motion.div
              key={record.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.01 }}
              onClick={() => onViewDetail(record)}
              className="bg-white rounded-xl p-6 border border-tarot-gold/20 shadow-sm hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-decorative text-tarot-gray group-hover:text-tarot-gold transition-colors">
                    {record.spread?.name || '塔罗解读'}
                  </h3>
                  <p className="text-tarot-gray/50 font-crimson text-sm">
                    {formatDate(record.createdAt)}
                  </p>
                  {record.orderId && (
                    <p className="text-tarot-gold/60 font-crimson text-xs mt-1">
                      订单号: {record.orderId}
                    </p>
                  )}
                </div>
                <button
                  onClick={(e) => handleDelete(record.id, e)}
                  className="text-tarot-gray/30 hover:text-red-500 transition-colors p-2"
                  title="删除记录"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              
              <div className="flex items-center gap-2 mb-3">
                {record.selectedCards.slice(0, 5).map((sc) => (
                  <div
                    key={sc.card.id}
                    className="text-xs text-tarot-gray/60 bg-tarot-lightgray/30 px-2 py-1 rounded"
                  >
                    {sc.card.nameCn}
                  </div>
                ))}
                {record.selectedCards.length > 5 && (
                  <div className="text-xs text-tarot-gray/40">
                    +{record.selectedCards.length - 5}
                  </div>
                )}
              </div>

              <p className="text-tarot-gray/60 font-crimson text-sm line-clamp-2">
                {record.interpretation.substring(0, 100)}...
              </p>

              <div className="mt-3 text-tarot-gold/60 font-crimson text-sm flex items-center gap-1">
                查看详情
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
