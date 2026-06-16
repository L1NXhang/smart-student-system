# 部署到 systemd（以非 root 用户运行）

## 1. 现有问题

当前生产后端以 root 用户运行（PID 3188698），这是**安全大忌**：
- root 进程被入侵 = 整个服务器失守
- 无法审计是谁启动的服务
- systemd unit 限制 / cgroup 隔离对 root 无效

## 2. 推荐：以 ubuntu 用户 + systemd 运行

### 步骤

```bash
# 1. 停掉 root 跑的老进程（注意：会中断服务！建议维护窗口做）
sudo kill 3188698

# 2. 复制 unit 文件
sudo cp deploy/systemd/smart-student.service /etc/systemd/system/

# 3. 重新加载 systemd
sudo systemctl daemon-reload

# 4. 启用并启动
sudo systemctl enable smart-student
sudo systemctl start smart-student

# 5. 查看状态
sudo systemctl status smart-student
sudo journalctl -u smart-student -f
```

### 3. 上传目录权限

```bash
sudo chown -R ubuntu:ubuntu /home/ubuntu/smart-student-system/backend/uploads
sudo chmod 750 /home/ubuntu/smart-student-system/backend/uploads
```

### 4. 验证非 root 启动

```bash
ps aux | grep app.js
# 应该看到 ubuntu 用户而不是 root
```

## 3. 回滚方案

如果 systemd 服务有问题，可以临时回到手动启动（仍是 root 权限）：

```bash
# 停 systemd
sudo systemctl stop smart-student

# 用 root 手动跑
sudo node /home/ubuntu/smart-student-system/backend/src/app.js &
```

## 4. 进阶：加 HTTPS

当前 `124.223.0.187:80` 是 HTTP，建议加 Let's Encrypt：

```bash
sudo apt install certbot
sudo certbot certonly --standalone -d zhangl1n.site
# 然后 nginx 反代加 ssl_certificate 配置
```
