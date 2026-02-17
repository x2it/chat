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
        const container = document.getElementById('articles-container');
        
        // 显示加载状态
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">加载中...</p>';
        
        try {
            // 检测是否在本地文件协议下
            const isLocalFile = window.location.protocol === 'file:';
            
            let blogPosts = [];
            
            if (isLocalFile) {
                // 本地模式：使用模拟数据
                console.log('本地文件模式，使用模拟数据');
                blogPosts = [
                    {
                        id: '1',
                        fields: {
                            分类: '博客',
                            标题: 'AI如何真正帮助创作',
                            发布时间: '2026-02-18',
                            内容: '# AI如何真正帮助创作\n\n在当前的技术环境中，AI已经成为了创作过程中的重要工具...' 
                        }
                    },
                    {
                        id: '2',
                        fields: {
                            分类: '博客',
                            标题: '深度思考的重要性',
                            发布时间: '2026-02-17',
                            内容: '# 深度思考的重要性\n\n在信息爆炸的时代，深度思考变得越来越重要...' 
                        }
                    }
                ];
            } else {
                // 在线模式：从 Cloudflare Worker 获取数据
                const response = await fetch('https://chat.x-dw.workers.dev');
                
                // 检查响应状态
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                
                // 验证数据格式
                if (!Array.isArray(data)) {
                    throw new Error('数据格式错误：期望数组');
                }
                
                // 筛选分类为"博客"的记录
                blogPosts = data.filter(item => {
                    // 确保 item 和 item.fields 存在
                    return item && item.fields && item.fields.分类 === '博客';
                });
                
                // 按发布时间倒序排列（最新的在前）
                blogPosts.sort((a, b) => {
                    // 直接使用时间戳进行比较，确保正确排序
                    return (b.fields.发布时间 || 0) - (a.fields.发布时间 || 0);
                });
            }
            
            // 动态生成卡片
            container.innerHTML = '';
            
            if (blogPosts.length === 0) {
                container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">暂无博客文章</p>';
                return;
            }
            
            // 遍历所有博客记录，为每条记录生成卡片
            blogPosts.forEach(post => {
                const article = document.createElement('article');
                article.className = 'article-card';
                
                // 处理封面图片
                let coverImage = '';
                if (post.fields.封面 && Array.isArray(post.fields.封面) && post.fields.封面.length > 0 && post.fields.封面[0].url) {
                    coverImage = `<img src="${post.fields.封面[0].url}" onerror="this.style.display='none'" style="max-width:100%; max-height:200px; object-fit:cover; border-radius:4px; margin-bottom:1rem;">`;
                }
                
                // 截取前100字作为内容预览，去除Markdown标记
                let contentPreview = post.fields.内容 || '无内容';
                // 移除Markdown标记
                contentPreview = contentPreview.replace(/[#*`\[\]()]|!\[.*?\]\(.*?\)/g, '').substring(0, 100) + '...';
                
                // 格式化日期
                let formattedDate = '未知日期';
                if (post.fields.发布时间) {
                    try {
                        formattedDate = new Date(post.fields.发布时间).toISOString().split('T')[0];
                    } catch (error) {
                        formattedDate = '日期格式错误';
                    }
                }
                
                // 获取文章ID，优先使用id，否则使用record_id
                const articleId = post.id || post.record_id;
                // 生成文章链接
                const postLink = articleId ? `article.html?id=${articleId}` : '#';
                
                article.innerHTML = `
                    ${coverImage}
                    <div class="article-header">
                        <span class="article-category">${post.fields.分类 || '未分类'}</span>
                        <h3 class="article-title">${post.fields.标题 || '无标题'}</h3>
                        <div class="article-date">${formattedDate}</div>
                    </div>
                    <div class="article-content">
                        <p>${contentPreview}</p>
                        <a href="${postLink}" class="read-more">继续阅读 →</a>
                    </div>
                `;
                
                container.appendChild(article);
            });
        } catch (error) {
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