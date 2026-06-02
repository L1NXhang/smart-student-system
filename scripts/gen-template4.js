const fs = require('fs');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType, PageNumber, Header, Footer,
} = require('docx');

const border = { style: BorderStyle.SINGLE, size: 1, color: "000000" };
const borders = { top: border, bottom: border, left: border, right: border };
const cm = { top: 60, bottom: 60, left: 100, right: 100 };

function mc(text, w, opts = {}) { return new TableCell({ borders, width: { size: w, type: WidthType.DXA }, shading: opts.sh ? { fill: opts.sh, type: ShadingType.CLEAR } : undefined, margins: cm, verticalAlign: "top", children: [new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text, font: "SimSun", size: 18, bold: opts.b || false, color: opts.c })] })] }); }
function r(cells) { return new TableRow({ children: cells }); }

// AI usage rows
const aiRows = [
  r([mc("1", 500, { sh: "D9E8F7", b: true }), mc("Claude Code (CLI)\n模型：Claude Opus 4.7\n访问方式：Windows CLI 客户端\n使用时间：2026年5月14日–20日", 2000), mc("代码编程：生成Vue3页面组件、Express路由/控制器、数据库模型；Bug修复：定位编码问题、API异常、UI溢出bug；架构设计：系统架构评审、数据库表结构设计、API接口规范制定；文档撰写：PRD文档、API文档、提交材料文档", 3000), mc("1. \"请为智慧学工系统创建学生Dashboard页面，使用Vue3+Element Plus，含统计卡片、公告列表、活动列表\"\n2. \"修复MySQL连接字符集导致的中文乱码问题，将latin1改为utf8mb4\"\n3. \"移动端表格溢出，390px视口下680px宽的表格如何处理\"\n4. \"设计奖学金申请的数据表结构，含学生ID、奖学金类型、申请理由、证明材料、审核状态等字段\"\n5. \"将聊天界面移动端改为全屏切换模式：联系人列表↔聊天区\"\n6. \"排查/api/scholarship/applications返回404的原因\"\n7. \"为登录页ShinyText组件调整动画速度，从5s改为12s\"\n8. \"创建项目README.md，含项目简介、技术栈、功能模块、在线演示地址\"", 3000), mc("AI生成代码经人工审查后采纳，关键业务逻辑（JWT认证、权限校验、滑块验证码）均由人工设计；AI生成的CSS动画参数经人工调整（速度/强度）；数据库表结构由AI建议+人工审核确定；文档由AI草拟后经人工校核补充", 2000), mc("整体采纳率约60%，经人工重构后实际代码采纳率约40%。前端页面结构采纳度高（约70%），后端业务逻辑采纳度中等（约40%），文档采纳度高（约80%）。AI主要替代了重复性代码编写和格式文档撰写，核心设计决策仍由人工完成。", 2000)]),
  r([mc("2", 500, { sh: "D9E8F7", b: true }), mc("DeepSeek V4 Pro\n访问方式：API/CC Switch 桥接\n使用时间：2026年5月14日–20日", 2000), mc("方案设计：辅助功能模块规划与竞品分析；文档润色：参赛文档文本润色与格式优化；问题解答：开发过程中的技术疑难解答", 3000), mc("1. \"智慧学工系统应该包含哪些核心功能模块\"\n2. \"Vue3中如何实现路由守卫和角色权限控制\"\n3. \"GSAP ScrollTrigger在移动端的性能优化建议\"\n4. \"大学生计算机设计大赛Web赛道的评审标准\"", 3000), mc("DeepSeek提供的方案建议作为参考，最终功能设计由团队讨论决定；技术方案经实测验证后采用；文档润色建议选择性采纳。", 2000), mc("咨询建议类采纳率约50%，文档润色采纳率约70%。主要用于思路拓展和方案验证，不直接生成最终交付物。", 2000)]),
  r([mc("3", 500, { sh: "D9E8F7", b: true }), mc("OpenClaw AI Agent\n版本：2026.4.14\n模型：MiniMax-M2.7\n部署于腾讯云服务器\n访问方式：SSH CLI\n使用时间：2026年5月10日–20日", 2000), mc("运维辅助：服务器健康检查、Docker容器状态监控；自动化测试：API端点可用性检测；日志分析：Nginx访问日志与后端错误日志分析", 3000), mc("1. \"检查服务器Docker容器运行状态\"\n2. \"查看后端API健康检查结果\"\n3. \"分析Nginx最近的404错误日志\"", 3000), mc("OpenClaw提供的运维建议经人工验证后执行；自动化检测结果作为参考，关键运维操作由人工决策。", 2000), mc("运维辅助类采纳率约80%，主要用于日常健康检查和日志分析，显著降低了手动巡检工作量。", 2000)]),
];

