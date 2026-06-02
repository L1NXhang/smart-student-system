const fs = require('fs');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat, HeadingLevel,
  BorderStyle, WidthType, ShadingType, PageNumber, PageBreak,
  TableOfContents, ExternalHyperlink,
} = require('docx');

// ============================================================
// Helpers
// ============================================================
const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const cellMargins = { top: 80, bottom: 80, left: 120, right: 120 };
const headerBorder = { style: BorderStyle.SINGLE, size: 1, color: "2E75B6" };

function heading1(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text, bold: true, font: "SimSun", size: 32 })] });
}
function heading2(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text, bold: true, font: "SimSun", size: 28 })] });
}
function heading3(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun({ text, bold: true, font: "SimSun", size: 24 })] });
}
function para(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 120, line: 360 },
    children: [new TextRun({ text, font: opts.font || "SimSun", size: opts.size || 24, bold: opts.bold || false })],
  });
}
function emptyLine() {
  return new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: "", size: 12 })] });
}

function makeCell(text, width, opts = {}) {
  return new TableCell({
    borders, width: { size: width, type: WidthType.DXA },
    shading: opts.shading ? { fill: opts.shading, type: ShadingType.CLEAR } : undefined,
    margins: cellMargins,
    verticalAlign: "center",
    children: [new Paragraph({ children: [new TextRun({ text, font: "SimSun", size: 22, bold: opts.bold || false })] })],
  });
}

function makeHeaderCell(text, width) {
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: { fill: "2E75B6", type: ShadingType.CLEAR },
    margins: cellMargins,
    verticalAlign: "center",
    children: [new Paragraph({ children: [new TextRun({ text, font: "SimSun", size: 22, bold: true, color: "FFFFFF" })] })],
  });
}

function tableRow(cells) {
  return new TableRow({ children: cells });
}

// ============================================================
// Content
// ============================================================

// ---- Cover Page ----
const coverPage = [
  emptyLine(), emptyLine(), emptyLine(), emptyLine(), emptyLine(), emptyLine(),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 300 }, children: [new TextRun({ text: "智慧学工系统", font: "SimHei", size: 56, bold: true, color: "2E75B6" })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: "系统功能说明文档", font: "SimHei", size: 40, bold: true, color: "333333" })] }),
  emptyLine(),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 160 }, children: [new TextRun({ text: "Smart Student Affairs System", font: "Arial", size: 28, color: "666666" })] }),
  emptyLine(), emptyLine(),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 160 }, children: [new TextRun({ text: "西华师范大学计算机学院第二十八届电脑文化艺术节", font: "SimSun", size: 26, color: "333333" })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 160 }, children: [new TextRun({ text: "智慧学工应用创新大赛 · 参赛作品", font: "SimSun", size: 26, color: "333333" })] }),
  emptyLine(), emptyLine(),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 }, children: [new TextRun({ text: "团队：2024级六班，一杰", font: "SimSun", size: 26 })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 }, children: [new TextRun({ text: "日期：2026年5月20日", font: "SimSun", size: 26 })] }),
  emptyLine(),
  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "线上访问地址：http://124.223.0.187/smart/", font: "SimSun", size: 24, color: "2E75B6" })] }),
  new Paragraph({ children: [new PageBreak()] }),
];

// ---- TOC ----
const tocPage = [
  new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: "目录", font: "SimHei", size: 32, bold: true })] }),
  new TableOfContents("目录", { hyperlink: true, headingStyleRange: "1-3" }),
  new Paragraph({ children: [new PageBreak()] }),
];

