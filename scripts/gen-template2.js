const fs = require('fs');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType, HeadingLevel, PageNumber, Header, Footer, PageBreak,
} = require('docx');

const border = { style: BorderStyle.SINGLE, size: 1, color: "000000" };
const borders = { top: border, bottom: border, left: border, right: border };
const cellMargins = { top: 60, bottom: 60, left: 100, right: 100 };
const noBorder = { style: BorderStyle.NONE, size: 0 };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

function cell(text, width, opts = {}) {
  return new TableCell({
    borders: opts.noBorder ? noBorders : borders,
    width: { size: width, type: WidthType.DXA },
    shading: opts.shading ? { fill: opts.shading, type: ShadingType.CLEAR } : undefined,
    margins: cellMargins,
    verticalAlign: "center",
    children: [new Paragraph({
      alignment: opts.center ? AlignmentType.CENTER : AlignmentType.LEFT,
      spacing: { after: 40 },
      children: [new TextRun({ text, font: opts.font || "SimSun", size: opts.size || 20, bold: opts.bold || false, color: opts.color })]
    })],
  });
}

function emptyCell(width) {
  return new TableCell({
    borders, width: { size: width, type: WidthType.DXA }, margins: cellMargins,
    children: [new Paragraph({ children: [new TextRun({ text: "", size: 20 })] })],
  });
}

function row(cells) { return new TableRow({ children: cells }); }

