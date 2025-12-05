# 部署检查清单

## ✅ 代码修复完成

- [x] 优化页面加载策略（PageLoader.ts）
- [x] 改进内容等待逻辑（waitForContent）
- [x] 添加详细日志（所有核心模块）
- [x] 增加超时时间（30s → 45s）
- [x] 优化浏览器参数
- [x] 过滤无效 URL
- [x] 确保浏览器正确关闭（finally 块）

## ✅ 文件清理完成

- [x] 删除测试文件（test-*.js, test-*.json 等）
- [x] 删除冗余文档（Railway 故障排查文档）
- [x] 删除临时文件（src.7z, 启动脚本）
- [x] 更新 .gitignore
- [x] 更新 .dockerignore

## ✅ 文档完善

- [x] DEPLOYMENT.md - Railway 部署指南
- [x] FIX_SUMMARY.md - 问题修复总结
- [x] QUICK_DEPLOY.md - 快速部署指南
- [x] pre-deploy-check.md - 部署前检查
- [x] README_COZE.md - Coze 插件说明
- [x] test-extraction.js - 测试脚本

## 📋 部署前检查

### 1. 本地构建测试
```bash
npm run build
```
- [ ] 构建成功，无错误
- [ ] dist/ 目录生成

### 2. 本地运行测试
```bash
npm run server:prod
```
- [ ] 服务器启动成功
- [ ] 端口 3000 监听

### 3. 功能测试
```bash
node test-extraction.js https://example.com
```
- [ ] 返回 success: true
- [ ] totalLinks > 0
- [ ] data 数组包含链接

### 4. 日志检查
- [ ] 看到 "Launching browser with options"
- [ ] 看到 "Page loaded: ..., found XX anchor elements"
- [ ] 看到 "Extracted XX raw links"
- [ ] 看到 "Processed XX links"

## 🚀 部署到 Railway

### 1. 提交代码
```bash
git add .
git commit -m "Fix: Improve page loading and link extraction"
git push origin main
```
- [ ] 代码提交成功
- [ ] 推送到 GitHub

### 2. Railway 部署
- [ ] Railway 检测到更新
- [ ] 构建开始（约 3-5 分钟）
- [ ] 构建成功
- [ ] 服务启动

### 3. 部署验证
```bash
curl https://your-app.up.railway.app/health
```
- [ ] 返回 {"status":"ok"}

```bash
curl -X POST https://your-app.up.railway.app/extract \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```
- [ ] 返回 success: true
- [ ] totalLinks > 0
- [ ] data 包含链接

### 4. Railway 日志检查
在 Railway "Logs" 标签中：
- [ ] 看到浏览器启动日志
- [ ] 看到页面加载日志
- [ ] 看到链接提取日志
- [ ] 无错误信息

## 🔌 Coze 配置

### 1. 创建插件
- [ ] 登录 Coze 平台
- [ ] 创建新插件
- [ ] 选择 "OpenAPI" 方式

### 2. 配置接口
```
https://your-app.up.railway.app/openapi.json
```
- [ ] OpenAPI 导入成功
- [ ] 接口配置正确

### 3. 测试插件
- [ ] 在 Coze 中测试提取功能
- [ ] 返回正确的链接数据
- [ ] 描述和 URL 正确显示

## 🎯 最终验证

### 测试不同类型的网站

**简单静态网站：**
```bash
curl -X POST https://your-app.up.railway.app/extract \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```
- [ ] 提取成功

**中文网站：**
```bash
curl -X POST https://your-app.up.railway.app/extract \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.baidu.com"}'
```
- [ ] 提取成功
- [ ] 中文显示正常

**动态网站：**
```bash
curl -X POST https://your-app.up.railway.app/extract \
  -H "Content-Type: application/json" \
  -d '{"url": "https://job.ceair.com/crew/crewIndex.html"}'
```
- [ ] 提取成功
- [ ] 动态内容加载

## 📊 性能检查

- [ ] 响应时间 < 10 秒
- [ ] 内存使用正常（< 500MB）
- [ ] 无内存泄漏
- [ ] 浏览器正确关闭

## 🐛 问题排查

如果遇到问题，按顺序检查：

1. **查看 Railway 日志** - 了解具体错误
2. **参考 FIX_SUMMARY.md** - 了解修复细节
3. **查看 DEPLOYMENT.md** - 故障排查指南
4. **运行本地测试** - 确认本地是否正常

## 📝 记录信息

部署成功后，记录以下信息：

- Railway 域名：`_______________________________`
- 部署时间：`_______________________________`
- 测试结果：`_______________________________`
- Coze 插件 ID：`_______________________________`

## ✨ 完成！

所有检查项都通过后，你的 Web Link Extractor 就可以正常使用了！

**下一步：**
1. 在 Coze 中创建 AI 应用
2. 使用链接提取插件
3. 享受自动化的链接提取功能