// ---- Section 1: Overview ----
const section1 = [
  heading1("一、系统概述"),
  heading2("1.1 项目背景"),
  para(`为深入学习贯彻习近平新时代中国特色社会主义思想，全面落实国家教育数字化战略部署，学校决定举办"智慧学工系统"设计大赛。`),
  para(`在学校日常生活中，学生与辅导员联系、部门发布活动、奖学金申请等功能分散在多个平台，导致师生需要在不同软件间频繁切换，操作繁琐。基于此痛点，我们设计开发了这套集学生信息管理、日常事务办理、学业发展支持于一体的综合性智慧学工信息系统，致力于提供响应更快、UI更精美、适配更好的使用体验。`),
  heading2("1.2 项目目标"),
  para(`• 功能完整性：完整实现六大核心功能模块，涵盖学生日常管理与服务的全部场景，确保系统实用性与完整性。`),
  para(`• 交互便捷性：采用简约商务风 UI 设计，搭配 GSAP 精致交互动效，操作路径短、学习成本低。`),
  para(`• 技术创新性：使用 Vue 3 + Node.js 全栈现代化技术栈，WebSocket 实时通信，响应式移动端适配。`),
  para(`• 实际应用价值：真正解决学工管理痛点，聚合分散功能于一体平台，提升管理效率与用户体验。`),
  heading2("1.3 系统形式"),
  para(`本系统采用 B/S 架构的 Web 网站形式，用户通过浏览器即可访问。系统同时支持 PC 端和移动端的响应式适配，无需安装任何客户端软件。系统部署于腾讯云轻量应用服务器（Ubuntu 22.04, 3.6GB RAM），通过 Nginx 进行静态资源托管和反向代理。`),
  heading2("1.4 目标用户"),
  para(`• 学生：查看个人信息、提交各类申请（奖学金/助学金/信息变更/困难认定等）、查看通知公告、报名活动、与班主任实时聊天、参加安全考试等。`),
  para(`• 管理员（教师/辅导员）：管理学生信息、审核申请（奖学金/信息变更/晚归/外出等）、发布公告与活动、导入数据（成绩/题库）、管理勤工助学岗位等。`),
  new Paragraph({ children: [new PageBreak()] }),
];

// ---- Section 2: Architecture ----
const section2 = [
  heading1("二、系统架构设计"),
  heading2("2.1 整体架构"),
  para(`系统采用经典的三层架构模式，各层职责清晰，便于开发、测试和维护：`),
  para(`前端层（Vue 3 SPA） → HTTP/HTTPS (RESTful API + WebSocket) → 后端层（Node.js + Express） → ORM（Sequelize） → 数据层（MySQL 8.0）`),
  emptyLine(),
  new Table({
    width: { size: 9026, type: WidthType.DXA },
    columnWidths: [2000, 3500, 3526],
    rows: [
      tableRow([makeHeaderCell("层级", 2000), makeHeaderCell("技术", 3500), makeHeaderCell("说明", 3526)]),
      tableRow([makeCell("前端框架", 2000, { bold: true }), makeCell("Vue 3 (Composition API)", 3500), makeCell("渐进式框架，组件化开发，生态丰富", 3526)]),
      tableRow([makeCell("构建工具", 2000, { bold: true }), makeCell("Vite 8", 3500), makeCell("快速冷启动，HMR 热更新", 3526)]),
      tableRow([makeCell("UI 组件库", 2000, { bold: true }), makeCell("Element Plus 2.x", 3500), makeCell("Vue 3 官方推荐组件库，组件丰富", 3526)]),
      tableRow([makeCell("动画库", 2000, { bold: true }), makeCell("GSAP 3.x", 3500), makeCell("专业级动画引擎，高性能动效", 3526)]),
      tableRow([makeCell("状态管理", 2000, { bold: true }), makeCell("Pinia 2.x", 3500), makeCell("Vue 3 官方状态管理，TypeScript 友好", 3526)]),
      tableRow([makeCell("路由", 2000, { bold: true }), makeCell("Vue Router 4.x", 3500), makeCell("Hash 模式，支持路由守卫与角色控制", 3526)]),
      tableRow([makeCell("HTTP 请求", 2000, { bold: true }), makeCell("Axios 1.x", 3500), makeCell("拦截器统一处理 Token 注入与错误响应", 3526)]),
      tableRow([makeCell("后端框架", 2000, { bold: true }), makeCell("Node.js 20 + Express 4.x", 3500), makeCell("JavaScript 全栈，中间件架构，RESTful API", 3526)]),
      tableRow([makeCell("ORM", 2000, { bold: true }), makeCell("Sequelize 6.x + mysql2", 3500), makeCell("模型定义、关联查询、连接池管理", 3526)]),
      tableRow([makeCell("认证", 2000, { bold: true }), makeCell("JWT (JSON Web Token)", 3500), makeCell("无状态认证，7天有效期，角色信息嵌入", 3526)]),
      tableRow([makeCell("实时通信", 2000, { bold: true }), makeCell("Socket.io 4.x", 3500), makeCell("WebSocket 双向通信，支持聊天/在线状态", 3526)]),
      tableRow([makeCell("数据库", 2000, { bold: true }), makeCell("MySQL 8.0 (Docker)", 3500), makeCell("关系型数据库，utf8mb4 字符集", 3526)]),
      tableRow([makeCell("Web 服务", 2000, { bold: true }), makeCell("Nginx (Docker Alpine)", 3500), makeCell("静态资源托管 + API 反向代理", 3526)]),
      tableRow([makeCell("部署平台", 2000, { bold: true }), makeCell("腾讯云轻量服务器", 3500), makeCell("Ubuntu 22.04, 3.6GB RAM, 40GB SSD", 3526)]),
    ],
  }),
  heading2("2.2 目录结构"),
  heading3("前端 (frontend/src/)"),
  para(`• api/ — Axios 接口封装，按模块拆分（auth, student, scholarship, academic, career, safety, message, admin, upload）`),
  para(`• components/ — 通用组件，含 Layout（侧边栏/顶栏/底导航/移动导航）和 react-bits（GSAP 动画组件）`),
  para(`• views/ — 页面视图，分为 student（学生端 17 页）、admin（管理端 10 页）、auth（认证 3 页）`),
  para(`• router/ — Vue Router 配置，含角色路由守卫和通配符重定向`),
  para(`• store/ — Pinia 状态管理，用户信息与角色权限`),
  para(`• utils/ — 工具函数，auth token 管理`),
  para(`• assets/ — 静态资源与全局 CSS 样式`),
  heading3("后端 (backend/src/)"),
  para(`• routes/ — Express 路由定义（auth, student, scholarship, academic, career, safety, chat, announcement, feedback, event, admin, upload）`),
  para(`• controllers/ — 业务逻辑控制器，处理请求参数验证与响应组装`),
  para(`• models/ — Sequelize 数据模型定义，含字段映射（camelCase ↔ snake_case）`),
  para(`• middlewares/ — 中间件（auth JWT 认证、upload 文件上传、role 角色权限、eventPublisher 活动发布权限）`),
  para(`• config/ — 数据库连接配置，含 utf8mb4 字符集与连接池设置`),
  new Paragraph({ children: [new PageBreak()] }),
];

