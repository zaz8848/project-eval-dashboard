const DATA = [
    // ===== 智能问数 =====
    {
        id: 1, name: '智能问数一期：会员概览数据智能解读', module: '智能问数', priority: 'P0', version: 'V1.0', risk: 'high', effort: null, status: '待评估',
        desc: '仅包含会员概览数据智能解读。通过自然语言对话式查询会员数据，支持基础数据权限管理。',
        techAnalysis: 'Copilot Studio 做对话交互层 + Azure OpenAI GPT-4o 做 NL2SQL（自然语言转 SQL）。需要 CDP 数据字典作为 few-shot 上下文注入。行级数据权限通过 Dataverse 安全角色 + Copilot Studio 用户身份透传实现。',
        techs: [{ name: 'Copilot Studio', pct: 40 }, { name: 'Azure OpenAI', pct: 35 }, { name: 'Dataverse', pct: 15 }, { name: '自定义开发', pct: 10 }],
        risks: [{ level: 'high', text: 'NL2SQL 准确率：复杂多表 JOIN、嵌套查询容易出错' }, { level: 'medium', text: '数据权限行级过滤：不同角色只能看自己区域数据，AI 不能泄露' }],
        diagram: 'graph LR\n  A[用户提问] --> B[Copilot Studio]\n  B --> C[Azure OpenAI]\n  C --> D[NL2SQL 转换]\n  D --> E[Dataverse/CDP 查询]\n  E --> F[结果格式化]\n  F --> G[返回用户]',
        note: '客户第一优先级。V1.0 核心验证项。'
    },

    {
        id: 2, name: '智能问数：CDP全报表问数覆盖', module: '智能问数', priority: 'P0', version: 'V2.0', risk: 'medium', effort: null, status: '待评估',
        desc: 'CDP全报表问数覆盖，支持对 CDP 系统内所有报表进行自然语言查询。',
        techAnalysis: '在 V1.0 基础上扩展 schema 覆盖范围，需要完整的 CDP 数据字典。Few-shot 模板库需要按报表类型分类管理。',
        techs: [{ name: 'Copilot Studio', pct: 35 }, { name: 'Azure OpenAI', pct: 35 }, { name: 'Dataverse', pct: 15 }, { name: '自定义开发', pct: 15 }],
        risks: [{ level: 'medium', text: '数据字典完整性决定查询覆盖范围' }],
        diagram: 'graph LR\n  A[全报表 Schema] --> B[Few-shot 模板库]\n  B --> C[NL2SQL Engine]\n  C --> D[多表查询]\n  D --> E[结果可视化]',
        note: ''
    },

    {
        id: 3, name: 'AI人群画像洞察', module: '智能问数', priority: 'P1', version: 'V2.0', risk: 'medium', effort: null, status: '待评估',
        desc: '支持自然语义输入，自动识别人群特征，并生成可视化看板。',
        techAnalysis: 'Azure OpenAI 做语义解析和特征识别，Dataverse 存储画像数据。可视化看板需要自定义开发（Power BI Embedded 或自研前端组件）。',
        techs: [{ name: 'Copilot Studio', pct: 25 }, { name: 'Azure OpenAI', pct: 30 }, { name: 'Power BI', pct: 20 }, { name: '自定义开发', pct: 25 }],
        risks: [{ level: 'medium', text: '可视化看板生成需要自定义开发，工作量较大' }],
        diagram: 'graph LR\n  A[语义输入] --> B[特征识别]\n  B --> C[人群筛选]\n  C --> D[画像聚合]\n  D --> E[可视化看板]',
        note: ''
    },

    {
        id: 4, name: '数据复盘AI Agent（单个营销活动）', module: '智能问数', priority: 'P1', version: 'V2.1', risk: 'medium', effort: null, status: '待评估',
        desc: '基于单个营销活动数据自动解读营销结果和分析。',
        techAnalysis: 'Copilot Studio Agent 接入营销活动数据源，Azure OpenAI 做数据分析和总结。需要 CDP 提供营销活动效果数据 API。',
        techs: [{ name: 'Copilot Studio', pct: 35 }, { name: 'Azure OpenAI', pct: 40 }, { name: 'CDP API', pct: 25 }],
        risks: [{ level: 'medium', text: '依赖 CDP 营销活动数据 API 的开放度' }],
        diagram: 'graph LR\n  A[营销活动ID] --> B[数据拉取]\n  B --> C[AI分析]\n  C --> D[效果总结]\n  D --> E[优化建议]',
        note: ''
    },

    {
        id: 5, name: '智能问数已知未识别意图覆盖', module: '智能问数', priority: 'P2', version: 'V2.1', risk: 'low', effort: null, status: '待评估',
        desc: '覆盖智能问数中已知但未能识别的用户意图，提升问答准确率。',
        techAnalysis: '收集 V1.0/V2.0 阶段的未识别意图日志，补充 few-shot 和 intent 分类规则。',
        techs: [{ name: 'Copilot Studio', pct: 50 }, { name: 'Azure OpenAI', pct: 30 }, { name: '自定义开发', pct: 20 }],
        risks: [],
        diagram: 'graph LR\n  A[未识别意图日志] --> B[意图分析]\n  B --> C[补充规则]\n  C --> D[更新模型]',
        note: ''
    },

    {
        id: 6, name: '数据复盘全AI Agent（多营销活动）', module: '智能问数', priority: 'P2', version: '远期', risk: 'medium', effort: null, status: '待评估',
        desc: '基于多个营销活动数据自动解读结果的AI数据问询和分析。',
        techAnalysis: '在单活动复盘基础上扩展为多活动对比分析，需要更复杂的数据聚合和分析能力。',
        techs: [{ name: 'Copilot Studio', pct: 25 }, { name: 'Azure OpenAI', pct: 40 }, { name: 'CDP API', pct: 20 }, { name: '自定义开发', pct: 15 }],
        risks: [{ level: 'medium', text: '多活动对比分析数据量大，性能和准确性挑战' }],
        diagram: 'graph LR\n  A[多个活动数据] --> B[聚合分析]\n  B --> C[对比洞察]\n  C --> D[趋势总结]\n  D --> E[优化建议]',
        note: ''
    },

    {
        id: 7, name: 'AI个人画像描述', module: '智能问数', priority: 'P2', version: '远期', risk: 'low', effort: null, status: '待评估',
        desc: '支持AI总结个人画像描述。',
        techAnalysis: 'Copilot Studio Agent 查询个人会员数据，Azure OpenAI 生成自然语言画像描述。',
        techs: [{ name: 'Copilot Studio', pct: 40 }, { name: 'Azure OpenAI', pct: 40 }, { name: 'Dataverse', pct: 20 }],
        risks: [],
        diagram: 'graph LR\n  A[会员ID] --> B[数据查询]\n  B --> C[AI总结]\n  C --> D[画像描述]',
        note: ''
    },

    // ===== 营销助手 =====
    {
        id: 8, name: 'AI生成营销文案', module: '营销助手', priority: 'P1', version: 'V1.0', risk: 'low', effort: null, status: '待评估',
        desc: '根据人群特征生成相符合的营销文案。',
        techAnalysis: 'Azure OpenAI GPT-4o 做文案生成，通过 Prompt 模板管理不同场景。Copilot Studio 提供对话式交互，用户描述目标人群后自动生成文案。',
        techs: [{ name: 'Copilot Studio', pct: 35 }, { name: 'Azure OpenAI', pct: 45 }, { name: 'Dataverse', pct: 20 }],
        risks: [{ level: 'low', text: '文案质量需人工审核把关' }],
        diagram: 'graph LR\n  A[人群特征] --> B[Prompt模板]\n  B --> C[GPT-4o生成]\n  C --> D[文案输出]\n  D --> E[人工审核]',
        note: '文案生成技术成熟度高。'
    },

    {
        id: 9, name: '自动圈选人群（标签/行为）', module: '营销助手', priority: 'P1', version: 'V2.0', risk: 'high', effort: null, status: '待评估',
        desc: '自动圈选人群：基于已有标签和行为进行人群筛选。',
        techAnalysis: 'Copilot Studio + Azure OpenAI 做 NLP 解析，将自然语言圈人条件映射到 CDP 标签/行为筛选 API。需要 CDP 提供完整的标签体系和筛选接口。',
        techs: [{ name: 'Copilot Studio', pct: 30 }, { name: 'Azure OpenAI', pct: 25 }, { name: 'CDP API', pct: 35 }, { name: '自定义开发', pct: 10 }],
        risks: [{ level: 'high', text: 'CDP API 开放度：圈人接口可能不全或不稳定' }],
        diagram: 'graph LR\n  A[自然语言条件] --> B[NLP解析]\n  B --> C[标签/行为映射]\n  C --> D[CDP圈人API]\n  D --> E[人群结果]',
        note: ''
    },

    {
        id: 10, name: '自动创建营销画布', module: '营销助手', priority: 'P1', version: 'V2.0', risk: 'high', effort: null, status: '待评估',
        desc: '通过自然语义交互形成营销画布，可人工调整配置。',
        techAnalysis: '这是技术难度最高的功能之一。需要 Azure OpenAI 解析营销目标，生成画布结构，再通过 CDP API 创建实际画布。用户可在生成后手动微调。',
        techs: [{ name: 'Copilot Studio', pct: 20 }, { name: 'Azure OpenAI', pct: 30 }, { name: 'CDP API', pct: 35 }, { name: '自定义开发', pct: 15 }],
        risks: [{ level: 'high', text: 'CDP API 开放度：画布创建接口依赖重，是 V2.0 最大风险' }],
        diagram: 'graph LR\n  A[营销目标描述] --> B[AI解析]\n  B --> C[画布结构生成]\n  C --> D[CDP画布API]\n  D --> E[用户微调]',
        note: ''
    },

    {
        id: 11, name: '自动圈选人群（语义理解）', module: '营销助手', priority: 'P1', version: 'V2.1', risk: 'medium', effort: null, status: '待评估',
        desc: '基于语义理解的行为识别和自动标签，自动圈选人群。',
        techAnalysis: '在 V2.0 标签/行为圈人基础上升级，支持更深层的语义理解，自动从行为数据中识别特征并创建标签。',
        techs: [{ name: 'Copilot Studio', pct: 25 }, { name: 'Azure OpenAI', pct: 35 }, { name: 'CDP API', pct: 25 }, { name: '自定义开发', pct: 15 }],
        risks: [{ level: 'medium', text: '语义理解准确率，自动标签可能产生噪声' }],
        diagram: 'graph LR\n  A[行为数据] --> B[语义理解]\n  B --> C[特征识别]\n  C --> D[自动标签]\n  D --> E[人群圈选]',
        note: ''
    },

    {
        id: 12, name: 'AI营销内容图片生成', module: '营销助手', priority: 'P2', version: 'V2.1', risk: 'low', effort: null, status: '待评估',
        desc: 'AI生成优惠券图片、公告/弹窗营销图片。',
        techAnalysis: 'Azure AI Image / DALL-E 3 做图片生成。需要品牌素材库约束生成结果的一致性，建议模板化 + 人工审核流程。',
        techs: [{ name: 'Azure AI Image', pct: 50 }, { name: 'DALL-E 3', pct: 30 }, { name: '自定义开发', pct: 20 }],
        risks: [{ level: 'low', text: '品牌一致性难保证，需模板化 + 素材库约束 + 人工审核' }],
        diagram: 'graph LR\n  A[营销主题] --> B[Prompt构建]\n  B --> C[DALL-E 3]\n  C --> D[图片生成]\n  D --> E[品牌审核]',
        note: ''
    },

    // ===== 营销策略 =====
    {
        id: 13, name: '通用营销方案策划', module: '营销策略', priority: 'P1', version: 'V1.0', risk: 'low', effort: null, status: '待评估',
        desc: '通用营销方案策划：基于人群特征的通用策略推荐。',
        techAnalysis: 'Copilot Studio + CDP 知识库做营销方法论检索，Azure OpenAI 做策略生成。V1.0 先做通用模板，技术难度低。',
        techs: [{ name: 'Copilot Studio', pct: 40 }, { name: 'Azure OpenAI', pct: 35 }, { name: 'CDP知识库', pct: 25 }],
        risks: [{ level: 'low', text: '通用策略精度有限，需迭代优化' }],
        diagram: 'graph LR\n  A[人群特征] --> B[知识库匹配]\n  B --> C[策略推荐]\n  C --> D[方案输出]',
        note: 'V1.0 先做通用模板。'
    },

    {
        id: 14, name: '人群特征营销内容建议', module: '营销策略', priority: 'P1', version: 'V2.0', risk: 'medium', effort: null, status: '待评估',
        desc: '根据人群特征生成相符合的营销内容建议，涵盖：文案方案、优惠建议、渠道建议等。',
        techAnalysis: '需要策略引擎对接 CDP 历史营销数据进行分析，结合 Azure OpenAI 生成个性化建议。比 V1.0 通用策划复杂度显著提升。',
        techs: [{ name: 'Copilot Studio', pct: 20 }, { name: 'Azure OpenAI', pct: 30 }, { name: '自定义策略引擎', pct: 35 }, { name: 'CDP API', pct: 15 }],
        risks: [{ level: 'medium', text: '策略引擎需对接 CDP 历史数据，开发量较大' }],
        diagram: 'graph LR\n  A[人群画像] --> B[历史数据]\n  B --> C[策略引擎]\n  C --> D[文案建议]\n  C --> E[优惠建议]\n  C --> F[渠道建议]',
        note: ''
    },

    {
        id: 15, name: '营销专家库', module: '营销策略', priority: 'P2', version: 'V2.1', risk: 'high', effort: null, status: '待评估',
        desc: '营销专家库：营销活动触达方式推荐、触达效果转化提升建议、营销活动亮核审核提升建议、营销活动ROI提升建议等。',
        techAnalysis: '最复杂的模块。需要大量行业最佳实践数据积累，效果归因模型需要时间验证。建议从 V1.0 开始收集营销活动效果数据，逐步建立知识库。',
        techs: [{ name: 'Azure OpenAI', pct: 30 }, { name: '自定义策略引擎', pct: 40 }, { name: '效果归因模型', pct: 30 }],
        risks: [{ level: 'high', text: '领域知识积累周期长，需大量实践数据验证效果归因模型' }],
        diagram: 'graph LR\n  A[营销活动数据] --> B[效果归因]\n  B --> C[专家知识库]\n  C --> D[触达推荐]\n  C --> E[转化建议]\n  C --> F[ROI优化]',
        note: '最复杂模块，需深度定制。'
    },

    {
        id: 16, name: '操作系统使用说明', module: '营销策略', priority: 'P2', version: '远期', risk: 'low', effort: null, status: '待评估',
        desc: 'CDP 操作系统使用说明文档 AI 化。',
        techAnalysis: 'Copilot Studio 知识库功能可直接实现，将 CDP 操作手册导入知识库即可。',
        techs: [{ name: 'Copilot Studio', pct: 80 }, { name: 'CDP知识库', pct: 20 }],
        risks: [],
        diagram: 'graph LR\n  A[操作手册] --> B[知识库导入]\n  B --> C[Copilot Studio]\n  C --> D[问答输出]',
        note: ''
    },

    {
        id: 17, name: 'CDP指标问询', module: '营销策略', priority: 'P2', version: '远期', risk: 'low', effort: null, status: '待评估',
        desc: '支持 CDP 指标的自然语言问询。',
        techAnalysis: '复用智能问数的 NL2SQL 能力，聚焦在 CDP 业务指标维度。',
        techs: [{ name: 'Copilot Studio', pct: 40 }, { name: 'Azure OpenAI', pct: 40 }, { name: 'Dataverse', pct: 20 }],
        risks: [],
        diagram: 'graph LR\n  A[指标问询] --> B[NL2SQL]\n  B --> C[数据查询]\n  C --> D[指标解读]',
        note: ''
    },

    // ===== AI基础后台 =====
    {
        id: 18, name: '知识库管理', module: '基础后台', priority: 'P0', version: 'V1.0', risk: 'low', effort: null, status: '待评估',
        desc: '基础后台：知识库管理（CDP 数据字典、业务文档）。',
        techAnalysis: 'Dataverse 做存储，Power Apps 做管理界面。Copilot Studio 知识源直接对接 Dataverse 表。',
        techs: [{ name: 'Copilot Studio', pct: 20 }, { name: 'Dataverse', pct: 40 }, { name: 'Power Apps', pct: 40 }],
        risks: [],
        diagram: 'graph LR\n  A[数据字典] --> B[Dataverse]\n  C[业务文档] --> B\n  B --> D[Copilot Studio知识源]\n  E[Power Apps管理] --> B',
        note: '基础设施，必须同步启动。'
    },

    {
        id: 19, name: '提示词管理', module: '基础后台', priority: 'P0', version: 'V1.0', risk: 'low', effort: null, status: '待评估',
        desc: '基础后台：提示词管理（Prompt 模板 CRUD）。',
        techAnalysis: 'Dataverse 存储 Prompt 模板，Power Apps 做管理界面。支持版本控制和分场景管理。',
        techs: [{ name: 'Dataverse', pct: 45 }, { name: 'Power Apps', pct: 45 }, { name: '自定义开发', pct: 10 }],
        risks: [],
        diagram: 'graph LR\n  A[Prompt模板] --> B[Dataverse]\n  B --> C[版本控制]\n  B --> D[AI Agent调用]\n  E[Power Apps] --> A',
        note: ''
    },

    {
        id: 20, name: 'AI效率提升数据统计', module: '基础后台', priority: 'P1', version: 'V1.0', risk: 'low', effort: null, status: '待评估',
        desc: '基础后台：AI效率提升数据统计。',
        techAnalysis: '记录 AI 使用日志到 Dataverse，Power BI 或 Power Apps 做统计看板。含账号使用统计及计费。',
        techs: [{ name: 'Dataverse', pct: 35 }, { name: 'Power Apps', pct: 30 }, { name: 'Power BI', pct: 25 }, { name: '自定义开发', pct: 10 }],
        risks: [{ level: 'medium', text: 'Copilot Studio 按量计费，需预估月消息量' }],
        diagram: 'graph LR\n  A[使用日志] --> B[Dataverse]\n  B --> C[统计看板]\n  B --> D[计费统计]',
        note: ''
    },

    {
        id: 21, name: '会员核心数据解读策略', module: '基础后台', priority: 'P1', version: 'V1.0', risk: 'medium', effort: null, status: '待评估',
        desc: '策略中心：会员核心数据解读策略配置。',
        techAnalysis: '在 Dataverse 中配置数据解读规则模板，AI Agent 调用时按规则生成解读。需要自定义规则引擎。',
        techs: [{ name: 'Dataverse', pct: 30 }, { name: 'Power Apps', pct: 25 }, { name: '自定义规则引擎', pct: 45 }],
        risks: [{ level: 'medium', text: '规则引擎需自定义开发' }],
        diagram: 'graph LR\n  A[策略规则] --> B[规则引擎]\n  B --> C[数据解读模板]\n  C --> D[AI Agent调用]\n  E[Power Apps配置] --> A',
        note: ''
    },

    {
        id: 22, name: '会员画像解读策略', module: '基础后台', priority: 'P1', version: 'V1.0', risk: 'low', effort: null, status: '待评估',
        desc: '策略中心：会员画像解读策略配置。',
        techAnalysis: '与核心数据解读策略类似，针对会员画像维度的解读规则配置。',
        techs: [{ name: 'Dataverse', pct: 30 }, { name: 'Power Apps', pct: 30 }, { name: '自定义规则引擎', pct: 40 }],
        risks: [],
        diagram: 'graph LR\n  A[画像规则] --> B[规则引擎]\n  B --> C[画像解读]\n  C --> D[AI Agent调用]',
        note: ''
    },

    {
        id: 23, name: 'CDP AI助手嵌入CDP系统', module: '基础后台', priority: 'P0', version: 'V1.0', risk: 'low', effort: null, status: '待评估',
        desc: '基础交互：CDP AI助手插件内嵌CDP系统。',
        techAnalysis: 'Copilot Studio 提供 Web Channel，通过 iframe 嵌入 CDP 系统页面。技术成熟，风险低。',
        techs: [{ name: 'Copilot Studio', pct: 60 }, { name: 'iframe/Web Channel', pct: 30 }, { name: '自定义开发', pct: 10 }],
        risks: [],
        diagram: 'graph LR\n  A[Copilot Studio Bot] --> B[Web Channel]\n  B --> C[iframe嵌入]\n  C --> D[CDP系统页面]',
        note: ''
    },

    {
        id: 24, name: '核心数据解读策略（V2.0升级）', module: '基础后台', priority: 'P1', version: 'V2.0', risk: 'medium', effort: null, status: '待评估',
        desc: '基础后台V2.0：核心数据解读策略升级。',
        techAnalysis: '在 V1.0 基础上扩展更多数据维度的解读规则，提升解读精度。',
        techs: [{ name: 'Dataverse', pct: 30 }, { name: '自定义规则引擎', pct: 50 }, { name: 'Azure OpenAI', pct: 20 }],
        risks: [{ level: 'medium', text: '规则复杂度提升' }],
        diagram: 'graph LR\n  A[扩展规则] --> B[规则引擎V2]\n  B --> C[多维解读]\n  C --> D[AI增强]',
        note: ''
    },

    {
        id: 25, name: '独立AI助手Tab页面', module: '基础后台', priority: 'P1', version: 'V2.0', risk: 'low', effort: null, status: '待评估',
        desc: '交互升级：单独的AI助手tab页面（从嵌入式升级为独立页面）。',
        techAnalysis: '升级 V1.0 的 iframe 嵌入为独立 Tab 页面，提供更完整的 AI 交互体验。',
        techs: [{ name: 'Copilot Studio', pct: 40 }, { name: '自定义开发', pct: 40 }, { name: 'Power Apps', pct: 20 }],
        risks: [],
        diagram: 'graph LR\n  A[CDP系统] --> B[AI助手Tab]\n  B --> C[Copilot Studio]\n  C --> D[完整交互界面]',
        note: ''
    },

    {
        id: 26, name: '基于智能六步法的提示词', module: '基础后台', priority: 'P1', version: 'V2.0', risk: 'low', effort: null, status: '待评估',
        desc: '交互升级：基于智能六步法的提示词优化。',
        techAnalysis: '设计引导式交互流程，通过六步法模板引导用户更精准地描述需求。',
        techs: [{ name: 'Copilot Studio', pct: 50 }, { name: 'Dataverse', pct: 30 }, { name: '自定义开发', pct: 20 }],
        risks: [],
        diagram: 'graph LR\n  A[用户输入] --> B[六步引导]\n  B --> C[意图明确化]\n  C --> D[精准Prompt]\n  D --> E[高质量输出]',
        note: ''
    },

    {
        id: 27, name: '营销活动数据复盘解读策略', module: '基础后台', priority: 'P1', version: 'V2.1', risk: 'medium', effort: null, status: '待评估',
        desc: '策略中心：营销活动数据复盘解读策略配置。',
        techAnalysis: '为数据复盘 AI Agent 提供解读规则和模板，需要与营销活动数据结构对齐。',
        techs: [{ name: 'Dataverse', pct: 30 }, { name: '自定义规则引擎', pct: 40 }, { name: 'Azure OpenAI', pct: 30 }],
        risks: [{ level: 'medium', text: '需要营销活动数据结构标准化' }],
        diagram: 'graph LR\n  A[复盘规则] --> B[规则引擎]\n  B --> C[解读模板]\n  C --> D[复盘Agent调用]',
        note: ''
    },

    {
        id: 28, name: '营销活动数据问数解读策略', module: '基础后台', priority: 'P1', version: 'V2.1', risk: 'low', effort: null, status: '待评估',
        desc: '策略中心：营销活动数据问数解读策略配置。',
        techAnalysis: '为智能问数扩展营销活动维度的数据解读能力。',
        techs: [{ name: 'Dataverse', pct: 35 }, { name: '自定义规则引擎', pct: 35 }, { name: 'Azure OpenAI', pct: 30 }],
        risks: [],
        diagram: 'graph LR\n  A[问数规则] --> B[规则引擎]\n  B --> C[解读模板]\n  C --> D[问数Agent调用]',
        note: ''
    },

    {
        id: 29, name: '智能问数交互技术框架升级', module: '基础后台', priority: 'P2', version: 'V2.1', risk: 'medium', effort: null, status: '待评估',
        desc: '基础能力：智能问数交互技术实施框架升级。',
        techAnalysis: '基于 V1.0/V2.0 的使用反馈，升级交互框架，提升响应速度和用户体验。',
        techs: [{ name: 'Copilot Studio', pct: 30 }, { name: '自定义开发', pct: 50 }, { name: 'Azure OpenAI', pct: 20 }],
        risks: [{ level: 'medium', text: '框架升级可能影响已有功能' }],
        diagram: 'graph LR\n  A[用户反馈] --> B[框架评估]\n  B --> C[架构升级]\n  C --> D[性能优化]\n  D --> E[体验提升]',
        note: ''
    },
];

