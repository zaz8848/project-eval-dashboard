const DATA = [
    {
        id: 1, name: '智能问数一期：会员概览数据智能解读', module: '智能问数', priority: 'P0', version: 'V1.0', risk: 'high', effort: null, status: '待评估', deadline: '2026-07',
        desc: '仅包含会员概览数据智能解读。通过自然语言对话式查询会员数据，支持基础数据权限管理。',
        techAnalysis: 'Copilot Studio 作为主交互平台。NL2SQL 能力集成（取决于客户是否已有服务）。通过 API 连接客户 CDP 数据库查询业务数据。Dataverse 仅存知识库配置和模板。',
        techs: [{ name: 'Copilot Studio', pct: 45 }, { name: 'NL2SQL/AI 能力集成', pct: 30 }, { name: 'API 集成（CDP 数据库）', pct: 20 }, { name: 'Dataverse（配置）', pct: 5 }],
        risks: [{ level: 'high', text: 'NL2SQL 准确率：复杂多表 JOIN、嵌套查询容易出错' }, { level: 'medium', text: '数据权限行级过滤：不同角色只能看自己区域数据，AI 不能泄露' }],
        diagram: 'graph LR\n  A[用户提问] --> B[Copilot Studio]\n  B --> C[Azure OpenAI]\n  C --> D[NL2SQL 转换]\n  D --> E[Dataverse/CDP 查询]\n  E --> F[结果格式化]\n  F --> G[返回用户]',
        note: '客户第一优先级。V1.0 核心验证项。',
        impact: 9, dependencies: [], monthlyCost: 500, costNotes: '', decisionLog: ''
    },
    {
        id: 2, name: '智能问数：CDP全报表问数覆盖', module: '智能问数', priority: 'P0', version: 'V2.0', risk: 'medium', effort: null, status: '待评估', deadline: '2026-10',
        desc: 'CDP全报表问数覆盖，支持对 CDP 系统内所有报表进行自然语言查询。',
        techAnalysis: '扩展 schema 覆盖。Copilot Studio 做 Agent 编排。NL2SQL 扩展。API 对接更多 CDP 报表数据源。',
        techs: [{ name: 'Copilot Studio', pct: 40 }, { name: 'NL2SQL/AI 能力集成', pct: 30 }, { name: 'API 集成（CDP 数据库）', pct: 25 }, { name: 'Dataverse（配置）', pct: 5 }],
        risks: [{ level: 'medium', text: '数据字典完整性决定查询覆盖范围' }],
        diagram: 'graph LR\n  A[全报表 Schema] --> B[Few-shot 模板库]\n  B --> C[NL2SQL Engine]\n  C --> D[多表查询]\n  D --> E[结果可视化]',
        note: '',
        impact: 7, dependencies: [1], monthlyCost: 800, costNotes: '', decisionLog: ''
    },
    {
        id: 3, name: 'AI人群画像洞察', module: '智能问数', priority: 'P1', version: 'V2.0', risk: 'medium', effort: null, status: '待评估', deadline: '2026-10',
        desc: '支持自然语义输入，自动识别人群特征，并生成可视化看板。',
        techAnalysis: 'Copilot Studio Agent 做语义入口。AI 能力做特征识别。API 查客户 CDP 数据库做画像聚合。可视化用 Power BI。',
        techs: [{ name: 'Copilot Studio', pct: 35 }, { name: 'NL2SQL/AI 能力集成', pct: 30 }, { name: 'API 集成（CDP 数据库）', pct: 20 }, { name: 'Power BI Embedded', pct: 15 }],
        risks: [{ level: 'medium', text: '可视化看板生成需要自定义开发，工作量较大' }],
        diagram: 'graph LR\n  A[语义输入] --> B[特征识别]\n  B --> C[人群筛选]\n  C --> D[画像聚合]\n  D --> E[可视化看板]',
        note: '',
        impact: 6, dependencies: [2], monthlyCost: 600, costNotes: '', decisionLog: ''
    },
    {
        id: 4, name: '数据复盘AI Agent（单个营销活动）', module: '智能问数', priority: 'P1', version: 'V2.1', risk: 'medium', effort: null, status: '待评估', deadline: '2026-12',
        desc: '基于单个营销活动数据自动解读营销结果和分析。',
        techAnalysis: 'Copilot Studio Agent 做复盘交互。AI 能力做数据分析。API 拉取客户 CDP 数据库中的营销活动数据。',
        techs: [{ name: 'Copilot Studio', pct: 40 }, { name: 'NL2SQL/AI 能力集成', pct: 35 }, { name: 'API 集成（CDP 数据库）', pct: 25 }],
        risks: [{ level: 'medium', text: '依赖 CDP 营销活动数据 API 的开放度' }],
        diagram: 'graph LR\n  A[营销活动ID] --> B[数据拉取]\n  B --> C[AI分析]\n  C --> D[效果总结]\n  D --> E[优化建议]',
        note: '',
        impact: 5, dependencies: [2], monthlyCost: 400, costNotes: '', decisionLog: ''
    },
    {
        id: 5, name: '智能问数已知未识别意图覆盖', module: '智能问数', priority: 'P2', version: 'V2.1', risk: 'low', effort: null, status: '待评估', deadline: '2026-12',
        desc: '覆盖智能问数中已知但未能识别的用户意图，提升问答准确率。',
        techAnalysis: '主要在 Copilot Studio 内补充 Topic 和意图规则。AI 辅助意图识别。Dataverse 存未识别意图日志。',
        techs: [{ name: 'Copilot Studio', pct: 55 }, { name: 'NL2SQL/AI 能力集成', pct: 25 }, { name: 'Dataverse（配置）', pct: 20 }],
        risks: [],
        diagram: 'graph LR\n  A[未识别意图日志] --> B[意图分析]\n  B --> C[补充规则]\n  C --> D[更新模型]',
        note: '',
        impact: 4, dependencies: [1], monthlyCost: 100, costNotes: '', decisionLog: ''
    },
    {
        id: 6, name: '数据复盘全AI Agent（多营销活动）', module: '智能问数', priority: 'P2', version: '远期', risk: 'medium', effort: null, status: '待评估', deadline: null,
        desc: '基于多个营销活动数据自动解读结果的AI数据问询和分析。',
        techAnalysis: '扩展为多活动对比分析。Copilot Studio 做选择交互。AI 做跨活动分析。API 拉取多活动数据。',
        techs: [{ name: 'Copilot Studio', pct: 35 }, { name: 'NL2SQL/AI 能力集成', pct: 35 }, { name: 'API 集成（CDP 数据库）', pct: 30 }],
        risks: [{ level: 'medium', text: '多活动对比分析数据量大，性能和准确性挑战' }],
        diagram: 'graph LR\n  A[多个活动数据] --> B[聚合分析]\n  B --> C[对比洞察]\n  C --> D[趋势总结]\n  D --> E[优化建议]',
        note: '',
        impact: 3, dependencies: [1], monthlyCost: 0, costNotes: '', decisionLog: ''
    },
    {
        id: 7, name: 'AI个人画像描述', module: '智能问数', priority: 'P2', version: '远期', risk: 'low', effort: null, status: '待评估', deadline: null,
        desc: '支持AI总结个人画像描述。',
        techAnalysis: 'Copilot Studio Agent 查个人会员数据。AI 生成画像描述。数据从客户 CDP 数据库获取。',
        techs: [{ name: 'Copilot Studio', pct: 45 }, { name: 'NL2SQL/AI 能力集成', pct: 35 }, { name: 'API 集成（CDP 数据库）', pct: 20 }],
        risks: [],
        diagram: 'graph LR\n  A[会员ID] --> B[数据查询]\n  B --> C[AI总结]\n  C --> D[画像描述]',
        note: '',
        impact: 3, dependencies: [1], monthlyCost: 0, costNotes: '', decisionLog: ''
    },
    {
        id: 8, name: 'AI生成营销文案', module: '营销助手', priority: 'P1', version: 'V1.0', risk: 'low', effort: null, status: '待评估', deadline: '2026-07',
        desc: '根据人群特征生成相符合的营销文案。',
        techAnalysis: 'Copilot Studio Agent 做文案交互入口。AI 能力做文案生成。Prompt 模板存 Dataverse。人群特征从 CDP DB 通过 API 获取。',
        techs: [{ name: 'Copilot Studio', pct: 45 }, { name: 'NL2SQL/AI 能力集成', pct: 40 }, { name: 'Dataverse（Prompt 模板）', pct: 15 }],
        risks: [{ level: 'low', text: '文案质量需人工审核把关' }],
        diagram: 'graph LR\n  A[人群特征] --> B[Prompt模板]\n  B --> C[GPT-4o生成]\n  C --> D[文案输出]\n  D --> E[人工审核]',
        note: '文案生成技术成熟度高。',
        impact: 8, dependencies: [], monthlyCost: 300, costNotes: '', decisionLog: ''
    },
    {
        id: 9, name: '自动圈选人群（标签/行为）', module: '营销助手', priority: 'P1', version: 'V2.0', risk: 'high', effort: null, status: '待评估', deadline: '2026-10',
        desc: '自动圈选人群：基于已有标签和行为进行人群筛选。',
        techAnalysis: 'Copilot Studio Agent 做对话式圈人。AI 能力解析圈人条件。核心依赖：CDP 系统的标签/行为筛选 API。',
        techs: [{ name: 'Copilot Studio', pct: 35 }, { name: 'NL2SQL/AI 能力集成', pct: 25 }, { name: 'API 集成（CDP 接口）', pct: 35 }, { name: 'Dataverse（配置）', pct: 5 }],
        risks: [{ level: 'high', text: 'CDP API 开放度：圈人接口可能不全或不稳定' }],
        diagram: 'graph LR\n  A[自然语言条件] --> B[NLP解析]\n  B --> C[标签/行为映射]\n  C --> D[CDP圈人API]\n  D --> E[人群结果]',
        note: '',
        impact: 7, dependencies: [8], monthlyCost: 400, costNotes: '', decisionLog: ''
    },
    {
        id: 10, name: '自动创建营销画布', module: '营销助手', priority: 'P1', version: 'V2.0', risk: 'high', effort: null, status: '待评估', deadline: '2026-10',
        desc: '通过自然语义交互形成营销画布，可人工调整配置。',
        techAnalysis: 'Copilot Studio 做目标解析。AI 生成画布结构。核心在 API 调 CDP 画布创建接口——API 开放度是最大风险。',
        techs: [{ name: 'Copilot Studio', pct: 30 }, { name: 'NL2SQL/AI 能力集成', pct: 25 }, { name: 'API 集成（CDP 接口）', pct: 40 }, { name: 'Dataverse（配置）', pct: 5 }],
        risks: [{ level: 'high', text: 'CDP API 开放度：画布创建接口依赖重，是 V2.0 最大风险' }],
        diagram: 'graph LR\n  A[营销目标描述] --> B[AI解析]\n  B --> C[画布结构生成]\n  C --> D[CDP画布API]\n  D --> E[用户微调]',
        note: '',
        impact: 6, dependencies: [9], monthlyCost: 500, costNotes: '', decisionLog: ''
    },
    {
        id: 11, name: '自动圈选人群（语义理解）', module: '营销助手', priority: 'P1', version: 'V2.1', risk: 'medium', effort: null, status: '待评估', deadline: '2026-12',
        desc: '基于语义理解的行为识别和自动标签，自动圈选人群。',
        techAnalysis: '升级语义理解。Copilot Studio + AI 能力做深层语义。API 对接 CDP 行为数据。',
        techs: [{ name: 'Copilot Studio', pct: 35 }, { name: 'NL2SQL/AI 能力集成', pct: 35 }, { name: 'API 集成（CDP 接口）', pct: 25 }, { name: 'Dataverse（配置）', pct: 5 }],
        risks: [{ level: 'medium', text: '语义理解准确率，自动标签可能产生噪声' }],
        diagram: 'graph LR\n  A[行为数据] --> B[语义理解]\n  B --> C[特征识别]\n  C --> D[自动标签]\n  D --> E[人群圈选]',
        note: '',
        impact: 5, dependencies: [9], monthlyCost: 0, costNotes: '', decisionLog: ''
    },
    {
        id: 12, name: 'AI营销内容图片生成', module: '营销助手', priority: 'P2', version: 'V2.1', risk: 'low', effort: null, status: '待评估', deadline: '2026-12',
        desc: 'AI生成优惠券图片、公告/弹窗营销图片。',
        techAnalysis: 'Copilot Studio 做生成入口。核心是 AI 图片生成服务。需自定义品牌模板管理和审核流程。',
        techs: [{ name: 'Copilot Studio', pct: 15 }, { name: 'AI 图片生成服务', pct: 50 }, { name: '自定义开发', pct: 25 }, { name: 'Dataverse（模板）', pct: 10 }],
        risks: [{ level: 'low', text: '品牌一致性难保证，需模板化 + 素材库约束 + 人工审核' }],
        diagram: 'graph LR\n  A[营销主题] --> B[Prompt构建]\n  B --> C[DALL-E 3]\n  C --> D[图片生成]\n  D --> E[品牌审核]',
        note: '',
        impact: 4, dependencies: [11], monthlyCost: 200, costNotes: '', decisionLog: ''
    },
    {
        id: 13, name: '通用营销方案策划', module: '营销策略', priority: 'P1', version: 'V1.0', risk: 'low', effort: null, status: '待评估', deadline: '2026-07',
        desc: '通用营销方案策划：基于人群特征的通用策略推荐。',
        techAnalysis: 'Copilot Studio Agent 做策略问答——最擅长的场景。AI 能力做策略生成。知识库存 Dataverse。',
        techs: [{ name: 'Copilot Studio', pct: 50 }, { name: 'NL2SQL/AI 能力集成', pct: 30 }, { name: 'Dataverse（知识库）', pct: 20 }],
        risks: [{ level: 'low', text: '通用策略精度有限，需迭代优化' }],
        diagram: 'graph LR\n  A[人群特征] --> B[知识库匹配]\n  B --> C[策略推荐]\n  C --> D[方案输出]',
        note: 'V1.0 先做通用模板。',
        impact: 8, dependencies: [], monthlyCost: 200, costNotes: '', decisionLog: ''
    },
    {
        id: 14, name: '人群特征营销内容建议', module: '营销策略', priority: 'P1', version: 'V2.0', risk: 'medium', effort: null, status: '待评估', deadline: '2026-10',
        desc: '根据人群特征生成相符合的营销内容建议，涵盖：文案方案、优惠建议、渠道建议等。',
        techAnalysis: '需要策略引擎对接 CDP 历史营销数据进行分析，结合 Azure OpenAI 生成个性化建议。比 V1.0 通用策划复杂度显著提升。',
        techs: [{ name: 'Copilot Studio', pct: 30 }, { name: 'NL2SQL/AI 能力集成', pct: 30 }, { name: 'API 集成（CDP 数据库）', pct: 25 }, { name: '自定义策略引擎', pct: 15 }],
        risks: [{ level: 'medium', text: '策略引擎需对接 CDP 历史数据，开发量较大' }],
        diagram: 'graph LR\n  A[人群画像] --> B[历史数据]\n  B --> C[策略引擎]\n  C --> D[文案建议]\n  C --> E[优惠建议]\n  C --> F[渠道建议]',
        note: '',
        impact: 6, dependencies: [13], monthlyCost: 300, costNotes: '', decisionLog: ''
    },
    {
        id: 15, name: '营销专家库', module: '营销策略', priority: 'P2', version: 'V2.1', risk: 'high', effort: null, status: '待评估', deadline: '2026-12',
        desc: '营销专家库：营销活动触达方式推荐、触达效果转化提升建议、营销活动亮核审核提升建议、营销活动ROI提升建议等。',
        techAnalysis: '最复杂模块。核心是自定义策略引擎 + AI 效果归因分析。需要大量 CDP DB 历史数据。',
        techs: [{ name: 'Copilot Studio', pct: 20 }, { name: 'NL2SQL/AI 能力集成', pct: 30 }, { name: '自定义策略引擎', pct: 35 }, { name: 'API 集成（CDP 数据库）', pct: 15 }],
        risks: [{ level: 'high', text: '领域知识积累周期长，需大量实践数据验证效果归因模型' }],
        diagram: 'graph LR\n  A[营销活动数据] --> B[效果归因]\n  B --> C[专家知识库]\n  C --> D[触达推荐]\n  C --> E[转化建议]\n  C --> F[ROI优化]',
        note: '最复杂模块，需深度定制。',
        impact: 4, dependencies: [14], monthlyCost: 800, costNotes: '', decisionLog: ''
    },
    {
        id: 16, name: '操作系统使用说明', module: '营销策略', priority: 'P2', version: '远期', risk: 'low', effort: null, status: '待评估', deadline: null,
        desc: 'CDP 操作系统使用说明文档 AI 化。',
        techAnalysis: '纯 Copilot Studio 知识库功能，导入操作手册即可。最简单的功能点。',
        techs: [{ name: 'Copilot Studio', pct: 80 }, { name: 'Dataverse（知识库）', pct: 20 }],
        risks: [],
        diagram: 'graph LR\n  A[操作手册] --> B[知识库导入]\n  B --> C[Copilot Studio]\n  C --> D[问答输出]',
        note: '',
        impact: 2, dependencies: [], monthlyCost: 0, costNotes: '', decisionLog: ''
    },
    {
        id: 17, name: 'CDP指标问询', module: '营销策略', priority: 'P2', version: '远期', risk: 'low', effort: null, status: '待评估', deadline: null,
        desc: '支持 CDP 指标的自然语言问询。',
        techAnalysis: '复用智能问数 NL2SQL 能力。Copilot Studio Agent 做问询交互。API 查 CDP 数据库指标。',
        techs: [{ name: 'Copilot Studio', pct: 45 }, { name: 'NL2SQL/AI 能力集成', pct: 30 }, { name: 'API 集成（CDP 数据库）', pct: 25 }],
        risks: [],
        diagram: 'graph LR\n  A[指标问询] --> B[NL2SQL]\n  B --> C[数据查询]\n  C --> D[指标解读]',
        note: '',
        impact: 3, dependencies: [], monthlyCost: 0, costNotes: '', decisionLog: ''
    },
    {
        id: 18, name: '知识库管理', module: '基础后台', priority: 'P0', version: 'V1.0', risk: 'low', effort: null, status: '待评估', deadline: '2026-07',
        desc: '基础后台：知识库管理（CDP 数据字典、业务文档）。',
        techAnalysis: '知识库是配置数据，存 Dataverse。Power Apps 做管理界面。Copilot Studio 知识源直连。',
        techs: [{ name: 'Copilot Studio', pct: 25 }, { name: 'Dataverse', pct: 40 }, { name: 'Power Apps', pct: 35 }],
        risks: [],
        diagram: 'graph LR\n  A[数据字典] --> B[Dataverse]\n  C[业务文档] --> B\n  B --> D[Copilot Studio知识源]\n  E[Power Apps管理] --> B',
        note: '基础设施，必须同步启动。',
        impact: 9, dependencies: [], monthlyCost: 100, costNotes: '', decisionLog: ''
    },
    {
        id: 19, name: '提示词管理', module: '基础后台', priority: 'P0', version: 'V1.0', risk: 'low', effort: null, status: '待评估', deadline: '2026-07',
        desc: '基础后台：提示词管理（Prompt 模板 CRUD）。',
        techAnalysis: 'Prompt 模板是配置数据，存 Dataverse。Power Apps 做 CRUD。',
        techs: [{ name: 'Copilot Studio', pct: 15 }, { name: 'Dataverse', pct: 45 }, { name: 'Power Apps', pct: 40 }],
        risks: [],
        diagram: 'graph LR\n  A[Prompt模板] --> B[Dataverse]\n  B --> C[版本控制]\n  B --> D[AI Agent调用]\n  E[Power Apps] --> A',
        note: '',
        impact: 8, dependencies: [], monthlyCost: 0, costNotes: '', decisionLog: ''
    },
    {
        id: 20, name: 'AI效率提升数据统计', module: '基础后台', priority: 'P1', version: 'V1.0', risk: 'low', effort: null, status: '待评估', deadline: '2026-07',
        desc: '基础后台：AI效率提升数据统计。',
        techAnalysis: '使用日志存 Dataverse。Power Apps/BI 做统计看板。',
        techs: [{ name: 'Copilot Studio', pct: 20 }, { name: 'Dataverse', pct: 35 }, { name: 'Power Apps', pct: 25 }, { name: 'Power BI', pct: 20 }],
        risks: [{ level: 'medium', text: 'Copilot Studio 按量计费，需预估月消息量' }],
        diagram: 'graph LR\n  A[使用日志] --> B[Dataverse]\n  B --> C[统计看板]\n  B --> D[计费统计]',
        note: '',
        impact: 5, dependencies: [], monthlyCost: 150, costNotes: '', decisionLog: ''
    },
    {
        id: 21, name: '会员核心数据解读策略', module: '基础后台', priority: 'P1', version: 'V1.0', risk: 'medium', effort: null, status: '待评估', deadline: '2026-07',
        desc: '策略中心：会员核心数据解读策略配置。',
        techAnalysis: '策略规则存 Dataverse。Power Apps 做配置。Copilot Studio Agent 调用规则解读。',
        techs: [{ name: 'Copilot Studio', pct: 30 }, { name: 'Dataverse', pct: 30 }, { name: 'Power Apps', pct: 25 }, { name: '自定义规则引擎', pct: 15 }],
        risks: [{ level: 'medium', text: '规则引擎需自定义开发' }],
        diagram: 'graph LR\n  A[策略规则] --> B[规则引擎]\n  B --> C[数据解读模板]\n  C --> D[AI Agent调用]\n  E[Power Apps配置] --> A',
        note: '',
        impact: 7, dependencies: [], monthlyCost: 0, costNotes: '', decisionLog: ''
    },
    {
        id: 22, name: '会员画像解读策略', module: '基础后台', priority: 'P1', version: 'V1.0', risk: 'low', effort: null, status: '待评估', deadline: '2026-07',
        desc: '策略中心：会员画像解读策略配置。',
        techAnalysis: '与核心数据解读相同结构，针对画像维度。',
        techs: [{ name: 'Copilot Studio', pct: 30 }, { name: 'Dataverse', pct: 30 }, { name: 'Power Apps', pct: 25 }, { name: '自定义规则引擎', pct: 15 }],
        risks: [],
        diagram: 'graph LR\n  A[画像规则] --> B[规则引擎]\n  B --> C[画像解读]\n  C --> D[AI Agent调用]',
        note: '',
        impact: 6, dependencies: [], monthlyCost: 0, costNotes: '', decisionLog: ''
    },
    {
        id: 23, name: 'CDP AI助手嵌入CDP系统', module: '基础后台', priority: 'P0', version: 'V1.0', risk: 'low', effort: null, status: '待评估', deadline: '2026-07',
        desc: '基础交互：CDP AI助手插件内嵌CDP系统。',
        techAnalysis: '核心就是 Copilot Studio Web Channel + iframe 嵌入。最直接体现 Copilot Studio 价值。',
        techs: [{ name: 'Copilot Studio', pct: 70 }, { name: '自定义开发（iframe）', pct: 25 }, { name: 'Dataverse（配置）', pct: 5 }],
        risks: [],
        diagram: 'graph LR\n  A[Copilot Studio Bot] --> B[Web Channel]\n  B --> C[iframe嵌入]\n  C --> D[CDP系统页面]',
        note: '',
        impact: 8, dependencies: [], monthlyCost: 0, costNotes: '', decisionLog: ''
    },
    {
        id: 24, name: '核心数据解读策略（V2.0升级）', module: '基础后台', priority: 'P1', version: 'V2.0', risk: 'medium', effort: null, status: '待评估', deadline: '2026-10',
        desc: '基础后台V2.0：核心数据解读策略升级。',
        techAnalysis: 'V1.0 基础上扩展更多维度。Copilot Studio 做 Agent 运行时。',
        techs: [{ name: 'Copilot Studio', pct: 25 }, { name: 'Dataverse', pct: 30 }, { name: '自定义规则引擎', pct: 30 }, { name: 'NL2SQL/AI 能力集成', pct: 15 }],
        risks: [{ level: 'medium', text: '规则复杂度提升' }],
        diagram: 'graph LR\n  A[扩展规则] --> B[规则引擎V2]\n  B --> C[多维解读]\n  C --> D[AI增强]',
        note: '',
        impact: 5, dependencies: [21], monthlyCost: 0, costNotes: '', decisionLog: ''
    },
    {
        id: 25, name: '独立AI助手Tab页面', module: '基础后台', priority: 'P1', version: 'V2.0', risk: 'low', effort: null, status: '待评估', deadline: '2026-10',
        desc: '交互升级：单独的AI助手tab页面（从嵌入式升级为独立页面）。',
        techAnalysis: '从 iframe 升级为独立 Tab。核心仍是 Copilot Studio。',
        techs: [{ name: 'Copilot Studio', pct: 50 }, { name: '自定义开发', pct: 35 }, { name: 'Power Apps', pct: 15 }],
        risks: [],
        diagram: 'graph LR\n  A[CDP系统] --> B[AI助手Tab]\n  B --> C[Copilot Studio]\n  C --> D[完整交互界面]',
        note: '',
        impact: 4, dependencies: [23], monthlyCost: 0, costNotes: '', decisionLog: ''
    },
    {
        id: 26, name: '基于智能六步法的提示词', module: '基础后台', priority: 'P1', version: 'V2.0', risk: 'low', effort: null, status: '待评估', deadline: '2026-10',
        desc: '交互升级：基于智能六步法的提示词优化。',
        techAnalysis: '核心在 Copilot Studio Topic 设计——六步引导流程。',
        techs: [{ name: 'Copilot Studio', pct: 60 }, { name: 'Dataverse（模板）', pct: 25 }, { name: '自定义开发', pct: 15 }],
        risks: [],
        diagram: 'graph LR\n  A[用户输入] --> B[六步引导]\n  B --> C[意图明确化]\n  C --> D[精准Prompt]\n  D --> E[高质量输出]',
        note: '',
        impact: 4, dependencies: [25], monthlyCost: 0, costNotes: '', decisionLog: ''
    },
    {
        id: 27, name: '营销活动数据复盘解读策略', module: '基础后台', priority: 'P1', version: 'V2.1', risk: 'medium', effort: null, status: '待评估', deadline: '2026-12',
        desc: '策略中心：营销活动数据复盘解读策略配置。',
        techAnalysis: '为复盘 Agent 提供解读规则配置。',
        techs: [{ name: 'Copilot Studio', pct: 25 }, { name: 'Dataverse', pct: 30 }, { name: '自定义规则引擎', pct: 25 }, { name: 'NL2SQL/AI 能力集成', pct: 20 }],
        risks: [{ level: 'medium', text: '需要营销活动数据结构标准化' }],
        diagram: 'graph LR\n  A[复盘规则] --> B[规则引擎]\n  B --> C[解读模板]\n  C --> D[复盘Agent调用]',
        note: '',
        impact: 5, dependencies: [4], monthlyCost: 0, costNotes: '', decisionLog: ''
    },
    {
        id: 28, name: '营销活动数据问数解读策略', module: '基础后台', priority: 'P1', version: 'V2.1', risk: 'low', effort: null, status: '待评估', deadline: '2026-12',
        desc: '策略中心：营销活动数据问数解读策略配置。',
        techAnalysis: '与复盘策略类似结构。',
        techs: [{ name: 'Copilot Studio', pct: 25 }, { name: 'Dataverse', pct: 30 }, { name: '自定义规则引擎', pct: 25 }, { name: 'NL2SQL/AI 能力集成', pct: 20 }],
        risks: [],
        diagram: 'graph LR\n  A[问数规则] --> B[规则引擎]\n  B --> C[解读模板]\n  C --> D[问数Agent调用]',
        note: '',
        impact: 4, dependencies: [27], monthlyCost: 0, costNotes: '', decisionLog: ''
    },
    {
        id: 29, name: '智能问数交互技术框架升级', module: '基础后台', priority: 'P2', version: 'V2.1', risk: 'medium', effort: null, status: '待评估', deadline: '2026-12',
        desc: '基础能力：智能问数交互技术实施框架升级。',
        techAnalysis: '基于反馈升级交互框架。Copilot Studio 做核心平台。',
        techs: [{ name: 'Copilot Studio', pct: 40 }, { name: '自定义开发', pct: 40 }, { name: 'NL2SQL/AI 能力集成', pct: 20 }],
        risks: [{ level: 'medium', text: '框架升级可能影响已有功能' }],
        diagram: 'graph LR\n  A[用户反馈] --> B[框架评估]\n  B --> C[架构升级]\n  C --> D[性能优化]\n  D --> E[体验提升]',
        note: '',
        impact: 3, dependencies: [1], monthlyCost: 0, costNotes: '', decisionLog: ''
    },
];

