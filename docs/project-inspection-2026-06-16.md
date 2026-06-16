# Hermes 项目级自检报告

> 2026-06-16 | Hermes (mmx search + 手动审计)
> 范围：/home/ubuntu/smart-student-system on 124.223.0.187

## 已修复 BUG（已 commit 到 hermes/cleanup-2026-06-16）

| # | BUG | 严重度 | Commit | 状态 |
|---|---|---|---|---|
| 1 | 根目录 5 个孤儿 Vue/JS 文件 | 低 | e36f494 | 已挪 _archive/ |
| 2 | 2 个 .bak 文件 + 空 tmp/ | 低 | cd50d1f | 已挪 _archive/，tmp 删除 |
| 3 | 16 个未跟踪的新功能文件 | 中 | e285f40 | 已 add 到 git |
| 4 | 80 modified 文件未提交 | 高 | 96e6b35 | 已 WIP commit 全部入库 |
| 5 | mysql2 `collation` 配置选项无效 | 中 | a1de8fc | 已删多余行 |
| 6 | `server.listen` 无 error handler (EADDRINUSE 进程崩) | **高** | a1de8fc | 已加 error handler |
| 7 | `.env.example` 占位符不规范 + CRLF | 中 | ccc5c20 | 已规范化 placeholder + LF |

## 未修复 BUG（需要后续处理）

| # | BUG | 严重度 | 建议修复 |
|---|---|---|---|
| A | 2 处 `v-html` 接受后端 content 渲染（XSS 风险） | **高** | 引入 DOMPurify 或自写 sanitizer |
| B | JWT token 存 `localStorage`（XSS 可窃） | **高** | 改 httpOnly cookie，或加 CSP |
| C | 5 处 `.catch(() => {})` 吞异常无日志 | 中 | 至少 console.error |
| D | 1 处 `EADDRINUSE` 进程以 root 跑（PID 3188698） | **高** | 改用非 root 用户 + systemd |
| E | 5 个 vite build 警告：单 chunk > 500KB | 低 | code-split |
| F | 前端缺 lint script（无质量门禁） | 中 | 加 eslint + husky pre-commit |
| G | 后端 devDep jest 未装（`npm test` 跑不起） | 中 | `npm install` 跑全 |
| H | `package.json` `vue-router: ^5.0.7`（Vue 3 应是 4.x） | 中 | 改 `^4.4.0` |
| I | 4 处后端 console.log 残留 | 低 | 删或换 logger |
| J | `defaultPassword = bcrypt('123456')` 业务规则（学生默认密码） | 中 | 改成强密码 + 首次登录强制改 |
| K | 业务进程无 graceful shutdown | 中 | 加 SIGTERM handler |
| L | `124.223.0.187` 写死在 app.js CORS 白名单 | 低 | 用 env |

## 安全建议（强烈）

- **轮换 JWT_SECRET 和 DB_PASSWORD**（曾被 commit 到 .env.example）
- 启用 HTTPS（zhangl1n.site 域名）防止 token 明文传输
- 启用 fail2ban 防止 SSH 爆破
- 定期跑 `npm audit` 修依赖漏洞

## 推荐的下一步

1. **现在立刻**：先 push 当前 7 个 commit 到 GitHub（hermes/cleanup-2026-06-16 分支）
2. **本周内**：修复 BUG #A（v-html XSS）和 #B（token localStorage）
3. **本月内**：加 eslint / husky / 单元测试（BUG F、G）
4. **下月**：拆 vite chunk / 加 graceful shutdown

---

**审计方法**：
- 手动 SSH + grep（找代码异味）
- mysql2 启动警告捕获（找依赖 BUG）
- API 端点探测（找运行时 BUG）
- node -c 语法检查（找语法 BUG）

**未做（要花更多时间）**：
- 单元测试覆盖率（需先装 jest）
- 集成测试（需测试数据库）
- 性能压测（需装 artillery 或 k6）
- 依赖漏洞扫描（需 npm audit + Snyk）

