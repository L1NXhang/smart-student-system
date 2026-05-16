const { StudentInfo, User, sequelize } = require('../models');
const { success, error, paginate } = require('../utils/response');
const { getCachedStudentInfo } = require('../utils/getStudentInfo');
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, HeadingLevel, AlignmentType, BorderStyle, WidthType } = require('docx');

// 提交奖学金申请
const submitScholarshipApplication = async (req, res) => {
  try {
    const userId = req.user.id;
    const { scholarshipType, reason, materials, gpa, ranking, awardsSummary, conductScore, conductScoreDetail, templateData } = req.body;

    const studentInfo = await getCachedStudentInfo(req);
    if (!studentInfo) {
      return error(res, '学生信息不存在', 404);
    }

    // 检查是否已有待审核的同类申请
    const existing = await sequelize.query(
      `SELECT * FROM scholarship_applications
       WHERE student_id = ? AND scholarship_type = ? AND status = 'pending'`,
      {
        replacements: [studentInfo.id, scholarshipType],
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (existing.length > 0) {
      return error(res, '已有待审核的该类奖学金申请', 400);
    }

    // 插入申请
    await sequelize.query(
      `INSERT INTO scholarship_applications
       (student_id, scholarship_type, reason, materials, gpa, ranking, awards_summary, conduct_score, conduct_score_detail, template_data, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`,
      {
        replacements: [
          studentInfo.id, scholarshipType, reason, JSON.stringify(materials || []),
          gpa || null, ranking || null, awardsSummary || null,
          conductScore || 0, conductScoreDetail ? JSON.stringify(conductScoreDetail) : null,
          templateData ? JSON.stringify(templateData) : null,
        ],
        type: sequelize.QueryTypes.INSERT
      }
    );

    return success(res, null, '奖学金申请已提交');
  } catch (err) {
    console.error('提交奖学金申请错误:', err);
    return error(res, '提交奖学金申请失败', 500);
  }
};

// 获取我的奖学金申请
const getMyScholarshipApplications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, pageSize = 10 } = req.query;

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

    // 获取总数
    const countResult = await sequelize.query(
      `SELECT COUNT(*) as total FROM scholarship_applications WHERE ${whereClause}`,
      {
        replacements: params,
        type: sequelize.QueryTypes.SELECT
      }
    );
    const total = countResult[0].total;

    // 获取列表
    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    const list = await sequelize.query(
      `SELECT * FROM scholarship_applications WHERE ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      {
        replacements: [...params, parseInt(pageSize), offset],
        type: sequelize.QueryTypes.SELECT
      }
    );

    // 解析 materials JSON
    list.forEach(item => {
      if (item.materials) {
        try {
          item.materials = JSON.parse(item.materials);
        } catch (e) {
          item.materials = [];
        }
      }
    });

    return paginate(res, list, total, parseInt(page), parseInt(pageSize));
  } catch (err) {
    console.error('获取奖学金申请列表错误:', err);
    return error(res, '获取奖学金申请列表失败', 500);
  }
};

// 提交助学金申请
const submitGrantApplication = async (req, res) => {
  try {
    const userId = req.user.id;
    const { grantType, reason, materials } = req.body;

    const studentInfo = await getCachedStudentInfo(req);
    if (!studentInfo) {
      return error(res, '学生信息不存在', 404);
    }

    // 检查是否已有待审核的同类申请
    const existing = await sequelize.query(
      `SELECT * FROM grant_applications 
       WHERE student_id = ? AND grant_type = ? AND status = 'pending'`,
      {
        replacements: [studentInfo.id, grantType],
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (existing.length > 0) {
      return error(res, '已有待审核的该类助学金申请', 400);
    }

    // 插入申请
    await sequelize.query(
      `INSERT INTO grant_applications (student_id, grant_type, reason, materials, status, created_at)
       VALUES (?, ?, ?, ?, 'pending', NOW())`,
      {
        replacements: [studentInfo.id, grantType, reason, JSON.stringify(materials || [])],
        type: sequelize.QueryTypes.INSERT
      }
    );

    return success(res, null, '助学金申请已提交');
  } catch (err) {
    console.error('提交助学金申请错误:', err);
    return error(res, '提交助学金申请失败', 500);
  }
};

// 获取我的助学金申请
const getMyGrantApplications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, pageSize = 10 } = req.query;

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

    // 获取总数
    const countResult = await sequelize.query(
      `SELECT COUNT(*) as total FROM grant_applications WHERE ${whereClause}`,
      {
        replacements: params,
        type: sequelize.QueryTypes.SELECT
      }
    );
    const total = countResult[0].total;

    // 获取列表
    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    const list = await sequelize.query(
      `SELECT * FROM grant_applications WHERE ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      {
        replacements: [...params, parseInt(pageSize), offset],
        type: sequelize.QueryTypes.SELECT
      }
    );

    // 解析 materials JSON
    list.forEach(item => {
      if (item.materials) {
        try {
          item.materials = JSON.parse(item.materials);
        } catch (e) {
          item.materials = [];
        }
      }
    });

    return paginate(res, list, total, parseInt(page), parseInt(pageSize));
  } catch (err) {
    console.error('获取助学金申请列表错误:', err);
    return error(res, '获取助学金申请列表失败', 500);
  }
};