const PLANS = [
    {
        id: 'plan-a',
        name: '阶段一：三大核心功能 + 基础能力底座',
        tag: '推荐',
        summary: '聚焦 3 个核心业务功能，配套基础能力底座，双方协同开发快速验证价值。',
        strategy: '核心功能：智能问数 + 人群画像洞察 + 自动圈选人群。基础底座：知识库、提示词、解读策略作为支撑同步建设。',
        coreFeatures: [
            { name: '智能问数（含会员概览）', desc: '自然语言查询会员数据，覆盖会员概览、生命周期等核心指标。<br/><b style=\"color:#EF4444\">【前提条件】</b>NL2SQL（自然语言转SQL）能力由客户侧提供现成组件或第三方服务，微软负责将该组件集成至 Copilot Studio Agent 中完成端到端调用，<b style=\"color:#EF4444\">微软不承担 NL2SQL 引擎的开发与调优工作</b>。', module: '智能问数', featureIds: [1, 2, 5], ourWork: 'Copilot Studio Agent 搭建 + 对接客户提供的 NL2SQL 组件（集成调用，不含引擎开发）', clientWork: '提供 NL2SQL 组件/服务 + CDP 数据库 schema 及字段说明 + 数据查询 API', jointWork: '联调查询接口 + 端到端准确率验证' },
            { name: 'AI 人群画像洞察', desc: '语义输入自动识别人群特征，生成画像分析', module: '智能问数', featureIds: [3, 7], ourWork: 'Copilot Studio Agent + AI 特征识别', clientWork: '人群标签体系、画像数据 API', jointWork: '画像准确度验证' },
            { name: '自动圈选人群', desc: '基于标签和行为的对话式人群圈选', module: '营销助手', featureIds: [9, 11], ourWork: 'Copilot Studio 对话式交互 + NLP 解析', clientWork: 'CDP 标签/行为筛选 API', jointWork: '圈人结果验证 + 准确度调优' },
        ],
        baseInfra: [
            { name: '知识库管理', desc: 'CDP 数据字典、业务文档的知识库搭建与管理', why: '智能问数的 NL2SQL 需要数据字典作为上下文', featureIds: [18] },
            { name: '提示词管理', desc: 'Prompt 模板的 CRUD 和版本管理', why: '所有 AI 功能的 Prompt 统一管理', featureIds: [19] },
            { name: '会员数据解读策略', desc: '会员核心数据和画像的解读规则配置', why: '智能问数和画像洞察需要解读规则', featureIds: [21, 22] },
            { name: 'CDP AI 助手嵌入', desc: '将 AI 助手嵌入 CDP 系统', why: '所有功能的统一入口', featureIds: [23] },
        ],
        phases: [
            { name: '第一阶段：核心验证（6-8周）', items: ['NL2SQL POC 验证', '智能问数一期', 'AI 人群画像洞察', '自动圈选人群', '知识库管理', '提示词管理', '解读策略配置', 'CDP AI 助手嵌入'], focus: '3 大核心功能跑通 + 基础底座搭建', acceptance: '用户能在 CDP 中通过 AI 助手查数据、看画像、圈人群' },
            { name: '第二阶段：能力扩展', items: ['AI 生成营销文案', '通用营销方案策划', 'CDP 全报表问数覆盖', 'AI 效率数据统计'], focus: '营销内容生成 + 问数范围扩展', acceptance: '文案生成 + 全报表覆盖' },
            { name: '第三阶段：深度自动化', items: ['自动创建营销画布', '营销专家库', '数据复盘 Agent', 'AI 营销图片生成'], focus: '全流程自动化', acceptance: '营销闭环自动化' },
        ],
        pros: ['聚焦 3 个高价值功能，交付目标清晰', '双方协同分工明确，不互相阻塞', '基础底座同步建设，为后续扩展打基础', '可争取微软技术支持资源'],
        cons: ['营销文案/策略功能延后', '需要客户配合提供 API 和数据字典'],
        ganttTasks: [
            { section: '核心功能', name: 'NL2SQL 集成验证（调用客户组件）', start: '2026-06-02', days: 5 },
            { section: '核心功能', name: '智能问数一期', start: '2026-06-06', days: 6 },
            { section: '核心功能', name: 'AI 人群画像洞察', start: '2026-06-11', days: 6 },
            { section: '核心功能', name: '自动圈选人群', start: '2026-06-15', days: 6 },
            { section: '基础底座', name: '知识库管理', start: '2026-06-06', days: 5 },
            { section: '基础底座', name: '提示词管理', start: '2026-06-06', days: 5 },
            { section: '基础底座', name: '解读策略配置', start: '2026-06-11', days: 4 },
            { section: '基础底座', name: 'CDP AI 助手嵌入', start: '2026-06-06', days: 3 },
            { section: '里程碑', name: '第一阶段交付', start: '2026-07-25', days: 0, milestone: true },
        ]
    },
    {
        id: 'plan-b',
        name: '阶段二：全量功能覆盖 + 分版本交付',
        tag: null,
        summary: '覆盖全部功能点，按 V1.0 / V2.0 / V2.1 三期交付，对齐客户原始产品路线图。',
        strategy: '三期分批交付：V1.0 打基础（8个功能），V2.0 智能化升级（6个功能），V2.1 深度 AI（5个功能）。',
        // 按期分组的功能点
        phaseFeatures: [
            {
                phase: 'V1.0',
                title: '第一期：基础能力（6-7月）',
                focus: '四大模块基础功能全部上线',
                features: [
                    { name: '智能问数一期', desc: '会员概览数据智能解读', module: '智能问数', featureIds: [1], ourWork: 'Copilot Studio + NL2SQL', clientWork: 'CDP DB schema + API' },
                    { name: 'AI 生成营销文案', desc: '根据人群特征生成文案', module: '营销助手', featureIds: [8], ourWork: 'Copilot Studio + Prompt', clientWork: '人群特征 API' },
                    { name: '通用营销方案策划', desc: '通用策略推荐', module: '营销策略', featureIds: [13], ourWork: 'Copilot Studio 知识库', clientWork: '营销方法论' },
                    { name: '知识库管理', desc: '数据字典 + 业务文档', module: '基础后台', featureIds: [18], ourWork: 'Dataverse + Power Apps', clientWork: '数据字典提供' },
                    { name: '提示词管理', desc: 'Prompt CRUD', module: '基础后台', featureIds: [19], ourWork: 'Dataverse + Power Apps', clientWork: 'Prompt 需求' },
                    { name: '策略中心', desc: '数据 + 画像解读规则', module: '基础后台', featureIds: [21, 22], ourWork: '规则引擎 + 配置', clientWork: '规则逻辑' },
                    { name: 'CDP AI 助手嵌入', desc: 'iframe 嵌入 CDP', module: '基础后台', featureIds: [23], ourWork: 'Web Channel', clientWork: 'CDP 嵌入位' },
                    { name: 'AI 效率统计', desc: '使用量 + 看板', module: '基础后台', featureIds: [20], ourWork: 'Dataverse + Power BI', clientWork: '指标定义' },
                ],
            },
            {
                phase: 'V2.0',
                title: '第二期：智能化升级（8-10月）',
                focus: '问数扩展 + 自动化 + 个性化',
                features: [
                    { name: 'CDP 全报表问数', desc: '扩展到全报表查询', module: '智能问数', featureIds: [2], ourWork: 'NL2SQL 扩展 schema', clientWork: '全量数据字典' },
                    { name: 'AI 人群画像洞察', desc: '语义识别人群特征', module: '智能问数', featureIds: [3], ourWork: 'Copilot Studio + AI', clientWork: '标签 + 画像 API' },
                    { name: '自动圈选人群', desc: '对话式标签/行为圈人', module: '营销助手', featureIds: [9], ourWork: 'NLP 解析 + 交互', clientWork: 'CDP 圈人 API' },
                    { name: '自动创建营销画布', desc: '语义生成画布', module: '营销助手', featureIds: [10], ourWork: 'AI 画布生成', clientWork: 'CDP 画布 API' },
                    { name: '人群特征营销建议', desc: '文案/优惠/渠道建议', module: '营销策略', featureIds: [14], ourWork: '策略引擎', clientWork: '历史营销数据' },
                    { name: '后台升级', desc: '独立 Tab + 六步法 + 策略升级', module: '基础后台', featureIds: [24, 25, 26], ourWork: '交互 + 规则升级', clientWork: '需求反馈' },
                ],
            },
            {
                phase: 'V2.1',
                title: '第三期：深度 AI（Q4）',
                focus: '复盘 + 专家系统 + 图片生成',
                features: [
                    { name: '数据复盘 Agent', desc: '单/多营销活动复盘', module: '智能问数', featureIds: [4, 6], ourWork: 'Agent + 分析', clientWork: '活动数据 API' },
                    { name: '语义理解圈人', desc: '深层语义 + 自动标签', module: '营销助手', featureIds: [11], ourWork: 'NLP 升级', clientWork: '行为数据' },
                    { name: 'AI 营销图片生成', desc: '优惠券/营销图', module: '营销助手', featureIds: [12], ourWork: 'AI 图片服务', clientWork: '品牌素材' },
                    { name: '营销专家库', desc: '触达/转化/ROI 建议', module: '营销策略', featureIds: [15], ourWork: '效果归因模型', clientWork: '历史效果数据' },
                    { name: '交互框架升级', desc: '性能 + 体验优化', module: '基础后台', featureIds: [29], ourWork: '框架重构', clientWork: '需求反馈' },
                ],
            },
        ],
        coreFeatures: null,
        baseInfra: null,
        phases: [
            { name: 'V1.0（6-7月）', items: ['智能问数一期', 'AI 生成营销文案', '通用营销方案策划', '知识库管理', '提示词管理', '策略中心', 'CDP AI 助手嵌入', 'AI 效率统计'], focus: '四模块 V1.0 全部交付', acceptance: '基础功能全部可用' },
            { name: 'V2.0（8-10月）', items: ['CDP 全报表问数', '人群画像洞察', '自动圈选人群', '自动创建画布', '营销建议', '后台升级'], focus: '智能化 + 自动化', acceptance: '自动化上线' },
            { name: 'V2.1（Q4）', items: ['数据复盘 Agent', '语义圈人', '图片生成', '营销专家库', '框架升级'], focus: '深度 AI', acceptance: '全 Agent 上线' },
        ],
        pros: ['完整覆盖：29 个功能全规划', '分期交付：节奏清晰', '对齐客户原始路线图'],
        cons: ['V1.0 功能多，交付压力大', 'NL2SQL 不通影响全局', '需要更多并行资源', '单点验证不够深入'],
        ganttTasks: [
            // V1.0
            { section: 'V1.0', name: '智能问数一期', start: '2026-06-02', days: 14 },
            { section: 'V1.0', name: 'AI 营销文案', start: '2026-06-11', days: 14 },
            { section: 'V1.0', name: '营销方案策划', start: '2026-06-16', days: 14 },
            { section: 'V1.0', name: '知识库管理', start: '2026-06-02', days: 10 },
            { section: 'V1.0', name: '提示词管理', start: '2026-06-05', days: 7 },
            { section: 'V1.0', name: '策略中心', start: '2026-06-02', days: 10 },
            { section: 'V1.0', name: 'AI 助手嵌入', start: '2026-06-06', days: 7 },
            { section: 'V1.0', name: 'AI 效率统计', start: '2026-06-06', days: 7 },
            { section: '里程碑', name: 'V1.0 交付', start: '2026-06-21', days: 0, milestone: true },
            // V2.0
            { section: 'V2.0', name: '全报表问数', start: '2026-07-01', days: 14 },
            { section: 'V2.0', name: '画像洞察', start: '2026-07-11', days: 14 },
            { section: 'V2.0', name: '自动圈人', start: '2026-07-11', days: 14 },
            { section: 'V2.0', name: '营销画布', start: '2026-07-01', days: 14 },
            { section: 'V2.0', name: '营销建议', start: '2026-07-01', days: 14 },
            { section: 'V2.0', name: '后台升级', start: '2026-07-01', days: 12 },
            { section: '里程碑', name: 'V2.0 交付', start: '2026-07-12', days: 0, milestone: true },
            // V2.1
            { section: 'V2.1', name: '复盘 Agent', start: '2026-07-26', days: 14 },
            { section: 'V2.1', name: '语义圈人', start: '2026-07-31', days: 14 },
            { section: 'V2.1', name: 'AI 图片', start: '2026-07-31', days: 14 },
            { section: 'V2.1', name: '营销专家库', start: '2026-07-31', days: 14 },
            { section: 'V2.1', name: '框架升级', start: '2026-07-31', days: 21 },
            { section: '里程碑', name: 'V2.1 交付', start: '2026-07-30', days: 0, milestone: true },
        ]
    }
];

export { DATA, PLANS };
