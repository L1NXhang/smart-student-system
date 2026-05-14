const fs = require('fs');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle,
  WidthType, ShadingType, PageNumber, PageBreak, LevelFormat,
  TableOfContents,
} = require('../backend/node_modules/docx');

const border = { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' };
const borders = { top: border, bottom: border, left: border, right: border };
const cellMargins = { top: 80, bottom: 80, left: 120, right: 120 };

function cell(text, opts = {}) {
  return new TableCell({
    borders,
    width: opts.width ? { size: opts.width, type: WidthType.DXA } : undefined,
    shading: opts.shading ? { fill: opts.shading, type: ShadingType.CLEAR } : undefined,
    margins: cellMargins,
    children: [new Paragraph({
      alignment: opts.align || AlignmentType.LEFT,
      children: [new TextRun({ text, bold: opts.bold, font: 'Arial', size: opts.size || 20 })],
    })],
  });
}

function sectionTitle(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 240 },
    children: [new TextRun({ text, font: 'Arial' })],
  });
}

function subTitle(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 180 },
    children: [new TextRun({ text, font: 'Arial' })],
  });
}

function bodyText(text) {
  return new Paragraph({
    spacing: { after: 120, line: 360 },
    children: [new TextRun({ text, font: 'Arial', size: 22 })],
  });
}

