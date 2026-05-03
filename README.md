# Novel AI Writer

基于 Electron + React 的桌面小说写作助手，集成 AI Agent 进行章节连贯性审查。

## 功能
- ✍️ 智能创作（大纲生成、章节生成、流式输出）
- 🎨 加料系统（上传小说，模板增强描写）
- 👥 角色管理（AI 辅助生成设定）
- 📁 项目管理（多作品、章节统计）
- 🤖 Agent 工作流（CrewAI + DeepSeek 自动审查章节一致性）

## 技术栈
- Electron + React + Webpack
- DeepSeek API / OpenAI 兼容接口
- CrewAI（Agent 框架）

## 本地运行
```bash
npm install
npm run watch   # 终端1
npm start       # 终端2
