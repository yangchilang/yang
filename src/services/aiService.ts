import { ReadingInput } from '../types';

const API_KEY = import.meta.env.VITE_AI_API_KEY || 'sk-bc0642954c244f0996f2c2e7122c335c';
const API_URL = import.meta.env.VITE_AI_API_URL || 'https://api.deepseek.com/v1/chat/completions';

function buildPrompt(input: ReadingInput): string {
  const { selectedCards, userContext, spread } = input;
  
  const cardsInfo = selectedCards.map((sc, index) => {
    const orientation = sc.isReversed ? '逆位' : '正位';
    const positionMeaning = sc.positionMeaning || `第${index + 1}张牌`;
    return `
【第${index + 1}张牌 - ${positionMeaning}】
牌名：${sc.card.nameCn} (${sc.card.name})
状态：${orientation}
牌义：${sc.isReversed ? sc.card.reversedMeaning : sc.card.meaning}
元素：${sc.card.element}
守护星：${sc.card.zodiac}
    `;
  }).join('\n');

  const spreadInfo = spread 
    ? `\n【牌阵名称】${spread.name}\n【牌阵说明】${spread.description}\n`
    : '';

  const contextInfo = userContext.trim() 
    ? `\n\n用户的困惑与背景：\n"${userContext}"\n\n` 
    : '\n\n（用户没有提供具体背景，请从普遍的人生主题角度进行解读）\n\n';

  return `你是一位有着二十年经验的资深塔罗占卜师，名叫明月。你说话温暖、亲切，就像和朋友聊天一样自然。

你的解读风格：
- 用"朋友"这样的称呼，亲切而不过分亲密
- 语言口语化，像朋友间的真诚对话，而不是念经
- 会用生动的比喻和小故事来解释牌面
- 既有温柔的理解，也有直接的坦诚
- 充满同理心，但不失专业和洞察力
- 解读要有温度、有情感、有灵魂

请用第一人称"我"来解读，仿佛你正在面对面为用户占卜。

以下是用户的占卜信息：
${spreadInfo}

【牌阵布局】
${cardsInfo}
${contextInfo}

请生成一段详细的解读，要求：
1. 开场要亲切自然，像"朋友，让我看看你的牌..."
2. 根据牌阵的每个位置含义，对每张牌进行针对性的解读
3. 探讨牌面之间的联系和互动，形成完整的叙事
4. 结合用户背景给出具体、有针对性的建议
5. 结尾要给予希望和力量，像朋友的支持
6. 全程保持温暖、真诚、口语化的语气
7. 可以适当用感叹号表达情感，但要自然
8. 解读要有个人风格，像真人在说话
9. 注意每张牌在牌阵中的位置含义，不要只解读单张牌，要结合位置来解读

请用中文输出你的解读：`;
}

export async function getAIInterpretation(input: ReadingInput): Promise<string> {
  try {
    const prompt = buildPrompt(input);
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 1024,
        temperature: 0.8,
        top_p: 0.95,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    return content.trim() || generateFallbackInterpretation(input);
  } catch (error) {
    console.warn('AI API call failed, using fallback interpretation:', error);
    return generateFallbackInterpretation(input);
  }
}

function generateFallbackInterpretation(input: ReadingInput): string {
  const { selectedCards, userContext } = input;
  
  const openings = [
    '朋友，让我看看你抽到了什么...',
    '朋友，让我为你解读这些牌...',
    '朋友，我看到了有趣的牌面组合...',
    '让我为你揭开这些牌的神秘面纱...'
  ];
  
  const cardInterpretations = selectedCards.map((selectedCard, index) => {
    const positionNames = ['第一张', '第二张', '第三张', '第四张', '第五张'];
    const position = positionNames[index] || `第${index + 1}张`;
    const meaning = selectedCard.isReversed 
      ? selectedCard.card.reversedMeaning 
      : selectedCard.card.meaning;
    
    const warmInterpretations = [
      `${position}是${selectedCard.card.nameCn}，${selectedCard.isReversed ? '出现了逆位' : '正位'}${selectedCard.isReversed ? '，这意味着' : '，这张牌在说'}${meaning}。`,
      `看这张${selectedCard.card.nameCn}，${selectedCard.isReversed ? '逆位的能量' : '正位的能量'}${selectedCard.isReversed ? '在提醒你' : '在告诉你'}${meaning}。`,
      `哦，${position}是${selectedCard.card.nameCn}！${selectedCard.isReversed ? '逆位哦，' : ''}${meaning}，这很重要！`
    ];
    
    return warmInterpretations[Math.floor(Math.random() * warmInterpretations.length)];
  });
  
  const themeInsights = [
    '这几张牌在一起，讲述了一个关于成长和转变的故事...',
    '牌面之间形成了一个很有意义的对话，我看到了能量在流动...',
    '这些牌在告诉我关于你现在的旅程...'
  ];
  
  const closings = [
    '无论牌面显示什么，记住——你永远都有选择的力量！加油！',
    '一切都会好起来的。信我的话，也信你自己的力量！',
    '保持信心。宇宙在回应你的问题，答案已经在路上了！',
    '我看到了希望。相信自己，相信这个过程，你会找到答案的！',
    '牌告诉我，你要相信自己。你比想象中更强大！'
  ];
  
  const randomOpening = openings[Math.floor(Math.random() * openings.length)];
  const randomTheme = themeInsights[Math.floor(Math.random() * themeInsights.length)];
  const randomClosing = closings[Math.floor(Math.random() * closings.length)];
  
  let reading = '';
  reading += randomOpening + '\n\n';
  
  cardInterpretations.forEach(cardReading => {
    reading += cardReading + '\n';
  });
  
  reading += '\n' + randomTheme + '\n\n';
  
  if (userContext.trim()) {
    reading += `关于你的问题"${userContext}"，我感觉到牌面和你的心有很深的连接...\n\n`;
  }
  
  reading += randomClosing;
  
  return reading;
}
