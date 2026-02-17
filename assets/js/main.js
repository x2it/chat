// assets/js/main.js

// 全局变量存储所有文章数据
window.allPosts = [];

document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('articles-container');
    
    if (!container) {
        console.error('错误：未找到容器元素 #articles-container');
        return;
    }
    
    // Worker 地址
    const WORKER_URL = 'https://chat.x-dw.workers.dev';
    
    console.log('开始从 Worker 获取数据...');
    
    // 获取并渲染数据
    fetch(WORKER_URL)
        .then(response => {
            console.log('响应状态:', response.status);
            if (!response.ok) {
                throw new Error(`HTTP 错误: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('从 Worker 获取到原始数据:', data);
            console.log('获取到的数据总数:', data.length);
            
            // 存储为全局变量
            window.allPosts = data;
            
            // 初始加载时，默认渲染分类为“博客”的文章
            renderPosts('博客');
            
            // 为筛选按钮添加点击事件
            setupFilterButtons();
        })
        .catch(error => {
            console.error('获取数据失败:', error);
            container.innerHTML = `<p style="text-align:center;color:red;">加载失败，请稍后重试。错误：${error.message}</p>`;
        });
    
    // 设置筛选按钮事件
    function setupFilterButtons() {
        const filterTabs = document.querySelectorAll('.filter-tab');
        
        filterTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                // 移除所有 active 类
                filterTabs.forEach(t => t.classList.remove('active'));
                // 给当前按钮添加 active
                this.classList.add('active');
                // 获取分类并渲染
                const category = this.getAttribute('data-category');
                renderPosts(category);
            });
        });
    }
    
    // 渲染指定分类的文章
    function renderPosts(category) {
        const container = document.getElementById('articles-container');
        if (!container) return;
        
        console.log(`开始渲染分类为 "${category}" 的文章`);
        
        // 筛选分类为 category 的记录
        let filteredPosts = window.allPosts.filter(item => item.fields && item.fields.分类 === category);
        console.log(`筛选后的 ${category} 文章数:`, filteredPosts.length);
        
        if (filteredPosts.length === 0) {
            container.innerHTML = `<p style="text-align:center;color:var(--text-light);">暂无${category}内容，稍后再来～</p>`;
            return;
        }
        
        // 按发布时间倒序（最新的在前）
        filteredPosts.sort((a, b) => b.fields.发布时间 - a.fields.发布时间);
        console.log('排序后的文章:', filteredPosts);
        
        // 清空容器
        container.innerHTML = '';
        
        // 遍历生成卡片
        filteredPosts.forEach(item => {
            const fields = item.fields;
            const id = item.id || item.record_id;
            
            // 格式化日期
            const date = new Date(fields.发布时间);
            const dateStr = date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-');
            
            // 内容预览：去除 Markdown 标记，取前100字符
            const rawContent = fields.内容 || '';
            const plainText = rawContent
                .replace(/!\[.*?\]\(.*?\)/g, '')   // 移除图片
                .replace(/\[.*?\]\(.*?\)/g, '')   // 移除链接
                .replace(/[#*`>~\-+]/g, '')       // 移除标记符号
                .replace(/\n+/g, ' ')             // 换行变空格
                .trim();
            const preview = plainText.length > 100 ? plainText.substring(0, 100) + '...' : plainText;
            
            // 构建卡片 HTML
            const card = document.createElement('div');
            card.className = 'article-card';
            card.innerHTML = `
                <div style="padding:1rem;">
                    <h3 style="margin:0 0 0.5rem; font-size:1.25rem;">${fields.标题 || '无标题'}</h3>
                    <div style="color:var(--text-light); font-size:0.85rem; margin-bottom:0.5rem;">${dateStr}</div>
                    <p style="color:var(--text-secondary); line-height:1.5; margin-bottom:1rem;">${preview}</p>
                    <a href="article.html?id=${id}" style="color:var(--accent-color); text-decoration:none; font-weight:500;">继续阅读 →</a>
                </div>
            `;
            
            container.appendChild(card);
        });
    }
    
    // 返回顶部按钮功能
    const backToTopButton = document.getElementById('backToTop');
    if (backToTopButton) {
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                backToTopButton.style.display = 'block';
            } else {
                backToTopButton.style.display = 'none';
            }
        });
        
        backToTopButton.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
});