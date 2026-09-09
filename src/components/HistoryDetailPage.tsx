import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import { ReadingRecord, ReadingInput } from '../types';
import { cleanInterpretationForImage, parseInterpretation, getInterpretation } from '../services/aiService';
import { updateReadingRecordLocal, updateBackendReading } from '../services/historyService';
import { useAuthStore } from '../store/authStore';

interface HistoryDetailPageProps {
  record: ReadingRecord;
  onBack: () => void;
  onRecordUpdated?: (record: ReadingRecord) => void;
}

export function HistoryDetailPage({ record, onBack, onRecordUpdated }: HistoryDetailPageProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const readingRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);
  const [isCopying, setIsCopying] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // 重新解读相关状态：interpretation 用本地状态承载，重新解读成功后立即刷新页面
  const [interpretation, setInterpretation] = useState(record.interpretation);
  const [isReinterpreting, setIsReinterpreting] = useState(false);
  const [reinterpretError, setReinterpretError] = useState<string | undefined>(undefined);
  const [isFallback, setIsFallback] = useState(false);
  // 解读文本编辑状态
  const [isEditing, setIsEditing] = useState(false);
  const [editingText, setEditingText] = useState(record.interpretation);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const { isAuthenticated } = useAuthStore();

  const handleStartEdit = () => {
    setEditingText(interpretation);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingText(interpretation);
  };

  const handleFinishEdit = async () => {
    const newText = editingText.trim();
    if (!newText) {
      alert('解读内容不能为空');
      return;
    }

    setIsSavingEdit(true);
    try {
      setInterpretation(newText);
      setIsEditing(false);
      // 内容修改后，之前生成的长图已过期
      setGeneratedImage(null);
      canvasRef.current = null;

      // 回写本地与后端记录
      const updated: ReadingRecord = { ...record, interpretation: newText };
      updateReadingRecordLocal(updated);

      let finalRecord = updated;
      if (isAuthenticated) {
        const numId = parseInt(record.id, 10);
        if (!isNaN(numId)) {
          const backendRecord = await updateBackendReading(numId, {
            interpretation: newText,
            ...(record.spread ? { spread: record.spread } : {}),
          });
          if (backendRecord) finalRecord = backendRecord;
        }
      }
      onRecordUpdated?.(finalRecord);
    } catch (error) {
      console.error('Failed to save edited interpretation:', error);
      alert('保存失败，请稍后重试');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleReinterpret = async () => {
    setIsReinterpreting(true);
    setReinterpretError(undefined);
    try {
      const input: ReadingInput = {
        selectedCards: record.selectedCards,
        userContext: record.userContext,
        spread: record.spread,
        orderId: record.orderId,
        title: record.title,
        customerGender: record.customerGender,
        relatedOrderId: record.relatedOrderId,
        customerInfo: record.customerInfo,
        customerStatement: record.customerStatement,
        customerQuestion: record.customerQuestion,
      };

      const result = await getInterpretation(input);
      setInterpretation(result.content);
      setIsFallback(result.isFallback);
      setReinterpretError(result.errorMessage);
      // 内容更新后，之前生成的长图已过期
      setGeneratedImage(null);
      canvasRef.current = null;

      // 只有正式解读才回写记录；备用解读不落库，避免覆盖原有内容
      if (!result.isFallback) {
        const updated: ReadingRecord = { ...record, interpretation: result.content };
        updateReadingRecordLocal(updated);

        let finalRecord = updated;
        if (isAuthenticated) {
          const numId = parseInt(record.id, 10);
          if (!isNaN(numId)) {
            const backendRecord = await updateBackendReading(numId, {
              interpretation: result.content,
              ...(record.spread ? { spread: record.spread } : {}),
            });
            if (backendRecord) finalRecord = backendRecord;
          }
        }
        onRecordUpdated?.(finalRecord);
      }
    } catch (error) {
      console.error('Failed to reinterpret:', error);
      setReinterpretError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsReinterpreting(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!exportRef.current) return;
    
    setIsGenerating(true);
    
    try {
      const canvas = await html2canvas(exportRef.current, {
        backgroundColor: '#ffffff',
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
      });
      
      canvasRef.current = canvas;
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

  const handleCopyImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!navigator.clipboard || typeof ClipboardItem === 'undefined') {
      alert('当前浏览器不支持直接复制图片，请长按预览图保存，或使用「下载长图」按钮。');
      return;
    }

    setIsCopying(true);
    try {
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('图片生成失败');

      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);

      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy image:', error);
      alert('复制失败，您可以长按预览图直接保存，或使用「下载长图」按钮保存后发送。');
    } finally {
      setIsCopying(false);
    }
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

      {(isFallback || reinterpretError) && (
        <div className="mb-6 rounded-lg border border-amber-400/40 bg-amber-50 px-4 py-3 text-sm text-amber-900 shadow-sm">
          <div className="font-semibold mb-1">⚠️ 本次为备用解读（解读服务未响应）</div>
          {reinterpretError ? (
            <div className="text-amber-800/90 text-xs break-words">
              错误原因：{reinterpretError.slice(0, 200)}{reinterpretError.length > 200 ? '……' : ''}
            </div>
          ) : null}
          <div className="text-amber-800/80 mt-1 text-xs">
            请检查网络后点击下方「重新解读」按钮重试，即可获得正式解读。
          </div>
        </div>
      )}

      <div 
        ref={readingRef}
        className="relative bg-white rounded-xl border-2 border-tarot-gold/30 overflow-hidden shadow-lg"
        style={{ minHeight: '600px' }}
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%20100%20100%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Ccircle%20cx%3D%2250%22%20cy%3D%2250%22%20r%3D%2245%22%20fill%3D%22none%22%20stroke%3D%22%23d4af37%22%20stroke-width%3D%220.2%22%2F%3E%3Ccircle%20cx%3D%2250%22%20cy%3D%2250%22%20r%3D%2235%22%20fill%3D%22none%22%20stroke%3D%22%23d4af37%22%20stroke-width%3D%220.2%22%2F%3E%3Ccircle%20cx%3D%2250%22%20cy%3D%2250%22%20r%3D%2225%22%20fill%3D%22none%22%20stroke%3D%22%23d4af37%22%20stroke-width%3D%220.2%22%2F%3E%3C/svg%3E')] opacity-30"></div>
        
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-20">
          <div className="text-tarot-gold font-decorative text-sm opacity-80">
            塔罗解读
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
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-10 h-10 bg-tarot-gold/20 rounded-lg flex items-center justify-center">
                      <span className="text-tarot-gold font-decorative font-bold">
                        {index + 1}
                      </span>
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-tarot-gold font-decorative text-lg">
                          {selectedCard.card.nameCn}
                        </span>
                        <span className={`text-sm px-2 py-0.5 rounded-full ${
                          selectedCard.isReversed 
                            ? 'bg-red-100 text-red-600' 
                            : 'bg-green-100 text-green-600'
                        }`}>
                          {selectedCard.isReversed ? '逆位' : '正位'}
                        </span>
                      </div>
                      <div className="text-tarot-gray/70 font-crimson text-sm mt-1">
                        {selectedCard.positionMeaning}
                      </div>
                    </div>
                  </div>
                  <div className="text-tarot-gray/60 font-crimson text-sm pl-14">
                    {selectedCard.isReversed ? selectedCard.card.reversedMeaning : selectedCard.card.meaning}
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
            {record.customerInfo && (
              <div className="mt-4">
                <div className="text-tarot-gray/50 font-crimson text-xs mb-1">客户主体及客体信息</div>
                <div className="text-tarot-gray/80 font-crimson text-sm whitespace-pre-line bg-tarot-lightgray/30 rounded-lg p-3">
                  {record.customerInfo}
                </div>
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
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="text-tarot-gold font-decorative text-lg">
                ✧ 总结 ✧
              </div>
              {!isReinterpreting && !isEditing && interpretation && (
                <button
                  onClick={handleStartEdit}
                  className="text-xs px-3 py-1 rounded-full border border-tarot-gold/40 text-tarot-gold/80 hover:bg-tarot-gold/10 hover:text-tarot-gold transition-colors font-crimson"
                >
                  ✏️ 编辑解读
                </button>
              )}
            </div>
            {isReinterpreting ? (
              <div className="text-center py-10">
                <div className="relative w-16 h-16 mx-auto mb-4">
                  <div className="absolute inset-0 border-4 border-tarot-gold/20 rounded-full" />
                  <div className="absolute inset-0 border-4 border-tarot-gold/50 rounded-full animate-spin border-t-transparent" />
                </div>
                <p className="text-tarot-gray/70 font-crimson">正在重新解读，请稍候...</p>
              </div>
            ) : isEditing ? (
              <div>
                <textarea
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  className="w-full rounded-lg border-2 border-tarot-gold/40 bg-white p-4 text-tarot-gray font-crimson text-base leading-relaxed resize-y focus:outline-none focus:border-tarot-gold"
                  style={{ minHeight: '320px' }}
                  placeholder="可在此修改解读内容，生成长图时将使用修改后的内容"
                />
                <div className="flex flex-col md:flex-row gap-3 justify-center mt-4">
                  <button
                    onClick={handleFinishEdit}
                    disabled={isSavingEdit}
                    className="px-6 py-2.5 rounded-lg font-decorative bg-gradient-to-r from-tarot-gold to-yellow-500 text-white hover:shadow-lg hover:shadow-tarot-gold/30 transition-all disabled:opacity-50"
                  >
                    {isSavingEdit ? '保存中...' : '完成编辑'}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    disabled={isSavingEdit}
                    className="px-6 py-2.5 rounded-lg font-decorative bg-white border-2 border-tarot-gold/50 text-tarot-gray hover:border-tarot-gold hover:text-tarot-gold transition-all disabled:opacity-50"
                  >
                    取消
                  </button>
                </div>
                <p className="text-tarot-gray/50 font-crimson text-xs text-center mt-3">
                  修改完成后点击「完成编辑」，生成长图将使用修改后的内容
                </p>
              </div>
            ) : interpretation ? (
              <div className="text-tarot-gray font-crimson text-lg leading-relaxed whitespace-pre-line">
                {interpretation}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-tarot-gray/60 font-crimson mb-4">
                  这条记录还没有解读内容（可能是草稿或上次解读失败）
                </p>
                <button
                  onClick={handleReinterpret}
                  className="px-8 py-3 rounded-lg font-decorative bg-gradient-to-r from-tarot-gold to-yellow-500 text-white hover:shadow-lg hover:shadow-tarot-gold/30 transition-all"
                >
                  立即解读
                </button>
              </div>
            )}
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
            神秘塔罗 · 智慧解读
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
          onClick={handleReinterpret}
          disabled={isReinterpreting || isEditing || isSavingEdit || !record.selectedCards.length}
          className="px-8 py-3 rounded-lg font-decorative bg-gradient-to-r from-tarot-gold to-yellow-500 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-tarot-gold/30 transition-all"
        >
          {isReinterpreting ? '重新解读中...' : '重新解读'}
        </button>

        <button
          onClick={handleGenerateImage}
          disabled={isGenerating || isReinterpreting || isEditing || isSavingEdit || !interpretation}
          className="px-8 py-3 rounded-lg font-decorative bg-white border-2 border-tarot-gold/50 text-tarot-gray hover:border-tarot-gold hover:text-tarot-gold transition-all disabled:opacity-50"
        >
          {isGenerating ? '生成中...' : '生成长图'}
        </button>
        
        <button
          onClick={handleDownload}
          disabled={!generatedImage}
          className="px-8 py-3 rounded-lg font-decorative bg-white border-2 border-tarot-gold/50 text-tarot-gray hover:border-tarot-gold hover:text-tarot-gold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          下载长图
        </button>

        <button
          onClick={handleCopyImage}
          disabled={!generatedImage || isCopying}
          className="px-8 py-3 rounded-lg font-decorative bg-white border-2 border-tarot-gold/50 text-tarot-gray hover:border-tarot-gold hover:text-tarot-gold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCopying ? '复制中...' : copySuccess ? '已复制 ✓' : '复制图片'}
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

      {/* 长图导出模板 - 上部牌阵实拍照片 + 下部解读文字，备忘录风格 */}
      <div
        ref={exportRef}
        style={{ position: 'absolute', left: '-9999px', top: 0, width: '600px' }}
      >
        <div style={{ background: '#fcfbf7', padding: '56px 44px 48px', fontFamily: '"Noto Serif SC", "Songti SC", "SimSun", "Georgia", serif' }}>
          {record.uploadedImage && (
            <div style={{ marginBottom: '32px' }}>
              <img
                src={record.uploadedImage}
                alt="牌阵实拍"
                style={{ width: '100%', display: 'block', borderRadius: '8px', border: '1px solid #ece7db' }}
              />
            </div>
          )}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ fontSize: '32px', color: '#2c2c2c', fontWeight: 600, letterSpacing: '2px' }}>
              {record.spread?.name || '塔罗解读'}
            </div>
          </div>
          <div style={{ width: '40px', height: '2px', background: '#d4af37', margin: '0 auto 36px' }} />
          {parseInterpretation(interpretation).length > 0 ? (
            parseInterpretation(interpretation).map((block, i) => {
              const bodyStyle: React.CSSProperties = {
                fontSize: '24px',
                lineHeight: 1.85,
                color: '#3a3a3a',
                whiteSpace: 'pre-line',
                textAlign: 'justify',
                letterSpacing: '0.5px',
              };
              if (block.type === 'card') {
                const card = record.selectedCards[block.cardIndex];
                const cardTitle = card
                  ? `第${block.cardIndex + 1}张牌，${card.card.nameCn}`
                  : `第${block.cardIndex + 1}张牌`;
                return (
                  <div key={i} style={{ marginBottom: '34px' }}>
                    <div style={{ fontSize: '26px', fontWeight: 600, color: '#2c2c2c', marginBottom: '14px', letterSpacing: '1px' }}>
                      {cardTitle}
                    </div>
                    <div style={bodyStyle}>{block.body}</div>
                  </div>
                );
              }
              return (
                <div key={i} style={{ ...bodyStyle, marginBottom: '34px' }}>
                  {block.body}
                </div>
              );
            })
          ) : (
            <div style={{ fontSize: '24px', lineHeight: 1.85, color: '#3a3a3a', whiteSpace: 'pre-line', textAlign: 'justify', letterSpacing: '0.5px' }}>
              {cleanInterpretationForImage(interpretation, record.spread?.name)}
            </div>
          )}
          <div style={{ marginTop: '44px', paddingTop: '20px', borderTop: '1px solid #f0f0f0', textAlign: 'center' }}>
            <div style={{ fontSize: '15px', color: '#999999', letterSpacing: '0.5px', lineHeight: 1.8 }}>
              塔罗只是一面镜子，帮你看清当下的能量与倾向，真正需要书写答案的依然是你自己。愿你带着清晰与勇气，一步一步走向自己真正想要的方向。
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