// ---- Section 3: Functional Modules ----
const section3 = [
  heading1("三、功能模块详解"),
  para(`本系统完整实现了大赛要求的六大核心功能模块，共计 27 个页面（学生端 17 页 + 管理端 10 页 + 认证 3 页）。以下逐一说明各模块的功能设计与实现。`),
  heading2("3.1 用户认证模块"),
  para(`实现教师、学生两类用户身份的注册、登录及权限差异化使用功能。`),
  heading3("功能清单"),
  para(`• 登录功能：支持学号/工号 + 密码登录，集成滑块验证码（拖拽拼图）防止机器攻击，登录成功后 JWT Token 7天有效。`),
  para(`• 注册功能：学生自主注册，填写学号、姓名等基本信息，提交后由管理员审核通过方可使用。管理员账号由系统预设，不支持自主注册。`),
  para(`• 修改密码：登录后可在个人中心修改密码，支持旧密码验证与新密码强度检查。首次登录强制修改初始密码。`),
  para(`• 角色路由守卫：基于 Vue Router beforeEach 全局守卫，根据用户角色（student/admin）自动过滤未授权页面访问。未登录用户访问任何页面均重定向至登录页。`),
  para(`• 密码强度验证：要求至少8位且包含字母和数字，输入时实时显示三色强度条（弱/中/强）。`),

  heading2("3.2 学生基本信息管理模块"),
  para(`本模块实现学生信息的"一站式"整合管理，涵盖姓名、学号、照片、联系方式、身份证号码、学院、专业、年级班级、校区、宿舍号、非集中住宿地址、病史、爱好、性格特征、职业目标、班主任及联系方式、家庭情况（含父母及联系方式）、紧急联系人及联系方式（不少于2位）、困难认定等级（含认定级别及特殊人员证明材料上传）、信息变更申请（如联系方式、家庭住址变动）、信息导出权限控制（仅管理员/本人可导出）等信息的录入、查询、修改与维护功能。`),
  para(`信息以单页面分区展示，结构清晰：`),
  para(`• 顶部证件照区：支持点击更换证件照，管理员可查看/审核。`),
  para(`• 基础信息区：姓名、学号、联系方式（手机号）、邮箱、身份证号，关键字段修改需管理员审核。`),
  para(`• 学籍信息区：学院（8个真实学院可选）、专业、年级（级联筛选）、班级、校区（华凤/行署）、宿舍号、校外住宿地址。`),
  para(`• 个人特质区：病史、爱好、性格特征、职业目标，学生可自由填写。`),
  para(`• 联系信息区：班主任姓名及联系方式，系统自动关联。`),
  para(`• 家庭情况区：父母姓名、关系、联系电话，支持多人。`),
  para(`• 紧急联系人区：不少于2位，含关系、姓名、联系电话。`),
  para(`• 困难认定区：困难认定等级（一般困难/比较困难/特别困难）及证明材料上传，支持图片和PDF。`),

  heading2("3.3 奖助服务管理模块"),
  para(`集成奖学金申请与审核、助学金申报与审批、勤工助学岗位发布、学生报名投递及资格筛选等全流程功能。`),
  heading3("奖学金管理"),
  para(`• 学生端：查看奖学金列表，填写申请理由并上传证明材料，提交后跟踪审核状态（待审核/已通过/已拒绝）。支持查看审核意见。`),
  para(`• 管理端：查看全部申请列表，支持按状态/类型筛选，一键审核（通过/拒绝并填写审核意见）。支持导出奖学金申请为 Word 文档。`),
  heading3("勤工助学管理"),
  para(`• 学生端：浏览岗位列表（名称、要求、工作时间、薪酬、名额、截止时间），查看岗位详情，投递申请并跟踪录用状态。`),
  para(`• 管理端：发布/编辑岗位（名称、描述、要求、工作时间、薪酬、名额、截止时间），查看投递列表，进行资格筛选与录用操作。`),

  heading2("3.4 学业发展支持模块"),
  para(`• 成绩查询：按学期筛选查看各课程成绩（课程名称、类型、学分、分数、绩点），顶部汇总总学分、平均分、平均绩点、绩点趋势。学期绩点对比可视化。`),
  para(`• 获奖记录：查看个人比赛获奖情况（名称、级别、类型、日期、证书），管理员可录入获奖记录。`),
  para(`• 违纪查询：查看个人违纪记录（如有），含违纪类型、时间、处理结果。`),
  para(`• 中期鉴定：填写思想品德、学业情况、社会实践、身心健康、自我评价等内容，提交后由班主任审核。`),
  para(`• 第二课堂：管理员导入活动数据，系统自动统计分类学时（学术/文体/志愿），生成第二课堂成绩单。`),
  para(`• 管理员功能：批量导入成绩（Excel 解析）、导入第二课堂活动数据。`),

  heading2("3.5 职业规划模块"),
  para(`• 生涯测评工具：内置霍兰德职业兴趣测试和 MBTI 性格测评简化版，在线答题后系统自动计算并展示测评报告（结果类型、职业建议、适合岗位推荐）。`),
  para(`• 就业指导预约：学生选择时间段、填写预约事由，提交后管理员确认。支持查看预约状态。`),
  para(`• 就业信息推送：管理员发布招聘/宣讲会/政策等信息，学生按类型筛选查看详情，支持收藏与已读标记。`),

  heading2("3.6 安全管理与预警模块"),
  para(`• 晚归登记：填写晚归日期、预计返回时间、晚归原因，提交后等待管理员审核。`),
  para(`• 外出报备：填写外出日期、目的地、外出事由、预计返回时间，提交审核。`),
  para(`• 安全知识学习与考试：管理员导入题库（题目+选项+正确答案+分值），设置考试时长与及格线。学生在线答题、限时提交、自动评分并显示成绩。`),
  para(`• 异常情况上报：选择上报类型（校园安全隐患/个人突发状况），填写描述与位置，可上传图片。管理员查看处理。`),

  heading2("3.7 沟通互动模块"),
  para(`• 实时聊天（核心特色）：基于 Socket.io 实现班主任与学生之间的一对一实时私信。支持消息即时收发、历史消息分页加载（每次20条）、未读消息红点提示、在线/离线状态显示、"对方正在输入..."状态、文字/图片/文件消息类型。移动端采用全屏切换模式（联系人列表↔聊天区），优化小屏体验。`),
  para(`• 公告通知：管理员发布班级/年级公告，学生端展示公告列表与详情，支持已读确认。未读公告数量红点提示。`),
  para(`• 意见反馈：学生提交反馈（建议/投诉/咨询），管理员查看并回复。支持查看回复内容与处理状态。`),
  para(`• 活动报名：管理员发布活动（名称、类型、时间、地点、名额、截止时间），学生浏览活动列表、查看详情、在线报名。管理员可导出报名名单。`),
  new Paragraph({ children: [new PageBreak()] }),
];

