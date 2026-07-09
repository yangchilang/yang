import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import { ReadingRecord } from '../types';
import { TarotCard } from './TarotCard';

interface HistoryDetailPageProps {
  record: ReadingRecord;
  onBack: () => void;
}

export function HistoryDetailPage({ record, onBack }: HistoryDetailPageProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const readingRef = useRef<HTMLDivElement>(null);

  const handleGenerateImage = async () => {
    if (!readingRef.current) return;
    
    setIsGenerating(true);
    
    try {
      const canvas = await html2canvas(readingRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });
      
      const imageData = canvas.toDataURL('image/png');
      setGeneratedImage(imageData);
    } catch (error) {
      console.error('Failed to generate image:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    
    const link = document.createElement('a');
    link.download = `tarot-reading-${record.id}.png`;
    link.href = generatedImage;
    link.click();
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-4xl mx-auto px-4"
    >
      <div className="relative mb-8">
        <button
          onClick={onBack}
          className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-2 text-tarot-gray hover:text-tarot-gold transition-colors font-crimson"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回
        </button>
        <div className="text-center">
          <motion.h1
            className="text-3xl md:text-4xl font-decorative text-tarot-gray mb-2"
            animate={{ opacity: [0, 1], scale: [0.9, 1] }}
            transition={{ duration: 0.8 }}
          >
            {record.spread?.name || '塔罗解读结果'}
          </motion.h1>
          <p className="text-tarot-gray/70 font-crimson">
            {formatDate(record.createdAt)}
          </p>
        </div>
      </div>

      <div 
        ref={readingRef}
        className="relative bg-white rounded-xl border-2 border-tarot-gold/30 overflow-hidden shadow-lg"
        style={{ minHeight: '600px' }}
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%20100%20100%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Ccircle%20cx%3D%2250%22%20cy%3D%2250%22%20r%3D%2245%22%20fill%3D%22none%22%20stroke%3D%22%23d4af37%22%20stroke-width%3D%220.2%22%2F%3E%3Ccircle%20cx%3D%2250%22%20cy%3D%2250%22%20r%3D%2235%22%20fill%3D%22none%22%20stroke%3D%22%23d4af37%22%20stroke-width%3D%220.2%22%2F%3E%3Ccircle%20cx%3D%2250%22%20cy%3D%2250%22%20r%3D%2225%22%20fill%3D%22none%22%20stroke%3D%22%23d4af37%22%20stroke-width%3D%220.2%22%2F%3E%3C/svg%3E')] opacity-30"></div>
        
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-20">
          <div className="text-tarot-gold font-decorative text-sm opacity-80">
            AI 塔罗解读
          </div>
          <div className="text-tarot-gray/60 font-crimson text-xs">
            {formatDate(record.createdAt)}
          </div>
        </div>

        <div className="relative z-10 p-8">
          {record.uploadedImage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <div className="relative rounded-lg overflow-hidden border-2 border-tarot-gold/30 shadow-md">
                <div className="flex justify-center bg-tarot-lightgray/20">
                  <img 
                    src={record.uploadedImage} 
                    alt="牌阵照片"
                    className="max-w-full h-auto object-contain"
                    style={{ maxHeight: '500px' }}
                  />
                </div>
                <div className="absolute bottom-3 left-0 right-0 text-center">
                  <div className="inline-block text-tarot-gold font-decorative text-sm bg-black/30 px-4 py-1.5 rounded-full">
                    ✧ 牌阵实拍 ✧
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <div className="text-tarot-gold font-decorative text-xl mb-6 text-center">
              ✧ 牌卡解读 ✧
            </div>
            <div className="space-y-6">
              {record.selectedCards.map((selectedCard, index) => (
                <motion.div
                  key={selectedCard.position}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="bg-tarot-lightgray/20 rounded-lg p-4 border border-tarot-gold/15"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <TarotCard
                        card={selectedCard.card}
                        isReversed={selectedCard.isReversed}
                        size="small"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-tarot-gold font-decorative text-lg">
                          第 {selectedCard.position} 张
                        </span>
                        <span className="text-tarot-gray font-decorative">
                          {selectedCard.card.nameCn}
                        </span>
                        <span className={`text-sm ${selectedCard.isReversed ? 'text-red-500' : 'text-tarot-gray/60'}`}>
                          {selectedCard.isReversed ? '逆位' : '正位'}
                        </span>
                      </div>
                      <div className="text-tarot-gray/70 font-crimson text-sm mb-2">
                        位置含义：{selectedCard.positionMeaning}
                      </div>
                      <div className="text-tarot-gray/60 text-xs font-crimson">
                        元素：{selectedCard.card.element} · {selectedCard.card.zodiac}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-tarot-darkblue/30 rounded-lg p-6 border border-tarot-gold/15 mb-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="text-tarot-gold">🌙</span>
              <span className="text-tarot-gold font-decorative text-lg">客户信息</span>
            </div>
            {record.orderId && (
              <div className="text-tarot-gray/80 font-crimson text-sm mb-2">
                <span className="text-tarot-gray/50">订单号：</span>{record.orderId}
              </div>
            )}
            {record.customerGender && (
              <div className="text-tarot-gray/80 font-crimson text-sm mb-2">
                <span className="text-tarot-gray/50">性别：</span>{record.customerGender}
              </div>
            )}
            {record.divinerAge && (
              <div className="text-tarot-gray/80 font-crimson text-sm mb-2">
                <span className="text-tarot-gray/50">占卜者年龄：</span>{record.divinerAge}
              </div>
            )}
            {record.partnerAge && (
              <div className="text-tarot-gray/80 font-crimson text-sm mb-2">
                <span className="text-tarot-gray/50">对方年龄：</span>{record.partnerAge}
              </div>
            )}
            {record.relationship && (
              <div className="text-tarot-gray/80 font-crimson text-sm mb-2">
                <span className="text-tarot-gray/50">关系：</span>{record.relationship}
              </div>
            )}
            {record.isContacting !== undefined && (
              <div className="text-tarot-gray/80 font-crimson text-sm mb-2">
                <span className="text-tarot-gray/50">是否联系：</span>{record.isContacting ? '是' : '否'}
              </div>
            )}
            {record.customerStatement && (
              <div className="mt-4">
                <div className="text-tarot-gray/50 font-crimson text-xs mb-1">客户自述</div>
                <div className="text-tarot-gray/80 font-crimson text-sm">{record.customerStatement}</div>
              </div>
            )}
            {record.customerQuestion && (
              <div className="mt-4">
                <div className="text-tarot-gray/50 font-crimson text-xs mb-1">客户问题</div>
                <div className="text-tarot-gray/80 font-crimson text-sm">{record.customerQuestion}</div>
              </div>
            )}
            {record.relatedOrderId && (
              <div className="text-tarot-gray/80 font-crimson text-sm mt-4 pt-4 border-t border-tarot-gold/10">
                <span className="text-tarot-gray/50">关联订单：</span>{record.relatedOrderId}
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-tarot-gold/5 rounded-lg p-6 border border-tarot-gold/20 mb-8"
          >
            <div className="text-tarot-gold font-decorative text-lg mb-4 text-center">
              ✧ 总结 ✧
            </div>
            <div className="text-tarot-gray font-crimson text-lg leading-relaxed whitespace-pre-line">
              {record.interpretation}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-r from-tarot-gold/10 via-purple-50/50 to-tarot-gold/10 rounded-lg p-6 border border-tarot-gold/20"
          >
            <div className="text-tarot-gold font-decorative text-center mb-3">
              ✧ 温馨提示 ✧
            </div>
            <p className="text-tarot-gray/80 font-crimson text-base leading-relaxed text-center">
              塔罗只是一面镜子，帮你看清当下的能量与倾向，真正需要书写答案的依然是你自己。愿你带着清晰与勇气，一步一步走向自己真正想要的方向。
            </p>
          </motion.div>
        </div>

        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
          <div className="text-tarot-gold/50 font-decorative text-xs">
            ✦ ★ ✦
          </div>
          <div className="text-tarot-gold/50 font-decorative text-xs">
            神秘塔罗 · AI 解读
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mt-8 flex flex-col md:flex-row gap-4 justify-center"
      >
        <button
          onClick={handleGenerateImage}
          disabled={isGenerating}
          className="px-8 py-3 rounded-lg font-decorative bg-white border-2 border-tarot-gold/50 text-tarot-gray hover:border-tarot-gold hover:text-tarot-gold transition-all disabled:opacity-50"
        >
          {isGenerating ? '生成中...' : '生成长图'}
        </button>
        
        <button
          onClick={handleDownload}
          disabled={!generatedImage}
          className="px-8 py-3 rounded-lg font-decorative bg-gradient-to-r from-tarot-gold to-yellow-500 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-tarot-gold/30 transition-all"
        >
          下载长图
        </button>
      </motion.div>

      {generatedImage && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-8 text-center"
        >
          <div className="text-tarot-gray font-decorative mb-4">预览</div>
          <img
            src={generatedImage}
            alt="塔罗解读结果"
            className="max-w-full h-auto rounded-lg border-2 border-tarot-gold/30 shadow-xl"
          />
        </motion.div>
      )}
    </motion.div>
  );
}
