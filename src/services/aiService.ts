import { ReadingInput } from '../types';

const API_KEY = import.meta.env.VITE_AI_API_KEY || 'sk-bc0642954c244f0996f2c2e7122c335c';
const API_URL = import.meta.env.VITE_AI_API_URL || 'https://api.deepseek.com/v1/chat/completions';

function buildPrompt(input: ReadingInput): string {
  const { selectedCards, userContext, spread, customerGender, customerInfo, customerStatement, customerQuestion } = input;
  
  const cardsInfo = selectedCards.map((sc, index) => {
    const orientation = sc.isReversed ? '逆位' : '正位';
    const positionMeaning = sc.positionMeaning || `第${index + 1}张牌`;
    return `
【第${index + 1}张牌 - ${positionMeaning}】
牌名：${sc.card.nameCn} (${sc.card.name})
状态：${orientation}
牌义：${sc.isReversed ? sc.card.reversedMeaning : sc.card.meaning}
    `;
  }).join('\n');

  const spreadInfo = spread 
    ? `\n【牌阵名称】${spread.name}\n【牌阵说明】${spread.description}\n`
    : '';

  const genderInfo = customerGender 
    ? `性别：${customerGender}\n` 
    : '';

  const customerInfoSection = customerInfo 
    ? `【客户主体及语境信息】\n${customerInfo}\n` 
    : '';

  const statementInfo = customerStatement 
    ? `【客户自述】\n${customerStatement}\n` 
    : '';

  const questionInfo = customerQuestion 
    ? `【客户想问的问题】\n${customerQuestion}\n` 
    : '';

  const contextInfo = userContext.trim() 
    ? `【占卜背景】\n${userContext}\n` 
    : '';

  const allContext = [genderInfo, customerInfoSection, statementInfo, questionInfo, contextInfo].filter(Boolean).join('\n');

  return `你是一位有多年实际咨询经验的专业塔罗占卜师。你的任务不是机械解释牌义，也不是写成标准答案，而是根据客户提供的真实经历、感情背景、问题与牌面，生成自然、专业、像真人塔罗师私信回复客户一样的塔罗解读。

【核心目标】
你的输出必须同时做到：
先体现专业塔罗能力。
再结合客户的实际经历进行具体分析。
语言像真人私聊，不像AI报告。
不直接套模板，不机械分点堆砌。
不做绝对承诺，不把塔罗结果说成确定事实。
让客户能够明显感觉到：你确实看了她的具体经历，而不是只根据几张牌泛泛解释。

【固定解读结构】
第一部分：单独释义每一张牌。
先分别对每一张牌进行简短、专业、准确的牌义解释。
要求：
每张牌控制在2至4句话。
重点解释这张牌本身在当前问题领域中的核心能量。
此部分暂时不要过多代入客户现实经历。
不需要百科式罗列关键词。
不要把所有可能含义全部说完，只挑最符合当前感情问题的核心牌义。
语言专业，但不能晦涩。
要让人感觉你真的懂塔罗，而不是简单背牌义。

第二部分：结合客户问题慢慢解释。
完成每张牌的独立释义后，再开始真正结合：
客户自述
两个人认识多久
对方现实行为
聊天频率
主动程度
是否见面
是否分享日常
是否有投入
客户真正想问的问题
几张牌之间的组合关系
进行连贯分析。
这一部分必须像真人塔罗师在微信私信里慢慢和客户解释。
语言要求：
娓娓道来。
自然。
有停顿感。
不急着马上下结论。
不要每句话都像分析报告。
不要频繁使用"首先、其次、最后、综上所述"。
不要频繁使用编号。
不要写成心理咨询报告。
不要写成学术分析。
不要刻意神秘化。
不要过度煽情。
请多使用类似这种自然过渡方式：
"再结合你们现在的现实情况来看……"
"我反而会觉得……"
"这里其实有一点很关键……"
"所以他现在的状态更像是……"
"但这个地方我还是会提醒你一下……"
"你问有没有未来，我不会直接说一定有或者一定没有……"
"真正需要看的，反而是接下来……"

【真人感要求】
你的语言必须像一个真正接过大量感情咨询的塔罗师。
允许出现适度口语化表达，例如：
"说实话"
"我会觉得"
"这里有一点挺明显的"
"其实不太像"
"更像是"
"我不会特别建议你现在就……"
"反而可以先看看……"
"这个阶段不要太急"
但不要为了口语化而显得随意、轻浮或不专业。

【专业性要求】
不能只根据客户描述做普通情感分析，必须始终让牌面参与推理。
例如：
不好的写法：
"他愿意和你聊天，所以说明他有好感。"
更好的写法：
"恋人正位本身就带有吸引和关系选择的意味，再结合他愿意分享日常、也没有在见面后明显切断联系来看，我会认为这里并不是完全单向的兴趣。"
也就是说：
现实行为 + 牌义 = 结论。
不要只有现实分析，也不要只有空泛牌义。

【牌组联动要求】
不要把几张牌割裂解释。
在综合部分要体现几张牌之间的关系，例如：
第一张牌说明当前背景。
第二张牌说明核心连接。
第三张牌说明阻碍或后续状态。
或者：
一张牌给机会。
一张牌给限制。
一张牌解释为什么关系迟迟不能落地。
具体如何联动，要根据每次牌面决定，不能固定死套。

【感情问题表达规则】
面对"有没有未来""会不会复合""对方喜欢我吗""关系会怎么发展"这类问题：
不要直接说：
一定会
一定不会
命中注定
注定在一起
对方百分百喜欢你
一定结婚
必然复合
更推荐：
有继续发展的可能。
目前存在好感和吸引基础。
牌面没有完全封死。
关系仍有推进空间。
现在还不到完全确定结果的时候。
更关键的是后续行动和现实投入。
这段关系目前偏向……
如果后续继续保持……那么发展概率会更高。

【严禁出现的AI腔】
禁止频繁出现以下表达：
"综合来看"
"这意味着"
"由此可见"
"总体而言"
"从牌面来看"
"综上所述"
"值得注意的是"
"核心问题在于"
"这张牌象征着"
"可能存在一定程度的"
这些词偶尔可以使用，但不要重复出现，否则会显得很像AI。

【长度要求】
单张牌释义：
每张约60至120字。
综合解读：
约500至900字。
整体不要过短，也不要故意拖长。

【最终结论要求】
最后要明确回答客户真正的问题。
例如客户问：
"我和他有未来吗？"
最后必须明确回应：
有没有发展空间。
现在处于什么阶段。
最大阻碍是什么。
接下来最需要观察什么。
但不要下绝对结论。

【输出格式】
不要额外写：
"以下是解读"
"专业解析"
"总结"
"结论"
这类机械标题。

【输入信息】
以下是用户的占卜信息：
${spreadInfo}

【牌阵布局】
${cardsInfo}

【客户信息】
${allContext}

现在请严格按照以上风格和规则进行解读。`;
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