// ---- Section 4: Operation Guide ----
const section4 = [
  heading1("四、操作指南"),
  heading2("4.1 管理员操作流程"),
  para(`1. 打开浏览器访问 http://124.223.0.187/smart/，进入登录页面。`),
  para(`2. 使用管理员账号（admin / 123456）登录，系统自动跳转至管理首页。`),
  para(`3. 管理首页：查看学生总数、待审核申请数、未处理反馈数、今日晚归/外出数量等实时统计数据。通过"快捷操作"区快速跳转至常用功能。`),
  para(`4. 学生管理：左侧菜单进入"学生管理"，可按姓名/学号搜索，按学院/年级/班级级联筛选。点击"查看详情"打开右侧滑出面板，查看学生完整信息。点击"批量导入学生"上传 Excel 文件批量导入。`),
  para(`5. 申请审核：进入"申请审核"→"奖学金审核"/"信息变更审核"，查看待审核列表，点击审核通过或拒绝并填写审核意见。`),
  para(`6. 公告发布：进入"公告管理"，填写标题、内容、类型（班级/年级）、发布范围，点击发布。`),
  para(`7. 活动管理：进入"活动管理"，创建活动（名称、类型、时间、地点、名额、截止时间），查看报名名单，支持导出。`),
  heading2("4.2 学生操作流程"),
  para(`1. 访问系统网址，输入学号和密码，拖动滑块完成验证后登录。首次登录需修改密码。`),
  para(`2. 首页工作台：查看奖学金数量、未读通知、待审核申请、近期活动等概览信息。点击卡片可进入对应功能。`),
  para(`3. 个人信息：点击"我的"→"个人信息"，查看完整信息。点击"编辑信息"可提交信息变更申请。`),
  para(`4. 奖学金申请：进入"奖助服务"→"奖学金申请"，选择奖学金类型，填写申请理由，上传证明材料，提交后等待审核。`),
  para(`5. 成绩查询：进入"学业发展"→"成绩查询"，查看各学期成绩与绩点趋势图。`),
  para(`6. 活动报名：进入"沟通互动"→"活动报名"，浏览活动列表，点击感兴趣的活动查看详情并报名。`),
  para(`7. 聊天室：进入"沟通互动"→"聊天室"，点击联系人开始实时聊天。输入消息后按回车或点击发送。`),
  heading2("4.3 移动端适配说明"),
  para(`系统在手机浏览器上自动切换为移动端布局，主要适配措施包括：`),
  para(`• 底部导航栏（4个标签：首页/我的/学业/消息），方便拇指操作。`),
  para(`• 侧边栏默认隐藏，点击左上角汉堡菜单图标滑出，选择菜单项后自动关闭。`),
  para(`• 表格支持横向滑动，底部显示"← 左右滑动查看 →"提示。`),
  para(`• 卡片式布局垂直堆叠（移动端1列），弹窗自适应屏幕宽度。`),
  para(`• 聊天室移动端采用全屏切换模式：全屏联系人列表 → 点击联系人 → 全屏聊天区（左上角返回按钮回退）。`),
  new Paragraph({ children: [new PageBreak()] }),
];

