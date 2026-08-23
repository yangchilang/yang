import { ReadingInput } from '../types';

// 密钥安全：源码中绝对不硬编码任何真实 API Key。
// 部署到 Cloudflare Pages 时，前端请求同源后端 /api/interpret，由 Pages Functions 在服务端注入密钥并转发。
// 本地开发时，如果在 .env.local 里配置了 VITE_API_KEY（仅开发者本机可见，不进仓库），可以直接直连 DeepSeek 跳过代理，方便调试。
const INTERPRET_ENDPOINT = '/api/interpret';
const MODEL_NAME = import.meta.env.VITE_MODEL_NAME || 'deepseek-v4-flash';

// 只允许"构建时被用户显式通过环境变量注入"的 Key，源码里没有任何默认值。
// 部署环境不设置这个变量，就走后端安全代理。
const DEV_MODE_DIRECT_API_KEY: string | undefined = (import.meta.env.VITE_API_KEY || '').trim() || undefined;
const DEV_MODE_DIRECT_API_URL =
  (import.meta.env.VITE_API_URL || '').trim() || 'https://api.deepseek.com/v1/chat/completions';

const USE_DIRECT = Boolean(DEV_MODE_DIRECT_API_KEY);

function buildPrompt(input: ReadingInput): string {
  const { selectedCards, spread, customerGender, customerInfo, customerStatement, customerQuestion } = input;
  
  const cardsInfo = selectedCards.map((sc, index) => {
    const orientation = sc.isReversed ? '逆位' : '正位';
    const positionMeaning = sc.positionMeaning || `第${index + 1}张牌`;
    return `
【第${index + 1}张牌 - ${positionMeaning}】
牌名：${sc.card.nameCn} (${sc.card.name})
状态：${orientation}
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

  const allContext = [genderInfo, customerInfoSection, statementInfo, questionInfo].filter(Boolean).join('\n');

  return `你是一位具有多年实际咨询经验的专业塔罗师。你的任务是根据客户自述、客户问题、牌阵名称、每个牌位的含义以及对应牌面，生成适合直接私信客户或展示在网页上的塔罗解读。

 牌阵中的牌数不固定，可能是1张、3张、5张、7张或更多张。你必须严格按照输入的牌位顺序逐张解读，不能默认只有三张牌，也不能擅自增加、删除或调换牌位。

 【核心目标】

 1. 每张牌先做简短、准确的专业牌义解释。
 2. 再结合这张牌所处的牌位以及客户的现实情况展开，必须引用客户自述中的具体细节（如认识时间、联系频率、见面情况、矛盾点等），不允许脱离客户实际情况空谈牌义。
 3. 解读必须像真人塔罗师在私信中慢慢讲述，亲切自然，而不是格式化的分析报告。
 4. 既要体现塔罗专业性，也要回应客户真正关心的问题，并且给出具体的、可观察的判断方向。
 5. 不做绝对预言，不把牌面说成已经确定的现实。
 6. 不机械套用固定答案，同一张牌处在不同牌位时，解释方向必须有所区别。
 7. 内容必须扎实具体，禁止使用"可能有一定倾向""需要观察一下""保持耐心"等空泛表达而不展开说明。
 
 【牌位优先原则】 
 
 解读每张牌时，必须同时考虑： 
 
 - 牌面的基础含义 
 - 正位或逆位 
 - 当前牌位所代表的问题 
 - 客户的具体经历 
 - 前后牌之间的联系 
 - 客户真正想问的核心问题 
 
 牌位含义的优先级高于泛泛的通用牌义。 
 
 例如： 
 
 恋人正位出现在"对方感受"牌位，可以侧重吸引、好感以及内在选择。 
 
 恋人正位出现在"关系阻碍"牌位，则可能侧重犹豫、选择困难或双方价值观是否一致。 
 
 不能因为抽到同一张牌，就每次都输出相同解释。 
 
 【每张牌的解读方式】 
 
 每一个牌位都按照以下思路展开，但不要在正文中机械标注这些步骤： 
 
 第一步：用1至2句话简短解释这张牌在当前问题领域中的核心牌义，体现专业能力。 
 
 第二步：结合该牌位的具体含义，说明这张牌在整个牌阵中负责回答什么。 
 
 第三步：结合客户自述中的现实细节进行分析，例如： 
 
 - 对方的态度和行为 
 - 双方认识时间 
 - 主动程度 
 - 联系频率 
 - 见面情况 
 - 情绪变化 
 - 现实投入 
 - 当前关系阶段 
 - 已经发生的矛盾或阻碍 
 
 第四步：说明这张牌与前后牌之间是相互支持、相互矛盾，还是形成了某种发展过程。 
 
 【专业牌义要求】 
 
 每张牌开头的专业释义应当简短，不要写成塔罗百科。 
 
 好的表达方式： 
 
 "宝剑十逆位本身带有从压力、失望或情绪低谷中逐渐恢复的含义。它并不是完全回到轻松状态，而是说明最严重的阶段可能正在过去，但残留的不安仍然存在。" 
 
 不好的表达方式： 
 
 "宝剑十代表结束、痛苦、背叛、低谷、绝望、失败、伤害、崩溃、重生。" 
 
 不要只罗列关键词，也不要把所有可能牌义都塞进正文。 
 
 【真人私信语言风格】

 解读一开始可以称呼客户为"你"或"朋友"，整篇都保持像在跟一个真实的人面对面聊天的语气，而不是在写报告。

 语言需要：

 - 专业但不生硬
 - 自然、口语化、亲切温和
 - 有情绪流动和停顿感
 - 像真人根据客户情况慢慢解释，能让客户感到被理解
 - 有明确判断，但不把话说死
 - 能指出客户容易忽略的细节
 - 不刻意制造玄乎感
 - 不过度安慰客户，但也不冷漠
 - 不迎合客户预设的答案，但表达要让人愿意接受
 - 能共情客户的处境，先接住情绪再展开分析

 可以自然使用：

 "朋友，我看到了……"
 "你提到的这一点其实很重要……"
 "我会觉得……"
 "这里其实有一点很明显……"
 "放在这个牌位上，它更像是在说……"
 "再结合你提到的情况来看……"
 "这不一定代表他完全没有想法……"
 "但这个地方还是需要留意……"
 "真正需要观察的反而是……"
 "我不会直接把它理解成……"
 "说实话，目前还没有到可以完全确定的程度……"
 "你愿意把这件事讲出来，说明你已经在认真面对了……"

 这些句式只能作为语气参考，不要在每次解读中机械重复。
 
 【避免机械腔】 
 
 不要频繁使用： 
 
 - 首先 
 - 其次 
 - 最后 
 - 综上所述 
 - 由此可见 
 - 总体而言 
 - 值得注意的是 
 - 核心问题在于 
 - 这意味着 
 - 从牌面来看 
 - 可能存在一定程度的 
 
 不要每段都采用完全相同的句式。 
 
 不要写成： 
 
 "该牌表明……该牌意味着……该牌象征……" 
 
 不要反复复述客户原话。 
 
 【牌组联动要求】 
 
 当牌阵包含两张或更多牌时，不能只做彼此独立的单牌解释。 
 
 完成逐张解读后，必须把整个牌阵串联起来，例如分析： 
 
 - 哪张牌代表关系基础 
 - 哪张牌代表当下状态 
 - 哪张牌揭示阻碍 
 - 哪张牌代表对方的真实态度 
 - 哪张牌代表客户自身的心理状态 
 - 哪张牌决定后续走向 
 - 牌面之间是否出现矛盾 
 - 感情与行动是否一致 
 - 有吸引力但缺少行动，还是行动存在但感情不足 
 - 关系是在推进、停滞、反复，还是逐渐疏远 
 
 牌阵结构不同，联动方式也必须随之变化，不能固定套用"过去、现在、未来"。 
 
 如果只有一张牌，则不强行分析牌组联动，重点把这张牌与客户问题解释透彻。 
 
 【回答问题的原则】 
 
 必须明确回应客户的问题，但不要给绝对承诺。 
 
 客户问"有没有未来"，需要说明： 
 
 - 目前有没有发展基础 
 - 关系处于什么阶段 
 - 最大阻碍是什么 
 - 后面能否继续推进 
 - 需要观察哪些现实行动 
 
 客户问"对方怎么想"，需要区分： 
 
 - 好感 
 - 吸引 
 - 顾虑 
 - 行动意愿 
 - 是否准备进入关系 
 
 客户问"能不能复合"，需要区分： 
 
 - 是否还有情感连接 
 - 是否愿意重新行动 
 - 原有问题是否得到解决 
 - 复合机会和复合后的稳定性 
 
 不要简单把"有感情"直接等同于"会行动"，也不要把"有联系"直接等同于"有未来"。 
 
 【固定输出格式】 
 
 标题： 
 
 {{牌阵名称}} 
 
 随后按照输入顺序，逐张输出： 
 
 第{{序号}}张牌：{{牌位名称}}｜{{牌名及正逆位}} 
 
 先简短解释专业牌义，再结合这个牌位和客户实际情况自然展开。 
 
 正文不使用项目符号，不拆成"牌义""现实分析"等小标题，要写成一段连贯的真人解读。

 每张牌的正文长度必须达到200至400个汉字，这是硬性要求，不是参考值。如果某张牌的解读不足200字，说明你对这张牌的展开不够充分，必须继续补充。牌位越重要，可以适当增加内容，但不要故意凑字数。每张牌必须包含：牌义解释、牌位含义结合、客户自述细节引用、与前后牌的联动分析，四者缺一不可，不允许只写一两句就跳过。

 如果客户自述比较简短，必须基于已有信息合理展开推断，而不是用"具体情况需要更多了解"敷衍。例如客户只说"分手三个月"，可以结合时间长度推断情绪阶段；客户说"对方不回消息"，可以结合行为频率推断态度变化。

 全部牌位完成后输出：

 整体解读

 把所有牌面和牌位串联起来，直接回应客户的问题。不能只是重复前文，要讲清楚整组牌形成的关系逻辑、主要机会、现实阻碍以及可能的发展方向。整体解读必须包含对客户核心问题的明确回应，不能绕开问题。

 整体解读必须达到400至800个汉字，这是硬性要求。牌数较少时可以适当缩短，但不得低于400字；牌数较多时可以适当增加。

 最后输出：

 温馨提示

 结合牌面给出一段具体、现实、可以执行的建议。不要只写"顺其自然""相信自己""保持耐心"等空泛内容。

 需要根据牌面告诉客户：

 - 应该主动还是暂时观察
 - 是否需要放慢关系节奏
 - 应该看对方哪些实际行动
 - 是否需要设立边界
 - 是否应减少情绪消耗
 - 哪些事情暂时不适合做

 温馨提示必须达到100至250个汉字，这是硬性要求。
 
 【排版要求】 
 
 不要使用Markdown表格。 
 不要使用项目符号。 
 不要输出分析过程。 
 不要在开头说"好的""以下是解读"。 
 不要在结尾询问客户是否需要继续占卜。 
 不要擅自加入客户没有提到的经历。 
 不要添加具体时间预测，除非牌阵本身设置了时间牌位。 
 不要改变牌阵中原有牌位的含义。

 【字数自检】

 输出前请逐段检查字数：
 - 每张牌的正文是否达到200字以上？不足则补充牌位含义结合和客户细节引用。
 - 整体解读是否达到400字以上？不足则补充牌面联动分析和具体发展方向。
 - 温馨提示是否达到100字以上？不足则补充具体可执行的行动建议。

 如果任何一段不达标，必须重新展开该段，不要用"建议保持耐心""需要观察"等空泛话术凑字数，而是补充具体的、与客户情况相关的分析内容。

【输入信息】
以下是用户的占卜信息：
${spreadInfo}

【牌阵布局】
${cardsInfo}

【客户信息】
${allContext}

现在请严格按照以上风格和规则进行解读。`;
}

export interface InterpretationResult {
  content: string;
  isFallback: boolean;
  errorMessage?: string;
}

export async function getInterpretation(input: ReadingInput): Promise<InterpretationResult> {
  try {
    const prompt = buildPrompt(input);

    if (!MODEL_NAME) {
      throw new Error('未配置模型名，请设置环境变量 VITE_MODEL_NAME（推荐 deepseek-v4-flash）');
    }

    // 本地开发模式：.env.local 配置了 VITE_API_KEY 时，直接直连 DeepSeek，方便调试。
    // 生产部署：VITE_API_KEY 不会注入前端构建，因此一定会进入 else 分支走同源后端安全代理。
    if (USE_DIRECT && DEV_MODE_DIRECT_API_KEY) {
      console.info(
        `[解读服务] 本地直连模式（仅开发环境）endpoint=${DEV_MODE_DIRECT_API_URL} ` +
          `model=${MODEL_NAME} key_len=${DEV_MODE_DIRECT_API_KEY.length}`,
      );
      return callDeepSeekDirect(prompt, MODEL_NAME, DEV_MODE_DIRECT_API_URL, DEV_MODE_DIRECT_API_KEY);
    }

    console.info(`[解读服务] 安全代理模式 endpoint=${INTERPRET_ENDPOINT} model=${MODEL_NAME}`);
    return callBackendProxy(prompt, MODEL_NAME, INTERPRET_ENDPOINT);
  } catch (error) {
    console.error('========== 解读服务调用失败 ==========');
    console.error('时间:', new Date().toLocaleString('zh-CN'));
    console.error('请求URL:', USE_DIRECT ? DEV_MODE_DIRECT_API_URL : INTERPRET_ENDPOINT);
    console.error('模型:', MODEL_NAME);
    console.error('错误详情:', error);
    if (error instanceof Error) {
      console.error('错误message:', error.message);
      console.error('错误stack:', error.stack);
    }
    console.error('====================================');
    const msg = error instanceof Error ? error.message : String(error);
    return {
      content: generateFallbackInterpretation(input),
      isFallback: true,
      errorMessage: msg,
    };
  }
}

async function callBackendProxy(prompt: string, model: string, endpoint: string): Promise<InterpretationResult> {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, model }),
  });

  let responseText = '';
  try {
    responseText = await response.text();
  } catch {
    responseText = '';
  }

  let parsed: any = null;
  try {
    parsed = JSON.parse(responseText);
  } catch {
    parsed = null;
  }

  if (!response.ok) {
    const errMsg =
      (parsed && typeof parsed.error === 'string' && parsed.error) ||
      (parsed && typeof parsed.message === 'string' && parsed.message) ||
      responseText.slice(0, 500) ||
      `HTTP ${response.status} ${response.statusText}`;
    throw new Error(errMsg);
  }

  if (!parsed || !parsed.success || !parsed.data || typeof parsed.data.content !== 'string' || !parsed.data.content.trim()) {
    const snippet = responseText.slice(0, 300);
    throw new Error(`后端返回内容缺失，请稍后重试。原始片段: ${snippet}`);
  }

  const content = parsed.data.content.trim();
  const finishReason = parsed.data.finishReason || '';
  console.info(`[解读服务] 响应完成 endpoint=${endpoint} finish_reason=${finishReason} content_len=${content.length}`);
  return { content, isFallback: false };
}

async function callDeepSeekDirect(
  prompt: string,
  model: string,
  apiUrl: string,
  apiKey: string,
): Promise<InterpretationResult> {
  const requestBody: Record<string, unknown> = {
    model,
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 8192,
    temperature: 0.8,
    top_p: 0.95,
    thinking: { type: 'disabled' },
  };

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`HTTP ${response.status} ${response.statusText}${body ? ' | ' + body.slice(0, 500) : ''}`);
  }

  const data: any = await response.json();
  const choice = data?.choices?.[0];
  const message = choice?.message ?? {};
  const content = typeof message.content === 'string' ? message.content.trim() : '';
  const reasoning = typeof message.reasoning_content === 'string' ? message.reasoning_content.trim() : '';
  const finishReason = typeof choice?.finish_reason === 'string' ? choice.finish_reason : '';
  const usage = typeof data?.usage === 'object' ? JSON.stringify(data.usage) : '';
  console.info(
    `[解读服务] 直连响应完成 finish_reason=${finishReason} usage=${usage} ` +
      `content_len=${content.length} reasoning_len=${reasoning.length}`,
  );

  const finalContent = content || reasoning;
  if (!finalContent) {
    throw new Error(`解读服务返回空内容（finish_reason=${finishReason}）`);
  }
  return { content: finalContent, isFallback: false };
}

function generateFallbackInterpretation(input: ReadingInput): string {
  const { selectedCards, spread, customerQuestion, customerStatement, customerInfo } = input;

  const spreadName = spread?.name || '塔罗解读';

  let output = '';
  output += spreadName + '\n\n';

  selectedCards.forEach((selectedCard, index) => {
    const positionNo = index + 1;
    const positionMeaning = selectedCard.positionMeaning || `第${positionNo}张牌`;
    const orientation = selectedCard.isReversed ? '逆位' : '正位';
    const coreMeaning = (selectedCard.isReversed ? selectedCard.card.reversedMeaning : selectedCard.card.meaning) || '当前牌面反映了事情的潜在能量。';
    const keywords = selectedCard.card.keywords || [];
    const element = selectedCard.card.element || '';

    output += `第${positionNo}张牌：${positionMeaning}｜${selectedCard.card.nameCn} ${orientation}\n`;

    let cardText = '';
    cardText += `朋友，这张${selectedCard.card.nameCn}${selectedCard.isReversed ? '出现了逆位，' : '以正位出现，'}首先从专业牌义来看，`;
    if (orientation === '正位') {
      cardText += `它通常象征着${coreMeaning.slice(0, 30)}${coreMeaning.length > 30 ? '……' : ''}`;
    } else {
      cardText += `它的正位本来代表${(selectedCard.card.meaning || '').slice(0, 25)}，但逆位时能量会被削弱、阻滞或走向反面，`;
    }
    if (element) {
      cardText += `这张牌的元素是${element}，在解读时需要把元素性质一并纳入。`;
    }
    cardText += `放在"${positionMeaning}"这个牌位上，它更像是在回答${positionMeaning}这一维度的问题，`;
    cardText += `而不是泛泛地谈一张${selectedCard.card.nameCn}是什么意思。`;

    if (customerStatement) {
      const snippet = customerStatement.length > 50 ? customerStatement.slice(0, 50) + '……' : customerStatement;
      cardText += `你提到"${snippet}"，把这段经历和这张牌结合起来看的话，`;
      cardText += `牌面所提示的${coreMeaning.slice(0, 20)}其实已经在你描述的细节里有迹可循了。`;
    } else if (customerInfo) {
      const snippet = customerInfo.length > 40 ? customerInfo.slice(0, 40) + '……' : customerInfo;
      cardText += `结合你提供的背景信息"${snippet}"来看，`;
      cardText += `这张牌所带出的能量并不是凭空出现的，而是你当前处境的一个缩影。`;
    } else {
      cardText += `即便你现在没有提供太多背景细节，这张牌本身也在透露一些可以观察的方向，`;
      cardText += `比如你当下是否在重复某种模式，或者是否有被自己忽略的情绪。`;
    }

    if (selectedCards.length > 1) {
      if (index === 0) {
        const nextCard = selectedCards[index + 1];
        cardText += `另外，这张牌作为整组牌的开端，它所定下的基调会直接影响后面${nextCard?.card.nameCn || '的牌'}的展开方向，`;
        cardText += `你可以把它理解为整件事情的起点或底色。`;
      } else if (index === selectedCards.length - 1) {
        const prevCard = selectedCards[index - 1];
        cardText += `从承接关系来看，这张牌是${prevCard?.card.nameCn || '前面牌面'}所指向的趋势走到最后呈现出的结果，`;
        cardText += `它不一定代表终局，但往往是我们最需要留意的收尾信号。`;
      } else {
        const prevCard = selectedCards[index - 1];
        const nextCard = selectedCards[index + 1];
        cardText += `夹在${prevCard?.card.nameCn || '前面的牌'}与${nextCard?.card.nameCn || '后面的牌'}之间，`;
        cardText += `这张牌既承接了前一张带出的主题，又为后一张的展开埋下了伏笔。`;
      }
    }

    if (keywords.length > 0) {
      cardText += `如果把它落到关键词上，大约可以概括为：${keywords.slice(0, 4).join('、')}。`;
    }
    cardText += `但这不是全部，真正需要看的是这些能量会如何在你接下来一段时间里具体表现出来。`;

    output += cardText + '\n\n';
  });

  output += '整体解读\n';
  let overall = '';
  overall += `把这${selectedCards.length}张牌串起来看，`;
  if (customerQuestion) {
    overall += `你真正关心的是"${customerQuestion.length > 60 ? customerQuestion.slice(0, 60) + '……' : customerQuestion}"这个问题。`;
    overall += `从整组牌的结构来看，`;
  }
  overall += `第一张牌更多回答的是事情当下的基础状态，`;
  if (selectedCards.length > 1) {
    overall += `中间部分承担了真正推动剧情的矛盾与转机，`;
    overall += `而最后一张则指向这件事大概率会落在什么方向上。`;
  }
  overall += `你需要留意的是，这组牌里有没有出现前后相互矛盾的能量——`;
  overall += `比如前面牌呈现出犹豫克制，后面却突然给出明确行动信号，这种前后反差往往就是整件事最关键的地方。`;
  overall += `我不会把牌面直接当成已经发生的现实，它更像是在告诉你：当前的能量如果不做调整，会沿着什么趋势继续发展。`;
  overall += `你真正掌握主动权的地方，在于是否能在看清趋势之后，主动调整自己的选择和做法，而不是等结果来到你面前才开始反应。`;
  if (selectedCards.some(c => c.isReversed)) {
    overall += `这组牌里出现了逆位牌，说明某些能量目前是卡住的、还没完全顺过来的状态，`;
    overall += `这不是"坏事"，而是在提醒你：那部分议题需要更耐心地处理，急着推进反而会适得其反。`;
  } else {
    overall += `这组牌整体以正位为主，说明当前大多数变量是比较顺的，`;
    overall += `但顺不代表不用做事，反而要在顺的时候把基础打得更扎实，以免后续遇到意外就崩掉。`;
  }
  output += overall + '\n\n';

  output += '温馨提示\n';
  let tips = '';
  tips += `未来两到四周内，建议你先观察、再出手，不要一有情绪就立刻做决定。`;
  tips += `具体来说，如果你在等对方的回应，就去看对方的实际行动有没有变化，`;
  tips += `而不是只听他说了什么；如果你在推进一件事，就先做一个最小可执行的动作，`;
  tips += `不要一开始就铺太大的局面。这段时间不适合过度消耗自己的情绪和精力，`;
  tips += `也不适合反复追问自己"到底会不会"这种没有答案的问题。`;
  tips += `你要做的是：把注意力拉回到自己身上，先照顾好睡眠、饮食和日常节奏，`;
  tips += `然后等牌面中提到的那些关键信号真正出现时，再从容回应。`;
  output += tips + '\n';

  return output;
}

export function cleanInterpretationForImage(interpretation: string, spreadName?: string): string {
  const lines = interpretation.split(/\r?\n/);
  const filtered = lines.filter(line => {
    const trimmed = line.trim();
    if (!trimmed) return true;
    if (/^第[一二三四五六七八九十百千\d]+张牌：/.test(trimmed)) return false;
    if (trimmed === '整体解读') return false;
    if (trimmed === '温馨提示') return false;
    if (spreadName && trimmed === spreadName.trim()) return false;
    return true;
  });
  let start = 0;
  while (start < filtered.length && !filtered[start].trim()) start++;
  let end = filtered.length;
  while (end > start && !filtered[end - 1].trim()) end--;
  return filtered.slice(start, end).join('\n');
}
