// js/news.js

if (!localStorage.getItem('news')) {
    const initialNews = [
        {
            id: 1,
            title: "Студентка УУНиТ стала абсолютной победительницей международного конкурса Miss Asia Awards в Сеуле",
            text: "Наша студентка блестяще представила университет на международной арене. Это историческое событие для нашего вуза!",
            image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80",
            likes: 124, author: "admin@test.ru", status: "approved", date: "23 Окт, 15:45", comments: []
        },
        {
            id: 2,
            title: "Уфимский университет вошёл в рейтинг MosIUR «Три миссии университета»",
            text: "Университет подтвердил высокий статус в международном рейтинге.",
            image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80",
            likes: 45, author: "admin@test.ru", status: "approved", date: "23 Окт, 15:31", comments: []
        }
    ];
    localStorage.setItem('news', JSON.stringify(initialNews));
}

function setupNav() {
    const navContainer = document.getElementById('user-nav');
    if(!navContainer) return;
    
    const currentUser = getCurrentUser();

    if (currentUser) {
        const initial = currentUser.email.charAt(0).toUpperCase(); 
        const displayName = currentUser.email.split('@')[0];
        const adminBtn = isAdmin() ? `<a href="admin.html" class="btn-outline" style="margin-right:10px;">Модерация</a>` : '';

        navContainer.innerHTML = `
            ${adminBtn}
            <button class="btn-primary" onclick="openAddNewsForm()" style="margin-right: 15px;">Предложить новость</button>
            <a href="profile.html" class="user-profile-nav" title="Перейти в профиль">
                <div class="avatar">${initial}</div>
                <span class="user-name-nav">${displayName}</span>
            </a>
        `;
    } else {
        navContainer.innerHTML = `<a href="login.html" class="btn-primary" style="text-decoration:none;">Войти</a>`;
    }
}