// ---- Section 5: Database Design ----
const section5 = [
  heading1("五、数据库设计方案"),
  heading2("5.1 数据库概览"),
  para(`本系统使用 MySQL 8.0 关系型数据库，字符集采用 utf8mb4（支持完整 Unicode 包括 Emoji），排序规则 utf8mb4_unicode_ci。共设计 28 张数据表，涵盖用户认证、学生信息、奖助服务、学业发展、职业规划、安全管理、沟通互动等全部业务领域。`),
  heading2("5.2 核心表结构"),
  heading3("用户表 (users)"),
  para(`存储所有用户账号信息，包括管理员和学生。关键字段：id (主键自增)、username (学号/工号)、password (bcrypt加密)、name (姓名)、role (student/admin)、status (0待审核/1正常/2禁用)、department (部门)、department_role (部门角色)。`),
  heading3("学生详细信息表 (student_info) — 25+ 字段"),
  para(`与学生用户一对一关联，存储完整的学生档案信息。关键字段：user_id (外键)、photo (证件照路径)、phone (手机号)、email (邮箱)、id_card (身份证号)、college (学院)、major (专业)、grade (年级)、class_name (班级)、campus (校区)、dormitory (宿舍号)、off_campus_address (校外住宿地址)、medical_history (病史)、hobbies (爱好)、personality (性格特征)、career_goal (职业目标)、class_teacher (班主任)、class_teacher_phone (班主任电话)、difficulty_level (困难认定等级)、difficulty_material (证明材料路径)、difficulty_status (认定状态)。`),
  heading3("其他核心表"),
  para(`• family_info — 家庭信息表（成员类型、姓名、联系方式、关系）`),
  para(`• emergency_contacts — 紧急联系人表（姓名、关系、联系电话，不少于2位）`),
  para(`• scholarship_applications — 奖学金申请表（学生ID、奖学金类型、申请理由、证明材料JSON、状态、审核人、审核意见）`),
  para(`• work_study_positions — 勤工助学岗位表（名称、描述、要求、工作时间、薪酬、名额、截止时间、状态）`),
  para(`• work_study_applications — 勤工助学申请表（岗位ID、学生ID、申请理由、状态）`),
  para(`• grades — 成绩表（学生ID、学期、课程名称、课程类型、学分、分数、绩点）`),
  para(`• midterm_evaluations — 中期鉴定表（学生ID、学期、思想品德、学业情况、社会实践、身心健康、自我评价、班主任评语、状态）`),
  para(`• second_classroom_activities — 第二课堂活动表（学生ID、活动名称、活动类型、时长、学分、学期）`),
  para(`• awards — 获奖记录表（学生ID、奖项名称、级别、类型、日期、证书路径）`),
  para(`• disciplinary_records — 违纪记录表（学生ID、违纪类型、时间、描述、处理结果）`),
  para(`• career_assessments — 生涯测评记录表（学生ID、测评类型、结果类型、建议）`),
  para(`• career_appointments — 就业指导预约表（学生ID、预约时间、事由、状态）`),
  para(`• job_infos — 就业信息表（标题、内容、类型、发布时间）`),
  para(`• late_return_records — 晚归登记表（学生ID、日期、预计返回时间、原因、审核状态）`),
  para(`• leave_records — 外出报备表（学生ID、日期、目的地、事由、预计返回时间、审核状态）`),
  para(`• safety_exams — 安全考试表（标题、时长、及格分、状态）`),
  para(`• safety_questions — 考试题目表（考试ID、题目内容、选项JSON、正确答案、分值）`),
  para(`• safety_exam_records — 考试记录表（考试ID、学生ID、答案JSON、得分、是否通过）`),
  para(`• incident_reports — 异常上报表（学生ID、类型、标题、描述、位置、图片、处理状态）`),
  para(`• chat_messages — 聊天消息表（发送者ID、接收者ID、内容、消息类型、文件URL、已读状态）`),
  para(`• announcements — 公告表（标题、内容、类型、发布范围、发布者ID）`),
  para(`• announcement_reads — 公告已读表（公告ID、用户ID、已读时间）`),
  para(`• feedbacks — 意见反馈表（学生ID、标题、内容、类型、回复、回复者、处理状态）`),
  para(`• events — 活动表（标题、类型、时间、地点、描述、名额、截止时间、发布者、状态）`),
  para(`• event_registrations — 活动报名表（活动ID、学生ID、状态）`),
  para(`• info_change_requests — 信息变更申请表（学生ID、变更字段、原值、新值、原因、审核状态）`),
  para(`• difficulty_applications — 困难认定申请表（学生ID、认定等级、原因、材料、审核状态）`),
  heading2("5.3 数据库关系图"),
  para(`核心关系：users 表为所有用户的基础表，student_info 通过 user_id 关联到 users。所有业务表（奖学金申请、成绩、聊天消息、活动报名等）通过 student_id 关联到 student_info，形成以用户为中心的数据网络。管理员相关的管理操作表（公告、岗位、考试、活动等）通过 publisher_id 关联到 users。`),
  new Paragraph({ children: [new PageBreak()] }),
];