// 方案设计数据
const PLANS = [
    {
        id: 'plan-a',
        name: '方案一：优先级驱动 — 微软赋能快速验证',
        tag: '推荐',
        summary: '聚焦 P0 高优先级功能，采取微软赋能方式，先打通核心产品验证 Copilot Studio 价值。',
        strategy: '选取智能问数（P0）+ AI基础后台必要组件，用 Copilot Studio + Azure OpenAI 最小化验证。营销助手/策略放第二批次。',
        phases: [
            { name: '第一批次（6-7月）', items: ['NL2SQL POC 验证', '智能问数一期：会员概览数据智能解读', '知识库管理', '提示词管理', 'CDP AI助手嵌入CDP系统', '会员核心数据解读策略', '会员画像解读策略'], focus: '验证 NL2SQL + Copilot Studio 核心价值', acceptance: '用户通过自然语言查到会员概览数据，准确率 > 80%' },
            { name: '第二批次（8-9月）', items: ['AI生成营销文案', '通用营销方案策划', 'AI效率提升数据统计'], focus: '扩展 AIGC 和策略能力', acceptance: '文案生成功能上线，策略推荐可用' },
            { name: '第三批次（Q4）', items: ['CDP全报表问数覆盖', 'AI人群画像洞察', '自动圈选人群', '自动创建营销画布'], focus: '全面覆盖 + 自动化', acceptance: '全报表覆盖 + 营销自动化流程跑通' },
        ],
        pros: ['风险最低：先验证核心技术路线（含 NL2SQL POC）', '交付最快：第一批次可在 2 个月内完成', '微软赋能：可争取微软技术支持资源'],
        cons: ['营销助手/策略功能延后交付', '客户可能期望更快看到全貌'],
        ganttTasks: [
            { section: '第一批次', name: 'NL2SQL POC 验证', start: '2026-06-01', days: 10 },
            { section: '第一批次', name: '智能问数一期', start: '2026-06-11', days: 30 },
            { section: '第一批次', name: '知识库管理', start: '2026-06-01', days: 20 },
            { section: '第一批次', name: '提示词管理', start: '2026-06-08', days: 20 },
            { section: '第一批次', name: 'CDP AI助手嵌入', start: '2026-06-15', days: 15 },
            { section: '第一批次', name: '策略中心', start: '2026-06-20', days: 25 },
            { section: '第二批次', name: 'AI生成营销文案', start: '2026-08-01', days: 25 },
            { section: '第二批次', name: '通用营销方案策划', start: '2026-08-10', days: 20 },
            { section: '第二批次', name: 'AI效率数据统计', start: '2026-08-20', days: 15 },
            { section: '第三批次', name: 'CDP全报表问数覆盖', start: '2026-10-01', days: 30 },
            { section: '第三批次', name: 'AI人群画像洞察', start: '2026-10-10', days: 30 },
            { section: '第三批次', name: '自动圈选人群', start: '2026-10-15', days: 35 },
            { section: '第三批次', name: '自动创建营销画布', start: '2026-11-01', days: 30 },
            { section: '里程碑', name: 'V1.0 核心验证完成', start: '2026-07-15', days: 0, milestone: true },
            { section: '里程碑', name: '第二批次交付', start: '2026-09-15', days: 0, milestone: true },
            { section: '里程碑', name: 'V2.0 交付', start: '2026-12-01', days: 0, milestone: true },
        ]
    },
    {
        id: 'plan-b',
        name: '方案二：全量评估 — 四模块并行推进',
        tag: null,
        summary: '全量评估所有功能点，四大模块并行推进 V1.0，一次性交付完整的 AI 能力底座。',
        strategy: '同时启动智能问数、营销助手、营销策略、AI基础后台的 V1.0 功能，按原路线图 6-7 月交付。',
        phases: [
            { name: 'V1.0 全量（6-7月）', items: ['智能问数一期', 'AI生成营销文案', '通用营销方案策划', '知识库管理', '提示词管理', 'AI效率提升数据统计', '策略中心', 'CDP AI助手嵌入'], focus: '四模块 V1.0 全部交付', acceptance: '四大模块 V1.0 功能全部可用' },
            { name: 'V2.0（8-10月）', items: ['全报表问数', '人群画像洞察', '自动圈人', '自动画布', '营销内容建议', '后台升级'], focus: '智能化升级', acceptance: '自动化功能上线' },
            { name: 'V2.1（Q4）', items: ['数据复盘Agent', '语义圈人', '图片生成', '营销专家库', '框架升级'], focus: '深度 AI + 专家系统', acceptance: '全部 AI Agent 上线' },
        ],
        pros: ['完整交付：客户一次性看到全貌', '并行效率：团队可分工协作', '按原路线图推进，对齐客户预期'],
        cons: ['风险分散：NL2SQL 如果不通会影响整体进度', '需要多个开发者并行', 'V1.0 交付压力大'],
        ganttTasks: [
            { section: '智能问数', name: '智能问数一期', start: '2026-06-01', days: 40 },
            { section: '智能问数', name: 'CDP全报表问数覆盖', start: '2026-08-01', days: 35 },
            { section: '智能问数', name: 'AI人群画像洞察', start: '2026-08-15', days: 30 },
            { section: '智能问数', name: '数据复盘Agent', start: '2026-10-01', days: 30 },
            { section: '营销助手', name: 'AI生成营销文案', start: '2026-06-01', days: 30 },
            { section: '营销助手', name: '自动圈选人群', start: '2026-08-01', days: 35 },
            { section: '营销助手', name: '自动创建营销画布', start: '2026-09-01', days: 30 },
            { section: '营销助手', name: 'AI营销图片生成', start: '2026-10-15', days: 25 },
            { section: '营销策略', name: '通用营销方案策划', start: '2026-06-10', days: 25 },
            { section: '营销策略', name: '人群特征营销建议', start: '2026-08-15', days: 30 },
            { section: '营销策略', name: '营销专家库', start: '2026-10-15', days: 40 },
            { section: '基础后台', name: '知识库管理', start: '2026-06-01', days: 20 },
            { section: '基础后台', name: '提示词管理', start: '2026-06-05', days: 20 },
            { section: '基础后台', name: '策略中心', start: '2026-06-10', days: 30 },
            { section: '基础后台', name: 'CDP AI助手嵌入', start: '2026-06-15', days: 15 },
            { section: '基础后台', name: 'AI效率数据统计', start: '2026-06-20', days: 20 },
            { section: '基础后台', name: '独立AI助手Tab', start: '2026-08-15', days: 20 },
            { section: '基础后台', name: '交互框架升级', start: '2026-10-15', days: 25 },
            { section: '里程碑', name: 'V1.0 全量交付', start: '2026-07-31', days: 0, milestone: true },
            { section: '里程碑', name: 'V2.0 交付', start: '2026-10-15', days: 0, milestone: true },
            { section: '里程碑', name: 'V2.1 交付', start: '2026-12-15', days: 0, milestone: true },
        ]
    }
];

export { DATA, PLANS };