function renderNews() {
    const container = document.getElementById('news-container');
    if (!container) return;

    const allNews = JSON.parse(localStorage.getItem('news')) || [];
    const currentUser = getCurrentUser();
    const approvedNews = allNews.filter(n => n.status === 'approved');

    if (approvedNews.length === 0) {
        container.innerHTML = '<p style="grid-column: 1/-1; text-align:center; padding: 2rem;">Пока нет новостей.</p>';
        return;
    }

    container.innerHTML = approvedNews.map((item) => {
        const userLikes = JSON.parse(localStorage.getItem(`likes_${currentUser ? currentUser.email : 'guest'}`)) || [];
        const isLiked = userLikes.includes(item.id) ? 'liked' : '';
        const dateDisplay = item.date || new Date().toLocaleDateString('ru-RU');
        const imgSrc = item.image || 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=400&q=80';

        return `
            <div class="news-card" onclick="openArticleModal(${item.id})">
                <img src="${imgSrc}" alt="${item.title}" onerror="this.src='https://via.placeholder.com/400x200?text=УУНиТ'">
                <div class="news-content">
                    <span class="news-date">${dateDisplay}</span>
                    <h3>${item.title}</h3>
                    <p>${item.text.substring(0, 100)}...</p>
                    <div class="card-footer">
                        <span class="author">Автор: ${item.author.split('@')[0]}</span>
                        <button class="like-btn ${isLiked}" onclick="event.stopPropagation(); toggleLike(${item.id}, this)">
                            ❤️ <span>${item.likes}</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function toggleLike(newsId, btn) {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        showToast('Войдите, чтобы ставить лайки!', 'error');
        setTimeout(() => window.location.href = 'login.html', 1500);
        return;
    }

    let allNews = JSON.parse(localStorage.getItem('news'));
    let newsItem = allNews.find(n => n.id === newsId);
    let userLikes = JSON.parse(localStorage.getItem(`likes_${currentUser.email}`)) || [];
    const countSpan = btn.querySelector('span');

    if (userLikes.includes(newsId)) {
        userLikes = userLikes.filter(id => id !== newsId);
        newsItem.likes--;
        btn.classList.remove('liked');
        countSpan.innerText = newsItem.likes;
    } else {
        userLikes.push(newsId);
        newsItem.likes++;
        btn.classList.add('liked');
        countSpan.innerText = newsItem.likes;
    }

    localStorage.setItem(`likes_${currentUser.email}`, JSON.stringify(userLikes));
    localStorage.setItem('news', JSON.stringify(allNews));
}

function openAddNewsForm() {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        showToast('Войдите, чтобы предложить новость!', 'error');
        setTimeout(() => window.location.href = 'login.html', 1500);
        return;
    }
    
    const formTitle = document.getElementById('modal-add-title');
    const submitBtn = document.getElementById('modal-add-btn');
    
    if (isAdmin()) {
        formTitle.innerText = "Опубликовать новость";
        submitBtn.innerText = "Опубликовать";
    } else {
        formTitle.innerText = "Предложить новость";
        submitBtn.innerText = "Отправить на модерацию";
    }

    document.getElementById('add-news-modal').style.display = 'flex';
}

function closeAddNewsForm() {
    document.getElementById('add-news-modal').style.display = 'none';
}

function submitNews(e) {
    e.preventDefault();
    const currentUser = getCurrentUser();
    const title = document.getElementById('news-title').value;
    const text = document.getElementById('news-text').value;
    const image = document.getElementById('news-image').value || '';
    const allNews = JSON.parse(localStorage.getItem('news'));

    const now = new Date();
    const dateStr = `${now.getDate()} ${now.toLocaleString('ru', {month:'short'})}, ${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
    const status = isAdmin() ? 'approved' : 'pending';

    allNews.push({
        id: Date.now(),
        title, text, image,
        likes: 0,
        author: currentUser.email,
        status: status,
        date: dateStr,
        comments: []
    });

    localStorage.setItem('news', JSON.stringify(allNews));
    
    if (isAdmin()) {
        showToast('Новость успешно опубликована!', 'success');
    } else {
        showToast('Новость отправлена на модерацию!', 'success');
    }
    
    closeAddNewsForm();
    e.target.reset();
    renderNews();
}

function openArticleModal(id) {
    const allNews = JSON.parse(localStorage.getItem('news'));
    const article = allNews.find(n => n.id === id);
    const container = document.getElementById('article-view-content');
    const modal = document.getElementById('view-news-modal');

    if (!article) return;

    const currentUser = getCurrentUser();
    const comments = article.comments || [];

    const commentsHtml = comments.map(c => `
        <div class="comment-item">
            <div class="comment-header">
                <span>${c.author}</span>
                <span>${c.date}</span>
            </div>
            <p>${c.text}</p>
        </div>
    `).join('');

    const commentFormHtml = currentUser ? `
        <form class="add-comment-form" onsubmit="addComment(event, ${id})">
            <input type="text" id="comment-text" placeholder="Написать комментарий..." required>
            <button type="submit" class="btn-primary">Отправить</button>
        </form>
    ` : `<p style="text-align:center; color:var(--text-muted);">Войдите, чтобы оставить комментарий.</p>`;

    container.innerHTML = `
        <button class="close-article-btn" onclick="closeArticleModal()">×</button>
        <div class="article-header">
            <div class="article-meta">
                <span>Автор: ${article.author}</span>
                <span>${article.date}</span>
            </div>
            <h1>${article.title}</h1>
        </div>
        ${article.image ? `<img src="${article.image}" class="article-image">` : ''}
        <div class="article-text">${article.text}</div>
        
        <div class="comments-section">
            <h3>Комментарии (${comments.length})</h3>
            <div id="comments-list">${commentsHtml || '<p style="color:var(--text-muted);">Комментариев пока нет.</p>'}</div>
            ${commentFormHtml}
        </div>
    `;

    modal.style.display = 'flex';
}

function closeArticleModal() {
    document.getElementById('view-news-modal').style.display = 'none';
}

function addComment(e, newsId) {
    e.preventDefault();
    const text = document.getElementById('comment-text').value;
    const user = getCurrentUser();
    if (!text || !user) return;

    let allNews = JSON.parse(localStorage.getItem('news'));
    let article = allNews.find(n => n.id === newsId);
    if (!article.comments) article.comments = [];

    const now = new Date();
    const dateStr = `${now.getDate()}.${now.getMonth()+1}.${now.getFullYear()} ${now.getHours()}:${now.getMinutes()}`;

    article.comments.push({
        author: user.email.split('@')[0],
        text: text,
        date: dateStr
    });

    localStorage.setItem('news', JSON.stringify(allNews));
    openArticleModal(newsId);
}

window.onclick = function(event) {
    const addModal = document.getElementById('add-news-modal');
    const viewModal = document.getElementById('view-news-modal');
    if (event.target === addModal) closeAddNewsForm();
    if (event.target === viewModal) closeArticleModal();
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('news-container')) {
        setupNav();
        renderNews();
    }
});