// 获取勤工助学岗位列表
const getWorkStudyPositions = async (req, res) => {
  try {
    const { keyword, status = 1, page = 1, pageSize = 10 } = req.query;

    let whereClause = 'status = ?';
    const params = [parseInt(status)];

    if (keyword) {
      whereClause += ' AND (title LIKE ? OR description LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    // 获取总数
    const countResult = await sequelize.query(
      `SELECT COUNT(*) as total FROM work_study_positions WHERE ${whereClause}`,
      {
        replacements: params,
        type: sequelize.QueryTypes.SELECT
      }
    );
    const total = countResult[0].total;

    // 获取列表
    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    const list = await sequelize.query(
      `SELECT * FROM work_study_positions WHERE ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      {
        replacements: [...params, parseInt(pageSize), offset],
        type: sequelize.QueryTypes.SELECT
      }
    );

    return paginate(res, list, total, parseInt(page), parseInt(pageSize));
  } catch (err) {
    console.error('获取勤工助学岗位列表错误:', err);
    return error(res, '获取勤工助学岗位列表失败', 500);
  }
};

// 获取岗位详情
const getWorkStudyPositionDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const position = await sequelize.query(
      'SELECT * FROM work_study_positions WHERE id = ?',
      {
        replacements: [id],
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (position.length === 0) {
      return error(res, '岗位不存在', 404);
    }

    return success(res, position[0]);
  } catch (err) {
    console.error('获取岗位详情错误:', err);
    return error(res, '获取岗位详情失败', 500);
  }
};

// 申请勤工助学岗位
const applyWorkStudyPosition = async (req, res) => {
  try {
    const userId = req.user.id;
    const { positionId, reason } = req.body;

    const studentInfo = await getCachedStudentInfo(req);
    if (!studentInfo) {
      return error(res, '学生信息不存在', 404);
    }

    // 检查岗位是否存在且开放
    const position = await sequelize.query(
      'SELECT * FROM work_study_positions WHERE id = ? AND status = 1',
      {
        replacements: [positionId],
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (position.length === 0) {
      return error(res, '岗位不存在或已关闭', 404);
    }

    // 检查是否已申请
    const existing = await sequelize.query(
      'SELECT * FROM work_study_applications WHERE position_id = ? AND student_id = ?',
      {
        replacements: [positionId, studentInfo.id],
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (existing.length > 0) {
      return error(res, '已申请该岗位', 400);
    }

    // 检查岗位是否已满
    const applicationCount = await sequelize.query(
      `SELECT COUNT(*) as count FROM work_study_applications 
       WHERE position_id = ? AND status = 'approved'`,
      {
        replacements: [positionId],
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (applicationCount[0].count >= position[0].quota) {
      return error(res, '该岗位名额已满', 400);
    }

    // 插入申请
    await sequelize.query(
      `INSERT INTO work_study_applications (position_id, student_id, reason, status, created_at)
       VALUES (?, ?, ?, 'pending', NOW())`,
      {
        replacements: [positionId, studentInfo.id, reason],
        type: sequelize.QueryTypes.INSERT
      }
    );

    return success(res, null, '岗位申请已提交');
  } catch (err) {
    console.error('申请勤工助学岗位错误:', err);
    return error(res, '申请勤工助学岗位失败', 500);
  }
};

// 获取我的岗位申请
const getMyWorkStudyApplications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, pageSize = 10 } = req.query;

    const studentInfo = await getCachedStudentInfo(req);
    if (!studentInfo) {
      return error(res, '学生信息不存在', 404);
    }

    let whereClause = 'a.student_id = ?';
    const params = [studentInfo.id];

    if (status) {
      whereClause += ' AND a.status = ?';
      params.push(status);
    }

    // 获取总数
    const countResult = await sequelize.query(
      `SELECT COUNT(*) as total FROM work_study_applications a WHERE ${whereClause}`,
      {
        replacements: params,
        type: sequelize.QueryTypes.SELECT
      }
    );
    const total = countResult[0].total;

    // 获取列表
    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    const list = await sequelize.query(
      `SELECT a.*, p.title as position_title, p.work_time, p.salary
       FROM work_study_applications a
       LEFT JOIN work_study_positions p ON a.position_id = p.id
       WHERE ${whereClause}
       ORDER BY a.created_at DESC
       LIMIT ? OFFSET ?`,
      {
        replacements: [...params, parseInt(pageSize), offset],
        type: sequelize.QueryTypes.SELECT
      }
    );

    return paginate(res, list, total, parseInt(page), parseInt(pageSize));
  } catch (err) {
    console.error('获取岗位申请列表错误:', err);
    return error(res, '获取岗位申请列表失败', 500);
  }
};

// 导出奖学金申请为Word文档
const exportToDocx = async (req, res) => {
  try {
    const applicationId = req.params.id;
    const userId = req.user.id;

    // Get application with student info
    const [apps] = await sequelize.query(
      `SELECT sa.*, si.college, si.major, si.grade, si.class_name, si.class_teacher,
              u.name as student_name, u.username as student_id
       FROM scholarship_applications sa
       JOIN student_info si ON sa.student_id = si.id
       JOIN users u ON si.user_id = u.id
       WHERE sa.id = ?`,
      { replacements: [applicationId], type: sequelize.QueryTypes.SELECT }
    );

    if (!apps) return error(res, '申请不存在', 404);

    const app = apps;
    const conductItems = app.conduct_score_detail ? JSON.parse(app.conduct_score_detail) : [];
    const awardsList = app.awards_summary ? JSON.parse(app.awards_summary) : [];
    const materials = app.materials ? JSON.parse(app.materials) : [];

    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({ text: '奖学金申请表', heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER, spacing: { after: 400 } }),

          // Basic info table
          new Paragraph({ text: '一、基本信息', heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 120 } }),
          createTable([
            ['姓名', app.student_name || '', '学号', app.student_id || ''],
            ['学院', app.college || '', '专业', app.major || ''],
            ['年级', app.grade || '', '班级', app.class_name || ''],
          ]),

          // Academic info
          new Paragraph({ text: '二、学业成绩', heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 120 } }),
          createTable([
            ['奖学金类型', app.scholarship_type || '', 'GPA', app.gpa || ''],
            ['专业排名', app.ranking || '', '操行分', String(app.conduct_score || 0)],
          ]),

          // Conduct score detail
          new Paragraph({ text: '三、操行分明细', heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 120 } }),
          ...(conductItems.length > 0
            ? [createTable([
                ['类别', '加分项目', '分值', '依据'],
                ...conductItems.map(c => [c.category || '', c.item || '', String(c.score || 0), c.basis || '']),
              ])]
            : [new Paragraph({ text: '（无操行分项目）', spacing: { after: 120 } })]
          ),

          // Awards
          new Paragraph({ text: '四、获奖情况', heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 120 } }),
          ...(awardsList.length > 0
            ? [createTable([
                ['获奖名称', '级别', '获奖日期'],
                ...awardsList.map(a => [a.name || '', a.level || '', a.date || '']),
              ])]
            : [new Paragraph({ text: '（无获奖记录）', spacing: { after: 120 } })]
          ),

          // Application reason
          new Paragraph({ text: '五、申请理由', heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 120 } }),
          new Paragraph({ text: app.reason || '', spacing: { after: 200 } }),

          // Materials
          new Paragraph({ text: '六、证明材料', heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 120 } }),
          ...(materials.length > 0
            ? materials.map((m, i) => new Paragraph({ text: `${i + 1}. ${typeof m === 'string' ? m : m.name || m.url || ''}`, spacing: { after: 60 } }))
            : [new Paragraph({ text: '（无证明材料）' })]
          ),

          // Signature areas
          new Paragraph({ text: '', spacing: { before: 600 } }),
          new Paragraph({ text: `班主任签字：_______________    日期：_______________`, spacing: { after: 200 } }),
          new Paragraph({ text: `辅导员签字：_______________    日期：_______________`, spacing: { after: 200 } }),
          new Paragraph({ text: `学院盖章：_______________`, spacing: { after: 200 } }),
        ],
      }],
    });

    const buffer = await Packer.toBuffer(doc);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="奖学金申请表_${app.student_name}_${app.scholarship_type}.docx"`);
    res.send(buffer);
  } catch (err) {
    console.error('导出Word错误:', err);
    return error(res, '导出失败', 500);
  }
};

function createTable(rows) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: rows.map((cells, rowIdx) => new TableRow({
      children: cells.map(cell => new TableCell({
        children: [new Paragraph({ text: cell, alignment: rowIdx === 0 ? AlignmentType.CENTER : AlignmentType.LEFT })],
        ...(rowIdx === 0 ? { shading: { fill: 'E8F0FE' } } : {}),
      })),
    })),
  });
}

module.exports = {
  submitScholarshipApplication,
  getMyScholarshipApplications,
  submitGrantApplication,
  getMyGrantApplications,
  getWorkStudyPositions,
  getWorkStudyPositionDetail,
  applyWorkStudyPosition,
  getMyWorkStudyApplications,
  exportToDocx,
};
