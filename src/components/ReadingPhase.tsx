import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import html2canvas from 'html2canvas';
import { SelectedCard, Spread } from '../types';
import { cleanInterpretationForImage, parseInterpretation } from '../services/aiService';

interface ReadingPhaseProps {
  selectedCards: SelectedCard[];
  interpretation: string;
  spread?: Spread;
  onContinue: () => void;
  onGoBack: () => void;
  onSave?: (uploadedImage?: string) => void | Promise<void>;
  isFallback?: boolean;
  errorMessage?: string;
}

export function ReadingPhase({ selectedCards, interpretation, spread, onContinue, onGoBack, onSave, isFallback, errorMessage }: ReadingPhaseProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const readingRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);
  const [showDownload, setShowDownload] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowDownload(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // 上传/更换照片后，之前生成的长图已过期，清空后需重新生成
  useEffect(() => {
    setGeneratedImage(null);
    canvasRef.current = null;
  }, [uploadedImage]);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('请上传图片文件');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const imgData = event.target?.result as string;
      setUploadedImage(imgData);
      if (onSave) {
        onSave(imgData);
      }
    };
    reader.readAsDataURL(file);
  }, [onSave]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('请上传图片文件');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const imgData = event.target?.result as string;
      setUploadedImage(imgData);
      if (onSave) {
        onSave(imgData);
      }
    };
    reader.readAsDataURL(file);
  }, [onSave]);

  const handleGenerateImage = async () => {
    if (!exportRef.current) return;
    
    setIsGenerating(true);
    
    try {
      const canvas = await html2canvas(exportRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
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
    link.download = `tarot-reading-${Date.now()}.png`;
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-4xl mx-auto px-4"
    >
      <div className="relative mb-8">
        <button
          onClick={onGoBack}
          className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-2 text-tarot-gray hover:text-tarot-gold transition-colors font-crimson"
          style={{ zIndex: 100 }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回
        </button>
        <div className="text-center">
          <motion.h1
            className="text-4xl md:text-5xl font-decorative text-tarot-gray mb-2"
            animate={{ opacity: [0, 1], scale: [0.9, 1] }}
            transition={{ duration: 0.8 }}
          >
            {spread?.name || '塔罗解读结果'}
          </motion.h1>
          <p className="text-tarot-gray/70 font-crimson text-lg">
            宇宙的智慧在此揭示...
          </p>
        </div>
      </div>

      {isFallback && (
        <div className="mb-6 mx-auto max-w-3xl rounded-lg border border-amber-400/40 bg-amber-50 px-4 py-3 text-sm text-amber-900 shadow-sm">
          <div className="font-semibold mb-1">⚠️ 本次解读为备用解读（解读服务未响应）</div>
          {errorMessage ? (
            <div className="text-amber-800/90 text-xs break-words">
              错误原因：{errorMessage.slice(0, 200)}{errorMessage.length > 200 ? '……' : ''}
            </div>
          ) : null}
          <div className="text-amber-800/80 mt-1 text-xs">
            请检查网络与密钥配置，或稍后重试即可获得正式解读。
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
            {new Date().toLocaleDateString('zh-CN')}
          </div>
        </div>

        <div className="relative z-10 p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            {uploadedImage ? (
              <div className="relative rounded-lg overflow-hidden border-2 border-tarot-gold/30 shadow-md">
                <div className="flex justify-center bg-tarot-lightgray/20">
                  <img 
                    src={uploadedImage} 
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
            ) : (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative rounded-lg border-2 border-dashed transition-all cursor-pointer ${
                  isDragging 
                    ? 'border-tarot-gold bg-tarot-gold/10' 
                    : 'border-tarot-gold/40 bg-tarot-lightgray/10 hover:border-tarot-gold/60 hover:bg-tarot-gold/5'
                }`}
                style={{ minHeight: '200px' }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <div className="flex flex-col items-center justify-center h-full py-8">
                  <div className="text-tarot-gold text-4xl mb-4">🖼️</div>
                  <div className="text-tarot-gray font-decorative mb-2">上传牌阵照片</div>
                  <div className="text-tarot-gray/60 font-crimson text-sm">
                    拖拽图片到此处，或点击上传
                  </div>
                  <div className="text-tarot-gray/40 font-crimson text-xs mt-2">
                    支持 JPG、PNG 格式
                  </div>
                </div>
              </div>
            )}
          </motion.div>

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
              {selectedCards.map((selectedCard, index) => (
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
            transition={{ delay: 0.5 }}
            className="bg-tarot-gold/5 rounded-lg p-6 border border-tarot-gold/20 mb-8"
          >
            <div className="text-tarot-gold font-decorative text-lg mb-4 text-center">
              ✧ 总结 ✧
            </div>
            <div className="text-tarot-gray font-crimson text-lg leading-relaxed whitespace-pre-line">
              {interpretation}
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
            神秘塔罗 · 智慧解读
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showDownload && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
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

            <button
              onClick={handleCopyImage}
              disabled={!generatedImage || isCopying}
              className="px-8 py-3 rounded-lg font-decorative bg-white border-2 border-tarot-gold/50 text-tarot-gray hover:border-tarot-gold hover:text-tarot-gold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCopying ? '复制中...' : copySuccess ? '已复制 ✓' : '复制图片'}
            </button>
            
            <button
              onClick={onContinue}
              className="px-8 py-3 rounded-lg font-decorative bg-white border-2 border-tarot-gold/50 text-tarot-gray hover:border-tarot-gold hover:text-tarot-gold transition-all"
            >
              继续解读
            </button>
          </motion.div>
        )}
      </AnimatePresence>

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
        <div style={{ background: '#fcfbf7', padding: '48px 36px 40px', fontFamily: '"Noto Serif SC", "Songti SC", "SimSun", "Georgia", serif' }}>
          {uploadedImage && (
            <div style={{ marginBottom: '28px' }}>
              <img
                src={uploadedImage}
                alt="牌阵实拍"
                style={{ width: '100%', display: 'block', borderRadius: '8px', border: '1px solid #ece7db' }}
              />
            </div>
          )}
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div style={{ fontSize: '22px', color: '#2c2c2c', fontWeight: 500, letterSpacing: '1px' }}>
              {spread?.name || '塔罗解读'}
            </div>
          </div>
          <div style={{ width: '32px', height: '2px', background: '#d4af37', margin: '0 auto 28px' }} />
          {parseInterpretation(interpretation).length > 0 ? (
            parseInterpretation(interpretation).map((block, i) => {
              const bodyStyle: React.CSSProperties = {
                fontSize: '16px',
                lineHeight: 1.9,
                color: '#3a3a3a',
                whiteSpace: 'pre-line',
                textAlign: 'justify',
                letterSpacing: '0.3px',
              };
              if (block.type === 'card') {
                const card = selectedCards[block.cardIndex];
                const cardTitle = card
                  ? `第${block.cardIndex + 1}张牌，${card.card.nameCn}`
                  : `第${block.cardIndex + 1}张牌`;
                return (
                  <div key={i} style={{ marginBottom: '26px' }}>
                    <div style={{ fontSize: '17px', fontWeight: 600, color: '#2c2c2c', marginBottom: '10px', letterSpacing: '0.5px' }}>
                      {cardTitle}
                    </div>
                    <div style={bodyStyle}>{block.body}</div>
                  </div>
                );
              }
              return (
                <div key={i} style={{ ...bodyStyle, marginBottom: '26px' }}>
                  {block.body}
                </div>
              );
            })
          ) : (
            <div style={{ fontSize: '16px', lineHeight: '1.9', color: '#3a3a3a', whiteSpace: 'pre-line', textAlign: 'justify', letterSpacing: '0.3px' }}>
              {cleanInterpretationForImage(interpretation, spread?.name)}
            </div>
          )}
          <div style={{ marginTop: '36px', paddingTop: '16px', borderTop: '1px solid #f0f0f0', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: '#999999', letterSpacing: '0.3px', lineHeight: '1.7' }}>
              塔罗只是一面镜子，帮你看清当下的能量与倾向，真正需要书写答案的依然是你自己。愿你带着清晰与勇气，一步一步走向自己真正想要的方向。
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
