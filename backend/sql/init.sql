-- ========================================================
-- 智慧学工系统 - 数据库建表脚本
-- 数据库: smart_campus
-- 字符集: utf8mb4
-- 创建日期: 2026-05-13
-- ========================================================

-- 创建数据库
CREATE DATABASE IF NOT EXISTS smart_campus 
DEFAULT CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE smart_campus;

-- ========================================================
-- 1. 用户相关表
-- ========================================================

-- 用户表
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名（学号/工号）',
    password VARCHAR(255) NOT NULL COMMENT '密码（bcrypt加密）',
    name VARCHAR(50) NOT NULL COMMENT '姓名',
    role ENUM('student', 'admin') NOT NULL DEFAULT 'student' COMMENT '角色：student-学生, admin-管理员',
    status TINYINT NOT NULL DEFAULT 0 COMMENT '状态：0-待审核, 1-正常, 2-禁用',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_username (username),
    INDEX idx_role (role),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 学生详细信息表
CREATE TABLE student_info (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID',
    user_id INT NOT NULL COMMENT '关联用户ID',
    photo VARCHAR(255) COMMENT '照片路径',
    phone VARCHAR(20) COMMENT '联系方式',
    id_card VARCHAR(18) COMMENT '身份证号',
    college VARCHAR(100) COMMENT '学院',
    major VARCHAR(100) COMMENT '专业',
    grade VARCHAR(20) COMMENT '年级',
    class_name VARCHAR(50) COMMENT '班级',
    campus VARCHAR(50) COMMENT '校区',
    dormitory VARCHAR(50) COMMENT '宿舍号',
    off_campus_address VARCHAR(255) COMMENT '校外住宿地址',
    medical_history TEXT COMMENT '病史',
    hobbies TEXT COMMENT '爱好',
    personality TEXT COMMENT '性格特征',
    career_goal TEXT COMMENT '职业目标',
    class_teacher VARCHAR(50) COMMENT '班主任姓名',
    class_teacher_phone VARCHAR(20) COMMENT '班主任联系方式',
    difficulty_level VARCHAR(20) COMMENT '困难认定等级：一般困难/比较困难/特别困难',
    difficulty_material VARCHAR(255) COMMENT '困难认定证明材料路径',
    difficulty_status VARCHAR(20) DEFAULT 'none' COMMENT '困难认定状态：none-未申请, pending-待审核, approved-已通过, rejected-已拒绝',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_college (college),
    INDEX idx_class (class_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='学生详细信息表';

-- 家庭信息表
CREATE TABLE family_info (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID',
    student_id INT NOT NULL COMMENT '关联学生ID',
    member_type ENUM('father', 'mother', 'emergency1', 'emergency2') NOT NULL COMMENT '成员类型',
    name VARCHAR(50) NOT NULL COMMENT '姓名',
    phone VARCHAR(20) COMMENT '联系方式',
    relation VARCHAR(50) COMMENT '关系',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (student_id) REFERENCES student_info(id) ON DELETE CASCADE,
    INDEX idx_student_id (student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='家庭信息表';

-- ========================================================
-- 2. 申请相关表
-- ========================================================

-- 信息变更申请表
CREATE TABLE info_change_requests (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID',
    student_id INT NOT NULL COMMENT '学生ID',
    field_name VARCHAR(50) NOT NULL COMMENT '变更字段名',
    old_value TEXT COMMENT '原值',
    new_value TEXT NOT NULL COMMENT '新值',
    reason TEXT COMMENT '变更原因',
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending' COMMENT '状态',
    reviewer_id INT COMMENT '审核人ID',
    review_comment TEXT COMMENT '审核意见',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '申请时间',
    reviewed_at DATETIME COMMENT '审核时间',
    FOREIGN KEY (student_id) REFERENCES student_info(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_student_id (student_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='信息变更申请表';

-- 困难认定申请表
CREATE TABLE difficulty_applications (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID',
    student_id INT NOT NULL COMMENT '学生ID',
    level VARCHAR(20) NOT NULL COMMENT '申请等级：一般困难/比较困难/特别困难',
    reason TEXT COMMENT '申请理由',
    material_path VARCHAR(255) COMMENT '证明材料路径',
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending' COMMENT '状态',
    reviewer_id INT COMMENT '审核人ID',
    review_comment TEXT COMMENT '审核意见',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '申请时间',
    reviewed_at DATETIME COMMENT '审核时间',
    FOREIGN KEY (student_id) REFERENCES student_info(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_student_id (student_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='困难认定申请表';

-- 奖学金申请表
CREATE TABLE scholarship_applications (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID',
    student_id INT NOT NULL COMMENT '学生ID',
    scholarship_type VARCHAR(50) NOT NULL COMMENT '奖学金类型：国家奖学金/国家励志奖学金/校级一等奖学金/校级二等奖学金/校级三等奖学金',
    reason TEXT COMMENT '申请理由',
    materials TEXT COMMENT '证明材料JSON数组',
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending' COMMENT '状态',
    reviewer_id INT COMMENT '审核人ID',
    review_comment TEXT COMMENT '审核意见',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '申请时间',
    reviewed_at DATETIME COMMENT '审核时间',
    FOREIGN KEY (student_id) REFERENCES student_info(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_student_id (student_id),
    INDEX idx_status (status),
    INDEX idx_scholarship_type (scholarship_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='奖学金申请表';

-- 助学金申请表
CREATE TABLE grant_applications (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID',
    student_id INT NOT NULL COMMENT '学生ID',
    grant_type VARCHAR(50) NOT NULL COMMENT '助学金类型',
    reason TEXT COMMENT '申请理由',
    materials TEXT COMMENT '证明材料JSON数组',
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending' COMMENT '状态',
    reviewer_id INT COMMENT '审核人ID',
    review_comment TEXT COMMENT '审核意见',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '申请时间',
    reviewed_at DATETIME COMMENT '审核时间',
    FOREIGN KEY (student_id) REFERENCES student_info(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_student_id (student_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='助学金申请表';

-- 勤工助学岗位表
CREATE TABLE work_study_positions (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID',
    title VARCHAR(100) NOT NULL COMMENT '岗位名称',
    description TEXT COMMENT '岗位描述',
    requirements TEXT COMMENT '岗位要求',
    work_time VARCHAR(100) COMMENT '工作时间',
    salary VARCHAR(100) COMMENT '薪酬待遇',
    quota INT NOT NULL DEFAULT 1 COMMENT '招聘人数',
    deadline DATETIME COMMENT '报名截止时间',
    status TINYINT DEFAULT 1 COMMENT '状态：0-关闭, 1-开放',
    publisher_id INT COMMENT '发布人ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '发布时间',
    FOREIGN KEY (publisher_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_deadline (deadline)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='勤工助学岗位表';

-- 勤工助学岗位申请表
CREATE TABLE work_study_applications (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID',
    position_id INT NOT NULL COMMENT '岗位ID',
    student_id INT NOT NULL COMMENT '学生ID',
    reason TEXT COMMENT '申请理由',
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending' COMMENT '状态',
    reviewer_id INT COMMENT '审核人ID',
    review_comment TEXT COMMENT '审核意见',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '申请时间',
    reviewed_at DATETIME COMMENT '审核时间',
    FOREIGN KEY (position_id) REFERENCES work_study_positions(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES student_info(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY unique_position_student (position_id, student_id),
    INDEX idx_position_id (position_id),
    INDEX idx_student_id (student_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='勤工助学岗位申请表';

-- ========================================================
-- 3. 学业相关表
-- ========================================================

-- 成绩表
CREATE TABLE grades (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID',
    student_id INT NOT NULL COMMENT '学生ID',
    semester VARCHAR(20) NOT NULL COMMENT '学年学期，如：2025-2026-1',
    course_name VARCHAR(100) NOT NULL COMMENT '课程名称',
    course_type ENUM('required', 'elective') DEFAULT 'required' COMMENT '课程类型：required-必修, elective-选修',
    credit DECIMAL(3,1) NOT NULL COMMENT '学分',
    score DECIMAL(5,2) NOT NULL COMMENT '成绩',
    gpa DECIMAL(3,2) COMMENT '绩点',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '录入时间',
    FOREIGN KEY (student_id) REFERENCES student_info(id) ON DELETE CASCADE,
    INDEX idx_student_id (student_id),
    INDEX idx_semester (semester),
    UNIQUE KEY unique_student_course_semester (student_id, course_name, semester)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='成绩表';

-- 获奖记录表
CREATE TABLE awards (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID',
    student_id INT NOT NULL COMMENT '学生ID',
    award_name VARCHAR(100) NOT NULL COMMENT '奖项名称',
    award_level VARCHAR(50) COMMENT '奖项级别：国家级/省级/校级/院级',
    award_type VARCHAR(50) COMMENT '奖项类型：学习/文体/科技/其他',
    award_date DATE COMMENT '获奖日期',
    certificate_path VARCHAR(255) COMMENT '证书图片路径',
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'approved' COMMENT '状态',
    reviewer_id INT COMMENT '审核人ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '录入时间',
    FOREIGN KEY (student_id) REFERENCES student_info(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_student_id (student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='获奖记录表';

-- 违纪记录表
CREATE TABLE disciplinary_records (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID',
    student_id INT NOT NULL COMMENT '学生ID',
    violation_type VARCHAR(50) NOT NULL COMMENT '违纪类型',
    description TEXT COMMENT '违纪描述',
    punishment VARCHAR(100) COMMENT '处分结果',
    record_date DATE COMMENT '记录日期',
    status ENUM('active', 'revoked') DEFAULT 'active' COMMENT '状态',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (student_id) REFERENCES student_info(id) ON DELETE CASCADE,
    INDEX idx_student_id (student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='违纪记录表';

-- 第二课堂活动表
CREATE TABLE second_classroom_activities (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID',
    student_id INT NOT NULL COMMENT '学生ID',
    activity_name VARCHAR(100) NOT NULL COMMENT '活动名称',
    activity_type VARCHAR(50) COMMENT '活动类型：学术/文体/志愿/社会实践/其他',
    hours DECIMAL(5,1) COMMENT '活动时长（小时）',
    points DECIMAL(5,1) COMMENT '学分',
    semester VARCHAR(20) COMMENT '学年学期',
    certificate_path VARCHAR(255) COMMENT '证明材料路径',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '录入时间',
    FOREIGN KEY (student_id) REFERENCES student_info(id) ON DELETE CASCADE,
    INDEX idx_student_id (student_id),
    INDEX idx_semester (semester)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='第二课堂活动表';

-- 中期鉴定表
CREATE TABLE midterm_evaluations (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID',
    student_id INT NOT NULL COMMENT '学生ID',
    semester VARCHAR(20) NOT NULL COMMENT '学年学期',
    moral_performance TEXT COMMENT '思想品德表现',
    academic_performance TEXT COMMENT '学业情况',
    social_practice TEXT COMMENT '社会实践',
    physical_mental TEXT COMMENT '身心健康',
    self_evaluation TEXT COMMENT '自我评价',
    teacher_comment TEXT COMMENT '班主任评语',
    status ENUM('draft', 'submitted', 'approved', 'rejected') DEFAULT 'draft' COMMENT '状态',
    reviewer_id INT COMMENT '审核人ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    submitted_at DATETIME COMMENT '提交时间',
    reviewed_at DATETIME COMMENT '审核时间',
    FOREIGN KEY (student_id) REFERENCES student_info(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY unique_student_semester (student_id, semester),
    INDEX idx_student_id (student_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='中期鉴定表';

-- ========================================================
-- 4. 职业规划相关表
-- ========================================================

-- 生涯测评记录表
CREATE TABLE career_assessments (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID',
    student_id INT NOT NULL COMMENT '学生ID',
    assessment_type ENUM('interest', 'personality') NOT NULL COMMENT '测评类型：interest-职业兴趣, personality-性格',
    answers TEXT COMMENT '答题记录JSON',
    result_type VARCHAR(50) COMMENT '结果类型',
    result_description TEXT COMMENT '结果描述',
    career_suggestions TEXT COMMENT '职业建议',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '测评时间',
    FOREIGN KEY (student_id) REFERENCES student_info(id) ON DELETE CASCADE,
    INDEX idx_student_id (student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='生涯测评记录表';

-- 就业指导预约表
CREATE TABLE career_appointments (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID',
    student_id INT NOT NULL COMMENT '学生ID',
    appointment_date DATE NOT NULL COMMENT '预约日期',
    appointment_time VARCHAR(20) COMMENT '预约时间段',
    reason TEXT COMMENT '预约事由',
    status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending' COMMENT '状态',
    reviewer_id INT COMMENT '确认人ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '预约时间',
    confirmed_at DATETIME COMMENT '确认时间',
    FOREIGN KEY (student_id) REFERENCES student_info(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_student_id (student_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='就业指导预约表';

-- 就业信息表
CREATE TABLE job_infos (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID',
    title VARCHAR(100) NOT NULL COMMENT '信息标题',
    content TEXT NOT NULL COMMENT '信息内容',
    job_type ENUM('recruitment', 'lecture', 'policy', 'other') DEFAULT 'other' COMMENT '信息类型',
    company_name VARCHAR(100) COMMENT '公司名称（招聘类）',
    position VARCHAR(100) COMMENT '职位（招聘类）',
    salary VARCHAR(50) COMMENT '薪资（招聘类）',
    location VARCHAR(100) COMMENT '工作地点（招聘类）',
    contact_info VARCHAR(100) COMMENT '联系方式',
    deadline DATE COMMENT '截止日期',
    publisher_id INT COMMENT '发布人ID',
    status TINYINT DEFAULT 1 COMMENT '状态：0-下架, 1-发布',
    view_count INT DEFAULT 0 COMMENT '浏览次数',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '发布时间',
    FOREIGN KEY (publisher_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_job_type (job_type),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='就业信息表';

-- 就业信息阅读记录表
CREATE TABLE job_info_reads (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID',
    job_info_id INT NOT NULL COMMENT '就业信息ID',
    student_id INT NOT NULL COMMENT '学生ID',
    is_favorite TINYINT DEFAULT 0 COMMENT '是否收藏：0-否, 1-是',
    read_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '阅读时间',
    FOREIGN KEY (job_info_id) REFERENCES job_infos(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES student_info(id) ON DELETE CASCADE,
    UNIQUE KEY unique_job_student (job_info_id, student_id),
    INDEX idx_student_id (student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='就业信息阅读记录表';

-- ========================================================
-- 5. 安全管理相关表
-- ========================================================

-- 晚归登记表
CREATE TABLE late_return_records (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID',
    student_id INT NOT NULL COMMENT '学生ID',
    return_date DATE NOT NULL COMMENT '晚归日期',
    expected_time TIME COMMENT '预计返回时间',
    reason TEXT NOT NULL COMMENT '晚归原因',
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending' COMMENT '状态',
    reviewer_id INT COMMENT '审核人ID',
    review_comment TEXT COMMENT '审核意见',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '申请时间',
    reviewed_at DATETIME COMMENT '审核时间',
    FOREIGN KEY (student_id) REFERENCES student_info(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_student_id (student_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='晚归登记表';

-- 外出报备表
CREATE TABLE leave_records (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID',
    student_id INT NOT NULL COMMENT '学生ID',
    leave_date DATE NOT NULL COMMENT '外出日期',
    destination VARCHAR(255) NOT NULL COMMENT '目的地',
    reason TEXT COMMENT '外出事由',
    expected_return DATETIME COMMENT '预计返回时间',
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending' COMMENT '状态',
    reviewer_id INT COMMENT '审核人ID',
    review_comment TEXT COMMENT '审核意见',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '申请时间',
    reviewed_at DATETIME COMMENT '审核时间',
    FOREIGN KEY (student_id) REFERENCES student_info(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_student_id (student_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='外出报备表';

-- 安全考试表
CREATE TABLE safety_exams (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID',
    title VARCHAR(100) NOT NULL COMMENT '考试名称',
    description TEXT COMMENT '考试说明',
    duration INT NOT NULL DEFAULT 30 COMMENT '考试时长（分钟）',
    pass_score INT NOT NULL DEFAULT 60 COMMENT '及格分数',
    total_score INT NOT NULL DEFAULT 100 COMMENT '总分',
    status TINYINT DEFAULT 1 COMMENT '状态：0-关闭, 1-开放',
    publisher_id INT COMMENT '发布人ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (publisher_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='安全考试表';

-- 安全考试题目表
CREATE TABLE safety_questions (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID',
    exam_id INT NOT NULL COMMENT '考试ID',
    question TEXT NOT NULL COMMENT '题目内容',
    question_type ENUM('single', 'multiple') DEFAULT 'single' COMMENT '题目类型：single-单选, multiple-多选',
    options TEXT NOT NULL COMMENT '选项JSON数组',
    answer VARCHAR(50) NOT NULL COMMENT '正确答案',
    score INT NOT NULL DEFAULT 5 COMMENT '分值',
    sort_order INT DEFAULT 0 COMMENT '排序',
    FOREIGN KEY (exam_id) REFERENCES safety_exams(id) ON DELETE CASCADE,
    INDEX idx_exam_id (exam_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='安全考试题目表';

-- 安全考试记录表
CREATE TABLE safety_exam_records (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID',
    exam_id INT NOT NULL COMMENT '考试ID',
    student_id INT NOT NULL COMMENT '学生ID',
    answers TEXT COMMENT '答题记录JSON',
    score INT COMMENT '得分',
    is_passed TINYINT COMMENT '是否通过：0-否, 1-是',
    duration INT COMMENT '考试用时（秒）',
    ip_address VARCHAR(50) COMMENT 'IP地址',
    submitted_at DATETIME COMMENT '提交时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '开始时间',
    FOREIGN KEY (exam_id) REFERENCES safety_exams(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES student_info(id) ON DELETE CASCADE,
    UNIQUE KEY unique_exam_student (exam_id, student_id),
    INDEX idx_student_id (student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='安全考试记录表';

-- 异常情况上报表
CREATE TABLE incident_reports (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID',
    student_id INT NOT NULL COMMENT '学生ID',
    report_type ENUM('safety', 'personal') NOT NULL COMMENT '上报类型：safety-校园安全隐患, personal-个人突发状况',
    title VARCHAR(100) NOT NULL COMMENT '标题',
    description TEXT NOT NULL COMMENT '详细描述',
    location VARCHAR(255) COMMENT '发生地点',
    contact_phone VARCHAR(20) COMMENT '联系电话',
    images TEXT COMMENT '图片路径JSON数组',
    status ENUM('pending', 'processing', 'resolved') DEFAULT 'pending' COMMENT '状态',
    handler_id INT COMMENT '处理人ID',
    handle_result TEXT COMMENT '处理结果',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '上报时间',
    handled_at DATETIME COMMENT '处理时间',
    FOREIGN KEY (student_id) REFERENCES student_info(id) ON DELETE CASCADE,
    FOREIGN KEY (handler_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_student_id (student_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='异常情况上报表';

-- ========================================================
-- 6. 沟通互动相关表
-- ========================================================

-- 聊天消息表
CREATE TABLE chat_messages (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID',
    sender_id INT NOT NULL COMMENT '发送者用户ID',
    receiver_id INT NOT NULL COMMENT '接收者用户ID',
    content TEXT NOT NULL COMMENT '消息内容',
    is_read TINYINT DEFAULT 0 COMMENT '是否已读：0-未读, 1-已读',
    read_at DATETIME COMMENT '已读时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '发送时间',
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_sender_id (sender_id),
    INDEX idx_receiver_id (receiver_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='聊天消息表';

-- 公告表
CREATE TABLE announcements (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID',
    title VARCHAR(100) NOT NULL COMMENT '标题',
    content TEXT NOT NULL COMMENT '内容',
    type ENUM('class', 'grade', 'all') NOT NULL COMMENT '类型：class-班级, grade-年级, all-全校',
    target VARCHAR(100) COMMENT '发布范围（班级名/年级名）',
    publisher_id INT COMMENT '发布人ID',
    status TINYINT DEFAULT 1 COMMENT '状态：0-下架, 1-发布',
    view_count INT DEFAULT 0 COMMENT '浏览次数',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '发布时间',
    FOREIGN KEY (publisher_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_type (type),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='公告表';

-- 公告已读表
CREATE TABLE announcement_reads (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID',
    announcement_id INT NOT NULL COMMENT '公告ID',
    user_id INT NOT NULL COMMENT '用户ID',
    read_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '已读时间',
    FOREIGN KEY (announcement_id) REFERENCES announcements(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_announcement_user (announcement_id, user_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='公告已读表';

-- 意见反馈表
CREATE TABLE feedbacks (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID',
    student_id INT NOT NULL COMMENT '学生ID',
    title VARCHAR(100) NOT NULL COMMENT '标题',
    content TEXT NOT NULL COMMENT '内容',
    feedback_type ENUM('suggestion', 'complaint', 'inquiry', 'other') DEFAULT 'other' COMMENT '反馈类型',
    images TEXT COMMENT '图片路径JSON数组',
    reply TEXT COMMENT '回复内容',
    replier_id INT COMMENT '回复人ID',
    status ENUM('pending', 'replied') DEFAULT 'pending' COMMENT '状态',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '提交时间',
    replied_at DATETIME COMMENT '回复时间',
    FOREIGN KEY (student_id) REFERENCES student_info(id) ON DELETE CASCADE,
    FOREIGN KEY (replier_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_student_id (student_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='意见反馈表';

-- 活动表
CREATE TABLE events (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID',
    title VARCHAR(100) NOT NULL COMMENT '活动名称',
    event_type ENUM('academic', 'sports', 'volunteer', 'culture', 'other') DEFAULT 'other' COMMENT '活动类型',
    event_date DATETIME COMMENT '活动时间',
    location VARCHAR(255) COMMENT '地点',
    description TEXT COMMENT '简介',
    quota INT COMMENT '人数上限',
    deadline DATETIME COMMENT '报名截止时间',
    publisher_id INT COMMENT '发布人ID',
    status TINYINT DEFAULT 1 COMMENT '状态：0-取消, 1-正常',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '发布时间',
    FOREIGN KEY (publisher_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_event_type (event_type),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='活动表';

-- 活动报名表
CREATE TABLE event_registrations (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID',
    event_id INT NOT NULL COMMENT '活动ID',
    student_id INT NOT NULL COMMENT '学生ID',
    status ENUM('registered', 'cancelled', 'attended') DEFAULT 'registered' COMMENT '状态',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '报名时间',
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES student_info(id) ON DELETE CASCADE,
    UNIQUE KEY unique_event_student (event_id, student_id),
    INDEX idx_event_id (event_id),
    INDEX idx_student_id (student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='活动报名表';

-- ========================================================
-- 7. 插入默认管理员账号
-- ========================================================

-- 默认管理员账号：admin / 123456（密码需要 bcrypt 加密后存储）
-- 注意：实际使用时请替换为 bcrypt 加密后的密码
-- bcrypt hash for '123456': $2b$10$YourHashHere...

INSERT INTO users (username, password, name, role, status) VALUES 
('admin', '$2b$10$abcdefghijklmnopqrstu', '系统管理员', 'admin', 1);

-- ========================================================
-- 使用说明
-- ========================================================
-- 1. 在 MySQL 中执行：source /path/to/智慧学工系统-数据库脚本.sql
-- 2. 或者使用 MySQL Workbench / Navicat 导入执行
-- 3. 默认管理员账号：admin / 123456（请在生产环境修改密码）
-- 4. 所有表使用 InnoDB 引擎，支持事务
-- 5. 字符集统一使用 utf8mb4，支持 emoji 等特殊字符
-- ========================================================
