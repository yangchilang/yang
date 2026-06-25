import { motion } from 'framer-motion';
import { Card } from '../types';

interface TarotCardProps {
  card: Card;
  isReversed?: boolean;
  onClick?: () => void;
  size?: 'small' | 'medium' | 'large';
  selected?: boolean;
}

const sizeClasses = {
  small: 'w-20 h-32',
  medium: 'w-32 h-48',
  large: 'w-40 h-60'
};

const tarotArtStyles = [
  {
    bg: 'from-amber-900 via-yellow-900 to-orange-950',
    accent1: '#DAA520',
    accent2: '#B8860B',
    accent3: '#FFD700',
    glow: 'rgba(218, 165, 32, 0.4)',
    bgPattern: 'celestial'
  },
  {
    bg: 'from-slate-900 via-gray-900 to-zinc-950',
    accent1: '#C0C0C0',
    accent2: '#A8A8A8',
    accent3: '#E8E8E8',
    glow: 'rgba(192, 192, 192, 0.4)',
    bgPattern: 'classical'
  },
  {
    bg: 'from-purple-950 via-violet-900 to-indigo-950',
    accent1: '#9370DB',
    accent2: '#8A2BE2',
    accent3: '#DA70D6',
    glow: 'rgba(147, 112, 219, 0.4)',
    bgPattern: 'mystical'
  },
  {
    bg: 'from-emerald-950 via-teal-900 to-cyan-950',
    accent1: '#00CED1',
    accent2: '#20B2AA',
    accent3: '#40E0D0',
    glow: 'rgba(0, 206, 209, 0.4)',
    bgPattern: 'nature'
  },
  {
    bg: 'from-rose-950 via-red-900 to-orange-950',
    accent1: '#FF6347',
    accent2: '#FF4500',
    accent3: '#FFA07A',
    glow: 'rgba(255, 99, 71, 0.4)',
    bgPattern: 'fire'
  },
  {
    bg: 'from-blue-950 via-indigo-900 to-purple-950',
    accent1: '#4169E1',
    accent2: '#6495ED',
    accent3: '#87CEEB',
    glow: 'rgba(65, 105, 225, 0.4)',
    bgPattern: 'cosmic'
  }
];

