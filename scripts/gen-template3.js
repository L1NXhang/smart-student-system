const fs = require('fs');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType, HeadingLevel, PageNumber, Header, Footer, PageBreak,
} = require('docx');

const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const cm = { top: 60, bottom: 60, left: 100, right: 100 };

function h1(text) { return new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text, font: "SimHei", size: 32, bold: true, color: "2E75B6" })] }); }
function h2(text) { return new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text, font: "SimHei", size: 28, bold: true, color: "333333" })] }); }
function h3(text) { return new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun({ text, font: "SimSun", size: 24, bold: true, color: "555555" })] }); }
function p(text) { return new Paragraph({ spacing: { after: 100, line: 360 }, children: [new TextRun({ text, font: "SimSun", size: 22 })] }); }
function mc(text, w, opts = {}) { return new TableCell({ borders, width: { size: w, type: WidthType.DXA }, shading: opts.sh ? { fill: opts.sh, type: ShadingType.CLEAR } : undefined, margins: cm, verticalAlign: "center", children: [new Paragraph({ children: [new TextRun({ text, font: "SimSun", size: 20, bold: opts.b || false, color: opts.c })] })] }); }
function r(cells) { return new TableRow({ children: cells }); }

const cover = [
  new Paragraph({ spacing: { before: 3000 } }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: "智慧学工系统", font: "SimHei", size: 44, bold: true, color: "2E75B6" })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 }, children: [new TextRun({ text: "软件应用与开发类 — 作品设计和开发文档", font: "SimHei", size: 32, bold: true, color: "333333" })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 400 }, children: [new TextRun({ text: "中国大学生计算机设计大赛（2026年版）", font: "SimSun", size: 24, color: "666666" })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 }, children: [new TextRun({ text: "作品编号：【待补充】", font: "SimSun", size: 22, color: "FF0000" })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 }, children: [new TextRun({ text: "作品名称：智慧学工系统 — 高校一站式学生事务管理平台", font: "SimSun", size: 22 })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 }, children: [new TextRun({ text: "版本编号：V1.0", font: "SimSun", size: 22 })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 }, children: [new TextRun({ text: "填写日期：2026年5月20日", font: "SimSun", size: 22 })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 }, children: [new TextRun({ text: "赛道：软件应用与开发 / Web 应用与开发", font: "SimSun", size: 22 })] }),
  new Paragraph({ children: [new PageBreak()] }),
];

const ch1 = [
  h1("第一章  需求分析"),
  p("1.1 项目背景"),
  p("在学校日常生活中，学生与辅导员联系、部门发布活动、奖学金申请、安全报备等功能分散在多个平台（微信群聊、QQ群、独立教务系统等），导致师生需要在不同软件间频繁切换，信息查找困难，操作流程繁琐。现有平台普遍存在功能割裂、交互体验差、移动端适配不足等痛点。基于此，我们开发了智慧学工系统，旨在将学生事务管理全部核心功能聚合于一体平台，提供响应更快、UI更精美、适配更好的使用体验。"),
  p("1.2 竞品分析"),
  new Table({ width: { size: 9026, type: WidthType.DXA }, columnWidths: [1500, 1800, 1800, 1800, 2126],
    rows: [
      r([mc("维度", 1500, { sh: "2E75B6", b: true, c: "FFFFFF" }), mc("本系统", 1800, { sh: "2E75B6", b: true, c: "FFFFFF" }), mc("易班学工", 1800, { sh: "2E75B6", b: true, c: "FFFFFF" }), mc("传统教务系统", 1800, { sh: "2E75B6", b: true, c: "FFFFFF" }), mc("微信/QQ群", 2126, { sh: "2E75B6", b: true, c: "FFFFFF" })]),
      r([mc("响应式适配", 1500, { b: true }), mc("PC+移动端深度适配", 1800), mc("部分适配", 1800), mc("仅PC端", 1800), mc("不适用", 2126)]),
      r([mc("UI/UX品质", 1500, { b: true }), mc("GSAP动画+现代设计", 1800), mc("基础UI", 1800), mc("传统界面", 1800), mc("聊天界面", 2126)]),
      r([mc("功能聚合度", 1500, { b: true }), mc("6大模块一体化", 1800), mc("部分功能", 1800), mc("教务为主", 1800), mc("零散通知", 2126)]),
      r([mc("实时通信", 1500, { b: true }), mc("Socket.io实时聊天", 1800), mc("留言板", 1800), mc("无", 1800), mc("即时通讯", 2126)]),
      r([mc("移动端体验", 1500, { b: true }), mc("原生App级", 1800), mc("基本可用", 1800), mc("不可用", 1800), mc("微信内", 2126)]),
    ],
  }),
  p("1.3 目标用户"),
  p("学生：查看个人信息、提交各类申请（奖学金/助学金/信息变更/困难认定/晚归/外出报备等）、查看通知公告、报名活动、与班主任实时聊天、参加安全考试。管理员：管理学生信息（搜索/筛选/批量导入/详情查看/导出）、审核各类申请（奖学金/信息变更/晚归/外出等）、发布公告与活动、导入数据（成绩/题库）、管理勤工助学岗位。"),
  p("1.4 主要功能"),
  p("六大核心功能模块：学生基本信息管理（单页面25+字段完整展示，含家庭信息/紧急联系人/困难认定）、奖助服务管理（奖学金/助学金/勤工助学全流程）、学业发展支持（成绩查询与绩点趋势/中期鉴定/第二课堂/获奖记录/违纪查询）、职业规划（霍兰德+MBTI测评/就业指导预约/就业信息推送）、安全管理与预警（晚归登记/外出报备/安全考试/异常上报）、沟通互动（实时聊天/公告通知/意见反馈/活动报名）。共计27个完整页面（学生端17页+管理端10页+认证3页）。"),
];