const doc = new Document({
  styles: {
    default: { document: { run: { font: 'Arial', size: 22 } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 32, bold: true, font: 'Arial', color: '1A3C6D' },
        paragraph: { spacing: { before: 360, after: 240 }, outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 26, bold: true, font: 'Arial', color: '2B5797' },
        paragraph: { spacing: { before: 240, after: 180 }, outlineLevel: 1 } },
    ],
  },
  numbering: {
    config: [{
      reference: 'bullets',
      levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } } }],
    }],
  },
  sections: [
    // ===== COVER PAGE =====
    {
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      children: [
        new Paragraph({ spacing: { before: 2400 }, children: [] }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
          children: [new TextRun({ text: '智慧学工系统', font: 'Arial', size: 56, bold: true, color: '1A3C6D' })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 120 },
          children: [new TextRun({ text: 'Smart Student Affairs System', font: 'Arial', size: 28, color: '555555', italics: true })],
        }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 600 }, children: [
          new TextRun({ text: '系统功能说明文档', font: 'Arial', size: 36, color: '2B5797' }),
        ]}),
        new Paragraph({ spacing: { before: 1200 }, children: [] }),
        createInfoTable(),
        new Paragraph({ spacing: { before: 2400 }, children: [] }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: '西华师范大学 第二十八届电脑文化艺术节', font: 'Arial', size: 22, color: '888888' })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 120 },
          children: [new TextRun({ text: '智慧学工应用创新大赛', font: 'Arial', size: 22, color: '888888' })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: '2026年5月', font: 'Arial', size: 20, color: '888888' })],
        }),
      ],
    },

    // ===== TOC =====
    {
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
            children: [new TextRun({ text: '智慧学工系统 - 功能说明文档', font: 'Arial', size: 18, color: '999999' })],
          })],
        }),
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: '第 ', font: 'Arial', size: 18 }), new TextRun({ children: [PageNumber.CURRENT], font: 'Arial', size: 18 }), new TextRun({ text: ' 页', font: 'Arial', size: 18 })],
          })],
        }),
      },
      children: [
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: '目录', font: 'Arial' })] }),
        new TableOfContents('目录', { hyperlink: true, headingStyleRange: '1-2' }),
        new Paragraph({ children: [new PageBreak()] }),

        // ===== 1. 系统概述 =====
        sectionTitle('1. 系统概述'),
        subTitle('1.1 项目背景'),
        bodyText('为深入学习贯彻习近平新时代中国特色社会主义思想，全面落实国家教育数字化战略部署，西华师范大学举办"智慧学工系统"设计大赛。本项目旨在开发一款集学生信息管理、日常事务办理、学业发展支持于一体的综合性智慧学工信息系统。'),
        subTitle('1.2 项目目标'),
        bodyText('本系统围绕六大核心功能模块，实现学生工作全流程数字化管理：信息管理、奖助服务、学业发展、职业规划、安全管理、沟通互动。系统采用现代化技术栈，注重交互体验与数据安全。'),
        bodyText('系统支持PC端和移动端响应式访问，已部署至云服务器，可通过浏览器直接访问使用。'),

        subTitle('1.3 用户角色'),
        createTable(
          ['角色', '权限范围', '主要功能'],
          [
            ['学生', '个人信息查看、申请提交、消息接收', '查看档案、提交各类申请、报名活动、在线聊天'],
            ['教师/管理员', '数据管理、审批流程、信息发布', '管理学生、审核申请、发布公告、导入数据'],
          ],
        ),

        // ===== 2. 技术架构 =====
        sectionTitle('2. 技术架构'),
        subTitle('2.1 技术栈'),
        createTable(
          ['层级', '技术栈', '说明'],
          [
            ['前端框架', 'Vue 3 + Element Plus', '渐进式框架，组件化开发'],
            ['动画引擎', 'GSAP 3', '专业级动画库，页面动效'],
            ['后端框架', 'Node.js + Express', 'JavaScript全栈，RESTful API'],
            ['数据库', 'MySQL 8.0 + Sequelize ORM', '关系型数据库，ORM映射'],
            ['实时通信', 'Socket.io', 'WebSocket双向通信'],
            ['认证方案', 'JWT (JSON Web Token)', '无状态认证，RBAC权限控制'],
          ],
        ),

        subTitle('2.2 系统架构'),
        bodyText('系统采用前后端分离架构，前端Vue 3 SPA通过HTTP/HTTPS与后端Express API通信，WebSocket用于实时聊天。数据库使用MySQL 8.0，通过Sequelize ORM进行数据操作。Nginx反向代理统一入口。'),

        subTitle('2.3 部署架构'),
        bodyText('系统部署于腾讯云服务器（Ubuntu 24.04），通过Nginx反向代理统一入口（80端口）。后端Node.js进程监听3000端口，MySQL运行于Docker容器。前端Vite构建为静态文件，由后端Express生产模式托管。'),

        // ===== 3. 功能模块 =====
        sectionTitle('3. 功能模块说明'),
        bodyText('系统包含六大核心功能模块，覆盖学生工作管理的完整业务流程。'),

        subTitle('3.1 用户认证模块'),
        bodyText('实现学生、教师两类用户的注册、登录及权限控制。支持JWT Token认证、密码强度验证、滑块验证码、记住登录状态、首次登录强制改密等功能。学生账号需管理员审核后激活。'),

        subTitle('3.2 学生信息管理模块'),
        bodyText('涵盖学生个人信息的录入、查询、修改与维护。信息分为基础信息（姓名/学号/照片/联系方式）、学籍信息（学院/专业/班级/校区）、个人特质（病史/爱好/性格/职业目标）、联系信息（班主任/家庭成员/紧急联系人）、特殊信息（困难认定）五大类。'),
        bodyText('学生可提交信息变更申请，经管理员审核通过后生效。支持照片上传（证件照规格）、批量信息导入导出。'),

        subTitle('3.3 奖助服务模块'),
        bodyText('集成奖学金申请与审核、助学金申报、勤工助学岗位发布与报名等全流程功能。奖学金申请采用在线模板填写模式，包含学业成绩（GPA/排名）、获奖情况、操行分计算、申请理由等完整字段，审核通过后支持一键导出Word文档。勤工助学支持岗位发布、学生查看详情、在线投递申请。'),

        subTitle('3.4 学业发展模块'),
        bodyText('提供成绩查询（含GPA趋势图、学期对比）、第二课堂成绩单（分类学时进度条）、中期鉴定填报、获奖记录管理等功能。成绩支持Excel批量导入，第二课堂按学术科创/文体活动/志愿服务/其他活动四个类别分别统计学时并显示达标进度。'),

        subTitle('3.5 职业规划模块'),
        bodyText('内置生涯测评工具（职业兴趣测评、性格测评），支持在线答题、即时生成测评报告和职业建议。提供就业指导预约通道、就业信息精准推送（招聘/宣讲会/政策）等功能。'),

        subTitle('3.6 安全管理模块'),
        bodyText('包含晚归登记、外出报备、安全知识考试、异常情况上报等功能。晚归和外出需提交申请经管理员审核，支持取消和审核意见反馈。安全考试支持题库管理、在线答题、自动评分。'),

        subTitle('3.7 沟通互动模块'),
        bodyText('提供班主任与学生一对一实时聊天（基于WebSocket，支持在线状态、未读消息红点、正在输入提示）、班级/年级公告发布与已读追踪、意见反馈留言板（支持管理员回复）、活动报名专区（支持名额限制、报名截止、取消报名）等功能。'),

        // ===== 4. 数据库设计 =====
        sectionTitle('4. 数据库设计'),
        bodyText('系统数据库包含30张数据表，涵盖用户、学生信息、各类申请、学业记录、安全记录、聊天消息等全部业务数据。采用utf8mb4字符集，支持完整的Unicode字符存储。核心表包括：'),
        createTable(
          ['表名', '说明', '核心字段'],
          [
            ['users', '用户表', 'username, password, name, role, status'],
            ['student_info', '学生信息表', 'user_id, college, major, grade, photo等'],
            ['scholarship_applications', '奖学金申请表', 'student_id, scholarship_type, gpa, ranking, conduct_score等'],
            ['grades', '成绩表', 'student_id, semester, course_name, score, gpa'],
            ['midterm_evaluations', '中期鉴定表', 'student_id, semester, moral/ academic/ social等评价'],
            ['late_return_records', '晚归记录表', 'student_id, return_date, expected_time, reason'],
            ['chat_messages', '聊天消息表', 'sender_id, receiver_id, content, is_read'],
            ['events', '活动表', 'title, event_type, location, quota, deadline'],
          ],
        ),

        // ===== 5. 操作教程 =====
        sectionTitle('5. 操作教程'),
        subTitle('5.1 系统访问'),
        bodyText('在浏览器地址栏输入系统URL，进入登录页面。输入学号/工号和密码，完成滑块安全验证后点击登录。首次登录系统会提示修改密码。'),
        subTitle('5.2 学生端操作'),
        bodyText('工作台：登录后进入工作台首页，可查看我的奖学金、未读通知、待审核申请、近期活动等概览卡片，以及近期公告和活动列表。'),
        bodyText('个人信息：在个人信息页面可查看完整的个人档案，点击"编辑信息"进入编辑模式，修改后提交需管理员审核。支持证件照上传。'),
        bodyText('奖学金申请：在奖助服务页面点击"申请奖学金"，选择奖学金类型，填写GPA、排名、获奖情况、操行分明细、申请理由，上传证明材料后提交。审核通过后可在列表页导出Word文档。'),
        bodyText('安全考试：选择考试后开始计时答题，完成后自动评分并显示通过/未通过结果。'),
        subTitle('5.3 管理端操作'),
        bodyText('管理首页：可查看学生总数、待审核申请数、未处理反馈数、晚归/外出报备数等实时统计数据，点击可跳转至对应管理页面。'),
        bodyText('审核操作：在各审核页面可查看申请详情，选择通过或拒绝并填写审核意见。'),

        // ===== 6. 技术亮点 =====
        sectionTitle('6. 技术亮点'),
        bodyText('1. Vue 3 + Composition API：采用Vue 3最新Composition API开发，代码结构清晰，组件复用性高。'),
        bodyText('2. GSAP动画引擎：页面入场动画、数字滚动、卡片悬浮等交互动效均由GSAP驱动，体验流畅。'),
        bodyText('3. WebSocket实时通信：聊天模块基于Socket.io实现双向实时通信，支持在线状态、已读未读、正在输入等状态同步。'),
        bodyText('4. 响应式设计：系统全面适配PC端和移动端，移动端侧边栏自动隐藏为抽屉式菜单，表格支持横向滚动。'),
        bodyText('5. 奖学金模板系统：在线模板填写+操行分计算+Word文档导出，实现奖学金申请全流程数字化。'),
        bodyText('6. 安全机制：JWT认证+RABC权限控制+滑块验证码+密码强度检测+首登改密，多层安全防护。'),
        bodyText('7. 生产级部署：Nginx反向代理+Node.js进程管理+MySQL Docker容器化，保障服务稳定运行。'),

        // ===== 7. 部署说明 =====
        sectionTitle('7. 部署说明'),
        bodyText('服务器：腾讯云 CVM（Ubuntu 24.04）'),
        bodyText('访问地址：http://124.223.0.187/smart/'),
        bodyText('测试账号：admin / 123456（管理员）  2023010001 / 123456（学生）'),
        bodyText('部署方式：Nginx反向代理（80端口）→ Node.js Express（3000端口）→ MySQL（3306端口）'),
        bodyText('前端构建：Vite build --base /smart/，生成静态文件由Express托管'),
      ],
    },
  ],
});

