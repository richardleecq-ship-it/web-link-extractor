# Railway 部署指南

## 快速部署步骤

### 1. 准备代码
确保你的代码已推送到 GitHub 仓库。

### 2. 在 Railway 部署

1. 访问 https://railway.app/ 并登录
2. 点击 "New Project"
3. 选择 "Deploy from GitHub repo"
4. 选择你的仓库
5. Railway 会自动检测 Dockerfile 并开始构建

### 3. 配置环境变量（可选）

在 Railway 项目的 "Variables" 标签中添加：
```
PORT=3000
NODE_ENV=production
```

### 4. 生成公网域名

1. 进入项目 "Settings" 标签
2. 找到 "Domains" 部分
3. 点击 "Generate Domain"
4. 获得类似 `https://your-app.up.railway.app` 的地址

### 5. 验证部署

访问以下端点确认服务正常：

**健康检查：**
```
https://your-app.up.railway.app/health
```

**API 文档：**
```
https://your-app.up.railway.app/
```

**测试提取：**
```bash
curl -X POST https://your-app.up.railway.app/extract \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

或直接在浏览器访问：
```
https://your-app.up.railway.app/extract?url=https://example.com
```

## 在 Coze 中配置

### 方式一：使用 OpenAPI 导入（推荐）

1. 登录 Coze 平台
2. 创建新插件，选择 "OpenAPI"
3. 输入 OpenAPI URL：
   ```
   https://your-app.up.railway.app/openapi.json
   ```
4. Coze 会自动导入接口配置

### 方式二：手动配置

1. 创建新插件
2. 配置接口：
   - **接口地址**：`https://your-app.up.railway.app/extract`
   - **请求方法**：POST
   - **Content-Type**：application/json
   - **请求参数**：
     ```json
     {
       "url": "string"
     }
     ```

## 故障排查

### 部署失败

1. 查看 Railway 的 "Deployments" 标签中的日志
2. 确认 Dockerfile 和 package.json 配置正确
3. 检查构建日志中的错误信息

### 服务无法访问

1. 确认域名已生成
2. 访问 `/health` 端点检查服务状态
3. 查看 Railway 的 "Logs" 标签

### 提取不出内容（返回空数组）

**症状：** API 返回 `{"success":true,"data":[],"totalLinks":0}`

**排查步骤：**

1. **查看 Railway 日志**，确认以下信息：
   ```
   Launching browser with options: ...
   Page loaded: ..., found XX anchor elements in DOM
   ```
   
2. **如果看到 "found 0 anchor elements"**：
   - 页面加载超时或失败
   - 增加等待时间（修改 `src/core/PageLoader.ts` 中的 `waitForTimeout`）
   - 检查目标网站是否需要特殊配置

3. **如果看到 "found XX anchor elements" 但结果为 0**：
   - 链接被过滤掉了
   - 检查 URL 规范化是否正确
   - 查看日志中的 "skipped" 数量

4. **如果没有看到日志**：
   - 浏览器启动失败
   - 检查 Chromium 安装
   - 验证环境变量设置

**快速修复：**
- 参考 [FIX_SUMMARY.md](./FIX_SUMMARY.md) 了解最新修复
- 确保使用最新代码（包含页面加载优化）

### 内存不足

Railway 免费版有内存限制，如果遇到内存问题：
1. 考虑升级 Railway 套餐
2. 优化代码，确保浏览器正确关闭
3. 减少并发请求

### 浏览器启动失败

**症状：** 日志中出现 "Failed to launch browser" 或类似错误

**解决方案：**
1. 确认 Dockerfile 正确安装了 Chromium
2. 检查环境变量：
   ```
   PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium-browser
   PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
   ```
3. 重新部署项目

## 技术架构

- **运行环境**：Node.js 18 + Alpine Linux
- **浏览器**：Chromium（系统安装）
- **框架**：Express + Playwright
- **端口**：3000（可通过 PORT 环境变量配置）

## 重要文件

- `Dockerfile` - Docker 构建配置
- `src/coze-server.ts` - Express 服务器入口
- `src/coze-api.ts` - API 处理逻辑
- `openapi.json` - OpenAPI 规范文档
- `package.json` - 依赖和脚本配置

## 本地测试

在部署前，建议先本地测试：

```bash
# 安装依赖
npm install

# 构建项目
npm run build

# 启动服务器
npm run server:prod

# 测试接口
curl -X POST http://localhost:3000/extract \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

## 更新部署

代码更新后，Railway 会自动检测 GitHub 仓库的变化并重新部署。

手动触发重新部署：
1. 进入 Railway 项目
2. 点击 "Deployments" 标签
3. 点击 "Redeploy"

## 支持

如有问题，请查看：
- Railway 部署日志
- 项目 README.md
- GitHub Issues
