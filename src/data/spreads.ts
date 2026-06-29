export interface SpreadPosition {
  position: number;
  meaning: string;
}

export interface Spread {
  id: string;
  name: string;
  description: string;
  category: string;
  positions: SpreadPosition[];
}

export const spreads: Spread[] = [
  {
    id: 'three-card-reunion',
    name: '是否能复合',
    description: '分析与对方的复合可能性',
    category: '感情复合',
    positions: [
      { position: 1, meaning: '和对方还能不能复合' },
      { position: 2, meaning: '对方想不想复合' },
      { position: 3, meaning: '有什么阻碍' },
    ]
  },
  {
    id: 'three-card-feelings',
    name: 'ta的想法和感觉',
    description: '了解对方的真实想法和感受',
    category: '想法分析',
    positions: [
      { position: 1, meaning: 'ta的想法' },
      { position: 2, meaning: 'ta的感觉' },
      { position: 3, meaning: 'ta对我的想法和感觉' },
    ]
  },
  {
    id: 'three-card-soulmate',
    name: '正缘',
    description: '探索未来正缘的特征',
    category: '感情发展',
    positions: [
      { position: 1, meaning: '未来正缘的性格' },
      { position: 2, meaning: '未来正缘的外貌和身高信息，分析时请尽量具体且友好（如肤色偏白、身高175左右、瓜子脸一类的特征）' },
      { position: 3, meaning: '未来正缘的工作情况和职业类型' },
    ]
  },
  {
    id: 'three-card-monthly',
    name: '月发展趋势',
    description: '预测本月的发展走向',
    category: '时间发展',
    positions: [
      { position: 1, meaning: '月初状态' },
      { position: 2, meaning: '月中发展' },
      { position: 3, meaning: '月末结果' },
    ]
  },
  {
    id: 'three-card-fortune',
    name: '运势近中远',
    description: '分析近期、中期和远期运势',
    category: '事业财运',
    positions: [
      { position: 1, meaning: '近期运势' },
      { position: 2, meaning: '中期运势' },
      { position: 3, meaning: '远期运势' },
    ]
  },
  {
    id: 'three-card-wealth',
    name: '财运改善',
    description: '改善财务状况的建议',
    category: '事业财运',
    positions: [
      { position: 1, meaning: '改善财务状况需要注意的地方' },
      { position: 2, meaning: '如何改善财务状况/提升正财或偏财' },
      { position: 3, meaning: '未来的财务状况需要注意或如何做' },
    ]
  },
  {
    id: 'three-card-dating',
    name: '脱单',
    description: '分析近期脱单的可能性',
    category: '感情发展',
    positions: [
      { position: 1, meaning: '最近的感情状态' },
      { position: 2, meaning: '最近会不会出现合适的人' },
      { position: 3, meaning: '看近期脱单结果和发展趋势' },
    ]
  },
  // 感情复合类
  {
    id: 'complex-cross',
    name: '复合十字架',
    description: '用于分析复合可能性和建议',
    category: '感情复合',
    positions: [
      { position: 1, meaning: '你们会不会复合' },
      { position: 2, meaning: '你们之间的阻碍' },
      { position: 3, meaning: '对方想不想复合' },
      { position: 4, meaning: '对方对你的想法和感觉' },
      { position: 5, meaning: '建议牌' },
    ]
  },
  {
    id: 'broken-mirror',
    name: '破镜重圆牌阵',
    description: '深度分析复合可能性及情敌情况',
    category: '感情复合',
    positions: [
      { position: 1, meaning: '最近及过去' },
      { position: 2, meaning: '现状及关键' },
      { position: 3, meaning: '复合所产生的结果' },
      { position: 4, meaning: '前任过去情况' },
      { position: 5, meaning: '前任现在情况' },
      { position: 6, meaning: '复合可能' },
      { position: 7, meaning: '情敌过去' },
      { position: 8, meaning: '情敌现状' },
      { position: 9, meaning: '情敌与你交锋的未来' },
      { position: 10, meaning: '情敌优势/你的劣势' },
      { position: 11, meaning: '策略/建议' },
    ]
  },
  {
    id: 'ex-reunion',
    name: '前任复合判断',
    description: '全面分析前任复合的可能性',
    category: '感情复合',
    positions: [
      { position: 1, meaning: '描述你们之前的感情' },
      { position: 2, meaning: '分手后你的状态' },
      { position: 3, meaning: '分手后对方的状态' },
      { position: 4, meaning: '你对复合的看法' },
      { position: 5, meaning: '对方对复合的看法' },
      { position: 6, meaning: '你们之间的障碍' },
      { position: 7, meaning: '什么可以帮助你们的关系' },
      { position: 8, meaning: '你不知道的事' },
      { position: 9, meaning: '你们最终的结局' },
    ]
  },
  {
    id: 'stalking-ex',
    name: '视奸前任牌阵',
    description: '了解前任的近况',
    category: '感情复合',
    positions: [
      { position: 1, meaning: '对方目前感情状况' },
      { position: 2, meaning: '对方目前财务状况' },
      { position: 3, meaning: '对方目前对你的看法' },
      { position: 4, meaning: '离开之后对方有没有想起过你' },
      { position: 5, meaning: '对方后悔和你分手吗' },
    ]
  },
  {
    id: 'ex-reunion-advanced',
    name: '前任复合判断（进阶版）',
    description: '更深入的前任复合分析',
    category: '感情复合',
    positions: [
      { position: 1, meaning: '你们之前的感情' },
      { position: 2, meaning: '分手后你的状态' },
      { position: 3, meaning: '分手后ta的状态' },
      { position: 4, meaning: '你对复合的想法' },
      { position: 5, meaning: 'ta对复合的想法' },
      { position: 6, meaning: '你们之间的阻碍' },
      { position: 7, meaning: '什么可以帮助你们的关系' },
      { position: 8, meaning: '你不知道的事' },
      { position: 9, meaning: '最后的结局' },
    ]
  },
  {
    id: 'active-reunion',
    name: '主动复合牌阵',
    description: '指导如何主动寻求复合',
    category: '感情复合',
    positions: [
      { position: 1, meaning: 'ta还爱我吗' },
      { position: 2, meaning: 'ta有新欢了吗' },
      { position: 3, meaning: '跟我复合顾虑的点是什么' },
      { position: 4, meaning: '希望我改哪点' },
      { position: 5, meaning: '怎么跟他谈复合' },
      { position: 6, meaning: '复合后会对我更好吗' },
      { position: 7, meaning: '怎么维持感情' },
      { position: 8, meaning: '我和ta的结局' },
      { position: 9, meaning: '近期会主动找我复合吗' },
    ]
  },

  // 学业类
  {
    id: 'study-hexagram',
    name: '学业六芒星',
    description: '全面分析学业状况',
    category: '学业',
    positions: [
      { position: 1, meaning: '过去' },
      { position: 2, meaning: '基础' },
      { position: 3, meaning: '环境' },
      { position: 4, meaning: '心态' },
      { position: 5, meaning: '现在' },
      { position: 6, meaning: '未来' },
      { position: 7, meaning: '建议' },
    ]
  },
  {
    id: 'new-semester',
    name: '新学期牌阵',
    description: '预测新学期的发展',
    category: '学业',
    positions: [
      { position: 1, meaning: '一学期人际发展趋势（前期）' },
      { position: 2, meaning: '一学期人际发展趋势（中期）' },
      { position: 3, meaning: '一学期人际发展趋势（后期）' },
      { position: 4, meaning: '一学期学业发展运势（前期）' },
      { position: 5, meaning: '一学期学业发展运势（中期）' },
      { position: 6, meaning: '一学期学业发展运势（后期）' },
      { position: 7, meaning: '整个学期需要注意的事项' },
      { position: 8, meaning: '整个学期的建议' },
    ]
  },
  {
    id: 'study-problem',
    name: '学习问题解决牌阵',
    description: '解决学习中的问题',
    category: '学业',
    positions: [
      { position: 1, meaning: '问题核心' },
      { position: 2, meaning: '障碍和短处' },
      { position: 3, meaning: '资源和长处' },
      { position: 4, meaning: '对策' },
    ]
  },
  {
    id: 'study-status',
    name: '学习状态及建议',
    description: '了解当前学习状态',
    category: '学业',
    positions: [
      { position: 1, meaning: '建议' },
      { position: 2, meaning: '过去' },
      { position: 3, meaning: '现在' },
      { position: 4, meaning: '未来' },
    ]
  },
  {
    id: 'exam-prep',
    name: '备考牌阵',
    description: '备考期间的全面分析',
    category: '学业',
    positions: [
      { position: 1, meaning: '备考中的个人状态（需要加强或改进的地方）' },
      { position: 2, meaning: '备考中的核心课题/精神层面' },
      { position: 3, meaning: '情绪与人际发展情况' },
      { position: 4, meaning: '行动力情况' },
      { position: 5, meaning: '学业发展趋势或现实情况' },
      { position: 6, meaning: '思维与技能发展情况' },
    ]
  },

  // 感情发展类
  {
    id: 'ambiguous',
    name: '暧昧牌阵',
    description: '分析暧昧关系的发展',
    category: '感情发展',
    positions: [
      { position: 1, meaning: 'ta的暧昧对象是否只有我' },
      { position: 2, meaning: '我和ta的感情发展' },
      { position: 3, meaning: 'ta对我的真实想法' },
      { position: 4, meaning: '我和ta如何增进感情' },
      { position: 5, meaning: '近期是否适合告白' },
    ]
  },
  {
    id: 'secret-love',
    name: '暗恋牌阵',
    description: '了解暗恋对象的想法',
    category: '感情发展',
    positions: [
      { position: 1, meaning: 'ta对我的真实想法' },
      { position: 2, meaning: 'ta对我的第一印象' },
      { position: 3, meaning: '我们在一起的可能性' },
      { position: 4, meaning: '近期是否要采取行动' },
      { position: 5, meaning: '我们关系的最后结果' },
      { position: 6, meaning: '指引/建议' },
    ]
  },
  {
    id: 'crush',
    name: '暗恋crush牌阵',
    description: '简单的暗恋分析',
    category: '感情发展',
    positions: [
      { position: 1, meaning: 'ta对我有没有好感' },
      { position: 2, meaning: 'ta对我的看法如何' },
      { position: 3, meaning: '会在一起吗' },
      { position: 4, meaning: '未来的关系走向' },
    ]
  },
  {
    id: 'new-love',
    name: '新恋情预测',
    description: '预测即将到来的恋情',
    category: '感情发展',
    positions: [
      { position: 1, meaning: '马上会有一段新恋情吗' },
      { position: 2, meaning: '对方的星座/特质' },
      { position: 3, meaning: '相处是否融洽' },
      { position: 4, meaning: '是否长久' },
      { position: 5, meaning: '是否为灵魂伴侣' },
      { position: 6, meaning: '结果' },
    ]
  },
  {
    id: 'future-lover',
    name: '未来恋人牌阵',
    description: '描绘未来恋人的特征',
    category: '感情发展',
    positions: [
      { position: 1, meaning: 'ta是什么类型' },
      { position: 2, meaning: 'ta已经出现了吗' },
      { position: 3, meaning: '你们的阻碍' },
      { position: 4, meaning: '相处模式' },
      { position: 5, meaning: '如何相遇/再次相遇' },
      { position: 6, meaning: '指引/建议' },
    ]
  },
  {
    id: 'peach-blossom',
    name: '桃花牌阵',
    description: '分析近期的桃花运势',
    category: '感情发展',
    positions: [
      { position: 1, meaning: '三个月内的桃花状况' },
      { position: 2, meaning: '对方星座' },
      { position: 3, meaning: '对方的外貌特征' },
      { position: 4, meaning: '持续时间' },
      { position: 5, meaning: '未来会遇到的问题' },
      { position: 6, meaning: '发展趋势' },
    ]
  },
  {
    id: 'peach-blossoms',
    name: '桃花朵朵开牌阵',
    description: '详细的桃花分析',
    category: '感情发展',
    positions: [
      { position: 1, meaning: '自身对情感的需求' },
      { position: 2, meaning: '明确自身恋爱方向' },
      { position: 3, meaning: '潜在桃花外形特质' },
      { position: 4, meaning: '桃花的性格和状态' },
      { position: 5, meaning: '桃花出现的时间' },
      { position: 6, meaning: '桃花出现的地点' },
      { position: 7, meaning: '发展趋势' },
      { position: 8, meaning: '感情发展趋势' },
      { position: 9, meaning: '感情发展趋势' },
      { position: 10, meaning: '应该怎么做' },
    ]
  },

  // 想法分析类
  {
    id: 'multi-dimension',
    name: '多维度想法感觉',
    description: '从多个维度分析对方想法',
    category: '想法分析',
    positions: [
      { position: 1, meaning: '表层想法' },
      { position: 2, meaning: '主体想法' },
      { position: 3, meaning: '潜意识想法' },
      { position: 4, meaning: '天使面' },
      { position: 5, meaning: '恶魔面' },
    ]
  },
  {
    id: 'thought-development',
    name: '想法和发展牌阵',
    description: '分析对方想法和未来发展',
    category: '想法分析',
    positions: [
      { position: 1, meaning: '对方的想法（表层）' },
      { position: 2, meaning: '对方的想法（深层）' },
      { position: 3, meaning: '对方的想法（潜意识）' },
      { position: 4, meaning: '未来的发展（短期）' },
      { position: 5, meaning: '未来的发展（中期）' },
      { position: 6, meaning: '未来的发展（长期）' },
    ]
  },
  {
    id: 'peek-heart',
    name: '窥探内心牌阵',
    description: '深入了解对方内心',
    category: '想法分析',
    positions: [
      { position: 1, meaning: '对方想从你身上得到什么' },
      { position: 2, meaning: '对你的喜欢程度' },
      { position: 3, meaning: 'ta的阴暗面' },
      { position: 4, meaning: '有无第三方' },
      { position: 5, meaning: '计划这段感情的态度' },
    ]
  },
  {
    id: 'missing',
    name: '思念牌阵',
    description: '了解对方是否在想你',
    category: '想法分析',
    positions: [
      { position: 1, meaning: 'ta在想我吗' },
      { position: 2, meaning: 'ta在等我吗' },
      { position: 3, meaning: 'ta对我的态度' },
      { position: 4, meaning: 'ta现在对我的感觉' },
      { position: 5, meaning: '我该怎么办' },
      { position: 6, meaning: '关系走向' },
    ]
  },

  // 关系分析类
  {
    id: 'venus',
    name: '维纳斯牌阵',
    description: '全面分析双方关系',
    category: '关系分析',
    positions: [
      { position: 1, meaning: '自己的看法' },
      { position: 2, meaning: '对方的心态' },
      { position: 3, meaning: '自己的影响' },
      { position: 4, meaning: '对方的影响' },
      { position: 5, meaning: '障碍' },
      { position: 6, meaning: '结果' },
      { position: 7, meaning: '自己未来的看法' },
      { position: 8, meaning: '对方未来的看法' },
    ]
  },
  {
    id: 'heart-voice',
    name: '心之声牌阵',
    description: '倾听内心的声音',
    category: '关系分析',
    positions: [
      { position: 1, meaning: '当前感情现状' },
      { position: 2, meaning: '不久的将来' },
      { position: 3, meaning: 'ta对你的内在看法' },
      { position: 4, meaning: 'ta对你的外在表现' },
      { position: 5, meaning: 'ta的状态' },
      { position: 6, meaning: 'ta希望的结果' },
      { position: 7, meaning: '你的状态' },
      { position: 8, meaning: '建议' },
    ]
  },
  {
    id: 'break-up',
    name: '断舍离牌阵',
    description: '决定是否应该放弃',
    category: '关系分析',
    positions: [
      { position: 1, meaning: '对方目前对我的想法' },
      { position: 2, meaning: '是否应该放弃这段感情（原因）' },
      { position: 3, meaning: '是否应该放弃这段感情（原因补充）' },
      { position: 4, meaning: '是否应该放弃这段感情（深层原因）' },
      { position: 5, meaning: '如果放弃后的发展' },
    ]
  },
  {
    id: 'destiny-wheel',
    name: '命运之轮牌阵',
    description: '探索命运的安排',
    category: '关系分析',
    positions: [
      { position: 1, meaning: '我和ta是命中注定吗' },
      { position: 2, meaning: '我们的缘分程度' },
      { position: 3, meaning: '这段感情能被认可吗' },
      { position: 4, meaning: '遇到障碍是否不被拆散' },
      { position: 5, meaning: 'ta所改变我的' },
      { position: 6, meaning: '我们的感情因果' },
    ]
  },
  {
    id: 'sincerity',
    name: '是否真心牌阵',
    description: '检验对方的真心',
    category: '关系分析',
    positions: [
      { position: 1, meaning: 'ta对你是否真心' },
      { position: 2, meaning: '真实的ta' },
      { position: 3, meaning: 'ta对你的真实想法' },
      { position: 4, meaning: 'ta认为的感情现状' },
      { position: 5, meaning: 'ta身边人对你的看法' },
      { position: 6, meaning: 'ta对你有什么隐藏的' },
      { position: 7, meaning: 'ta是否背叛过这段感情' },
      { position: 8, meaning: 'ta未来在关系中的样子' },
    ]
  },
  {
    id: 'cheating',
    name: '检验出轨牌阵',
    description: '检验是否有出轨',
    category: '关系分析',
    positions: [
      { position: 1, meaning: 'ta内心对这段感情是否动摇' },
      { position: 2, meaning: 'ta对我是否真心' },
      { position: 3, meaning: 'ta身边是否有第三方' },
      { position: 4, meaning: '这段感情的阻碍' },
      { position: 5, meaning: '未来发展与走向' },
    ]
  },

  // 事业财运类
  {
    id: 'career',
    name: '事业发展前景',
    description: '分析事业发展方向',
    category: '事业财运',
    positions: [
      { position: 1, meaning: '选择这份工作的原因' },
      { position: 2, meaning: '这条路是否正确' },
      { position: 3, meaning: '主要障碍' },
      { position: 4, meaning: '什么对我有益' },
      { position: 5, meaning: '如何让事业持续发展' },
    ]
  },
  {
    id: 'wealth',
    name: '财运改善牌阵',
    description: '改善财务状况',
    category: '事业财运',
    positions: [
      { position: 1, meaning: '改善财务状况需要注意的地方' },
      { position: 2, meaning: '如何改善财务状况/提升正财或偏财' },
      { position: 3, meaning: '未来的财务状况需要注意或如何做' },
    ]
  },

  // 人际关系类
  {
    id: 'friendship',
    name: '友情能量扫描牌阵',
    description: '扫描人际关系能量',
    category: '人际关系',
    positions: [
      { position: 1, meaning: '你在人际关系中的整体能量与角色' },
      { position: 2, meaning: '谁是真正支持你的人' },
      { position: 3, meaning: '谁表面亲近但内心复杂' },
      { position: 4, meaning: '谁对你有敌意或不喜欢你' },
      { position: 5, meaning: '被讨厌的原因/潜在问题' },
      { position: 6, meaning: '未来值得靠近的人' },
      { position: 7, meaning: '未来需要远离的人' },
    ]
  },

  // 时间发展类
  {
    id: 'development',
    name: '发展牌阵（事件推理）',
    description: '推理事件的发展',
    category: '时间发展',
    positions: [
      { position: 1, meaning: '事件开端' },
      { position: 2, meaning: '事件发展' },
      { position: 3, meaning: '事件阻碍' },
      { position: 4, meaning: '事件结果' },
      { position: 5, meaning: '对这件事的建议' },
    ]
  },
  {
    id: 'time-year',
    name: '时间发展牌阵（一年）',
    description: '预测一年的发展',
    category: '时间发展',
    positions: [
      { position: 1, meaning: '第一个月的发展' },
      { position: 2, meaning: '第二个月的发展' },
      { position: 3, meaning: '第三个月的发展' },
      { position: 4, meaning: '第四个月的发展' },
      { position: 5, meaning: '第五个月的发展' },
      { position: 6, meaning: '第六个月的发展' },
      { position: 7, meaning: '第七个月的发展' },
      { position: 8, meaning: '第八个月的发展' },
      { position: 9, meaning: '第九个月的发展' },
      { position: 10, meaning: '第十个月的发展' },
      { position: 11, meaning: '第十一个月的发展' },
      { position: 12, meaning: '第十二个月的发展' },
    ]
  },
  {
    id: 'time-half-year',
    name: '时间发展牌阵（半年）',
    description: '预测半年的发展',
    category: '时间发展',
    positions: [
      { position: 1, meaning: '第一个月的发展' },
      { position: 2, meaning: '第二个月的发展' },
      { position: 3, meaning: '第三个月的发展' },
      { position: 4, meaning: '第四个月的发展' },
      { position: 5, meaning: '第五个月的发展' },
      { position: 6, meaning: '第六个月的发展' },
    ]
  },
  {
    id: 'time-three-months',
    name: '时间发展牌阵（三个月）',
    description: '预测三个月的发展',
    category: '时间发展',
    positions: [
      { position: 1, meaning: '第一个月的发展' },
      { position: 2, meaning: '第二个月的发展' },
      { position: 3, meaning: '第三个月的发展' },
    ]
  },
];

export const threeCardSpreads = spreads.filter(spread => 
  spread.id.startsWith('three-card-')
);

export const spreadsByCategory = spreads.reduce((acc, spread) => {
  if (!acc[spread.category]) {
    acc[spread.category] = [];
  }
  acc[spread.category].push(spread);
  return acc;
}, {} as Record<string, Spread[]>);