function createInfoTable() {
  return new Table({
    width: { size: 6000, type: WidthType.DXA },
    columnWidths: [2000, 4000],
    rows: [
      new TableRow({ children: [cell('项目名称', { width: 2000, bold: true, shading: 'E8F0FE' }), cell('智慧学工系统', { width: 4000 })] }),
      new TableRow({ children: [cell('版本号', { width: 2000, bold: true, shading: 'E8F0FE' }), cell('V1.1', { width: 4000 })] }),
      new TableRow({ children: [cell('所属赛事', { width: 2000, bold: true, shading: 'E8F0FE' }), cell('西华师范大学第二十八届电脑文化艺术节——智慧学工应用创新大赛', { width: 4000 })] }),
      new TableRow({ children: [cell('提交日期', { width: 2000, bold: true, shading: 'E8F0FE' }), cell('2026年5月20日', { width: 4000 })] }),
      new TableRow({ children: [cell('技术栈', { width: 2000, bold: true, shading: 'E8F0FE' }), cell('Vue 3 + Node.js + MySQL + GSAP', { width: 4000 })] }),
    ],
  });
}

function createTable(headers, rows) {
  const allRows = [
    new TableRow({ children: headers.map(h => cell(h, { bold: true, shading: 'E8F0FE', align: AlignmentType.CENTER })) }),
    ...rows.map(r => new TableRow({ children: r.map(c => cell(String(c))) })),
  ];
  return new Table({
    width: { size: 9026, type: WidthType.DXA },
    columnWidths: Array(headers.length).fill(Math.floor(9026 / headers.length)),
    rows: allRows,
  });
}

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync('D:/TOYCLAUDE/smart-student-system/docs/系统功能说明文档.docx', buffer);
  console.log('Document generated: docs/系统功能说明文档.docx');
  console.log('Size:', (buffer.length / 1024).toFixed(1), 'KB');
});