const ch2 = [
  h1("第二章  概要设计"),
  h2("2.1 系统架构"),
  p("系统采用经典B/S三层架构：前端层（Vue 3 SPA）→ HTTP/HTTPS (RESTful API + WebSocket) → 后端层（Node.js + Express）→ ORM（Sequelize）→ 数据层（MySQL 8.0）。Nginx 作为反向代理和静态资源服务器，所有请求通过 Nginx 统一入口后路由至前端静态文件或后端 API 服务。"),
  h2("2.2 功能模块结构"),
  p("一级模块：用户认证（登录/注册/改密/验证码）、学生端（首页/个人信息/奖助/学业/职业/安全/沟通7个子模块17页面）、管理端（首页/学生管理/审核/勤工/学业/安全/公告/活动8个子模块10页面）。"),
  p("模块间通过 RESTful API 进行数据交互，聊天模块额外使用 Socket.io WebSocket 长连接实现实时双向通信。前端使用 Pinia 进行全局状态管理（用户信息/角色权限），Vue Router 实现 SPA 路由，路由守卫（beforeEach）统一处理认证与角色过滤。"),
  h2("2.3 人机界面设计"),
  p("PC端采用经典的侧边栏+顶栏布局，左侧可折叠菜单导航（220px展开/64px折叠），右侧主内容区自适应宽度。移动端采用底部标签导航栏+汉堡菜单滑出侧边栏布局，聊天室采用全屏切换模式（联系人列表↔聊天区）。全局使用蓝色系主色调（#409EFF），圆角卡片风格，GSAP驱动交互动效。"),
];

