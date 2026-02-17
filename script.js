// 动态内容管理系统
class FeishuTableManager {
    constructor() {
        this.contentContainer = document.getElementById('content-container');
        this.currentCategory = 'all';
        this.init();
    }

    // 初始化
    init() {
        this.loadContent();
        this.bindCategoryEvents();
        // 每5分钟自动刷新一次
        setInterval(() => this.loadContent(), 5 * 60 * 1000);
    }

    // 绑定分类导航事件
    bindCategoryEvents() {
        const categoryLinks = document.querySelectorAll('.category-link');
        categoryLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const category = link.getAttribute('data-category');
                this.switchCategory(category);
            });
        });
    }

    // 切换分类
    switchCategory(category) {
        this.currentCategory = category;
        
        // 更新导航链接样式
        const categoryLinks = document.querySelectorAll('.category-link');
        categoryLinks.forEach(link => {
            if (link.getAttribute('data-category') === category) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
        
        // 重新加载内容
        this.loadContent();
    }

    // 加载内容
    async loadContent() {
        try {
            this.showLoading();
            const data = await this.fetchData();
            const filteredData = this.filterByCategory(data);
            this.renderContent(filteredData);
        } catch (error) {
            this.showError(error.message);
            console.error('加载内容失败:', error);
        }
    }

    // 根据分类筛选数据
    filterByCategory(data) {
        if (this.currentCategory === 'all') {
            return data;
        }
        return data.filter(post => post.category === this.currentCategory);
    }

    // 获取数据（模拟飞书多维表格API）
    async fetchData() {
        // 这里将来替换为真实的飞书多维表格API调用
        // 现在返回模拟数据
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([
                    {
                        id: '1',
                        title: 'AI写作：像朋友一样聊天',
                        date: '2026-02-10',
                        category: 'tech',
                        excerpt: '探索AI写作如何模拟人类对话，创造更加自然流畅的内容。',
                        content: '<p>AI写作技术的发展让机器能够生成更加自然的文本内容...</p><p>通过深度学习和自然语言处理，AI可以理解上下文并生成连贯的对话...</p>'
                    },
                    {
                        id: '2',
                        title: '《慢慢》专辑介绍',
                        date: '2026-02-15',
                        category: 'music',
                        excerpt: '解析最新专辑《慢慢》的创作理念和音乐风格。',
                        content: '<p>《慢慢》专辑融合了多种音乐元素，展现了艺术家的成长...</p><p>每首歌曲都有其独特的故事背景和情感表达...</p>'
                    },
                    {
                        id: '3',
                        title: '2026年春晚：科技与温情的交织',
                        date: '2026-02-17',
                        category: 'life',
                        excerpt: '回顾2026年春晚的精彩瞬间，感受科技与传统文化的完美结合。',
                        content: '<p>2026年春晚通过先进的舞台技术，呈现了一场视觉盛宴...</p><p>同时，节目内容也注重情感表达，传递了温暖的节日氛围...</p>'
                    },
                    {
                        id: '4',
                        title: '5G技术的未来发展',
                        date: '2026-02-12',
                        category: 'tech',
                        excerpt: '探讨5G技术如何改变我们的生活和工作方式。',
                        content: '<p>5G技术的普及将带来更快的网络速度和更低的延迟...</p><p>这将推动物联网、自动驾驶等领域的快速发展...</p>'
                    },
                    {
                        id: '5',
                        title: '春日旅行指南',
                        date: '2026-02-08',
                        category: 'life',
                        excerpt: '推荐几个适合春日游玩的好去处，感受春天的气息。',
                        content: '<p>春天是旅行的好时节，万物复苏，景色宜人...</p><p>以下是几个适合春日游玩的目的地推荐...</p>'
                    }
                ]);
            }, 1000);
        });
    }

    // 渲染内容
    renderContent(data) {
        if (!data || data.length === 0) {
            this.showEmpty();
            return;
        }

        const html = `
            <ul class="post-list">
                ${data.map(post => `
                    <li class="post-item">
                        <span class="post-category">${this.getCategoryName(post.category)}</span>
                        <h2 class="post-title">${post.title}</h2>
                        <p class="post-date">${post.date}</p>
                        <p class="post-excerpt">${post.excerpt}</p>
                        <a href="#" class="post-link" data-id="${post.id}">阅读更多</a>
                    </li>
                `).join('')}
            </ul>
        `;

        this.contentContainer.innerHTML = html;
        this.bindEvents();
    }

    // 获取分类名称
    getCategoryName(category) {
        const categoryMap = {
            'tech': '科技',
            'life': '生活',
            'music': '音乐'
        };
        return categoryMap[category] || category;
    }

    // 绑定事件
    bindEvents() {
        const links = document.querySelectorAll('.post-link');
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const postId = link.getAttribute('data-id');
                this.showPostDetail(postId);
            });
        });
    }

    // 显示文章详情
    async showPostDetail(postId) {
        try {
            this.showLoading();
            const data = await this.fetchData();
            const post = data.find(p => p.id === postId);
            
            if (!post) {
                this.showError('文章不存在');
                return;
            }

            const html = `
                <div class="post-detail">
                    <span class="post-category">${this.getCategoryName(post.category)}</span>
                    <h1 class="post-title">${post.title}</h1>
                    <p class="post-date">${post.date}</p>
                    <div class="post-content">${post.content}</div>
                    <a href="#" class="post-link back-link">返回列表</a>
                </div>
            `;

            this.contentContainer.innerHTML = html;
            
            // 绑定返回按钮事件
            const backLink = document.querySelector('.back-link');
            backLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.loadContent();
            });
        } catch (error) {
            this.showError(error.message);
        }
    }

    // 显示加载状态
    showLoading() {
        this.contentContainer.innerHTML = '<div class="loading">加载中...</div>';
    }

    // 显示错误状态
    showError(message) {
        this.contentContainer.innerHTML = `<div class="error">${message}</div>`;
    }

    // 显示空状态
    showEmpty() {
        this.contentContainer.innerHTML = '<div class="empty">暂无内容</div>';
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new FeishuTableManager();
});

// 飞书多维表格API集成（将来替换为真实API）
class FeishuAPI {
    constructor(appId, appSecret) {
        this.appId = appId;
        this.appSecret = appSecret;
        this.token = '';
    }

    // 获取访问令牌
    async getToken() {
        // 真实API调用：https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/tenant-v1/auth/app_access_token/internal
        // 现在返回模拟token
        return 'mock_token';
    }

    // 获取表格数据
    async getTableData(tableId) {
        // 真实API调用：https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/sheets-v3/spreadsheet-sheet/query
        // 现在返回模拟数据
        return [];
    }
}

// 配置信息（将来替换为真实配置）
const config = {
    feishu: {
        appId: 'your_app_id',
        appSecret: 'your_app_secret',
        tableId: 'your_table_id'
    }
};