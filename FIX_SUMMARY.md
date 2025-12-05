# 提取不出内容问题修复总结

## 问题描述
部署到 Railway 后，API 返回 `"data":[]` 和 `"totalLinks":0`，无法提取链接。

## 根本原因
1. **页面加载策略不当**：使用 `waitUntil: 'networkidle'` 在某些网站上永远不会触发
2. **等待时间不足**：动态内容未完全加载就开始提取
3. **缺少调试信息**：无法判断是页面加载失败还是解析失败

## 修复方案

### 1. 优化页面加载策略 (src/core/PageLoader.ts)

**修改前：**
```typescript
response = await page.goto(url, {
  timeout,
  waitUntil: 'networkidle',  // 可能永远不会触发
});
```

**修改后：**
```typescript
response = await page.goto(url, {
  timeout,
  waitUntil: 'domcontentloaded',  // 更可靠的等待策略
});
```

### 2. 改进内容等待逻辑 (src/core/PageLoader.ts)

**修改前：**
```typescript
async waitForContent(page: Page, timeout: number = 30000): Promise<void> {
  await page.waitForLoadState('domcontentloaded', { timeout });
  await page.waitForTimeout(500);
  await page.waitForLoadState('networkidle', { timeout });
}
```

**修改后：**
```typescript
async waitForContent(page: Page, timeout: number = 30000): Promise<void> {
  // 分阶段等待，每个阶段都有容错
  await page.waitForLoadState('domcontentloaded', { timeout: 10000 });
  await page.waitForSelector('body', { timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(2000);  // 等待 JS 执行
  await page.waitForLoadState('load', { timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(1000);  // 等待懒加载内容
}
```

### 3. 增加详细日志

**PageLoader.ts：**
```typescript
console.log('Launching browser with options:', launchOptions);
console.log(`Page loaded: ${url}, found ${linkCount} anchor elements in DOM`);
```

**LinkParser.ts：**
```typescript
console.log(`Parsing links from: ${pageUrl} (${pageTitle})`);
console.log(`Found ${anchorElements.length} anchor elements`);
console.log(`Extracted ${rawLinks.length} raw links from page`);
```

**LinkExtractorService.ts：**
```typescript
console.log(`Processing ${rawLinks.length} raw links...`);
console.log(`Processed ${links.length} links (skipped ${skippedCount})`);
```

### 4. 增加超时时间 (src/coze-api.ts)

**修改前：**
```typescript
const result = await extractor.extract(url, { timeout: 30000 });
```

**修改后：**
```typescript
const result = await extractor.extract(url, { 
  timeout: 45000,  // 增加到 45 秒
  verbose: true    // 启用详细日志
});
```

### 5. 优化浏览器参数 (src/core/PageLoader.ts)

添加了更多兼容性参数：
```typescript
args: [
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-dev-shm-usage',
  '--disable-gpu',
  '--no-first-run',
  '--no-zygote',
  '--single-process',
  '--disable-blink-features=AutomationControlled',
  '--disable-web-security',  // 新增
  '--disable-features=IsolateOrigins,site-per-process'  // 新增
]
```

### 6. 过滤 javascript: 和 data: URL (src/services/LinkExtractorService.ts)

```typescript
// Skip javascript: and data: URLs
if (rawLink.href.startsWith('javascript:') || rawLink.href.startsWith('data:')) {
  skippedCount++;
  continue;
}
```

## 测试方法

### 本地测试
```bash
# 1. 构建
npm run build

# 2. 启动服务器
npm run server:prod

# 3. 测试提取
node test-extraction.js https://example.com
```

### 检查日志输出
应该看到完整的提取过程：
```
Launching browser with options: ...
Page loaded: https://example.com, found 25 anchor elements in DOM
Parsing links from: https://example.com (Example Domain)
Found 25 anchor elements
Extracted 25 raw links from page
Processing 25 raw links...
Processed 20 links (skipped 5)
```

### Railway 部署测试
```bash
# 提交代码
git add .
git commit -m "Fix: Improve page loading and link extraction"
git push

# 等待部署完成后测试
curl -X POST https://your-app.up.railway.app/extract \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

## 预期结果

修复后应该能正常提取链接：
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
  "totalLinks": 20
}
```

## 如果仍然失败

### 1. 查看 Railway 日志
在 Railway 项目的 "Logs" 标签中查看：
- 是否有浏览器启动错误
- 页面加载是否超时
- DOM 中是否找到了 anchor 元素

### 2. 检查特定网站
某些网站可能需要：
- 更长的等待时间
- 特定的 User-Agent
- Cookie 或认证

### 3. 调整等待策略
如果某个网站特别慢，可以在 `src/core/PageLoader.ts` 中增加等待时间：
```typescript
await page.waitForTimeout(3000);  // 从 2000 增加到 3000
```

## 文件修改清单

- ✅ `src/core/PageLoader.ts` - 页面加载策略优化
- ✅ `src/core/LinkParser.ts` - 添加日志
- ✅ `src/services/LinkExtractorService.ts` - 添加日志和过滤
- ✅ `src/coze-api.ts` - 增加超时和详细日志
- ✅ `test-extraction.js` - 新增测试脚本
- ✅ `pre-deploy-check.md` - 部署前检查清单

## 下一步

1. 本地测试确认修复有效
2. 提交代码到 GitHub
3. Railway 自动部署
4. 测试部署后的服务
5. 在 Coze 中配置并测试
