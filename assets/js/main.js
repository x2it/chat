// assets/js/main.js

// 全局变量存储所有文章数据
window.allPosts = [];

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM 加载完成，开始初始化...');
    
    // 初始化导航栏事件
    initNavigation();
    
    // 从 Worker 获取数据
    fetchData();
});

// 初始化导航栏事件
function initNavigation() {
    console.log('初始化导航栏事件...');
    
    const navTabs = document.querySelectorAll('.nav-tab');
    
    navTabs.forEach(tab => {
        tab.addEventListener('click', function(e) {
            const view = this.getAttribute('data-view');
            
            // 如果是博客或作品选项卡，阻止默认跳转
            if (view === 'blog' || view === 'works') {
                e.preventDefault();
                
                // 更新导航栏激活状态
                navTabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                
                // 切换内容
                switchContent(view);
            } else {
                // 其他选项卡（关于我、联系交流），保持默认跳转
                // 更新导航栏激活状态
                navTabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });
}

// 切换内容
function switchContent(view) {
    console.log(`切换到内容视图: ${view}`);
    
    // 隐藏所有内容容器
    document.getElementById('blog-posts').style.display = 'none';
    document.getElementById('works-posts').style.display = 'none';
    
    // 显示选中的内容容器
    if (view === 'blog') {
        document.getElementById('blog-posts').style.display = 'block';
        // 渲染博客内容
        renderBlogs();
    } else if (view === 'works') {
        document.getElementById('works-posts').style.display = 'block';
        // 渲染作品内容
        renderWorks();
    }
}

// 从 Worker 获取数据
function fetchData() {
    console.log('开始从 Worker 获取数据...');
    
    // Worker 地址
    const WORKER_URL = 'https://chat.x-dw.workers.dev';
    
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
            
            // 初始加载时，默认渲染博客内容
            renderBlogs();
        })
        .catch(error => {
            console.error('获取数据失败:', error);
            
            // 显示错误信息
            const blogContainer = document.getElementById('blog-container');
            const worksContainer = document.getElementById('works-container');
            
            if (blogContainer) {
                blogContainer.innerHTML = `<p style="text-align:center;color:red;">加载失败，请稍后重试。错误：${error.message}</p>`;
            }
            
            if (worksContainer) {
                worksContainer.innerHTML = `<p style="text-align:center;color:red;">加载失败，请稍后重试。错误：${error.message}</p>`;
            }
        });
}

// 渲染博客内容
function renderBlogs() {
    console.log('开始渲染博客内容...');
    
    const container = document.getElementById('blog-container');
    if (!container) {
        console.error('错误：未找到博客容器元素 #blog-container');
        return;
    }
    
    // 筛选分类为“博客”的文章
    let blogs = window.allPosts.filter(item => item.fields && item.fields.分类 === '博客');
    console.log('筛选后的博客文章:', blogs);
    console.log('筛选后的博客数:', blogs.length);
    
    if (blogs.length === 0) {
        container.innerHTML = `<p style="text-align:center;color:var(--text-light);">暂无博客内容，稍后再来～</p>`;
        return;
    }
    
    // 按发布时间倒序（最新的在前）
    blogs.sort((a, b) => b.fields.发布时间 - a.fields.发布时间);
    console.log('排序后的博客文章:', blogs);
    
    // 清空容器
    container.innerHTML = '';
    
    // 遍历生成卡片
    blogs.forEach(item => {
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
        
        // 封面图片处理
        let imgHtml = '';
        if (fields.封面 && Array.isArray(fields.封面) && fields.封面.length > 0) {
            const cover = fields.封面[0];
            const imgUrl = cover.tmp_url || cover.url;
            if (imgUrl) {
                imgHtml = `<img src="${imgUrl}" alt="${fields.标题 || '封面'}" onerror="this.style.display='none'">`;
            }
        }
        
        // 构建卡片 HTML
        const card = document.createElement('div');
        card.className = 'article-card';
        card.innerHTML = `
            ${imgHtml}
            <div class="article-content">
                <h3 class="article-title">${fields.标题 || '无标题'}</h3>
                <div class="article-date">${dateStr}</div>
                <p>${preview}</p>
                <a href="article.html?id=${id}" class="read-more">继续阅读 →</a>
            </div>
        `;
        
        container.appendChild(card);
    });
}

// 渲染作品内容
function renderWorks() {
    console.log('开始渲染作品内容...');
    
    const container = document.getElementById('works-container');
    if (!container) {
        console.error('错误：未找到作品容器元素 #works-container');
        return;
    }
    
    // 筛选分类为“作品集”的文章
    let works = window.allPosts.filter(item => item.fields && item.fields.分类 === '作品集');
    console.log('筛选后的作品:', works);
    console.log('筛选后的作品数:', works.length);
    
    if (works.length === 0) {
        container.innerHTML = `<p style="text-align:center;color:var(--text-light);">暂无作品内容，稍后再来～</p>`;
        return;
    }
    
    // 按发布时间倒序（最新的在前）
    works.sort((a, b) => b.fields.发布时间 - a.fields.发布时间);
    console.log('排序后的作品:', works);
    
    // 清空容器
    container.innerHTML = '';
    
    // 遍历生成卡片
    works.forEach(item => {
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
        
        // 封面图片处理
        let imgHtml = '';
        if (fields.封面 && Array.isArray(fields.封面) && fields.封面.length > 0) {
            const cover = fields.封面[0];
            const imgUrl = cover.tmp_url || cover.url;
            if (imgUrl) {
                imgHtml = `<img src="${imgUrl}" alt="${fields.标题 || '封面'}" onerror="this.style.display='none'">`;
            }
        }
        
        // 构建卡片 HTML
        const card = document.createElement('div');
        card.className = 'article-card';
        card.innerHTML = `
            ${imgHtml}
            <div class="article-content">
                <h3 class="article-title">${fields.标题 || '无标题'}</h3>
                <div class="article-date">${dateStr}</div>
                <p>${preview}</p>
                <a href="article.html?id=${id}" class="read-more">查看详情 →</a>
            </div>
        `;
        
        container.appendChild(card);
    });
}

// 返回顶部按钮功能
function initBackToTop() {
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
}

// 初始化返回顶部按钮
initBackToTop();