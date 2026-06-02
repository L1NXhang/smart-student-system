const fs = require('fs');
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, PageNumber, Header, Footer,
  AlignmentType, LevelFormat, TableOfContents,
} = require('docx');

function h1(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text, bold: true, font: "SimHei", size: 32, color: "2E75B6" })] });
}
function h2(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text, bold: true, font: "SimHei", size: 28, color: "333333" })] });
}
function para(text) {
  return new Paragraph({ spacing: { after: 120, line: 360 }, children: [new TextRun({ text, font: "SimSun", size: 24 })] });
}
function empty() { return new Paragraph({ children: [new TextRun({ text: "", size: 12 })] }); }

const cover = [
  empty(), empty(), empty(), empty(), empty(), empty(),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 300 }, children: [new TextRun({ text: "中国大学生计算机设计大赛", font: "SimHei", size: 44, bold: true, color: "2E75B6" })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: "赛道选择原因与前期准备工作", font: "SimHei", size: 36, bold: true, color: "333333" })] }),
  empty(), empty(), empty(),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 160 }, children: [new TextRun({ text: "赛道：软件应用与开发 — Web 应用与开发", font: "SimSun", size: 26 })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 160 }, children: [new TextRun({ text: "团队：2024级六班，一杰", font: "SimSun", size: 26 })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 160 }, children: [new TextRun({ text: "日期：2026年5月20日", font: "SimSun", size: 26 })] }),
];

const section1 = [
  h1("一、赛道选择"),
  h2("1.1 基本信息"),
  para("选择大类：软件应用与开发"),
  para("选择小类：Web 应用与开发"),
  para("（本系统同样与信息管理小类高度契合，综合考量技术实现与用户体验的双重侧重，最终选择 Web 应用与开发作为参赛小类。）"),
  h2("1.2 赛道选择原因"),
  para("在学校日常生活中，学生与辅导员联系、部门发布活动、奖学金申请、安全报备等功能分散在多个平台，导致师生需要在不同软件之间频繁切换，操作繁琐，效率低下。现有平台普遍存在以下痛点："),
  para("1. 功能割裂：学生事务管理涉及信息查询、奖助申请、学业发展、安全管理、沟通互动等多个方面，但每个方面都有独立的系统或渠道，缺少统一入口。"),
  para("2. 交互体验差：多数现有系统界面陈旧，移动端适配不足，操作路径长，学习成本高。"),
  para("3. 响应速度慢：部分系统技术架构老化，页面加载缓慢，影响日常使用体验。"),
  para("基于以上痛点，我们决定开发一套响应更快、UI更精美、适配更好的智慧学工系统，将学生事务管理的全部核心功能聚合于一体平台，提供 PC 端和移动端双端一致的高质量体验。"),
  para("本项目采用现代 Web 技术栈（Vue 3 + Node.js + MySQL），实现前后端分离架构，并深度应用 GSAP 动画库提升交互品质，充分契合 Web 应用与开发赛道的技术要求。"),
  para("同时，信息管理系统也是智慧学工系统的本质属性——本系统完整实现了学生基本信息管理、奖助服务管理、学业发展支持、职业规划、安全管理与预警、沟通互动等六大核心模块，涵盖了信息的录入、查询、修改、审核、统计、导出等全生命周期管理功能。"),
];

const section2 = [
  h1("二、前期准备工作"),
  h2("2.1 技术准备"),
  para("在项目启动前，系统性地学习了以下关键技术："),
  para("前端技术：Vue 3 Composition API、Vite 构建工具、Element Plus 组件库、GSAP 动画引擎、Pinia 状态管理、Vue Router 路由管理、Axios HTTP 请求库。"),
  para("后端技术：Node.js 运行时、Express.js Web 框架、Sequelize ORM、MySQL 关系型数据库、JWT 认证机制、Socket.io 实时通信。"),
  para("部署技术：Docker 容器化、Nginx 反向代理与静态资源托管、云服务器运维、SSH 远程管理。"),
  para("工程化：Git 版本控制、前后端联调与接口规范、响应式移动端适配。"),
  h2("2.2 工具准备"),
  para("准备了以下开发与部署工具："),
  para("轻量级应用服务器：腾讯云轻量应用服务器（Ubuntu 22.04, 3.6GB RAM, 40GB SSD），用于系统部署与公网访问。"),
  para("AI 辅助开发工具：Claude Code（AI 编程助手），用于加速代码编写、Bug 修复、架构设计等开发环节。"),
  para("DeepSeek V4 Pro API Token：提供额外的 AI 能力支持。"),
  para("智能体（OpenClaw AI Agent）：部署于服务器的 AI 助手，辅助日常运维与测试。"),
  h2("2.3 协作准备"),
  para("GitHub 项目协作：使用 Git 进行版本控制，GitHub 作为远程代码仓库，规范化 Commit 格式（[Frontend] / [Backend] / [Feature] / [Fix] / [UI] / [Project]），确保开发过程可追溯、可协作。"),
  para("前后端分离协作：明确 API 接口规范，前后端独立开发与联调。"),
  h2("2.4 素材与参考"),
  para("校徽素材：参考并使用西华师范大学校徽作为系统品牌标识。"),
  para("成熟案例参考：研究易班智慧学工平台等成熟案例的功能设计与交互模式。"),
  para("核心功能模块：通过团队讨论，对照大赛要求确定了六大核心功能模块的设计方案。"),
  para("技术文档：查阅 Vue 3、Element Plus、GSAP、Express、Sequelize 等官方文档与社区资源。"),
  h2("2.5 在线访问与测试"),
  para("系统已部署上线，可在线访问：http://124.223.0.187/smart/"),
  para("测试账号：admin / 123456（管理员），2023010001 / 123456（学生），202413140617 / 123456（学生/宣传部部长）。"),
];

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
      default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "中国大学生计算机设计大赛 — 参赛说明", font: "SimSun", size: 18, color: "999999" })] })] }),
    },
    footers: {
      default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "第 ", font: "SimSun", size: 18, color: "999999" }), new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 18, color: "999999" }), new TextRun({ text: " 页", font: "SimSun", size: 18, color: "999999" })], })] }),
    },
    children: [...cover, ...section1, ...section2],
  }],
});

Packer.toBuffer(doc).then(buf => {
  const out = "D:\\TOYCLAUDE\\smart-student-system\\docs\\赛道选择原因与前期准备工作.docx";
  fs.writeFileSync(out, buf);
  console.log("Created: " + out);
  console.log("Size: " + (buf.length / 1024).toFixed(1) + " KB");
}).catch(e => { console.error(e.message); process.exit(1); });
