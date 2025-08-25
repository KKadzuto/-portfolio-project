let achievements = [];
let filteredAchievements = [];
let currentLanguage = 'en';

document.addEventListener('DOMContentLoaded', function() {
    loadAchievements();
    setupEventListeners();
    displayPortfolio();
    updateLanguage();
    updatePlaceholders();
    
    window.debugPortfolio = function() {
        console.log('=== ДЕБАГ ПОРТФОЛИО ===');
        console.log('Достижения в памяти:', achievements);
        console.log('Отфильтрованные достижения:', filteredAchievements);
        console.log('localStorage:', localStorage.getItem('portfolioAchievements'));
        console.log('Размер localStorage:', new Blob([localStorage.getItem('portfolioAchievements') || '']).size, 'байт');
    };
    
    console.log('Портфолио инициализировано. Используйте debugPortfolio() для отладки.');
});

function setupEventListeners() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }
    
    document.addEventListener('click', (e) => {
        if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                const navToggle = document.querySelector('.nav-toggle');
                const navMenu = document.querySelector('.nav-menu');
                if (navToggle && navMenu) {
                    navToggle.classList.remove('active');
                    navMenu.classList.remove('active');
                }
            }
        });
    });

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(searchPeople, 300));
    }
}

function loadAchievements() {
    const saved = localStorage.getItem('portfolioAchievements');
    if (saved) {
        try {
            achievements = JSON.parse(saved);
            filteredAchievements = [...achievements];
            console.log('Достижения загружены:', achievements.length);
            if (achievements.length > 0) {
                showNotification(currentLanguage === 'en' ? `Loaded ${achievements.length} achievements` : `Загружено ${achievements.length} достижений`, 'success');
            }
        } catch (error) {
            console.error('Ошибка при загрузке достижений:', error);
            achievements = [];
            filteredAchievements = [];
            showNotification(currentLanguage === 'en' ? 'Error loading data' : 'Ошибка при загрузке данных', 'error');
        }
    } else {
        console.log('Достижения не найдены в localStorage');
    }
}

function saveAchievements() {
    try {
        localStorage.setItem('portfolioAchievements', JSON.stringify(achievements));
        console.log('Достижения сохранены:', achievements.length);
    } catch (error) {
        console.error('Ошибка при сохранении достижений:', error);
        showNotification(currentLanguage === 'en' ? 'Error saving data' : 'Ошибка при сохранении данных', 'error');
    }
}

function uploadAchievement() {
    const name = document.getElementById('name').value.trim();
    const title = document.getElementById('title').value.trim();
    const description = document.getElementById('description').value.trim();
    const skills = document.getElementById('skills').value.trim();
    const image = document.getElementById('image').files[0];
    const link = document.getElementById('link').value.trim();

    if (!name || !title || !description || !skills) {
        showNotification(currentLanguage === 'en' ? 'Please fill in all required fields' : 'Пожалуйста, заполните все обязательные поля', 'error');
        return;
    }

    const achievement = {
        id: Date.now(),
        name: name,
        title: title,
        description: description,
        skills: skills.split(',').map(skill => skill.trim()),
        image: image ? URL.createObjectURL(image) : null,
        link: link,
        date: new Date().toLocaleDateString('ru-RU'),
        likes: 0
    };

    achievements.unshift(achievement);
    filteredAchievements = [...achievements];
    
    saveAchievements();
    displayPortfolio();
    
    clearForm();
    
    showNotification(currentLanguage === 'en' ? 'Achievement uploaded successfully!' : 'Достижение успешно загружено!', 'success');
    
    scrollToSection('portfolio');
}

function clearForm() {
    document.getElementById('name').value = '';
    document.getElementById('title').value = '';
    document.getElementById('description').value = '';
    document.getElementById('skills').value = '';
    document.getElementById('image').value = '';
    document.getElementById('link').value = '';
}

