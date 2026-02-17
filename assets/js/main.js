// assets/js/main.js

document.addEventListener('DOMContentLoaded', function() {

    const container = document.getElementById('articles-container');

    if (!container) {

        console.error('错误：未找到容器元素 #articles-container');

        return;

    }

    // Worker 地址（确保与部署的一致）
    const WORKER_URL = 'https://chat.x-dw.workers.dev';

    // 获取并渲染数据
    fetch(WORKER_URL)

        .then(response => {

            if (!response.ok) {

                throw new Error(`HTTP 错误: ${response.status}`);

            }

            return response.json();

        })

        .then(data => {

            console.log('从 Worker 获取到原始数据:', data);

            // 1. 筛选分类为“博客”的文章
            let blogs = data.filter(item => item.fields && item.fields.分类 === '博客');

            console.log('筛选后的博客文章:', blogs);

            if (blogs.length === 0) {

                container.innerHTML = '<p style="text-align:center;color:var(--text-light);">暂无博客文章，稍后再来～</p>';

                return;

            }

            // 2. 按发布时间倒序（最新的在前）
            blogs.sort((a, b) => b.fields.发布时间 - a.fields.发布时间);

            // 3. 清空容器
            container.innerHTML = '';

            // 4. 遍历生成卡片
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

                    // 优先使用 tmp_url，若没有则用 url
                    const imgUrl = cover.tmp_url || cover.url;

                    if (imgUrl) {

                        imgHtml = `<img src="${imgUrl}" alt="${fields.标题}" onerror="this.style.display='none'" style="width:100%; height:200px; object-fit:cover; border-radius:8px 8px 0 0;">`;

                    }

                }

                // 构建卡片 HTML
                const card = document.createElement('div');
                card.className = 'blog-card';  // 这里使用你现有的卡片类名，如果不同请修改
                card.innerHTML = `

                    ${imgHtml}

                    <div style="padding:1rem;">

                        <h3 style="margin:0 0 0.5rem; font-size:1.25rem;">${fields.标题 || '无标题'}</h3>

                        <div style="color:var(--text-light); font-size:0.85rem; margin-bottom:0.5rem;">${dateStr}</div>

                        <p style="color:var(--text-secondary); line-height:1.5; margin-bottom:1rem;">${preview}</p>

                        <a href="article.html?id=${id}" style="color:var(--accent-color); text-decoration:none; font-weight:500;">继续阅读 →</a>

                    </div>

                `;

                container.appendChild(card);

            });

        })

        .catch(error => {

            console.error('获取数据失败:', error);

            container.innerHTML = `<p style="text-align:center;color:red;">加载失败，请稍后重试。错误：${error.message}</p>`;

        });

});