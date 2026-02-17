document.addEventListener('DOMContentLoaded', function() {
    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 300) {
                backToTop.classList.add('show');
            } else {
                backToTop.classList.remove('show');
            }
        });
        backToTop.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // 加载博客数据
    async function loadBlogPosts() {
        // 自动查找容器元素
        let container = document.getElementById('articles-container');
        
        // 如果找不到，尝试其他可能的容器
        if (!container) {
            container = document.querySelector('.blog-list');
        }
        if (!container) {
            container = document.querySelector('.posts');
        }
        
        // 输出容器元素信息
        console.log('容器元素：', container);
        
        // 如果仍然找不到容器，显示错误信息
        if (!container) {
            console.error('未找到博客列表容器元素');
            return;
        }
        
        // 显示加载状态
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">加载中...</p>';
        
        try {
            // 从 Cloudflare Worker 获取数据
            const response = await fetch('https://chat.x-dw.workers.dev');
            
            // 检查响应状态
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // 输出获取到的总记录数
            console.log('获取到总记录数：', data.length);
            
            // 验证数据格式
            if (!Array.isArray(data)) {
                throw new Error('数据格式错误：期望数组');
            }
            
            // 筛选分类为"博客"的记录
            const blogs = data.filter(item => {
                // 确保 item 和 item.fields 存在
                return item && item.fields && item.fields.分类 === '博客';
            });
            
            // 输出博客记录数
            console.log('博客记录数：', blogs.length);
            
            // 按发布时间倒序排列（最新的在前）
            blogs.sort((a, b) => {
                // 直接使用时间戳进行比较，确保正确排序
                return (b.fields.发布时间 || 0) - (a.fields.发布时间 || 0);
            });
            
            // 动态生成卡片
            container.innerHTML = '';
            
            if (blogs.length === 0) {
                container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">暂无博客文章</p>';
                return;
            }
            
            // 遍历所有博客记录，为每条记录生成卡片
            blogs.forEach(item => {
                const article = document.createElement('article');
                article.className = 'article-card';
                
                // 处理封面图片
                let coverImage = '';
                if (item.fields.封面 && Array.isArray(item.fields.封面) && item.fields.封面.length > 0) {
                    // 优先使用 tmp_url，然后使用 url
                    const imageUrl = item.fields.封面[0].tmp_url || item.fields.封面[0].url;
                    if (imageUrl) {
                        coverImage = `<img src="${imageUrl}" onerror="this.style.display='none'" style="max-width:100%; max-height:200px; object-fit:cover; border-radius:4px; margin-bottom:1rem;">`;
                    }
                }
                
                // 截取前100字作为内容预览，去除Markdown标记
                let contentPreview = item.fields.内容 || '无内容';
                // 移除Markdown标记
                contentPreview = contentPreview.replace(/[#*`\[\]()]|!\[.*?\]\(.*?\)/g, '').substring(0, 100) + '...';
                
                // 格式化日期
                let formattedDate = '未知日期';
                if (item.fields.发布时间) {
                    try {
                        formattedDate = new Date(item.fields.发布时间).toISOString().split('T')[0];
                    } catch (error) {
                        formattedDate = '日期格式错误';
                    }
                }
                
                // 获取文章ID，优先使用id，否则使用record_id
                const articleId = item.id || item.record_id;
                // 生成文章链接
                const postLink = articleId ? `article.html?id=${articleId}` : '#';
                
                article.innerHTML = `
                    ${coverImage}
                    <div class="article-header">
                        <span class="article-category">${item.fields.分类 || '未分类'}</span>
                        <h3 class="article-title">${item.fields.标题 || '无标题'}</h3>
                        <div class="article-date">${formattedDate}</div>
                    </div>
                    <div class="article-content">
                        <p>${contentPreview}</p>
                        <a href="${postLink}">继续阅读 →</a>
                    </div>
                `;
                
                container.appendChild(article);
            });
        } catch (error) {
            // 捕获并输出详细错误
            console.error('加载博客数据失败:', error);
            container.innerHTML = `
                <div style="text-align: center; color: var(--text-secondary); padding: 2rem;">
                    <p>加载失败，请稍后重试</p>
                    <p style="font-size: 0.9rem; margin-top: 0.5rem;">错误信息: ${error.message}</p>
                    <button onclick="loadBlogPosts()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: var(--dark-color); color: white; border: none; border-radius: 4px; cursor: pointer;">重新加载</button>
                </div>
            `;
        }
    }

    // 初始化加载博客数据
    loadBlogPosts();
});