// ---- Section 6: UI/UX ----
const section6 = [
  heading1("六、UI/UX 设计"),
  heading2("6.1 设计风格"),
  para(`整体采用简约商务风设计，以蓝色系为主色调（#409EFF），营造专业、可信赖的视觉氛围。圆角卡片（12px）、轻阴影（0 2px 12px rgba(0,0,0,0.06)）、充足留白，确保信息层次分明。`),
  heading2("6.2 色彩规范"),
  new Table({
    width: { size: 9026, type: WidthType.DXA },
    columnWidths: [1500, 2000, 5526],
    rows: [
      tableRow([makeHeaderCell("用途", 1500), makeHeaderCell("色值", 2000), makeHeaderCell("说明", 5526)]),
      tableRow([makeCell("主色", 1500, { bold: true }), makeCell("#409EFF", 2000), makeCell("主要按钮、链接、选中状态、侧边栏菜单高亮", 5526)]),
      tableRow([makeCell("主色浅", 1500, { bold: true }), makeCell("#ECF5FF", 2000), makeCell("主色背景、hover 状态", 5526)]),
      tableRow([makeCell("成功色", 1500, { bold: true }), makeCell("#67C23A", 2000), makeCell("成功状态、通过标志", 5526)]),
      tableRow([makeCell("警告色", 1500, { bold: true }), makeCell("#E6A23C", 2000), makeCell("警告状态、待审核标志", 5526)]),
      tableRow([makeCell("危险色", 1500, { bold: true }), makeCell("#F56C6C", 2000), makeCell("错误/危险状态、拒绝标志", 5526)]),
      tableRow([makeCell("信息色", 1500, { bold: true }), makeCell("#909399", 2000), makeCell("辅助信息、次要文字", 5526)]),
      tableRow([makeCell("边框色", 1500, { bold: true }), makeCell("#DCDFE6", 2000), makeCell("边框、分割线", 5526)]),
      tableRow([makeCell("背景色", 1500, { bold: true }), makeCell("#F5F7FA", 2000), makeCell("页面背景", 5526)]),
    ],
  }),
  heading2("6.3 GSAP 动画体系"),
  para(`系统内置 6 类 GSAP 动画效果，提升交互体验：`),
  para(`1. 极光背景动画（AuroraBackground）：登录/注册页面的流动极光效果，颜色渐变与流动速度可配置，移动端自动降低强度。`),
  para(`2. 页面转场动画：路由切换时淡入淡出效果（移动端使用 fade，桌面端使用 slide-left/slide-right 方向性转场）。`),
  para(`3. 卡片悬浮动画（TiltCard）：首页统计卡片在鼠标悬停时产生 3D 微倾斜和上浮效果。`),
  para(`4. 光标粒子动画（CursorTrail）：鼠标移动时产生彩色粒子拖尾效果，提升页面趣味性和科技感。`),
  para(`5. 数字滚动动画（CountUp）：统计数据从 0 滚动至目标值，增强数据展示的生动性。`),
  para(`6. 侧边栏菜单入场动画（GSAP stagger）：菜单项依次淡入左移入场，延迟递减，增强层次感。`),
  heading2("6.4 移动端适配"),
  para(`• 响应式断点：768px，低于此宽度自动切换移动端布局。`),
  para(`• CSS 变量系统：统一管理主题色、侧边栏宽度、头部高度、间距等。`),
  para(`• 底部导航栏：4 标签（首页/我的/学业/消息），固定底部，支持安全区域适配。`),
  para(`• 表格横向滚动：Element Plus 表格内部启用横向滚动条，底部显示滑动提示。`),
  para(`• 卡片网格自适应：桌面端4列 → 平板2列 → 手机1列。`),
  new Paragraph({ children: [new PageBreak()] }),
];