function DetailedIllustration({ cardId, pattern }: { cardId: number; pattern: string }) {
  const style = tarotArtStyles[cardId % tarotArtStyles.length];
  
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full absolute inset-0" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id={`mainGlow-${cardId}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={style.accent1} stopOpacity="0.5"/>
          <stop offset="50%" stopColor={style.accent2} stopOpacity="0.3"/>
          <stop offset="100%" stopColor={style.accent3} stopOpacity="0"/>
        </radialGradient>
        <linearGradient id={`frameGrad-${cardId}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={style.accent1} stopOpacity="0.9"/>
          <stop offset="50%" stopColor={style.accent2} stopOpacity="0.7"/>
          <stop offset="100%" stopColor={style.accent3} stopOpacity="0.9"/>
        </linearGradient>
        <filter id={`glow-${cardId}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <pattern id={`texture-${cardId}`} patternUnits="userSpaceOnUse" width="4" height="4">
          <rect width="4" height="4" fill="transparent"/>
          <circle cx="2" cy="2" r="0.5" fill={style.accent1} opacity="0.1"/>
        </pattern>
      </defs>
      
      <rect width="100" height="100" fill={`url(#texture-${cardId})`}/>
      <circle cx="50" cy="50" r="48" fill={`url(#mainGlow-${cardId})`} opacity="0.6"/>
      
      {pattern === 'celestial' && (
        <g filter={`url(#glow-${cardId})`}>
          <circle cx="50" cy="35" r="18" fill="none" stroke={style.accent1} strokeWidth="1.5" opacity="0.8"/>
          <circle cx="50" cy="35" r="14" fill={style.accent2} opacity="0.6"/>
          <circle cx="46" cy="32" r="11" fill="#1a1a2e" opacity="0.7"/>
          {[0, 60, 120, 180, 240, 300].map((angle, i) => (
            <circle
              key={i}
              cx={50 + Math.cos(angle * Math.PI / 180) * 22}
              cy={35 + Math.sin(angle * Math.PI / 180) * 22}
              r="2"
              fill={style.accent3}
              opacity="0.8"
            />
          ))}
          <path d="M30 70 Q50 55 70 70 Q50 85 30 70" fill={style.accent2} opacity="0.4"/>
          <polygon points="75,25 77,30 82,30 78,33 80,38 75,35 70,38 72,33 68,30 73,30" fill={style.accent3} opacity="0.9"/>
          <circle cx="25" cy="55" r="1.5" fill={style.accent1} opacity="0.7"/>
          <circle cx="78" cy="60" r="1" fill={style.accent3} opacity="0.6"/>
        </g>
      )}
      
      {pattern === 'classical' && (
        <g filter={`url(#glow-${cardId})`}>
          <rect x="30" y="25" width="40" height="50" fill="none" stroke={style.accent1} strokeWidth="1" opacity="0.7"/>
          <rect x="35" y="30" width="30" height="40" fill={style.accent2} opacity="0.3"/>
          <circle cx="50" cy="45" r="10" fill={style.accent1} opacity="0.5"/>
          <path d="M50 30 L50 20 M50 70 L50 80 M30 50 L20 50 M70 50 L80 50" stroke={style.accent2} strokeWidth="1" opacity="0.6"/>
          <polygon points="50,20 55,30 65,30 57,36 60,46 50,40 40,46 43,36 35,30 45,30" fill={style.accent3} opacity="0.8"/>
          <line x1="25" y1="75" x2="75" y2="75" stroke={style.accent1} strokeWidth="0.5" opacity="0.6"/>
        </g>
      )}
      
      {pattern === 'mystical' && (
        <g filter={`url(#glow-${cardId})`}>
          <polygon points="50,15 65,40 65,70 50,85 35,70 35,40" fill={style.accent1} opacity="0.5" stroke={style.accent2} strokeWidth="1"/>
          <polygon points="50,20 60,40 60,65 50,75 40,65 40,40" fill={style.accent2} opacity="0.4"/>
          <line x1="50" y1="15" x2="50" y2="85" stroke={style.accent3} strokeWidth="0.5" opacity="0.6"/>
          <line x1="35" y1="50" x2="65" y2="50" stroke={style.accent3} strokeWidth="0.5" opacity="0.6"/>
          <circle cx="50" cy="50" r="8" fill={style.accent3} opacity="0.7"/>
          <circle cx="25" cy="30" r="3" fill={style.accent1} opacity="0.5"/>
          <circle cx="75" cy="70" r="2.5" fill={style.accent2} opacity="0.5"/>
          <circle cx="30" cy="75" r="2" fill={style.accent3} opacity="0.5"/>
        </g>
      )}
      
      {pattern === 'nature' && (
        <g filter={`url(#glow-${cardId})`}>
          <circle cx="50" cy="40" r="15" fill={style.accent1} opacity="0.8"/>
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
            <line
              key={i}
              x1={50 + Math.cos(angle * Math.PI / 180) * 18}
              y1={40 + Math.sin(angle * Math.PI / 180) * 18}
              x2={50 + Math.cos(angle * Math.PI / 180) * 25}
              y2={40 + Math.sin(angle * Math.PI / 180) * 25}
              stroke={style.accent1}
              strokeWidth="1.5"
              opacity="0.7"
            />
          ))}
          <circle cx="35" cy="65" r="10" fill={style.accent2} opacity="0.6"/>
          <circle cx="38" cy="63" r="7" fill="#1a1a2e" opacity="0.6"/>
          <path d="M65 55 Q70 65 65 75 Q60 70 65 55" fill={style.accent3} opacity="0.5"/>
          <circle cx="25" cy="45" r="1.5" fill={style.accent1} opacity="0.6"/>
          <circle cx="78" cy="35" r="1" fill={style.accent3} opacity="0.5"/>
        </g>
      )}
      
      {pattern === 'fire' && (
        <g filter={`url(#glow-${cardId})`}>
          <path d="M50 15 Q65 35 60 50 Q55 60 50 70 Q45 60 40 50 Q35 35 50 15" fill={style.accent1} opacity="0.7"/>
          <path d="M50 20 Q60 38 56 50 Q52 58 50 65 Q48 58 44 50 Q40 38 50 20" fill={style.accent2} opacity="0.8"/>
          <path d="M50 28 Q56 42 53 50 Q50 56 50 62 Q50 56 47 50 Q44 42 50 28" fill={style.accent3} opacity="0.6"/>
          <circle cx="35" cy="40" r="2.5" fill={style.accent1} opacity="0.6"/>
          <circle cx="68" cy="35" r="2" fill={style.accent2} opacity="0.5"/>
          <circle cx="30" cy="65" r="1.5" fill={style.accent3} opacity="0.5"/>
          <circle cx="72" cy="60" r="2" fill={style.accent1} opacity="0.5"/>
          <circle cx="50" cy="80" r="1.5" fill={style.accent2} opacity="0.4"/>
        </g>
      )}
      
      {pattern === 'cosmic' && (
        <g filter={`url(#glow-${cardId})`}>
          {[0, 40, 80, 120, 160, 200, 240, 280, 320].map((angle, i) => (
            <circle
              key={i}
              cx={50 + Math.cos(angle * Math.PI / 180) * (12 + i * 1.2)}
              cy={50 + Math.sin(angle * Math.PI / 180) * (12 + i * 1.2)}
              r={i % 2 === 0 ? 1.5 : 1}
              fill={i % 3 === 0 ? style.accent1 : i % 3 === 1 ? style.accent2 : style.accent3}
              opacity={0.7 - i * 0.05}
            />
          ))}
          <circle cx="50" cy="50" r="10" fill="none" stroke={style.accent1} strokeWidth="1.5" opacity="0.7"/>
          <circle cx="50" cy="50" r="6" fill={style.accent1} opacity="0.6"/>
          <circle cx="50" cy="50" r="3" fill={style.accent3} opacity="0.8"/>
          <circle cx="25" cy="30" r="2" fill={style.accent2} opacity="0.5"/>
          <circle cx="78" cy="72" r="1.5" fill={style.accent3} opacity="0.5"/>
        </g>
      )}
    </svg>
  );
}

