const { sequelize } = require('./src/models');

(async () => {
  try {
    // ===== Part 0: Create career_assessment_questions table =====
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS career_assessment_questions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        assessment_type VARCHAR(30) COMMENT '测评类型: holland/mbti/values',
        dimension VARCHAR(50) COMMENT '维度',
        question VARCHAR(500) COMMENT '题目',
        options JSON COMMENT '选项数组',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('OK career_assessment_questions table created');

    // ===== Part 1: Safety exams + questions =====
    await sequelize.query(
      "INSERT INTO safety_exams (title, description, duration, total_score, pass_score, status) VALUES (?, ?, ?, ?, ?, ?)",
      { replacements: ['校园安全知识考试', '涵盖消防安全、交通安全、网络安全、心理健康等基础安全知识', 30, 100, 60, 1] }
    );
    const [[{ id: examId }]] = await sequelize.query("SELECT MAX(id) as id FROM safety_exams");
    console.log('OK safety_exams inserted, exam_id =', examId);

    const questions = [
      ['灭火器使用时的正确步骤是？', JSON.stringify(['A. 拔销-对准-压把-扫射', 'B. 对准-拔销-压把-扫射', 'C. 压把-拔销-对准-扫射', 'D. 拔销-压把-对准-扫射']), 'A', 20],
      ['校园内发生火灾时，以下哪项做法是错误的？', JSON.stringify(['A. 立即拨打119报警', 'B. 乘坐电梯快速逃生', 'C. 用湿毛巾捂住口鼻', 'D. 弯腰低姿撤离']), 'B', 20],
      ['网络诈骗的常见手段不包括以下哪项？', JSON.stringify(['A. 冒充公检法工作人员', 'B. 中奖信息诈骗', 'C. 银行柜台办理业务', 'D. 虚假兼职刷单']), 'C', 20],
      ['发现室友出现心理危机时，首先应该怎么做？', JSON.stringify(['A. 装作不知道', 'B. 及时报告辅导员或心理咨询中心', 'C. 在网上发帖求助', 'D. 责备对方不够坚强']), 'B', 20],
      ['骑行电动车在校园内，以下哪项是正确的？', JSON.stringify(['A. 可以不戴头盔', 'B. 可以载2人以上', 'C. 遵守交通规则，佩戴头盔，减速慢行', 'D. 可以在人行道上骑行']), 'C', 20],
    ];
    for (const [q, opts, ans, score] of questions) {
      await sequelize.query(
        'INSERT INTO safety_questions (exam_id, question, options, answer, score) VALUES (?, ?, ?, ?, ?)',
        { replacements: [examId, q, opts, ans, score] }
      );
    }
    console.log('OK safety_questions (5 rows) inserted');

    // ===== Part 2: Holland career assessment questions =====
    const hollandQuestions = [
      {
        q: '我喜欢动手修理、组装物品',
        options: ['A. 非常符合（动手操作型）', 'B. 比较符合（研究思考型）', 'C. 不太符合（艺术创作型）', 'D. 完全不符合（社交服务型）']
      },
      {
        q: '我喜欢探索科学理论或研究自然现象',
        options: ['A. 非常符合（研究思考型）', 'B. 比较符合（动手操作型）', 'C. 不太符合（企业领导型）', 'D. 完全不符合（事务常规型）']
      },
      {
        q: '我喜欢绘画、设计或音乐创作',
        options: ['A. 非常符合（艺术创作型）', 'B. 比较符合（社交服务型）', 'C. 不太符合（事务常规型）', 'D. 完全不符合（研究思考型）']
      },
      {
        q: '我喜欢帮助他人解决问题或辅导学习',
        options: ['A. 非常符合（社交服务型）', 'B. 比较符合（企业领导型）', 'C. 不太符合（动手操作型）', 'D. 完全不符合（事务常规型）']
      },
      {
        q: '我喜欢担任团队领导或发起创业项目',
        options: ['A. 非常符合（企业领导型）', 'B. 比较符合（社交服务型）', 'C. 不太符合（事务常规型）', 'D. 完全不符合（研究思考型）']
      },
      {
        q: '我喜欢整理文档、核对数据或按流程办事',
        options: ['A. 非常符合（事务常规型）', 'B. 比较符合（研究思考型）', 'C. 不太符合（艺术创作型）', 'D. 完全不符合（企业领导型）']
      }
    ];
    const dimensions = ['R', 'I', 'A', 'S', 'E', 'C'];
    for (let i = 0; i < hollandQuestions.length; i++) {
      const { q, options } = hollandQuestions[i];
      await sequelize.query(
        'INSERT INTO career_assessment_questions (assessment_type, dimension, question, options) VALUES (?, ?, ?, ?)',
        { replacements: ['holland', dimensions[i], q, JSON.stringify(options)] }
      );
    }
    console.log('OK career_assessment_questions (6 rows) inserted');

    // ===== Part 3: Job infos =====
    const jobs = [
      {
        title: '腾讯2026校园招聘-软件开发工程师',
        content: '腾讯科技（深圳）有限公司2026届校园招聘正式启动，诚聘软件开发工程师。负责公司核心产品的设计、开发与维护工作，参与技术方案的制定与实施。',
        company_name: '腾讯科技（深圳）有限公司',
        position: '软件开发工程师',
        salary: '薪资面议',
        location: '深圳',
        contact_info: 'campus@tencent.com',
        deadline: '2026-06-30',
        job_type: 'recruitment'
      },
      {
        title: '中国建设银行四川省分行-金融科技岗',
        content: '中国建设银行四川省分行2026年度校园招聘，招聘金融科技岗人员。负责银行金融科技系统的开发、运维及数据分析工作，推动银行数字化转型。',
        company_name: '中国建设银行四川省分行',
        position: '金融科技岗',
        salary: '年薪12-18万',
        location: '成都',
        contact_info: 'sc_hr@ccb.com',
        deadline: '2026-07-15',
        job_type: 'recruitment'
      },
      {
        title: '新东方教育科技集团-英语教师',
        content: '新东方教育科技集团南充分校诚聘英语教师。负责中小学生及成人英语课程教学，制定个性化教学方案，完成教学质量评估与反馈。',
        company_name: '新东方教育科技集团',
        position: '英语教师',
        salary: '月薪6000-10000元',
        location: '南充',
        contact_info: 'nchr@xdf.cn',
        deadline: '2026-08-01',
        job_type: 'recruitment'
      }
    ];
    for (const j of jobs) {
      await sequelize.query(
        'INSERT INTO job_infos (title, content, job_type, company_name, position, salary, location, contact_info, deadline, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        { replacements: [j.title, j.content, j.job_type, j.company_name, j.position, j.salary, j.location, j.contact_info, j.deadline, 1] }
      );
    }
    console.log('OK job_infos (3 rows) inserted');

    // ===== Part 4: Work study positions =====
    const positions = [
      {
        title: '图书馆管理员助理',
        description: '协助图书馆工作人员完成图书整理、借阅登记、书架维护等日常工作。工作地点：华凤校区图书馆。',
        requirements: '在校学生，责任心强，工作认真细致，每周至少工作8小时',
        work_time: '每周8小时（可灵活安排）',
        salary: '600元/月',
        quota: 2
      },
      {
        title: '实验室机房维护',
        description: '负责实验室及机房设备的日常维护与管理，包括电脑软硬件故障排查、网络维护等。工作地点：行署校区实训楼。',
        requirements: '计算机相关专业优先，熟悉电脑硬件和网络基础知识，每周至少工作6小时',
        work_time: '每周6小时',
        salary: '700元/月',
        quota: 1
      },
      {
        title: '学工部行政助理',
        description: '协助学工部老师完成文件整理、数据录入、资料归档等行政事务。工作地点：华凤校区行政楼。',
        requirements: '熟练使用Office办公软件，细心负责，沟通能力好，每周至少工作8小时',
        work_time: '每周8小时',
        salary: '500元/月',
        quota: 3
      }
    ];
    for (const p of positions) {
      await sequelize.query(
        'INSERT INTO work_study_positions (title, description, requirements, work_time, salary, quota, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        { replacements: [p.title, p.description, p.requirements, p.work_time, p.salary, p.quota, 1] }
      );
    }
    console.log('OK work_study_positions (3 rows) inserted');

    // ===== Part 5: Family info for 张三 (student_id=2) =====
    // Note: member_type column is ENUM('father','mother','emergency1','emergency2')
    await sequelize.query(
      "INSERT INTO family_info (student_id, member_type, name, phone, relation) VALUES (?, ?, ?, ?, ?)",
      { replacements: [2, 'father', '张建国', '13800002001', '父亲'] }
    );
    await sequelize.query(
      "INSERT INTO family_info (student_id, member_type, name, phone, relation) VALUES (?, ?, ?, ?, ?)",
      { replacements: [2, 'mother', '李梅', '13800002002', '母亲'] }
    );
    console.log('OK family_info (2 rows for 张三) inserted');

    // ===== Part 6: Emergency contacts for 张三 (student_id=2) =====
    await sequelize.query(
      "INSERT INTO emergency_contacts (student_id, name, phone, relation, is_primary) VALUES (?, ?, ?, ?, ?)",
      { replacements: [2, '李梅', '13800002002', '母亲', 1] }
    );
    await sequelize.query(
      "INSERT INTO emergency_contacts (student_id, name, phone, relation, is_primary) VALUES (?, ?, ?, ?, ?)",
      { replacements: [2, '王老师', '13900139000', '辅导员', 0] }
    );
    console.log('OK emergency_contacts (2 rows for 张三) inserted');

    // ===== Verify all data =====
    console.log('\n========== 验证结果 ==========');

    const [[{ cnt: ec }]] = await sequelize.query('SELECT COUNT(*) as cnt FROM safety_exams');
    console.log('safety_exams:', ec, '条');

    const [[{ cnt: qc }]] = await sequelize.query('SELECT COUNT(*) as cnt FROM safety_questions');
    console.log('safety_questions:', qc, '条');

    const [[{ cnt: cqc }]] = await sequelize.query('SELECT COUNT(*) as cnt FROM career_assessment_questions');
    console.log('career_assessment_questions:', cqc, '条');

    const [[{ cnt: jc }]] = await sequelize.query('SELECT COUNT(*) as cnt FROM job_infos');
    console.log('job_infos:', jc, '条');

    const [[{ cnt: pc }]] = await sequelize.query('SELECT COUNT(*) as cnt FROM work_study_positions');
    console.log('work_study_positions:', pc, '条');

    const [[{ cnt: fc }]] = await sequelize.query('SELECT COUNT(*) as cnt FROM family_info');
    console.log('family_info:', fc, '条');

    const [[{ cnt: eccount }]] = await sequelize.query('SELECT COUNT(*) as cnt FROM emergency_contacts');
    console.log('emergency_contacts:', eccount, '条');

    // Verify Chinese encoding
    const [exams] = await sequelize.query('SELECT id, title FROM safety_exams');
    console.log('\n安全考试标题:', exams[0].title);

    const [fam] = await sequelize.query('SELECT name FROM family_info LIMIT 1');
    console.log('家庭成员姓名:', fam[0].name);

    const [emer] = await sequelize.query('SELECT name, phone, relation FROM emergency_contacts LIMIT 1');
    console.log('紧急联系人:', emer[0].name, emer[0].phone, emer[0].relation);

    console.log('\n========== 全部数据填充完成 ==========');
  } catch (err) {
    console.error('Error:', err.message);
    console.error(err.stack);
  } finally {
    await sequelize.close();
  }
})();