// ---- Section 7: Highlights ----
const section7 = [
  heading1("七、特色亮点"),
  para(`1. 全面的功能覆盖：27个完整页面（学生端17页 + 管理端10页 + 认证3页），覆盖大赛要求的全部六大核心功能模块，功能齐全、交互流畅。`),
  para(`2. 精致的 GSAP 动画体系：6 种动画效果贯穿全站（极光背景、页面转场、卡片悬浮、光标粒子、数字滚动、菜单入场），在保证性能的前提下（GSAP 60fps 优化）大幅提升视觉体验。`),
  para(`3. 移动端深度适配：响应式布局、底部导航栏、侧边栏自动隐藏与滑出、表格横向滚动提示、聊天室全屏切换，为手机用户提供原生 App 级别的体验。`),
  para(`4. 滑块验证码：自定义拖拽拼图验证码，支持鼠标拖拽和触摸滑动，有效防止机器登录攻击。`),
  para(`5. 实时聊天系统：Socket.io 实现班主任与学生一对一实时私信，支持在线状态、正在输入、未读消息红点、历史消息分页加载、文件/图片发送。JWT 认证集成于 WebSocket 握手，保证安全性。`),
  para(`6. Excel 批量导入：管理员可上传 Excel 文件批量导入学生数据与成绩数据，支持 camelCase ↔ snake_case 字段映射。`),
  para(`7. 角色权限系统：三级角色（学生/管理员/部门部长），路由守卫 + API 中间件双重校验。部门部长拥有活动发布等额外权限。`),
  para(`8. 奖学金 Word 导出：一键将奖学金申请数据导出为格式化的 .docx 文件，方便存档与打印。`),
  para(`9. 首次登录强制修改密码：安全策略设计，学生首次登录后必须修改初始密码，密码强度实时验证（8位+字母+数字+三色强度条）。`),
  para(`10. 学院-年级-班级级联筛选：管理员可按真实学院（8个）进行级联筛选，快速定位目标学生群体。`),
  new Paragraph({ children: [new PageBreak()] }),
];