// ============================================================
// Build Document
// ============================================================
const doc = new Document({
  styles: {
    default: { document: { run: { font: "SimSun", size: 20 } } },
  },
  sections: [{
    properties: {
      page: { size: { width: 11906, height: 16838 }, margin: { top: 1200, right: 1000, bottom: 1000, left: 1000 } },
    },
    children: [
      // Title
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: "中国大学生计算机设计大赛作品信息概要表", font: "SimHei", size: 28, bold: true })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 }, children: [new TextRun({ text: "(2026年版)", font: "SimSun", size: 22 })] }),

      // ---- Basic Info ----
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 200, after: 120 }, children: [new TextRun({ text: "基本信息", font: "SimHei", size: 24, bold: true })] }),

      new Table({ width: { size: 9906, type: WidthType.DXA }, columnWidths: [2000, 7906],
        rows: [
          row([cell("作品编号", 2000, { shading: "D9E8F7", bold: true }), cell("【待补充】", 7906, { color: "FF0000" })]),
          row([cell("作品名称", 2000, { shading: "D9E8F7", bold: true }), cell("智慧学工系统 — 高校一站式学生事务管理平台", 7906)]),
          row([cell("作品大类", 2000, { shading: "D9E8F7", bold: true }), cell("软件应用与开发", 7906)]),
          row([cell("作品小类", 2000, { shading: "D9E8F7", bold: true }), cell("Web 应用与开发", 7906)]),
        ],
      }),

      // ---- Introduction ----
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 200, after: 120 }, children: [new TextRun({ text: "作品简介与创新描述", font: "SimHei", size: 24, bold: true })] }),

      new Table({ width: { size: 9906, type: WidthType.DXA }, columnWidths: [2000, 7906],
        rows: [
          row([cell("作品简介\n(100字以内)", 2000, { shading: "D9E8F7", bold: true }), cell("智慧学工系统是一套面向高校的综合性学生事务管理Web平台，聚合学生信息管理、奖助服务、学业发展、职业规划、安全管理、沟通互动六大核心模块于一体，支持PC端与移动端响应式适配，提供27个完整功能页面，旨在为高校师生提供统一、高效、美观的智慧学工服务。", 7906)]),
          row([cell("创新描述\n(100字以内)", 2000, { shading: "D9E8F7", bold: true }), cell("1. GSAP动画体系贯穿全站（极光背景、3D卡片悬浮、光标粒子、页面转场），提升交互品质；2. 实时聊天采用Socket.io双向通信，支持在线状态与正在输入提示；3. 移动端深度适配，聊天室全屏切换模式，表格横向滚动，原生App级体验；4. 自定义滑块验证码与首次登录强制改密。", 7906)]),
        ],
      }),

      // ---- Special Notes ----
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 200, after: 120 }, children: [new TextRun({ text: "特别说明", font: "SimHei", size: 24, bold: true })] }),

      new Table({ width: { size: 9906, type: WidthType.DXA }, columnWidths: [9906],
        rows: [
          row([cell("1. 作品中不涉及疆域地图相关内容。\n2. 本项目为全新开发，无前期基础，全部功能模块均为本次参赛期间（2026年5月）从零开始设计与实现。\n3. 作品开发过程中使用了AI辅助工具（Claude Code），已填写并提交《4-AI工具使用说明》。", 9906)]),
        ],
      }),

      // ---- Authors (placeholder) ----
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 200, after: 120 }, children: [new TextRun({ text: "作者及其分工比例", font: "SimHei", size: 24, bold: true })] }),
      new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: "【以下为模板占位，请根据实际团队成员填写姓名及各项工作量百分比】", font: "SimSun", size: 18, color: "FF0000" })] }),

      new Table({ width: { size: 9906, type: WidthType.DXA }, columnWidths: [1800, 1012, 1012, 1012, 1012, 1012, 1012, 1012, 1012],
        rows: [
          row([
            cell("项目\\姓名", 1800, { shading: "D9E8F7", bold: true, center: true }),
            cell("【姓名1】", 1012, { shading: "D9E8F7", bold: true, center: true }),
            cell("【姓名2】", 1012, { shading: "D9E8F7", bold: true, center: true }),
            cell("【姓名3】", 1012, { shading: "D9E8F7", bold: true, center: true }),
            cell("【姓名4】", 1012, { shading: "D9E8F7", bold: true, center: true }),
            cell("【姓名5】", 1012, { shading: "D9E8F7", bold: true, center: true }),
            cell("【姓名6】", 1012, { shading: "D9E8F7", bold: true, center: true }),
            cell("【姓名7】", 1012, { shading: "D9E8F7", bold: true, center: true }),
            cell("【姓名8】", 1012, { shading: "D9E8F7", bold: true, center: true }),
          ]),
          row([cell("组织协调", 1800, { bold: true }), emptyCell(1012), emptyCell(1012), emptyCell(1012), emptyCell(1012), emptyCell(1012), emptyCell(1012), emptyCell(1012), emptyCell(1012)]),
          row([cell("作品创意", 1800, { bold: true }), emptyCell(1012), emptyCell(1012), emptyCell(1012), emptyCell(1012), emptyCell(1012), emptyCell(1012), emptyCell(1012), emptyCell(1012)]),
          row([cell("竞品分析", 1800, { bold: true }), emptyCell(1012), emptyCell(1012), emptyCell(1012), emptyCell(1012), emptyCell(1012), emptyCell(1012), emptyCell(1012), emptyCell(1012)]),
          row([cell("方案设计", 1800, { bold: true }), emptyCell(1012), emptyCell(1012), emptyCell(1012), emptyCell(1012), emptyCell(1012), emptyCell(1012), emptyCell(1012), emptyCell(1012)]),
          row([cell("技术实现", 1800, { bold: true }), emptyCell(1012), emptyCell(1012), emptyCell(1012), emptyCell(1012), emptyCell(1012), emptyCell(1012), emptyCell(1012), emptyCell(1012)]),
          row([cell("文献阅读", 1800, { bold: true }), emptyCell(1012), emptyCell(1012), emptyCell(1012), emptyCell(1012), emptyCell(1012), emptyCell(1012), emptyCell(1012), emptyCell(1012)]),
          row([cell("测试分析", 1800, { bold: true }), emptyCell(1012), emptyCell(1012), emptyCell(1012), emptyCell(1012), emptyCell(1012), emptyCell(1012), emptyCell(1012), emptyCell(1012)]),
        ],
      }),

      // ---- Instructor ----
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 200, after: 120 }, children: [new TextRun({ text: "指导教师作用", font: "SimHei", size: 24, bold: true })] }),
      new Table({ width: { size: 9906, type: WidthType.DXA }, columnWidths: [9906],
        rows: [
          row([cell("【请勾选】□作品创意 □理论指导 □技术方案 □实验场地 □硬件资源 □数据提供 □后勤支持 □宣讲通知 □组织协调 □经费支持 □其他：", 9906)]),
        ],
      }),

      // ---- Platforms ----
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 200, after: 120 }, children: [new TextRun({ text: "技术平台", font: "SimHei", size: 24, bold: true })] }),
      new Table({ width: { size: 9906, type: WidthType.DXA }, columnWidths: [2000, 7906],
        rows: [
          row([cell("开发制作平台", 2000, { shading: "D9E8F7", bold: true }), cell("☑Windows 10/11  ☑Linux (Ubuntu 22.04)  □macOS  □其他", 7906)]),
          row([cell("运行展示平台", 2000, { shading: "D9E8F7", bold: true }), cell("☑Windows  ☑Linux  ☑macOS  ☑iOS  ☑Android（Web跨平台，任何现代浏览器均可访问）", 7906)]),
          row([cell("开发制作工具", 2000, { shading: "D9E8F7", bold: true }), cell("VS Code, Claude Code (AI辅助), GitHub, Docker, MySQL Workbench, Node.js 20, Vite 8, npm", 7906)]),
        ],
      }),

      // ---- References ----
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 200, after: 120 }, children: [new TextRun({ text: "参考文献", font: "SimHei", size: 24, bold: true })] }),
      new Table({ width: { size: 9906, type: WidthType.DXA }, columnWidths: [9906],
        rows: [
          row([cell("1. Vue 3 官方文档, https://vuejs.org/\n2. Element Plus 组件库, https://element-plus.org/\n3. GSAP 动画引擎文档, https://greensock.com/gsap/\n4. Express.js 官方文档, https://expressjs.com/\n5. Sequelize ORM 文档, https://sequelize.org/\n6. Socket.io 官方文档, https://socket.io/", 9906)]),
        ],
      }),

      // ---- Submission Content ----
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 200, after: 120 }, children: [new TextRun({ text: "提交内容", font: "SimHei", size: 24, bold: true })] }),
      new Table({ width: { size: 9906, type: WidthType.DXA }, columnWidths: [2000, 7906],
        rows: [
          row([cell("提交内容", 2000, { shading: "D9E8F7", bold: true }), cell("☑素材压缩包  ☑设计文档  ☑演示视频  ☑PPT  ☑源代码  □部署文件  □数据集  □模型  □作品文件  □其他", 7906)]),
        ],
      }),

      // ---- Files ----
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 200, after: 120 }, children: [new TextRun({ text: "相关文件", font: "SimHei", size: 24, bold: true })] }),
      new Table({ width: { size: 9906, type: WidthType.DXA }, columnWidths: [400, 3500, 3000, 3006],
        rows: [
          row([cell("序号", 400, { shading: "D9E8F7", bold: true, center: true }), cell("文件名与描述", 3500, { shading: "D9E8F7", bold: true }), cell("文件状态", 3000, { shading: "D9E8F7", bold: true }), cell("版权状态", 3006, { shading: "D9E8F7", bold: true })]),
          row([cell("1", 400, { center: true }), cell("文件名：2-作品信息概要表（2026年版）.pdf\n描述：作品信息概要表", 3500), cell("□已上传到网盘\n☑未上传，待提交", 3000), cell("☑自制", 3006)]),
          row([cell("2", 400, { center: true }), cell("文件名：3-设计和开发文档.pdf\n描述：软件应用与开发类作品设计和开发文档", 3500), cell("□已上传到网盘\n☑未上传，待提交", 3000), cell("☑自制", 3006)]),
          row([cell("3", 400, { center: true }), cell("文件名：4-AI工具使用说明.pdf\n描述：AI工具使用说明（Claude Code）", 3500), cell("□已上传到网盘\n☑未上传，待提交", 3000), cell("☑自制", 3006)]),
          row([cell("4", 400, { center: true }), cell("文件名：源代码.zip\n描述：完整前端(Vue3)+后端(Node.js)源代码", 3500), cell("□已上传到网盘\n☑未上传，待提交", 3000), cell("☑自制", 3006)]),
          row([cell("5", 400, { center: true }), cell("文件名：作品演示视频.mp4\n描述：系统功能演示视频（≤10分钟）", 3500), cell("□已上传到网盘\n☑未上传，待提交", 3000), cell("☑自制", 3006)]),
          row([cell("6", 400, { center: true }), cell("文件名：答辩演示PPT.pdf\n描述：现场答辩演示文档PDF版", 3500), cell("□已上传到网盘\n☑未上传，待提交", 3000), cell("☑自制", 3006)]),
          row([cell("7", 400, { center: true }), cell("文件名：素材包.zip\n描述：代表性素材（校徽、截图、设计稿）", 3500), cell("□已上传到网盘\n☑未上传，待提交", 3000), cell("☑自制 / □开源", 3006)]),
          row([cell("8", 400, { center: true }), cell("文件名：作品信息概要表.pdf\n描述：本表PDF版本", 3500), cell("□已上传到网盘\n☑未上传，待提交", 3000), cell("☑自制", 3006)]),
        ],
      }),

      // ---- Signature ----
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 200, after: 120 }, children: [new TextRun({ text: "参赛承诺", font: "SimHei", size: 24, bold: true })] }),
      new Table({ width: { size: 9906, type: WidthType.DXA }, columnWidths: [9906],
        rows: [
          row([cell("本作品全体参赛队员郑重承诺：本作品全体参赛队员确认本表所列内容是正式参赛内容的重要组成部分，并严格按照本大类参赛作品类别提交要求提交了评审必需的文档、数据等参赛材料，本表内容按照要求如实填写。如因提交的参赛材料不符合要求，或本表填写内容不属实，将自愿承担因此导致奖项等级降低甚至终止本作品参加比赛的责任。\n\n全体参赛队员签名：（可附授权使用的电子签名图片）\n\n日期：2026年    月    日", 9906)]),
        ],
      }),
    ],
  }],
});

const out = "D:\\TOYCLAUDE\\smart-student-system\\docs\\大赛作品提交模板\\2-作品信息概要表（已填写）.docx";
Packer.toBuffer(doc).then(buf => { fs.writeFileSync(out, buf); console.log("Created: " + out); }).catch(e => { console.error(e.message); process.exit(1); });