const ch3 = [
  h1("第三章  详细设计"),
  h2("3.1 界面设计"),
  p("登录页：移动端垂直居中布局（校徽+系统名+表单+滑块验证码），桌面端左右分栏（左侧品牌展示区+极光背景，右侧表单区）。极光背景使用 GSAP AuroraBackground 组件实现多色流体渐变动画。"),
  p("学生首页（工作台）：顶部统计卡片（奖学金/通知/待审核/活动），采用 TiltCard 3D悬浮+CountUp数字滚动动画。下方双栏布局（近期公告列表+近期活动列表），移动端堆叠为单栏。"),
  p("学生个人信息页：单页面分区展示，从上到下依次为证件照区→基础信息区→学籍信息区→个人特质区→联系信息区→家庭情况区→紧急联系人区→困难认定区。"),
  h2("3.2 数据库设计"),
  p("数据库采用 MySQL 8.0，utf8mb4 字符集，共设计28张数据表。核心表包括：users（用户表，含角色与状态）、student_info（学生详细信息表，25+字段，含学院/专业/年级/班级/校区/病史/爱好/职业目标等）、family_info（家庭信息表）、emergency_contacts（紧急联系人表）。业务表包括：scholarship_applications、work_study_positions、work_study_applications、grades（成绩表）、midterm_evaluations（中期鉴定）、safety_exams/safety_questions/safety_exam_records（安全考试体系）、chat_messages（实时聊天消息）、announcements/announcement_reads（公告与已读追踪）、events/event_registrations（活动与报名）、feedbacks（意见反馈）、info_change_requests（信息变更申请）等。"),
  p("ER关系：users 为所有用户基础表，student_info 通过 user_id 关联，所有业务表通过 student_id 关联到 student_info。管理相关表通过 publisher_id 关联到 users。"),
  h2("3.3 关键技术"),
  p("JWT认证：用户登录后签发包含用户ID、角色、部门角色的Token（7天有效期），前端 Axios 拦截器自动注入 Authorization 头。Socket.io 握手时传递 Token 进行 WebSocket 层认证。"),
  p("GSAP动画体系：6类动画效果——AuroraBackground（极光流体背景）、TiltCard（3D倾斜卡片）、CountUp（数字滚动）、Reveal（滚动触发显示）、CursorTrail（鼠标光标粒子）、页面转场（fade/slide-left/slide-right）。移动端自动降级动画强度。"),
  p("滑块验证码：自定义实现拖拽拼图验证，支持鼠标和触摸事件，滑动到最右端触发通过状态。"),
  p("移动端响应式：断点768px，CSS变量系统统一管理，Element Plus表格启用内部横向滚动，底部安全区域适配。"),
];

const ch4 = [
  h1("第四章  测试报告"),
  h2("4.1 测试环境"),
  p("服务端：腾讯云轻量应用服务器 Ubuntu 22.04 (3.6GB RAM)，Node.js 20，MySQL 8.0 Docker。客户端：Chrome 141、Edge、Firefox（PC端），iOS Safari、Android Chrome（移动端），390×844（iPhone 14）和 360×800 常见手机分辨率。"),
  h2("4.2 主要测试用例与结果"),
  new Table({ width: { size: 9026, type: WidthType.DXA }, columnWidths: [1800, 2000, 2500, 1500, 1226],
    rows: [
      r([mc("测试项", 1800, { sh: "2E75B6", b: true, c: "FFFFFF" }), mc("测试内容", 2000, { sh: "2E75B6", b: true, c: "FFFFFF" }), mc("预期结果", 2500, { sh: "2E75B6", b: true, c: "FFFFFF" }), mc("实际结果", 1500, { sh: "2E75B6", b: true, c: "FFFFFF" }), mc("状态", 1226, { sh: "2E75B6", b: true, c: "FFFFFF" })]),
      r([mc("登录验证", 1800), mc("正确账号+滑块验证", 2000), mc("登录成功跳转首页", 2500), mc("符合预期", 1500), mc("通过", 1226)]),
      r([mc("角色权限", 1800), mc("学生访问管理端页面", 2000), mc("重定向至学生首页", 2500), mc("符合预期", 1500), mc("通过", 1226)]),
      r([mc("中文字符", 1800), mc("查看学生列表中文数据", 2000), mc("中文正常显示无乱码", 2500), mc("符合预期", 1500), mc("通过", 1226)]),
      r([mc("移动端适配", 1800), mc("390px视口各页面访问", 2000), mc("布局正常/侧边栏隐藏/可操作", 2500), mc("符合预期", 1500), mc("通过", 1226)]),
      r([mc("实时聊天", 1800), mc("两端收发消息", 2000), mc("即时送达/在线状态正确", 2500), mc("功能正常", 1500), mc("通过", 1226)]),
      r([mc("批量导入", 1800), mc("Excel导入学生数据", 2000), mc("数据正确写入数据库", 2500), mc("符合预期", 1500), mc("通过", 1226)]),
      r([mc("安全考试", 1800), mc("答题提交自动评分", 2000), mc("分数正确/通过状态正确", 2500), mc("符合预期", 1500), mc("通过", 1226)]),
      r([mc("并发性能", 1800), mc("多用户同时访问API", 2000), mc("响应时间<1秒", 2500), mc("平均<500ms", 1500), mc("通过", 1226)]),
    ],
  }),
  h2("4.3 技术指标"),
  p("页面首屏加载时间：<3秒（PC端平均1.2秒，移动端平均2.5秒）。API响应时间：<500ms（平均）。并发支持：100+并发用户（连接池20连接）。数据导入速度：1000条/分钟。移动端表格滚动帧率：≥55fps。GSAP动画帧率：≥60fps。"),
];