// ---- Section 8: Test Accounts ----
const section8 = [
  heading1("八、测试账号与访问方式"),
  heading2("8.1 线上访问地址"),
  para(`http://124.223.0.187/smart/`),
  heading2("8.2 测试账号"),
  new Table({
    width: { size: 9026, type: WidthType.DXA },
    columnWidths: [2000, 1800, 1800, 3426],
    rows: [
      tableRow([makeHeaderCell("学号/工号", 2000), makeHeaderCell("密码", 1800), makeHeaderCell("姓名", 1800), makeHeaderCell("角色", 3426)]),
      tableRow([makeCell("admin", 2000, { bold: true }), makeCell("123456", 1800), makeCell("系统管理员", 1800), makeCell("管理员 — 拥有全部管理权限", 3426)]),
      tableRow([makeCell("2023010001", 2000, { bold: true }), makeCell("123456", 1800), makeCell("张三", 1800), makeCell("学生 — 可查看/申请所有功能", 3426)]),
      tableRow([makeCell("202413140617", 2000, { bold: true }), makeCell("123456", 1800), makeCell("张林", 1800), makeCell("学生 + 宣传部部长 — 可发布活动", 3426)]),
    ],
  }),
  heading2("8.3 系统部署信息"),
  para(`• 服务器：腾讯云轻量应用服务器（Ubuntu 22.04, 3.6GB RAM, 40GB SSD）`),
  para(`• 前端：Nginx Docker Alpine 静态托管 + 反向代理`),
  para(`• 后端：Node.js 20 双进程运行（端口3000），无 PM2 保护（已提交为比赛简化部署）`),
  para(`• 数据库：MySQL 8.0 Docker 容器，utf8mb4 字符集`),
  emptyLine(),
  para("—— 文档结束 ——", { bold: true, size: 28 }),
];

// ============================================================
// Assemble document
// ============================================================
const doc = new Document({
  styles: {
    default: { document: { run: { font: "SimSun", size: 24 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, font: "SimHei", color: "2E75B6" },
        paragraph: { spacing: { before: 360, after: 240 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: "SimHei", color: "333333" },
        paragraph: { spacing: { before: 240, after: 180 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, font: "SimSun", color: "555555" },
        paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 2 } },
    ],
  },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
      },
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [new TextRun({ text: "智慧学工系统 · 系统功能说明文档", font: "SimSun", size: 18, color: "999999" })],
        })],
      }),
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: "第 ", font: "SimSun", size: 18, color: "999999" }),
            new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 18, color: "999999" }),
            new TextRun({ text: " 页", font: "SimSun", size: 18, color: "999999" }),
          ],
        })],
      }),
    },
    children: [
      ...coverPage, ...tocPage, ...section1, ...section2, ...section3, ...section4,
      ...section5, ...section6, ...section7, ...section8,
    ],
  }],
});

Packer.toBuffer(doc).then(buffer => {
  const path = "D:\\TOYCLAUDE\\smart-student-system\\submission\\2024级六班，一杰\\系统功能说明文档.docx";
  fs.writeFileSync(path, buffer);
  console.log("Word document created: " + path);
  console.log("Size: " + (buffer.length / 1024).toFixed(1) + " KB");
}).catch(err => {
  console.error("Error:", err.message);
  process.exit(1);
});
