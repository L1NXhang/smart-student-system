-- 学生信息加邮箱字段
ALTER TABLE student_info ADD COLUMN email VARCHAR(100) COMMENT '邮箱' AFTER phone;