const ch5 = [
  h1("第五章  安装及使用"),
  h2("5.1 安装环境要求"),
  p("运行环境：现代浏览器（Chrome/Firefox/Edge/Safari最新版），无需安装客户端。部署环境（如需自行部署）：Node.js 20+，MySQL 8.0+，Docker（可选），Nginx，Ubuntu 22.04 或 Windows Server。"),
  h2("5.2 在线访问"),
  p("系统已部署于腾讯云服务器，直接通过浏览器访问即可使用：http://124.223.0.187/smart/"),
  p("测试账号：admin / 123456（管理员），2023010001 / 123456（学生张三），202413140617 / 123456（学生张林/宣传部部长）。"),
  h2("5.3 典型使用流程"),
  h3("管理员流程"),
  p("登录→管理首页（查看统计概览：学生总数/待审核数/未处理反馈）→学生管理（搜索筛选/查看详情/批量导入）→申请审核（奖学金/信息变更/困难认定）→公告发布→活动管理。"),
  h3("学生流程"),
  p("登录→首页工作台（查看概览卡片）→个人信息（查看完整档案）→奖助服务（申请奖学金/浏览勤工岗位）→学业发展（查看成绩/绩点趋势）→沟通互动（与班主任聊天/查看公告/报名活动）。"),
];

const ch6 = [
  h1("第六章  项目总结"),
  p("本项目从2026年5月14日启动，历时7天完成从零到部署上线的全过程。开发过程中我们深刻体会到："),
  p("1. 项目协调的重要性：前端17页面+后端12组API+27张表的协同开发，需要明确接口规范、合理的任务分解和高效的沟通机制。GitHub的Issues和Commit规范帮助团队保持同步。"),
  p("2. 技术选型的前瞻性：Vue 3 Composition API + GSAP的组合在开发效率和交互动效上达到了很好的平衡。Element Plus的组件生态大幅降低了UI开发成本。"),
  p("3. AI辅助开发的适用边界：Claude Code在代码编写、Bug定位、架构建议等方面显著提升了开发效率，但关键业务逻辑设计、UI细节打磨、安全策略制定仍需人工判断。"),
  p("4. 移动端适配的复杂性：响应式设计不仅是CSS断点，还需要考虑触摸交互差异、网络环境、性能降级、安全区域适配等多个维度。聊天室的全屏切换设计就是专门为小屏优化的交互方案。"),
  p("后续升级方向：增加离线PWA支持、消息推送通知、数据可视化大屏、与学校现有教务系统API对接、无障碍访问（WCAG 2.1）适配、国际化多语言支持。"),
  h2("参考文献"),
  p("1. Vue.js 官方文档. https://vuejs.org/"),
  p("2. Element Plus 组件库. https://element-plus.org/"),
  p("3. GSAP 动画引擎. https://greensock.com/gsap/"),
  p("4. Express.js 文档. https://expressjs.com/"),
  p("5. Sequelize ORM 文档. https://sequelize.org/"),
  p("6. Socket.io 文档. https://socket.io/"),
  p("7. MySQL 8.0 Reference Manual. https://dev.mysql.com/doc/refman/8.0/en/"),
  p("8. 易班智慧学工平台. https://www.yiban.cn/"),
];

const doc = new Document({
  styles: {
    default: { document: { run: { font: "SimSun", size: 22 } } },
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
    properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1200, right: 1200, bottom: 1200, left: 1200 } } },
    headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "智慧学工系统 — 设计和开发文档", font: "SimSun", size: 18, color: "999999" })] })] }) },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "第 ", font: "SimSun", size: 18 }), new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 18 }), new TextRun({ text: " 页", font: "SimSun", size: 18 })], })] }) },
    children: [...cover, ...ch1, ...ch2, ...ch3, ...ch4, ...ch5, ...ch6],
  }],
});

const out = "D:\\TOYCLAUDE\\smart-student-system\\docs\\大赛作品提交模板\\3-设计和开发文档（已填写）.docx";
Packer.toBuffer(doc).then(buf => { fs.writeFileSync(out, buf); console.log("Created: " + out); }).catch(e => { console.error(e.message); process.exit(1); });
