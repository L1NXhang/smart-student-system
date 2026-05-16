const { StudentInfo, sequelize } = require('../models');
const { success, error, paginate } = require('../utils/response');
const { getCachedStudentInfo } = require('../utils/getStudentInfo');

// 生涯测评题目
const assessmentQuestions = {
  interest: [
    { id: 1, question: '你喜欢研究科学问题吗？', options: ['A. 非常喜欢', 'B. 比较喜欢', 'C. 一般', 'D. 不太喜欢'] },
    { id: 2, question: '你喜欢与人交流沟通吗？', options: ['A. 非常喜欢', 'B. 比较喜欢', 'C. 一般', 'D. 不太喜欢'] },
    { id: 3, question: '你喜欢艺术创作吗？', options: ['A. 非常喜欢', 'B. 比较喜欢', 'C. 一般', 'D. 不太喜欢'] },
    { id: 4, question: '你喜欢组织管理活动吗？', options: ['A. 非常喜欢', 'B. 比较喜欢', 'C. 一般', 'D. 不太喜欢'] },
    { id: 5, question: '你喜欢动手制作东西吗？', options: ['A. 非常喜欢', 'B. 比较喜欢', 'C. 一般', 'D. 不太喜欢'] },
    { id: 6, question: '你喜欢帮助他人解决问题吗？', options: ['A. 非常喜欢', 'B. 比较喜欢', 'C. 一般', 'D. 不太喜欢'] },
    { id: 7, question: '你喜欢处理数据和信息吗？', options: ['A. 非常喜欢', 'B. 比较喜欢', 'C. 一般', 'D. 不太喜欢'] },
    { id: 8, question: '你喜欢户外活动吗？', options: ['A. 非常喜欢', 'B. 比较喜欢', 'C. 一般', 'D. 不太喜欢'] },
    { id: 9, question: '你喜欢阅读和写作吗？', options: ['A. 非常喜欢', 'B. 比较喜欢', 'C. 一般', 'D. 不太喜欢'] },
    { id: 10, question: '你喜欢挑战新事物吗？', options: ['A. 非常喜欢', 'B. 比较喜欢', 'C. 一般', 'D. 不太喜欢'] }
  ],
  personality: [
    { id: 1, question: '你更喜欢独自工作还是团队合作？', options: ['A. 独自工作', 'B. 团队合作', 'C. 都可以', 'D. 看情况'] },
    { id: 2, question: '你做事更注重细节还是大局？', options: ['A. 注重细节', 'B. 关注大局', 'C. 两者兼顾', 'D. 看情况'] },
    { id: 3, question: '你更喜欢按计划行事还是随机应变？', options: ['A. 按计划', 'B. 随机应变', 'C. 两者结合', 'D. 看情况'] },
    { id: 4, question: '你更倾向于理性分析还是感性判断？', options: ['A. 理性分析', 'B. 感性判断', 'C. 两者结合', 'D. 看情况'] },
    { id: 5, question: '你喜欢稳定还是变化？', options: ['A. 稳定', 'B. 变化', 'C. 适度变化', 'D. 看情况'] },
    { id: 6, question: '你面对压力时如何应对？', options: ['A. 冷静分析', 'B. 寻求帮助', 'C. 积极行动', 'D. 调整心态'] },
    { id: 7, question: '你更喜欢领导还是跟随？', options: ['A. 领导', 'B. 跟随', 'C. 都可以', 'D. 看情况'] },
    { id: 8, question: '你更注重过程还是结果？', options: ['A. 过程', 'B. 结果', 'C. 两者兼顾', 'D. 看情况'] }
  ]
};

// 测评结果类型
const assessmentResults = {
  interest: {
    'A': { type: '研究型', description: '你喜欢探索和研究新知识，适合从事科研、技术开发等工作。', suggestions: ['科研人员', '工程师', '程序员', '分析师'] },
    'B': { type: '社会型', description: '你喜欢与人交流合作，适合从事教育、服务、管理等工作。', suggestions: ['教师', '人力资源', '销售', '咨询师'] },
    'C': { type: '艺术型', description: '你有较强的创造力和审美能力，适合从事设计、创作等工作。', suggestions: ['设计师', '文案策划', '视频编辑', '艺术指导'] },
    'D': { type: '实践型', description: '你喜欢动手操作，适合从事技术、制造等工作。', suggestions: ['技术工程师', '产品经理', '项目经理', '运营专员'] }
  },
  personality: {
    'A': { type: '分析型', description: '你善于理性分析，注重逻辑和细节，适合需要精确思考的工作。', suggestions: ['数据分析师', '财务', '审计', '研究员'] },
    'B': { type: '领导型', description: '你有较强的领导能力和决策力，适合管理类工作。', suggestions: ['项目经理', '部门经理', '创业者', '团队负责人'] },
    'C': { type: '协作型', description: '你善于团队合作，沟通能力强，适合需要协作的工作。', suggestions: ['产品经理', '运营', '市场', '客户经理'] },
    'D': { type: '创新型', description: '你有较强的创新意识和适应能力，适合变化快的工作环境。', suggestions: ['创业者', '产品经理', '市场营销', '新媒体运营'] }
  }
};

