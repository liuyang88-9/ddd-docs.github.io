import {defineConfig} from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
    title: "DDD Architecture Guide",
    description: "A comprehensive guide to Domain-Driven Design architecture",
    base: "/ddd-guideline/",
    lang: 'zh-CN',
    lastUpdated: true,
    cleanUrls: true,

    head: [
        ['link', {rel: 'icon', href: '/favicon.ico'}],
        ['meta', {name: 'theme-color', content: '#3c8772'}],
        ['meta', {name: 'og:type', content: 'website'}],
        ['meta', {name: 'og:title', content: 'DDD Architecture Guide'}],
        ['meta', {name: 'og:description', content: 'A comprehensive guide to Domain-Driven Design architecture'}],
        // 预加载Ubuntu Mono字体
        ['link', {rel: 'preconnect', href: 'https://fonts.googleapis.com'}],
        ['link', {rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: ''}],
        ['link', {
            rel: 'stylesheet',
            href: 'https://fonts.googleapis.com/css2?family=Ubuntu+Mono&family=Inter:wght@300;400;500;600;700&family=Manrope:wght@400;500;600&display=swap'
        }],
        // Font Awesome 图标
        ['link', {rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'}]
    ],

    themeConfig: {
        // https://vitepress.dev/reference/default-theme-config
        logo: '/logo.svg',

        nav: [
            {text: '首页', link: '/'},
            {text: 'DDD 基础', link: '/fundamentals/'},
            {text: '战略设计', link: '/strategic-design/'},
            {text: '战术设计', link: '/tactical-design/'},
            {text: '实战案例', link: '/case-studies/'},
            {text: '资源', link: '/resources/'}
        ],

        sidebar: {
            '/fundamentals/': [
                {
                    text: 'DDD 基础',
                    items: [
                        {text: '什么是 DDD', link: '/fundamentals/what-is-ddd'},
                        {text: 'DDD 核心概念', link: '/fundamentals/core-concepts'},
                        {text: 'DDD 与其他架构的对比', link: '/fundamentals/comparisons'},
                        {text: '何时使用 DDD', link: '/fundamentals/when-to-use'}
                    ]
                }
            ],
            '/strategic-design/': [
                {
                    text: '战略设计',
                    items: [
                        {text: '限界上下文', link: '/strategic-design/bounded-contexts'},
                        {text: '上下文映射', link: '/strategic-design/context-mapping'},
                        {text: '领域事件', link: '/strategic-design/domain-events'},
                        {text: '通用语言', link: '/strategic-design/ubiquitous-language'}
                    ]
                }
            ],
            '/tactical-design/': [
                {
                    text: '战术设计',
                    items: [
                        {text: '聚合', link: '/tactical-design/aggregates'},
                        {text: '实体', link: '/tactical-design/entities'},
                        {text: '值对象', link: '/tactical-design/value-objects'},
                        {text: '领域服务', link: '/tactical-design/domain-services'},
                        {text: '仓储', link: '/tactical-design/repositories'},
                        {text: '工厂', link: '/tactical-design/factories'}
                    ]
                }
            ],
            '/case-studies/': [
                {
                    text: '实战案例',
                    items: [
                        {text: '电子商务系统', link: '/case-studies/e-commerce'},
                        {text: '金融系统', link: '/case-studies/finance'},
                        {text: '物流系统', link: '/case-studies/logistics'}
                    ]
                }
            ],
            '/resources/': [
                {
                    text: '资源',
                    items: [
                        {text: '推荐书籍', link: '/resources/books'},
                        {text: '在线资源', link: '/resources/online'},
                        {text: '社区', link: '/resources/community'}
                    ]
                }
            ]
        },

        socialLinks: [
            {icon: 'github', link: 'https://github.com/yourusername/ddd-architecture-guide'}
        ],

        footer: {
            message: 'Released under the MIT License.',
            copyright: 'Copyright © 2023-present'
        },

        search: {
            provider: 'local'
        },

        lastUpdated: {
            text: '最后更新于',
            formatOptions: {
                dateStyle: 'full',
                timeStyle: 'medium'
            }
        },

        docFooter: {
            prev: '上一页',
            next: '下一页'
        },

        outline: {
            label: '页面导航',
            level: 'deep'
        }
    }
})
