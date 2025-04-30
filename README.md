# DDD 架构指南文档网站

这是一个使用 VitePress 1.6.3 构建的领域驱动设计 (DDD) 架构文档网站，旨在提供关于 DDD 原则、模式和实践的全面指南。

## 📚 内容概览

本文档网站包含以下主要内容：

- DDD 基础知识和核心概念
- 战略设计（限界上下文、上下文映射等）
- 战术设计（实体、值对象、聚合等）
- 实战案例分析
- 学习资源和推荐书籍

## 🚀 本地开发

### 前置条件

- Node.js 16.0 或更高版本
- npm 或其他包管理工具

### 安装

```bash
# 克隆仓库
git clone https://github.com/yourusername/ddd-architecture-guide.git
cd ddd-architecture-guide

# 安装依赖
npm install
```

### 开发预览

```bash
# 启动开发服务器
npm run docs:dev
```

访问 `http://localhost:5173` 查看实时预览。

### 构建

```bash
# 构建生产版本
npm run docs:build

# 本地预览生产构建
npm run docs:preview
```

## 📦 项目结构

```
docs/
├── .vitepress/          # VitePress 配置
├── public/              # 静态资源
├── fundamentals/        # DDD 基础
├── strategic-design/    # 战略设计
├── tactical-design/     # 战术设计
├── case-studies/        # 实战案例
├── resources/           # 学习资源
└── index.md             # 首页
```

## 🔄 部署

本项目配置为通过 GitHub Actions 自动部署到 GitHub Pages。每次推送到 `main` 分支时，都会触发构建和部署流程。

## 🤝 贡献指南

欢迎对本文档网站做出贡献！您可以通过以下方式参与：

1. 提交 Issue 报告错误或建议新功能
2. 创建 Pull Request 修复错误或添加新内容
3. 改进现有文档，例如修正拼写错误、更新过时信息等

请确保您的贡献符合本项目的风格指南和质量标准。

## 📄 许可证

本项目采用 MIT 许可证。有关详细信息，请参阅 [LICENSE](LICENSE) 文件。 