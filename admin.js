document.addEventListener('DOMContentLoaded', () => {
    const page = window.location.pathname.split("/").pop(); // Gets the current HTML file name
    
    if (page === 'index.html' || page === '') {
        handleLoginPage();
    } else if (page === 'dashboard.html') {
        handleDashboardPage();
    } else if (page === 'edit-article.html') {
        handleEditArticlePage();
    }
});

// --- LOGIN PAGE LOGIC ---
function handleLoginPage() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const errorP = document.getElementById('login-error');

            try {
                const response = await fetch('http://localhost:5000/api/admin/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });

                if (!response.ok) {
                    throw new Error('Login failed. Please check your credentials.');
                }

                const data = await response.json();
                localStorage.setItem('authToken', data.token);
                window.location.href = 'dashboard.html';
            } catch (error) {
                errorP.textContent = error.message;
                errorP.style.display = 'block';
            }
        });
    }
}

// --- DASHBOARD PAGE LOGIC ---
function handleDashboardPage() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }
    
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('authToken');
            window.location.href = 'index.html';
        });
    }

    loadArticlesForDashboard();
    loadSiteContentForDashboard(); 
    handleSiteContentForm();
}

async function loadSiteContentForDashboard() {
    try {
        const res = await fetch('http://localhost:5000/api/content');
        const content = await res.json();
        
        // Populate the form with existing data
        document.getElementById('heroTitle').value = content.heroTitle || '';
        document.getElementById('heroDescription').value = content.heroDescription || '';
        document.getElementById('heroImage').value = content.heroImage || '';
        document.getElementById('aboutTitle').value = content.aboutTitle || '';
        document.getElementById('aboutDescription1').value = content.aboutDescription1 || '';
        document.getElementById('aboutDescription2').value = content.aboutDescription2 || '';
        document.getElementById('footerAboutImage').value = content.footerAboutImage || '';
        document.getElementById('footerAboutText').value = content.footerAboutText || '';
    } catch (error) {
        console.error('Failed to load site content for dashboard', error);
    }
}

function handleSiteContentForm() {
    const form = document.getElementById('site-content-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('authToken');
        
        const updatedContent = {
            heroTitle: document.getElementById('heroTitle').value,
            heroDescription: document.getElementById('heroDescription').value,
            heroImage: document.getElementById('heroImage').value,
            aboutTitle: document.getElementById('aboutTitle').value,
            aboutDescription1: document.getElementById('aboutDescription1').value,
            aboutDescription2: document.getElementById('aboutDescription2').value,
            footerAboutImage: document.getElementById('footerAboutImage').value,
            footerAboutText: document.getElementById('footerAboutText').value,
        };

        try {
            const response = await fetch('http://localhost:5000/api/content', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updatedContent)
            });
            if (!response.ok) throw new Error('Failed to save content.');
            alert('Website content updated successfully!');
        } catch (error) {
            alert('Error saving content: ' + error.message);
        }
    });
}

async function loadArticlesForDashboard() {
    const container = document.getElementById('dashboard-articles-container');
    try {
        const response = await fetch('http://localhost:5000/api/articles');
        const articles = await response.json();

        let tableHTML = `
            <table class="admin-table">
                <thead>
                    <tr><th>Title</th><th>Date</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>`;

        articles.forEach(article => {
            tableHTML += `
                <tr>
                    <td>${article.title}</td>
                    <td>${new Date(article.date).toLocaleDateString()}</td>
                    <td>${article.status}</td>
                    <td class="action-buttons">
                        <a href="edit-article.html?id=${article._id}" class="btn-edit">Edit</a>
                        <button class="btn-delete" onclick="deleteArticle('${article._id}')">Delete</button>
                    </td>
                </tr>`;
        });

        tableHTML += '</tbody></table>';
        container.innerHTML = tableHTML;
    } catch (error) {
        container.innerHTML = '<p>Error loading articles.</p>';
    }
}

async function deleteArticle(id) {
    if (!confirm('Are you sure you want to delete this article?')) return;
    
    const token = localStorage.getItem('authToken');
    try {
        const response = await fetch(`http://localhost:5000/api/articles/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to delete.');
        loadArticlesForDashboard();
    } catch (error) {
        alert('Error deleting article: ' + error.message);
    }
}

// --- ADD/EDIT ARTICLE PAGE LOGIC ---
async function handleEditArticlePage() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    const form = document.getElementById('edit-article-form');
    const formTitle = document.getElementById('form-title');
    const articleIdInput = document.getElementById('article-id');
    const urlParams = new URLSearchParams(window.location.search);
    const articleId = urlParams.get('id');

    if (articleId) {
        // --- EDIT MODE ---
        formTitle.textContent = 'Edit Article';
        try {
            // We need to fetch the single article data
            // Let's assume you'll add a route for this, for now we fetch all and filter
            const res = await fetch('http://localhost:5000/api/articles');
            const articles = await res.json();
            const article = articles.find(a => a._id === articleId);

            if (article) {
                articleIdInput.value = article._id;
                document.getElementById('title').value = article.title;
                document.getElementById('date').value = new Date(article.date).toISOString().split('T')[0];
                document.getElementById('imageSrc').value = article.imageSrc;
                document.getElementById('status').value = article.status;
                document.getElementById('description').value = article.description;
                document.getElementById('fullDescription').value = article.fullDescription;
            }
        } catch (error) {
            console.error("Failed to fetch article data", error);
        }
    } else {
        // --- ADD NEW MODE ---
        formTitle.textContent = 'Add New Article';
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const articleData = {
            title: document.getElementById('title').value,
            date: document.getElementById('date').value,
            imageSrc: document.getElementById('imageSrc').value,
            status: document.getElementById('status').value,
            description: document.getElementById('description').value,
            fullDescription: document.getElementById('fullDescription').value,
        };

        const method = articleId ? 'PUT' : 'POST';
        const endpoint = articleId ? `http://localhost:5000/api/articles/${articleId}` : 'http://localhost:5000/api/articles';

        try {
            const response = await fetch(endpoint, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(articleData)
            });
            if (!response.ok) throw new Error('Failed to save the article.');
            window.location.href = 'dashboard.html';
        } catch (error) {
            alert('Error saving article: ' + error.message);
        }
    });
}