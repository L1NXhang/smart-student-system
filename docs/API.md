# 智慧学工系统 - API 接口文档

## 文档信息

| 项目 | 内容 |
|------|------|
| 版本 | V1.0 |
| 创建日期 | 2026-05-13 |
| 基础 URL | `http://your-server:3000/api` |
| 认证方式 | JWT Token |

---

## 目录

1. [通用说明](#1-通用说明)
2. [用户认证模块](#2-用户认证模块)
3. [学生信息管理模块](#3-学生信息管理模块)
4. [奖助服务模块](#4-奖助服务模块)
5. [学业发展模块](#5-学业发展模块)
6. [职业规划模块](#6-职业规划模块)
7. [安全管理模块](#7-安全管理模块)
8. [沟通互动模块](#8-沟通互动模块)
9. [WebSocket 实时通信](#9-websocket-实时通信)

---

## 1. 通用说明

### 1.1 请求格式

- 请求方式：RESTful API
- 数据格式：JSON
- 字符编码：UTF-8

### 1.2 响应格式

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {}
}
```

### 1.3 状态码

| 状态码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权（Token 无效或过期） |
| 403 | 禁止访问（权限不足） |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

### 1.4 认证方式

在请求头中携带 JWT Token：

```
Authorization: Bearer <token>
```

---

## 2. 用户认证模块

### 2.1 用户注册

**POST** `/auth/register`

**请求参数**
```json
{
  "username": "2023010001",
  "password": "123456",
  "name": "张三",
  "role": "student"
}
```

**响应示例**
```json
{
  "code": 200,
  "message": "注册成功，请等待审核",
  "data": {
    "id": 1,
    "username": "2023010001",
    "name": "张三",
    "role": "student",
    "status": 0
  }
}
```

### 2.2 用户登录

**POST** `/auth/login`

**请求参数**
```json
{
  "username": "2023010001",
  "password": "123456"
}
```

**响应示例**
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "username": "2023010001",
      "name": "张三",
      "role": "student"
    }
  }
}
```

### 2.3 获取当前用户信息

**GET** `/auth/me`

**响应示例**
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "id": 1,
    "username": "2023010001",
    "name": "张三",
    "role": "student"
  }
}
```

### 2.4 修改密码

**PUT** `/auth/password`

**请求参数**
```json
{
  "oldPassword": "123456",
  "newPassword": "654321"
}
```

---

## 3. 学生信息管理模块

### 3.1 获取学生详细信息

**GET** `/student/info`

**响应示例**
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "id": 1,
    "userId": 1,
    "photo": "/uploads/photos/xxx.jpg",
    "phone": "13800138000",
    "idCard": "510xxxxxxxxxxxxxxx",
    "college": "计算机学院",
    "major": "计算机科学与技术",
    "grade": "2023",
    "className": "计算机1班",
    "campus": "华凤校区",
    "dormitory": "1栋101",
    "offCampusAddress": null,
    "medicalHistory": null,
    "hobbies": "篮球、编程",
    "personality": "开朗",
    "careerGoal": "软件工程师",
    "classTeacher": "李老师",
    "classTeacherPhone": "13900139000",
    "difficultyLevel": null,
    "difficultyStatus": "none",
    "familyInfo": [
      {
        "id": 1,
        "memberType": "father",
        "name": "张大",
        "phone": "13700137000",
        "relation": "父亲"
      }
    ]
  }
}
```

### 3.2 提交信息变更申请

**POST** `/student/info-change`

**请求参数**
```json
{
  "fieldName": "phone",
  "oldValue": "13800138000",
  "newValue": "13900139000",
  "reason": "更换手机号"
}
```

### 3.3 获取信息变更申请列表

**GET** `/student/info-change`

**查询参数**
- `status`: pending/approved/rejected（可选）
- `page`: 页码，默认1
- `pageSize`: 每页数量，默认10

**响应示例**
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "list": [...],
    "total": 10,
    "page": 1,
    "pageSize": 10
  }
}
```

### 3.4 提交困难认定申请

**POST** `/student/difficulty-application`

**请求参数**
```json
{
  "level": "一般困难",
  "reason": "家庭经济困难",
  "material": "<文件>"
}
```

### 3.5 获取困难认定申请状态

**GET** `/student/difficulty-application`

---

## 4. 奖助服务模块

### 4.1 奖学金申请

**POST** `/scholarship/applications`

**请求参数**
```json
{
  "scholarshipType": "国家奖学金",
  "reason": "学习成绩优异...",
  "materials": ["/uploads/cert1.jpg", "/uploads/cert2.jpg"]
}
```

### 4.2 获取我的奖学金申请

**GET** `/scholarship/applications`

### 4.3 获取奖学金申请列表（管理员）

**GET** `/admin/scholarship/applications`

**查询参数**
- `status`: pending/approved/rejected
- `scholarshipType`: 奖学金类型
- `page`: 页码
- `pageSize`: 每页数量

### 4.4 审核奖学金申请（管理员）

**PUT** `/admin/scholarship/applications/:id`

**请求参数**
```json
{
  "status": "approved",
  "reviewComment": "审核通过"
}
```

### 4.5 获取勤工助学岗位列表

**GET** `/work-study/positions`

**查询参数**
- `status`: 0/1
- `keyword`: 关键词搜索
- `page`: 页码
- `pageSize`: 每页数量

### 4.6 获取岗位详情

**GET** `/work-study/positions/:id`

### 4.7 申请勤工助学岗位

**POST** `/work-study/applications`

**请求参数**
```json
{
  "positionId": 1,
  "reason": "希望锻炼自己..."
}
```

### 4.8 获取我的岗位申请

**GET** `/work-study/applications`

### 4.9 发布岗位（管理员）

**POST** `/admin/work-study/positions`

**请求参数**
```json
{
  "title": "图书馆助理",
  "description": "协助图书整理...",
  "requirements": "工作认真负责",
  "workTime": "周一至周五 14:00-17:00",
  "salary": "15元/小时",
  "quota": 5,
  "deadline": "2026-05-20T23:59:59"
}
```

---

## 5. 学业发展模块

### 5.1 获取成绩列表

**GET** `/academic/grades`

**查询参数**
- `semester`: 学年学期（可选）
- `page`: 页码
- `pageSize`: 每页数量

**响应示例**
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "list": [
      {
        "id": 1,
        "semester": "2025-2026-1",
        "courseName": "高等数学",
        "courseType": "required",
        "credit": 4.0,
        "score": 85.5,
        "gpa": 3.5
      }
    ],
    "statistics": {
      "totalCredits": 20,
      "averageScore": 82.5,
      "averageGpa": 3.2
    }
  }
}
```

### 5.2 获取获奖记录

**GET** `/academic/awards`

### 5.3 提交获奖记录

**POST** `/academic/awards`

**请求参数**
```json
{
  "awardName": "数学建模竞赛一等奖",
  "awardLevel": "省级",
  "awardType": "科技",
  "awardDate": "2026-04-15",
  "certificate": "<文件>"
}
```

### 5.4 获取违纪记录

**GET** `/academic/disciplinary`

### 5.5 获取第二课堂成绩单

**GET** `/academic/second-classroom`

**响应示例**
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "activities": [...],
    "summary": {
      "totalHours": 50,
      "totalPoints": 10,
      "academic": 20,
      "sports": 10,
      "volunteer": 20
    }
  }
}
```

### 5.6 提交中期鉴定

**POST** `/academic/midterm-evaluation`

**请求参数**
```json
{
  "semester": "2025-2026-1",
  "moralPerformance": "思想品德表现...",
  "academicPerformance": "学业情况...",
  "socialPractice": "社会实践...",
  "physicalMental": "身心健康...",
  "selfEvaluation": "自我评价..."
}
```

### 5.7 获取中期鉴定

**GET** `/academic/midterm-evaluation/:semester`

### 5.8 批量导入成绩（管理员）

**POST** `/admin/academic/grades/import`

**请求参数**
- `file`: Excel 文件

### 5.9 批量导入第二课堂活动（管理员）

**POST** `/admin/academic/second-classroom/import`

---

## 6. 职业规划模块

### 6.1 获取测评题目

**GET** `/career/assessments/:type/questions`

**响应示例**
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "type": "interest",
    "questions": [
      {
        "id": 1,
        "question": "你喜欢...",
        "options": ["A. xxx", "B. xxx", "C. xxx", "D. xxx"]
      }
    ]
  }
}
```

### 6.2 提交测评答案

**POST** `/career/assessments/:type/submit`

**请求参数**
```json
{
  "answers": ["A", "B", "C", "A", ...]
}
```

**响应示例**
```json
{
  "code": 200,
  "message": "测评完成",
  "data": {
    "resultType": "研究型",
    "resultDescription": "你喜欢...",
    "careerSuggestions": ["科研人员", "工程师", "程序员"]
  }
}
```

### 6.3 获取测评历史

**GET** `/career/assessments`

### 6.4 预约就业指导

**POST** `/career/appointments`

**请求参数**
```json
{
  "appointmentDate": "2026-05-20",
  "appointmentTime": "14:00-15:00",
  "reason": "咨询职业规划..."
}
```

### 6.5 获取我的预约

**GET** `/career/appointments`

### 6.6 获取就业信息列表

**GET** `/career/job-infos`

**查询参数**
- `jobType`: recruitment/lecture/policy/other
- `keyword`: 关键词
- `page`: 页码
- `pageSize`: 每页数量

### 6.7 获取就业信息详情

**GET** `/career/job-infos/:id`

### 6.8 收藏就业信息

**POST** `/career/job-infos/:id/favorite`

---

## 7. 安全管理模块

### 7.1 提交晚归登记

**POST** `/safety/late-return`

**请求参数**
```json
{
  "returnDate": "2026-05-20",
  "expectedTime": "23:30",
  "reason": "参加社团活动..."
}
```

### 7.2 获取晚归登记记录

**GET** `/safety/late-return`

### 7.3 提交外出报备

**POST** `/safety/leave`

**请求参数**
```json
{
  "leaveDate": "2026-05-20",
  "destination": "成都市",
  "reason": "回家探亲",
  "expectedReturn": "2026-05-22T18:00:00"
}
```

### 7.4 获取外出报备记录

**GET** `/safety/leave`

### 7.5 获取安全考试列表

**GET** `/safety/exams`

### 7.6 获取考试题目

**GET** `/safety/exams/:id/questions`

### 7.7 提交考试答案

**POST** `/safety/exams/:id/submit`

**请求参数**
```json
{
  "answers": {
    "1": "A",
    "2": "B",
    ...
  }
}
```

**响应示例**
```json
{
  "code": 200,
  "message": "提交成功",
  "data": {
    "score": 85,
    "isPassed": true,
    "correctCount": 17,
    "wrongCount": 3
  }
}
```

### 7.8 获取考试记录

**GET** `/safety/exams/:id/record`

### 7.9 提交异常情况上报

**POST** `/safety/incidents`

**请求参数**
```json
{
  "reportType": "safety",
  "title": "宿舍楼道灯坏了",
  "description": "3楼楼道灯不亮...",
  "location": "1栋3楼",
  "contactPhone": "13800138000",
  "images": ["/uploads/img1.jpg"]
}
```

### 7.10 获取异常上报记录

**GET** `/safety/incidents`

---

## 8. 沟通互动模块

### 8.1 获取联系人列表

**GET** `/chat/contacts`

**响应示例**
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "contacts": [
      {
        "id": 2,
        "name": "张老师",
        "role": "admin",
        "unreadCount": 3,
        "lastMessage": "好的，我知道了",
        "lastMessageTime": "2026-05-13T10:30:00",
        "isOnline": true
      }
    ]
  }
}
```

### 8.2 获取聊天历史

**GET** `/chat/messages/:contactId`

**查询参数**
- `beforeId`: 获取此ID之前的消息（分页用）
- `limit`: 数量，默认20

**响应示例**
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "messages": [
      {
        "id": 1,
        "senderId": 1,
        "receiverId": 2,
        "content": "老师您好...",
        "isRead": true,
        "createdAt": "2026-05-13T10:30:00"
      }
    ],
    "hasMore": true
  }
}
```