// 获取测评题目
const getAssessmentQuestions = async (req, res) => {
  try {
    const { type } = req.params;

    if (!assessmentQuestions[type]) {
      return error(res, '无效的测评类型', 400);
    }

    return success(res, {
      type,
      questions: assessmentQuestions[type]
    });
  } catch (err) {
    console.error('获取测评题目错误:', err);
    return error(res, '获取测评题目失败', 500);
  }
};

// 提交测评答案
const submitAssessment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type } = req.params;
    const { answers } = req.body;

    if (!assessmentQuestions[type]) {
      return error(res, '无效的测评类型', 400);
    }

    const studentInfo = await getCachedStudentInfo(req);
    if (!studentInfo) {
      return error(res, '学生信息不存在', 404);
    }

    // 计算结果（简单统计）
    const counts = { A: 0, B: 0, C: 0, D: 0 };
    answers.forEach(a => {
      if (counts[a] !== undefined) counts[a]++;
    });

    // 找出最多的选项
    const maxOption = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
    const result = assessmentResults[type][maxOption];

    // 保存测评记录
    await sequelize.query(
      `INSERT INTO career_assessments (student_id, assessment_type, answers, result_type, result_description, career_suggestions, created_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      {
        replacements: [
          studentInfo.id,
          type,
          JSON.stringify(answers),
          result.type,
          result.description,
          JSON.stringify(result.suggestions)
        ],
        type: sequelize.QueryTypes.INSERT
      }
    );

    return success(res, {
      resultType: result.type,
      resultDescription: result.description,
      careerSuggestions: result.suggestions
    });
  } catch (err) {
    console.error('提交测评答案错误:', err);
    return error(res, '提交测评答案失败', 500);
  }
};

// 获取测评历史
const getAssessmentHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const studentInfo = await getCachedStudentInfo(req);
    if (!studentInfo) {
      return error(res, '学生信息不存在', 404);
    }

    const history = await sequelize.query(
      'SELECT * FROM career_assessments WHERE student_id = ? ORDER BY created_at DESC',
      {
        replacements: [studentInfo.id],
        type: sequelize.QueryTypes.SELECT
      }
    );

    // 解析 JSON 字段
    history.forEach(item => {
      if (item.career_suggestions) {
        try {
          item.career_suggestions = JSON.parse(item.career_suggestions);
        } catch (e) {}
      }
    });

    return success(res, history);
  } catch (err) {
    console.error('获取测评历史错误:', err);
    return error(res, '获取测评历史失败', 500);
  }
};

// 预约就业指导
const createAppointment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { appointmentDate, appointmentTime, reason } = req.body;

    const studentInfo = await getCachedStudentInfo(req);
    if (!studentInfo) {
      return error(res, '学生信息不存在', 404);
    }

    await sequelize.query(
      `INSERT INTO career_appointments (student_id, appointment_date, appointment_time, reason, status, created_at)
       VALUES (?, ?, ?, ?, 'pending', NOW())`,
      {
        replacements: [studentInfo.id, appointmentDate, appointmentTime, reason],
        type: sequelize.QueryTypes.INSERT
      }
    );

    return success(res, null, '预约已提交');
  } catch (err) {
    console.error('预约就业指导错误:', err);
    return error(res, '预约就业指导失败', 500);
  }
};

// 获取我的预约
const getMyAppointments = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;

    const studentInfo = await getCachedStudentInfo(req);
    if (!studentInfo) {
      return error(res, '学生信息不存在', 404);
    }

    let whereClause = 'student_id = ?';
    const params = [studentInfo.id];

    if (status) {
      whereClause += ' AND status = ?';
      params.push(status);
    }

    const appointments = await sequelize.query(
      `SELECT * FROM career_appointments WHERE ${whereClause} ORDER BY appointment_date DESC`,
      {
        replacements: params,
        type: sequelize.QueryTypes.SELECT
      }
    );

    return success(res, appointments);
  } catch (err) {
    console.error('获取预约列表错误:', err);
    return error(res, '获取预约列表失败', 500);
  }
};

// 取消预约
const cancelAppointment = async (req, res) => {
  try {
    const userId = req.user.id;
    const studentInfo = await getCachedStudentInfo(req);
    if (!studentInfo) return error(res, '学生信息不存在', 404);

    const appointments = await sequelize.query(
      'SELECT * FROM career_appointments WHERE id = ? AND student_id = ?',
      { replacements: [req.params.id, studentInfo.id], type: sequelize.QueryTypes.SELECT }
    );
    if (!appointments.length) return error(res, '预约不存在', 404);
    if (appointments[0].status !== 'pending') return error(res, '只能取消待确认的预约', 400);

    await sequelize.query(
      'UPDATE career_appointments SET status = ? WHERE id = ?',
      { replacements: ['cancelled', req.params.id], type: sequelize.QueryTypes.UPDATE }
    );
    return success(res, null, '已取消');
  } catch (err) {
    console.error('取消预约错误:', err);
    return error(res, '取消预约失败', 500);
  }
};

// 获取就业信息列表
const getJobInfos = async (req, res) => {
  try {
    const { jobType, keyword, page = 1, pageSize = 10 } = req.query;

    let whereClause = 'status = 1';
    const params = [];

    if (jobType) {
      whereClause += ' AND job_type = ?';
      params.push(jobType);
    }

    if (keyword) {
      whereClause += ' AND (title LIKE ? OR content LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    const countResult = await sequelize.query(
      `SELECT COUNT(*) as total FROM job_infos WHERE ${whereClause}`,
      {
        replacements: params,
        type: sequelize.QueryTypes.SELECT
      }
    );
    const total = countResult[0].total;

    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    const list = await sequelize.query(
      `SELECT * FROM job_infos WHERE ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      {
        replacements: [...params, parseInt(pageSize), offset],
        type: sequelize.QueryTypes.SELECT
      }
    );

    return paginate(res, list, total, parseInt(page), parseInt(pageSize));
  } catch (err) {
    console.error('获取就业信息列表错误:', err);
    return error(res, '获取就业信息列表失败', 500);
  }
};

