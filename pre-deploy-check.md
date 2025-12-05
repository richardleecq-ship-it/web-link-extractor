# 部署前检查清单

## 本地测试步骤

### 1. 构建项目
```bash
npm run build
```

### 2. 启动服务器
```bash
npm run server:prod
```

### 3. 测试提取功能
```bash
node test-extraction.js https://example.com
```

### 4. 检查日志输出

应该看到类似的日志：
```
Launching browser with options: ...
Page loaded: https://example.com, found XX anchor elements in DOM
Parsing links from: https://example.com (Example Domain)
Found XX anchor elements
Extracted XX raw links from page
Processing XX raw links...
Processed XX links (skipped X)
```

## 常见问题排查

### 问题：返回 0 个链接

**可能原因：**
1. 页面加载超时
2. JavaScript 未执行完成
3. 链接被过滤掉

**检查方法：**
- 查看日志中的 "found XX anchor elements in DOM"
- 如果是 0，说明页面未加载或等待时间不够
- 如果不是 0，但最终结果是 0，说明链接被过滤

**解决方案：**
- 增加 timeout 时间
- 检查 waitForContent 的等待策略
- 检查 processRawLinks 的过滤逻辑

### 问题：浏览器启动失败

**Railway 环境检查：**
```bash
# 检查 Chromium 是否安装
which chromium-browser

# 检查环境变量
echo $PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
```

## 部署到 Railway

### 1. 提交代码
```bash
git add .
git commit -m "Fix: Improve page loading and link extraction"
git push
```

### 2. Railway 自动部署

等待构建完成（约 3-5 分钟）

### 3. 检查部署日志

在 Railway 的 "Logs" 标签中查看：
- 浏览器启动日志
- 页面加载日志
- 链接提取日志

### 4. 测试部署的服务

```bash
curl -X POST https://your-app.up.railway.app/extract \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

## 关键修改说明

### 1. 页面加载策略优化
- 从 `networkidle` 改为 `domcontentloaded`
- 增加多个等待阶段
- 添加容错机制

### 2. 增加详细日志
- 浏览器启动日志
- 页面加载状态
- DOM 元素数量
- 链接处理过程

### 3. 超时时间调整
- 从 30 秒增加到 45 秒
- 分阶段等待，避免单点超时

### 4. 浏览器参数优化
- 添加 `--disable-web-security`
- 添加 `--disable-features=IsolateOrigins`
- 确保在 Railway 环境中稳定运行

## 预期结果

成功提取后应该返回：
```json
{
  "success": true,
  "data": [
    {
      "url": "https://example.com/page",
      "description": "Page Title",
      "anchorText": "Link Text",
      "title": "Title Attribute"
    }
  ],
  "sourceUrl": "https://example.com",
  "totalLinks": 10
}
```
