// assets/js/main.js

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
            
            // 1. 筛选分类为“博客”的文章
            let blogs = data.filter(item => item.fields && item.fields.分类 === '博客');
            console.log('筛选后的博客文章:', blogs);
            console.log('筛选后的博客数:', blogs.length);
            
            if (blogs.length === 0) {
                container.innerHTML = '<p style="text-align:center;color:var(--text-light);">暂无博客文章，稍后再来～</p>';
                return;
            }
            
            // 2. 按发布时间倒序（最新的在前）
            blogs.sort((a, b) => b.fields.发布时间 - a.fields.发布时间);
            console.log('排序后的博客文章:', blogs);
            
            // 3. 在容器上方添加日期信息
            const currentDate = new Date().toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
            
            // 4. 清空容器并构建内容
            container.innerHTML = `<h3>更新日期：${currentDate}</h3><ul style="list-style:none; padding:0;">`;
            
            // 5. 遍历生成列表项
            blogs.forEach(item => {
                const fields = item.fields;
                const id = item.id || item.record_id;
                
                // 格式化日期
                const date = new Date(fields.发布时间);
                const dateStr = date.toLocaleDateString('zh-CN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                });
                
                // 添加列表项
                container.innerHTML += `
                    <li style="margin-bottom:1rem;">
                        <a href="article.html?id=${id}" style="color:var(--accent-color); text-decoration:none;">
                            ${fields.标题 || '无标题'}
                        </a>
                        <span style="color:var(--text-light); font-size:0.85rem; margin-left:1rem;">${dateStr}</span>
                    </li>
                `;
            });
            
            // 关闭列表标签
            container.innerHTML += '</ul>';
        })
        .catch(error => {
            console.error('获取数据失败:', error);
            container.innerHTML = `<p style="text-align:center;color:red;">加载失败，请稍后重试。错误：${error.message}</p>`;
        });
});