const doc = new Document({
  styles: { default: { document: { run: { font: "SimSun", size: 20 } } } },
  sections: [{
    properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1000, right: 800, bottom: 1000, left: 800 } }, orientation: "landscape" },
    headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "AI工具使用说明（2026年版）", font: "SimSun", size: 18, color: "999999" })] })] }) },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "第 ", font: "SimSun", size: 18 }), new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 18 }), new TextRun({ text: " 页", font: "SimSun", size: 18 })], })] }) },
    children: [
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: "中国大学生计算机设计大赛", font: "SimHei", size: 28, bold: true })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 300 }, children: [new TextRun({ text: "AI工具使用说明 (2026年版)", font: "SimHei", size: 24, bold: true, color: "2E75B6" })] }),
      new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: "作品编号：【待补充】    作品名称：智慧学工系统 — 高校一站式学生事务管理平台", font: "SimSun", size: 20, color: "FF0000" })] }),
      new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: "填写说明：本作品开发过程中使用了AI辅助工具，包括Claude Code（编程助手）、DeepSeek V4 Pro（方案咨询）、OpenClaw AI Agent（运维辅助）。以下详述各工具的使用情况。", font: "SimSun", size: 18, color: "666666" })] }),

      // AI Usage Table
      new Table({ width: { size: 13740, type: WidthType.DXA }, columnWidths: [500, 2000, 3000, 3000, 2000, 2000],
        rows: [
          r([mc("序号", 500, { sh: "2E75B6", b: true, c: "FFFFFF" }), mc("AI工具的名称、版本、访问方式、使用时间", 2000, { sh: "2E75B6", b: true, c: "FFFFFF" }), mc("使用AI工具的环节与目的", 3000, { sh: "2E75B6", b: true, c: "FFFFFF" }), mc("关键提示词", 3000, { sh: "2E75B6", b: true, c: "FFFFFF" }), mc("AI回复的人工修改说明", 2000, { sh: "2E75B6", b: true, c: "FFFFFF" }), mc("采纳比例与说明", 2000, { sh: "2E75B6", b: true, c: "FFFFFF" })]),
          ...aiRows,
        ],
      }),

      new Paragraph({ spacing: { before: 200, after: 200 }, children: [new TextRun({ text: "全体参赛队员承诺：以上AI工具使用情况如实填写，AI生成内容的关键佐证材料（操作截图、交互录屏）将作为附录提交。如因填写不实导致的一切后果，由本团队自行承担。", font: "SimSun", size: 18, bold: true })] }),

      new Paragraph({ spacing: { before: 200 }, children: [new TextRun({ text: "附录：AI工具使用佐证材料索引", font: "SimHei", size: 22, bold: true })] }),
      new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "附录1：Claude Code关键对话截图（约10张，含时间戳）— 待补充", font: "SimSun", size: 18, color: "FF0000" })] }),
      new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "附录2：DeepSeek方案研讨截图（约5张，含时间戳）— 待补充", font: "SimSun", size: 18, color: "FF0000" })] }),
      new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "附录3：OpenClaw运维日志截图（约3张，含时间戳）— 待补充", font: "SimSun", size: 18, color: "FF0000" })] }),
      new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "附录4：源代码中AI辅助标注示例（// AI辅助生成: Claude Opus 4.7, 2026-05-15）— 待补充", font: "SimSun", size: 18, color: "FF0000" })] }),
      new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "附录5：AI交互录屏视频（≤5分钟，MP4格式）— 待补充", font: "SimSun", size: 18, color: "FF0000" })] }),
    ],
  }],
});

const out = "D:\\TOYCLAUDE\\smart-student-system\\docs\\大赛作品提交模板\\4-AI工具使用说明（已填写）.docx";
Packer.toBuffer(doc).then(buf => { fs.writeFileSync(out, buf); console.log("Created: " + out); }).catch(e => { console.error(e.message); process.exit(1); });
