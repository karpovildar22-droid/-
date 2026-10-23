// js/admin.js
document.addEventListener('DOMContentLoaded', () => {
    setupNav();
    if (!isAdmin()) {
        showToast('Доступ запрещен. Вы не модератор.', 'error');
        setTimeout(() => window.location.href = 'index.html', 2000);
        return;
    }
    renderModeration();
});

function renderModeration() {
    const container = document.getElementById('moderation-list');
    const allNews = JSON.parse(localStorage.getItem('news'));
    const pendingNews = allNews.filter(n => n.status === 'pending').reverse();

    if (pendingNews.length === 0) {
        container.innerHTML = '<p style="text-align:center;">Нет новостей на модерации. Все чисто!</p>';
        return;
    }

    container.innerHTML = pendingNews.map(item => `
        <div class="mod-item">
            <div style="flex: 1;">
                <h3>${item.title}</h3>
                <p style="color: var(--text-muted); font-size: 0.9rem; margin: 5px 0;">От: ${item.author} | ${item.date}</p>
                <p style="margin-top: 10px;">${item.text}</p>
            </div>
            <div class="mod-actions">
                <button class="btn-success" onclick="approveNews(${item.id})">Одобрить</button>
                <button class="btn-danger" onclick="openRejectModal(${item.id})">Вернуть на доработку</button>
            </div>
        </div>
    `).join('');
}

function approveNews(id) {
    let allNews = JSON.parse(localStorage.getItem('news'));
    let newsItem = allNews.find(n => n.id === id);
    
    newsItem.status = 'approved';
    delete newsItem.rejectReason; 
    localStorage.setItem('news', JSON.stringify(allNews));

    let users = JSON.parse(localStorage.getItem('users'));
    let author = users.find(u => u.email === newsItem.author);
    if (author) {
        author.points += 5;
        localStorage.setItem('users', JSON.stringify(users));
    }

    showToast('Новость одобрена и опубликована!', 'success');
    renderModeration();
}

// Открываем модалку для ввода причины
function openRejectModal(id) {
    document.getElementById('reject-id').value = id;
    document.getElementById('reject-reason').value = '';
    document.getElementById('reject-modal').style.display = 'flex';
}

function closeRejectModal() {
    document.getElementById('reject-modal').style.display = 'none';
}

// Сохраняем причину и возвращаем
function submitReject(e) {
    e.preventDefault();
    const id = parseInt(document.getElementById('reject-id').value);
    const reason = document.getElementById('reject-reason').value.trim();
    
    let allNews = JSON.parse(localStorage.getItem('news'));
    let newsItem = allNews.find(n => n.id === id);
    
    if (newsItem) {
        newsItem.status = 'rejected';
        newsItem.rejectReason = reason || 'Без указания причины';
        localStorage.setItem('news', JSON.stringify(allNews));
        closeRejectModal();
        showToast('Запись возвращена на доработку.', 'info');
        renderModeration(); 
    }
}

window.onclick = function(event) {
    const rejectModal = document.getElementById('reject-modal');
    if (event.target === rejectModal) closeRejectModal();
}