// 获取就业信息详情
const getJobInfoDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const jobInfo = await sequelize.query(
      'SELECT * FROM job_infos WHERE id = ?',
      {
        replacements: [id],
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (jobInfo.length === 0) {
      return error(res, '信息不存在', 404);
    }

    // 更新浏览次数
    await sequelize.query(
      'UPDATE job_infos SET view_count = view_count + 1 WHERE id = ?',
      {
        replacements: [id],
        type: sequelize.QueryTypes.UPDATE
      }
    );

    // 记录阅读
    const studentInfo = await getCachedStudentInfo(req);
    if (studentInfo) {
      await sequelize.query(
        `INSERT INTO job_info_reads (job_info_id, student_id, read_at)
         VALUES (?, ?, NOW())
         ON DUPLICATE KEY UPDATE read_at = NOW()`,
        {
          replacements: [id, studentInfo.id],
          type: sequelize.QueryTypes.INSERT
        }
      );
    }

    return success(res, jobInfo[0]);
  } catch (err) {
    console.error('获取就业信息详情错误:', err);
    return error(res, '获取就业信息详情失败', 500);
  }
};

// 收藏就业信息
const toggleFavorite = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const studentInfo = await getCachedStudentInfo(req);
    if (!studentInfo) {
      return error(res, '学生信息不存在', 404);
    }

    // 检查是否已收藏
    const existing = await sequelize.query(
      'SELECT * FROM job_info_reads WHERE job_info_id = ? AND student_id = ?',
      {
        replacements: [id, studentInfo.id],
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (existing.length > 0) {
      const newFavorite = existing[0].is_favorite ? 0 : 1;
      await sequelize.query(
        'UPDATE job_info_reads SET is_favorite = ? WHERE job_info_id = ? AND student_id = ?',
        {
          replacements: [newFavorite, id, studentInfo.id],
          type: sequelize.QueryTypes.UPDATE
        }
      );
      return success(res, { isFavorite: !!newFavorite }, newFavorite ? '已收藏' : '已取消收藏');
    } else {
      await sequelize.query(
        `INSERT INTO job_info_reads (job_info_id, student_id, is_favorite, read_at)
         VALUES (?, ?, 1, NOW())`,
        {
          replacements: [id, studentInfo.id],
          type: sequelize.QueryTypes.INSERT
        }
      );
      return success(res, { isFavorite: true }, '已收藏');
    }
  } catch (err) {
    console.error('收藏就业信息错误:', err);
    return error(res, '收藏就业信息失败', 500);
  }
};

module.exports = {
  getAssessmentQuestions,
  submitAssessment,
  getAssessmentHistory,
  createAppointment,
  getMyAppointments,
  cancelAppointment,
  getJobInfos,
  getJobInfoDetail,
  toggleFavorite
};