function displayPortfolio() {
    const portfolioGrid = document.getElementById('portfolioGrid');
    if (!portfolioGrid) return;

    const portfolioTitle = document.querySelector('#portfolio h2');
    if (portfolioTitle) {
        const titleText = currentLanguage === 'en' ? 'Latest Achievements' : 'Последние достижения';
        portfolioTitle.innerHTML = `${titleText} <span style="font-size: 1rem; color: #6b7280; font-weight: 400;">(${achievements.length})</span>`;
    }

    portfolioGrid.innerHTML = '';

    if (filteredAchievements.length === 0) {
        portfolioGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-ship" style="font-size: 4rem; color: #cbd5e1; margin-bottom: 1rem;"></i>
                <h3>${currentLanguage === 'en' ? 'No achievements yet' : 'Пока нет достижений'}</h3>
                <p>${currentLanguage === 'en' ? 'Be the first to share your project!' : 'Будьте первым, кто поделится своим проектом!'}</p>
            </div>
        `;
        return;
    }

    filteredAchievements.forEach(achievement => {
        const card = createPortfolioCard(achievement);
        portfolioGrid.appendChild(card);
    });
}

function createPortfolioCard(achievement) {
    const card = document.createElement('div');
    card.className = 'portfolio-card fade-in-up';
    
    const imageContent = achievement.image 
        ? `<img src="${achievement.image}" alt="${achievement.title}" style="width: 100%; height: 100%; object-fit: cover;">`
        : `<i class="fas fa-code"></i>`;

    card.innerHTML = `
        <div class="card-image">
            ${imageContent}
        </div>
        <div class="card-content">
            <h3 class="card-title">${achievement.title}</h3>
            <p class="card-author">${currentLanguage === 'en' ? 'Author' : 'Автор'}: ${achievement.name}</p>
            <p class="card-description">${achievement.description}</p>
            <div class="card-skills">
                ${achievement.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
            </div>
            <div class="card-actions">
                ${achievement.link ? `<a href="${achievement.link}" target="_blank" class="card-link">${currentLanguage === 'en' ? 'View Project' : 'Посмотреть проект'}</a>` : ''}
                <button class="btn btn-secondary" onclick="likeAchievement(${achievement.id})" style="margin-left: 10px;">
                    <i class="fas fa-heart"></i> ${achievement.likes}
                </button>
            </div>
            <small style="color: #9ca3af; display: block; margin-top: 10px;">${achievement.date}</small>
        </div>
    `;

    return card;
}

function searchPeople() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    if (!searchTerm.trim()) {
        filteredAchievements = [...achievements];
    } else {
        filteredAchievements = achievements.filter(achievement => 
            achievement.name.toLowerCase().includes(searchTerm) ||
            achievement.title.toLowerCase().includes(searchTerm) ||
            achievement.description.toLowerCase().includes(searchTerm) ||
            achievement.skills.some(skill => skill.toLowerCase().includes(searchTerm))
        );
    }
    
    displayPortfolio();
    displaySearchResults();
}

function displaySearchResults() {
    const searchResults = document.getElementById('searchResults');
    if (!searchResults) return;

    searchResults.innerHTML = '';

    if (filteredAchievements.length === 0) {
        searchResults.innerHTML = `
            <div class="empty-state" style="text-align: center; padding: 2rem;">
                <i class="fas fa-search" style="font-size: 3rem; color: #cbd5e1; margin-bottom: 1rem;"></i>
                <h3>${currentLanguage === 'en' ? 'Nothing found' : 'Ничего не найдено'}</h3>
                <p>${currentLanguage === 'en' ? 'Try changing your search query' : 'Попробуйте изменить поисковый запрос'}</p>
            </div>
        `;
        return;
    }

    filteredAchievements.forEach(achievement => {
        const resultCard = createSearchResultCard(achievement);
        searchResults.appendChild(resultCard);
    });
}

function createSearchResultCard(achievement) {
    const card = document.createElement('div');
    card.className = 'portfolio-card fade-in-up';
    
    const imageContent = achievement.image 
        ? `<img src="${achievement.image}" alt="${achievement.title}" style="width: 100%; height: 100%; object-fit: cover;">`
        : `<i class="fas fa-code"></i>`;

    card.innerHTML = `
        <div class="card-image">
            ${imageContent}
        </div>
        <div class="card-content">
            <h3 class="card-title">${achievement.title}</h3>
            <p class="card-author">${currentLanguage === 'en' ? 'Author' : 'Автор'}: ${achievement.name}</p>
            <p class="card-description">${achievement.description}</p>
            <div class="card-skills">
                ${achievement.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
            </div>
            <div class="card-actions">
                ${achievement.link ? `<a href="${achievement.link}" target="_blank" class="card-link">${currentLanguage === 'en' ? 'View Project' : 'Посмотреть проект'}</a>` : ''}
                <button class="btn btn-secondary" onclick="likeAchievement(${achievement.id})" style="margin-left: 10px;">
                    <i class="fas fa-heart"></i> ${achievement.likes}
                </button>
            </div>
        </div>
    `;

    return card;
}

function filterBySkill(skill) {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = skill;
    }
    
    filteredAchievements = achievements.filter(achievement => 
        achievement.skills.some(s => s.toLowerCase().includes(skill.toLowerCase()))
    );
    
    displayPortfolio();
    displaySearchResults();
}

function likeAchievement(id) {
    const achievement = achievements.find(a => a.id === id);
    if (achievement) {
        achievement.likes++;
        saveAchievements();
        displayPortfolio();
        displaySearchResults();
    }
}

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div style="
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 10px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            z-index: 10000;
            max-width: 300px;
            animation: slideInRight 0.3s ease;
        ">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}" style="margin-right: 8px;"></i>
            ${message}
        </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function clearAllData() {
    if (confirm('Вы уверены, что хотите удалить все данные? Это действие нельзя отменить.')) {
        localStorage.removeItem('portfolioAchievements');
        achievements = [];
        filteredAchievements = [];
        displayPortfolio();
        showNotification(currentLanguage === 'en' ? 'All data cleared' : 'Все данные удалены', 'info');
    }
}

function exportData() {
    const dataStr = JSON.stringify(achievements, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'portfolio-achievements.json';
    link.click();
    URL.revokeObjectURL(url);
    showNotification(currentLanguage === 'en' ? 'Data exported successfully' : 'Данные экспортированы', 'success');
}

function toggleLanguage() {
    currentLanguage = currentLanguage === 'en' ? 'ru' : 'en';
    updateLanguage();
    updatePlaceholders();
}

function updateLanguage() {
    const elements = document.querySelectorAll('[data-en][data-ru]');
    elements.forEach(element => {
        const text = currentLanguage === 'en' ? element.getAttribute('data-en') : element.getAttribute('data-ru');
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            element.placeholder = text;
        } else {
            element.textContent = text;
        }
    });
    
    const langToggle = document.querySelector('.lang-toggle span');
    if (langToggle) {
        langToggle.textContent = currentLanguage === 'en' ? 'RU' : 'EN';
    }
}

function updatePlaceholders() {
    const inputs = document.querySelectorAll('input[data-en-placeholder][data-ru-placeholder]');
    const textareas = document.querySelectorAll('textarea[data-en-placeholder][data-ru-placeholder]');
    
    [...inputs, ...textareas].forEach(element => {
        const placeholder = currentLanguage === 'en' ? element.getAttribute('data-en-placeholder') : element.getAttribute('data-ru-placeholder');
        element.placeholder = placeholder;
    });
}

const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .empty-state {
        text-align: center;
        padding: 3rem;
        color: #6b7280;
    }
    
    .empty-state i {
        display: block;
        margin-bottom: 1rem;
    }
    
    .card-actions {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .nav-menu {
        transition: all 0.3s ease;
    }
    
    .nav-menu.active {
        animation: slideDown 0.3s ease;
    }
    
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

const saved = localStorage.getItem('portfolioAchievements');
if (!saved) {
    const demoAchievements = [
        {
            id: 1,
            name: "Alexey Petrov",
            title: "React E-commerce Store",
            description: "Modern e-commerce store with shopping cart, filters and payment system. Used React, Node.js and MongoDB.",
            skills: ["React", "Node.js", "MongoDB", "JavaScript"],
            image: null,
            link: "https://example.com",
            date: "15.12.2024",
            likes: 12
        },
        {
            id: 2,
            name: "Maria Sidorova",
            title: "Portfolio Website",
            description: "Beautiful single-page portfolio website with animations and responsive design.",
            skills: ["HTML", "CSS", "JavaScript", "GSAP"],
            image: null,
            link: "",
            date: "14.12.2024",
            likes: 8
        },
        {
            id: 3,
            name: "Dmitry Kozlov",
            title: "Chat Application",
            description: "Real-time chat with file sharing and group conversations.",
            skills: ["Socket.io", "Express", "React", "MongoDB"],
            image: null,
            link: "https://chat-app.example.com",
            date: "13.12.2024",
            likes: 15
        }
    ];
    
    achievements = demoAchievements;
    filteredAchievements = [...achievements];
    saveAchievements();
}
