# 智慧学工系统改进需求文档

> 文档版本：v1.0  
> 日期：2026-05-25  
> 基于测试反馈生成

---

## 问题 1：注册信息不完整

### 现状
注册页面 (`/register`) 仅收集以下字段：
- 姓名 (name)
- 学号 (username)
- 联系方式 (phone)
- 密码 (password)
- 确认密码 (confirmPassword)

缺少学院、年级、专业等学籍核心字段，导致学生注册后需要额外到个人信息页补充，增加使用摩擦，且容易出现学生不填写导致信息不完整的情况。

### 改进方案
在注册表单中新增三个学籍字段：

| 字段 | 类型 | 是否必填 |
|------|------|----------|
| 学院 (college) | 下拉选择 | 是 |
| 专业 (major) | 文本输入 | 是 |
| 年级 (grade) | 下拉选择 | 是 |

**涉及文件**：
- `frontend/src/views/auth/Register.vue` — 表单 UI + 验证规则
- `backend/src/controllers/authController.js` — 注册接口处理
- `backend/src/routes/auth.js` — 参数校验

### 验收标准
- [x] 注册页展示学院/专业/年级字段
- [x] 三个字段均为必填，提交时校验
- [x] 注册成功后 StudentInfo 表包含对应信息
- [x] 登录后个人信息页正确回显这些字段

---

## 问题 2：聊天室消息气泡布局

### 现状
聊天消息通过 `isSelf(msg.senderId)` 判断是否为自己发送的消息，以此区分气泡颜色和对齐方向。

**根因分析**：后端 REST API (`GET /api/chat/messages/:contactId`) 返回的 Sequelize 模型序列化后使用数据库字段名 `sender_id`（snake_case），而前端代码只检查 `msg.senderId`（camelCase）。Socket.io 实时消息使用 camelCase (`senderId`)，但历史消息加载使用 snake_case (`sender_id`)。

当加载历史消息时，`msg.senderId` 为 `undefined`，`isSelf(undefined)` 始终返回 `false`，导致所有历史消息都被渲染为"对方消息"——无法区分发送者。

### 改进方案
在前端 `Chat.vue` 中增加字段名兼容处理，同时支持 `senderId`（camelCase）和 `sender_id`（snake_case）。

**涉及文件**：
- `frontend/src/views/student/Chat.vue` — 字段名兼容

### 验收标准
- [x] 历史消息（REST API）能正确区分自己/他人
- [x] 实时消息（Socket.io）能正确区分自己/他人
- [x] 自己的消息右对齐、蓝色背景、白色文字
- [x] 他人的消息左对齐、灰色背景、深色文字

---

## 问题 3：个人信息编辑权限

### 现状
个人信息编辑页面区分两类字段：
- **需审核字段**（reviewFields）：phone, email, idCard, college, major, className, classTeacher, classTeacherPhone
- **可直接更新字段**：grade, campus, dormitory, offCampusAddress, medicalHistory, hobbies, personality, careerGoal

**根因问题**：后端 `updateStudentInfo` 只接受 `phone, email, hobbies, personality, careerGoal` 五个字段的直接更新，而前端提交的 `grade, campus, dormitory, offCampusAddress, medicalHistory` 会被后端**静默忽略**，导致用户修改后无提示却未生效。

### 改进方案

1. **对齐前端与后端字段**：在后端 `updateStudentInfo` 中增加对 `grade, campus, dormitory, offCampusAddress, medicalHistory` 的支持
2. **将年级纳入审核字段**：`grade` 从直接更新改为需审核（与学院、专业同级）

**涉及文件**：
- `backend/src/controllers/studentController.js` — 扩展 updateStudentInfo 接受字段
- `frontend/src/views/student/Profile.vue` — 将 grade 加入 reviewFields 并添加审核标签

### 验收标准
- [x] 修改年级/校区/宿舍/病史等信息后，前端提示"已更新"且后端确实生效
- [x] 年级字段需要管理员审核
- [x] 所有前端直接更新的字段在后端均有对应处理

---

## 问题 4：滑块验证码体验

### 现状
登录页滑块验证码的 `sliderWidth` 在 JS 中硬编码为 `40px`，而 CSS 中 `.captcha-slider` 的实际宽度为 `42px`。这导致 `maxLeft` 计算结果偏差 2px，虽然滑块有 5px 容差，但不匹配会造成视觉与逻辑不一致。

### 改进方案

1. **统一滑块宽度**：从 DOM 元素动态获取实际宽度，消除硬编码
2. **优化验证后反馈**：添加快捷的键盘确认支持，验证通过后按 Enter 可直接登录

**涉及文件**：
- `frontend/src/views/auth/Login.vue` — 滑块宽度计算 + 交互优化

### 验收标准
- [x] 滑块宽度从 DOM 实际读取，与 CSS 保持一致
- [x] 验证通过后登录按钮正确变为可用状态
- [x] 验证通过后可直接按 Enter 提交登录

---

## 部署检查清单

- [ ] 前端构建通过 `npm run build`
- [ ] 后端服务重启
- [ ] 数据库无需迁移（仅代码层变更）
- [ ] 回归测试：注册 → 登录 → 聊天 → 个人信息编辑
