// js/profile.js
document.addEventListener('DOMContentLoaded', () => {
    setupNav();
    const user = getCurrentUser();
    if (!user) { window.location.href = 'login.html'; return; }

    const initial = user.email.charAt(0).toUpperCase();
    const displayName = user.email.split('@')[0];

    document.getElementById('profile-avatar').innerText = initial;
    document.getElementById('profile-name').innerText = displayName;
    document.getElementById('user-info').innerText = `Роль: ${user.role === 'admin' ? 'Администратор' : 'Студент'} | Баллы: ${user.points} | Email: ${user.email}`;
    
    renderMyRecords();
});

function renderMyRecords() {
    const user = getCurrentUser();
    const container = document.getElementById('my-records');
    const allNews = JSON.parse(localStorage.getItem('news'));
    
    const myNews = (allNews || []).filter(n => n.author === user.email).reverse();

    if (myNews.length === 0) {
        container.innerHTML = '<p style="color:var(--text-muted); text-align:center; padding: 2rem; background:var(--bg-card); border-radius:8px;">Вы пока не создали ни одной записи. Перейдите на главную и нажмите "Предложить новость".</p>';
        return;
    }

    container.innerHTML = myNews.map(item => {
        let statusText = '';
        let statusClass = '';
        
        if (item.status === 'approved') { statusText = 'Опубликовано'; statusClass = 'status-approved'; }
        else if (item.status === 'pending') { statusText = 'На модерации'; statusClass = 'status-pending'; }
        else if (item.status === 'rejected') { statusText = 'Отклонено'; statusClass = 'status-rejected'; }

        let reasonHtml = '';
        if (item.rejectReason) {
            reasonHtml = `<div class="reject-reason"><b>Модератор:</b> ${item.rejectReason}</div>`;
        }

        let editBtn = '';
        if (item.status !== 'pending') {
            editBtn = `<button class="btn-outline" onclick="openEditForm(${item.id})">Редактировать</button>`;
        }

        return `
            <div class="record-item">
                <div class="record-info">
                    <h4>${item.title}</h4>
                    <p style="font-size:0.9rem; color:var(--text-muted);">${item.date}</p>
                    <span class="record-status ${statusClass}">${statusText}</span>
                    ${reasonHtml}
                </div>
                <div>${editBtn}</div>
            </div>
        `;
    }).join('');
}

function openEditForm(id) {
    const allNews = JSON.parse(localStorage.getItem('news'));
    const item = allNews.find(n => n.id === id);
    if (!item) return;

    document.getElementById('edit-id').value = item.id;
    document.getElementById('edit-title').value = item.title;
    document.getElementById('edit-text').value = item.text;
    document.getElementById('edit-image').value = item.image || '';

    document.getElementById('edit-modal').style.display = 'flex';
}

function closeEditForm() {
    document.getElementById('edit-modal').style.display = 'none';
}

function saveEdit(e) {
    e.preventDefault();
    const id = parseInt(document.getElementById('edit-id').value);
    let allNews = JSON.parse(localStorage.getItem('news'));
    let item = allNews.find(n => n.id === id);
    const user = getCurrentUser();

    if (item) {
        item.title = document.getElementById('edit-title').value;
        item.text = document.getElementById('edit-text').value;
        item.image = document.getElementById('edit-image').value;
        
        item.status = user.role === 'admin' ? 'approved' : 'pending';
        delete item.rejectReason; 

        localStorage.setItem('news', JSON.stringify(allNews));
        
        if (user.role === 'admin') {
            showToast('Запись успешно обновлена!', 'success');
        } else {
            showToast('Запись отправлена на повторную модерацию!', 'info');
        }
        
        closeEditForm();
        renderMyRecords();
    }
}