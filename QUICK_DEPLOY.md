# 快速部署指南

## 🚀 立即部署到 Railway

### 1. 提交代码
```bash
git add .
git commit -m "Fix: Improve page loading and link extraction for Railway"
git push origin main
```

### 2. Railway 自动部署
- Railway 会自动检测到代码更新
- 构建时间约 3-5 分钟
- 查看 "Deployments" 标签了解进度

### 3. 测试部署
```bash
# 替换为你的 Railway 域名
curl -X POST https://your-app.up.railway.app/extract \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

## 📊 查看日志

在 Railway 项目中：
1. 点击 "Logs" 标签
2. 查看实时日志输出
3. 应该看到：
   ```
   Launching browser with options: ...
   Page loaded: ..., found XX anchor elements in DOM
   Parsing links from: ...
   Extracted XX raw links from page
   Processing XX raw links...
   Processed XX links (skipped X)
   ```

## ✅ 验证修复

### 健康检查
```bash
curl https://your-app.up.railway.app/health
```
应该返回：
```json
{"status":"ok","service":"web-link-extractor"}
```

### 提取测试
```bash
curl -X POST https://your-app.up.railway.app/extract \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```
应该返回包含链接的数据：
```json
{
  "success": true,
  "data": [...],
  "totalLinks": 20
}
```

## 🔧 如果还是失败

### 检查 Railway 日志
1. 查找 "Launching browser" - 确认浏览器启动
2. 查找 "Page loaded" - 确认页面加载成功
3. 查找 "found XX anchor elements" - 确认找到了链接

### 常见问题

**问题 1：浏览器启动失败**
- 检查 Dockerfile 中的 Chromium 安装
- 确认环境变量 `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` 设置正确

**问题 2：页面加载超时**
- 检查目标 URL 是否可访问
- 考虑增加 timeout 时间（在 `src/coze-api.ts` 中）

**问题 3：找到 0 个 anchor 元素**
- 页面可能需要更长的等待时间
- 在 `src/core/PageLoader.ts` 的 `waitForContent` 中增加等待时间

## 🎯 在 Coze 中配置

### 使用 OpenAPI（推荐）
1. 在 Coze 创建插件
2. 选择 "OpenAPI"
3. 输入：`https://your-app.up.railway.app/openapi.json`

### 手动配置
- **接口地址**：`https://your-app.up.railway.app/extract`
- **请求方法**：POST
- **Content-Type**：application/json
- **请求体**：
  ```json
  {
    "url": "string"
  }
  ```

## 📝 关键修改

本次修复包含：
1. ✅ 优化页面加载策略（从 networkidle 改为 domcontentloaded）
2. ✅ 改进内容等待逻辑（分阶段等待，容错处理）
3. ✅ 增加详细日志（便于调试）
4. ✅ 增加超时时间（30秒 → 45秒）
5. ✅ 优化浏览器参数（更好的兼容性）
6. ✅ 过滤无效 URL（javascript:, data:）

详细说明见 [FIX_SUMMARY.md](./FIX_SUMMARY.md)

## 💡 提示

- 首次部署后，Chromium 需要初始化，可能需要 10-20 秒
- 建议先用简单网站测试（如 example.com）
- 复杂的单页应用可能需要更长的等待时间
- 查看 Railway 日志可以了解详细的执行过程
