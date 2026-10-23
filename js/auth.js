// js/auth.js

// --- ФУНКЦИЯ УВЕДОМЛЕНИЙ (Доступна на всех страницах) ---
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span>${type === 'success' ? '✅' : type === 'error' ? '⚠️' : 'ℹ️'}</span>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-in forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

if (!localStorage.getItem('users')) {
    const defaultUsers = [
        { email: 'admin@test.ru', password: 'admin', role: 'admin', points: 0 },
        { email: 'student@test.ru', password: '123', role: 'student', points: 10 }
    ];
    localStorage.setItem('users', JSON.stringify(defaultUsers));
}

function registerUser(email, password) {
    const users = JSON.parse(localStorage.getItem('users'));
    if (users.find(u => u.email === email)) {
        showToast('Пользователь с таким email уже существует!', 'error');
        return false;
    }
    users.push({ email, password, role: 'student', points: 0 });
    localStorage.setItem('users', JSON.stringify(users));
    showToast('Регистрация успешна! Теперь войдите.', 'success');
    return true;
}

function loginUser(email, password) {
    const users = JSON.parse(localStorage.getItem('users'));
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        window.location.href = 'index.html';
    } else {
        showToast('Неверный email или пароль!', 'error');
    }
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
}

function isAdmin() {
    const user = getCurrentUser();
    return user && user.role === 'admin';
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

function toggleTheme() {
    const body = document.body;
    if (body.getAttribute('data-theme') === 'dark') {
        body.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
    } else {
        body.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    }
}

if (localStorage.getItem('theme') === 'dark') {
    document.body.setAttribute('data-theme', 'dark');
}