### 8.3 获取公告列表

**GET** `/announcements`

**查询参数**
- `type`: class/grade/all
- `page`: 页码
- `pageSize`: 每页数量

### 8.4 获取公告详情

**GET** `/announcements/:id`

### 8.5 确认已读公告

**POST** `/announcements/:id/read`

### 8.6 获取未读公告数量

**GET** `/announcements/unread-count`

### 8.7 提交意见反馈

**POST** `/feedbacks`

**请求参数**
```json
{
  "title": "系统建议",
  "content": "建议增加...",
  "feedbackType": "suggestion",
  "images": []
}
```

### 8.8 获取我的反馈

**GET** `/feedbacks`

### 8.9 获取活动列表

**GET** `/events`

**查询参数**
- `eventType`: academic/sports/volunteer/culture/other
- `status`: 0/1
- `page`: 页码
- `pageSize`: 每页数量

### 8.10 获取活动详情

**GET** `/events/:id`

### 8.11 报名活动

**POST** `/events/:id/register`

### 8.12 取消报名

**PUT** `/events/:id/cancel`

### 8.13 获取我的活动报名

**GET** `/events/my-registrations`

---

## 9. WebSocket 实时通信

### 9.1 连接方式

```javascript
import { io } from 'socket.io-client';

const socket = io('http://your-server:3000', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

### 9.2 事件列表

#### 客户端发送事件

| 事件名 | 说明 | 参数 |
|--------|------|------|
| `chat:message` | 发送消息 | `{ receiverId, content }` |
| `chat:typing` | 正在输入 | `{ receiverId }` |
| `chat:read` | 标记已读 | `{ messageIds }` |

#### 服务端发送事件

| 事件名 | 说明 | 参数 |
|--------|------|------|
| `chat:message` | 收到新消息 | `{ id, senderId, content, createdAt }` |
| `chat:typing` | 对方正在输入 | `{ senderId }` |
| `chat:read` | 消息已读 | `{ messageIds }` |
| `user:online` | 用户上线 | `{ userId }` |
| `user:offline` | 用户离线 | `{ userId }` |

### 9.3 使用示例

```javascript
// 发送消息
socket.emit('chat:message', {
  receiverId: 2,
  content: '老师您好！'
});

// 接收消息
socket.on('chat:message', (data) => {
  console.log('收到消息:', data);
});

// 正在输入
socket.emit('chat:typing', { receiverId: 2 });

// 监听对方正在输入
socket.on('chat:typing', (data) => {
  console.log('对方正在输入...');
});
```

---

## 附录

### A. 错误码对照表

| 错误码 | 说明 |
|--------|------|
| 1001 | 用户名已存在 |
| 1002 | 用户名或密码错误 |
| 1003 | 账号已被禁用 |
| 1004 | 账号待审核 |
| 2001 | 申请已存在 |
| 2002 | 申请已处理 |
| 3001 | 岗位已满 |
| 3002 | 已报名该岗位 |
| 4001 | 考试已结束 |
| 4002 | 已参加过该考试 |
| 5001 | 活动已截止 |
| 5002 | 活动名额已满 |

### B. 文件上传

**POST** `/upload`

**请求参数**
- `file`: 文件

**响应示例**
```json
{
  "code": 200,
  "message": "上传成功",
  "data": {
    "url": "/uploads/2026/05/xxx.jpg"
  }
}
```

---

**文档结束**