function OrnateFrame({ cardId }: { cardId: number }) {
  const style = tarotArtStyles[cardId % tarotArtStyles.length];
  
  return (
    <div className="absolute inset-0 pointer-events-none">
      <div 
        className="absolute inset-1 rounded-sm"
        style={{
          border: `2px solid ${style.accent1}`,
          opacity: 0.7,
          boxShadow: `inset 0 0 15px ${style.glow}`
        }}
      />
      
      <div 
        className="absolute inset-0 rounded-lg"
        style={{
          border: `1px solid ${style.accent2}`,
          opacity: 0.5
        }}
      />
      
      {[
        { top: 4, left: 4 },
        { top: 4, right: 4 },
        { bottom: 4, left: 4 },
        { bottom: 4, right: 4 }
      ].map((pos, i) => (
        <div
          key={i}
          className="absolute w-4 h-4"
          style={{
            ...pos,
            borderTop: i < 2 ? `2px solid ${style.accent1}` : 'none',
            borderBottom: i >= 2 ? `2px solid ${style.accent1}` : 'none',
            borderLeft: i === 0 || i === 2 ? `2px solid ${style.accent1}` : 'none',
            borderRight: i === 1 || i === 3 ? `2px solid ${style.accent1}` : 'none',
            opacity: 0.9
          }}
        />
      ))}
      
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`corner-${cardId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={style.accent1} stopOpacity="0.9"/>
            <stop offset="100%" stopColor={style.accent2} stopOpacity="0"/>
          </linearGradient>
        </defs>
        
        <path d="M2 12 L2 2 L12 2" stroke={`url(#corner-${cardId})`} strokeWidth="1" fill="none"/>
        <path d="M88 2 L98 2 L98 12" stroke={`url(#corner-${cardId})`} strokeWidth="1" fill="none"/>
        <path d="M2 88 L2 98 L12 98" stroke={`url(#corner-${cardId})`} strokeWidth="1" fill="none"/>
        <path d="M88 98 L98 98 L98 88" stroke={`url(#corner-${cardId})`} strokeWidth="1" fill="none"/>
      </svg>
    </div>
  );
}

export function TarotCard({ card, isReversed = false, onClick, size = 'medium', selected = false }: TarotCardProps) {
  const artStyle = tarotArtStyles[card.id % tarotArtStyles.length];
  
  return (
    <motion.div
      onClick={onClick}
      className={`relative ${sizeClasses[size]} ${selected ? 'ring-4 ring-tarot-gold' : ''}`}
      animate={{ rotate: isReversed ? 180 : 0 }}
      whileHover={{ scale: 1.05, y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <div className={`absolute inset-0 rounded-xl overflow-hidden shadow-2xl bg-gradient-to-br ${artStyle.bg}`}>
        
        <DetailedIllustration cardId={card.id} pattern={artStyle.bgPattern} />
        
        <OrnateFrame cardId={card.id} />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent"></div>
        
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{
            background: [
              'linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.15) 50%, transparent 70%)',
              'linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.2) 60%, transparent 80%)',
              'linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.15) 50%, transparent 70%)'
            ]
          }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        
        <div className="absolute top-2 left-2 right-2 z-20">
          <div 
            className="px-3 py-1.5 rounded-full backdrop-blur-md"
            style={{
              background: `linear-gradient(135deg, ${artStyle.accent1}60, ${artStyle.accent2}60)`,
              border: `1px solid ${artStyle.accent1}70`,
              boxShadow: `0 0 15px ${artStyle.glow}`
            }}
          >
            <motion.span 
              className="text-white text-xs font-semibold tracking-wide drop-shadow-lg"
              style={{ textShadow: `0 0 8px ${artStyle.accent1}` }}
              animate={{ opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              {card.nameCn}
            </motion.span>
          </div>
        </div>
        
        <motion.div 
          className="absolute inset-0 flex items-center justify-center z-10"
          animate={{ 
            scale: [1, 1.08, 1],
            rotate: [0, 2, -2, 0]
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div 
            className="relative"
            style={{
              filter: `drop-shadow(0 0 20px ${artStyle.accent1})`
            }}
          >
            <div 
              className="absolute inset-0 blur-2xl opacity-60"
              style={{ color: artStyle.accent1 }}
            >
              ✦
            </div>
            <div 
              className="relative text-5xl"
              style={{ color: artStyle.accent1 }}
            >
              ✦
            </div>
          </div>
        </motion.div>
        
        <div className="absolute bottom-2 left-2 right-2 z-20">
          <div className="flex justify-center mb-1.5">
            <div className="flex items-center gap-2">
              <div 
                className="h-px w-10"
                style={{
                  background: `linear-gradient(to right, transparent, ${artStyle.accent1})`
                }}
              />
              <span 
                className="text-white text-xs font-bold px-3 py-0.5 rounded-full backdrop-blur-md"
                style={{
                  background: `${artStyle.accent2}40`,
                  border: `1px solid ${artStyle.accent1}60`,
                  textShadow: `0 0 5px ${artStyle.accent1}`
                }}
              >
                {String(card.id + 1).padStart(2, '0')}
              </span>
              <div 
                className="h-px w-10"
                style={{
                  background: `linear-gradient(to left, transparent, ${artStyle.accent1})`
                }}
              />
            </div>
          </div>
          
          <div className="flex justify-center gap-1.5">
            {card.keywords.slice(0, 2).map((keyword, i) => (
              <motion.span 
                key={i}
                className="text-white/90 text-[9px] px-2.5 py-1 rounded-full backdrop-blur-md"
                style={{
                  background: `${artStyle.accent2}50`,
                  border: `1px solid ${artStyle.accent3}60`
                }}
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.4 }}
              >
                {keyword}
              </motion.span>
            ))}
          </div>
        </div>
        
        {isReversed && (
          <motion.div 
            className="absolute inset-0 flex items-center justify-center z-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              background: `linear-gradient(135deg, rgba(139,0,0,0.8), rgba(0,0,0,0.85))`
            }}
          >
            <div 
              className="text-white text-xl font-bold tracking-widest px-6 py-3 rounded-lg"
              style={{
                background: `linear-gradient(135deg, #8B0000, #DC143C)`,
                border: `2px solid ${artStyle.accent1}`,
                boxShadow: `0 0 25px ${artStyle.accent1}90, inset 0 0 15px rgba(0,0,0,0.5)`
              }}
            >
              逆位
            </div>
          </motion.div>
        )}
        
        <div 
          className="absolute top-0 right-0 w-16 h-16"
          style={{
            background: `linear-gradient(135deg, ${artStyle.accent1}50, transparent)`
          }}
        />
        <div 
          className="absolute bottom-0 left-0 w-16 h-16"
          style={{
            background: `linear-gradient(315deg, ${artStyle.accent2}50, transparent)`
          }}
        />
      </div>
      
      <motion.div 
        className="absolute -inset-1 rounded-xl"
        style={{
          background: `linear-gradient(135deg, ${artStyle.accent1}40, ${artStyle.accent2}40)`
        }}
        animate={{ 
          opacity: [0.3, 0.7, 0.3],
          scale: [1, 1.03, 1]
        }}
        transition={{ duration: 3.5, repeat: Infinity }}
      />
    </motion.div>
  );
}
