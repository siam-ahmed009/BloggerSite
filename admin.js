document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('authToken');

    // Redirect to login if not authenticated
    if (!token && !window.location.pathname.endsWith('index.html') && window.location.pathname !== '/') {
        window.location.href = 'index.html';
        return;
    }

    // --- UNIVERSAL ADMIN LOGIC ---
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('authToken');
            window.location.href = 'index.html';
        });
    }

    // --- LOGIN PAGE LOGIC ---
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
                const data = await response.json();
                if (!response.ok) throw new Error(data.message || 'Login failed.');
                
                localStorage.setItem('authToken', data.token);
                window.location.href = 'dashboard.html';
            } catch (error) {
                errorP.textContent = error.message;
                errorP.style.display = 'block';
            }
        });
    }
    
    // --- DASHBOARD PAGE LOGIC ---
    if (window.location.pathname.endsWith('dashboard.html')) {
        // Section visibility toggling
        const sectionSelector = document.getElementById('section-selector');
        const sections = document.querySelectorAll('.dashboard-section');

        sectionSelector.addEventListener('change', () => {
            sections.forEach(section => section.classList.add('hidden'));
            const selectedSection = document.getElementById(sectionSelector.value);
            if (selectedSection) {
                selectedSection.classList.remove('hidden');
            }
        });
        
        // Manually trigger change to show the first section by default
        sectionSelector.dispatchEvent(new Event('change'));

        // Initialize all dashboard functionalities
        handleArticleManagement(token);
        handleMessageManagement(token);
        handleSiteContentForm(token);
    }
});

// --- SITE CONTENT MANAGEMENT ---
function handleSiteContentForm(token) {
    const form = document.getElementById('site-content-form');
    if (!form) return;

    const fields = ['heroTitle', 'heroDescription', 'aboutTitle', 'aboutDescription1', 'footerAboutText'];

    // Load existing content into the form
    fetch('/api/site-content')
        .then(res => res.json())
        .then(data => {
            fields.forEach(field => {
                const element = document.getElementById(field);
                if (element && data) element.value = data[field] || '';
            });
        }).catch(err => console.error('Failed to load site content:', err));

    // Handle form submission to update content
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const body = {};
        fields.forEach(field => {
            const element = document.getElementById(field);
            if(element) body[field] = element.value;
        });

        try {
            const res = await fetch('/api/site-content', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(body)
            });
            if (!res.ok) throw new Error('Failed to update content.');
            alert('Content updated successfully!');
        } catch (error) {
            alert(error.message);
        }
    });
}

// --- ARTICLE MANAGEMENT ---
function handleArticleManagement(token) {
    const articleForm = document.getElementById('article-form');
    const articleList = document.getElementById('article-list');
    const articleIdInput = document.getElementById('article-id');

    const resetArticleForm = () => {
        articleForm.reset();
        articleIdInput.value = '';
    };

    const loadArticles = async () => {
        try {
            const res = await fetch('/api/articles');
            const articles = await res.json();
            articleList.innerHTML = `
                <table class="admin-table">
                    <thead><tr><th>Title</th><th>Author</th><th>Published</th><th>Actions</th></tr></thead>
                    <tbody>
                        ${articles.map(article => `
                            <tr>
                                <td>${article.title}</td>
                                <td>${article.author || 'N/A'}</td>
                                <td>${article.published ? 'Yes' : 'No'}</td>
                                <td class="action-buttons">
                                    <button class="btn-edit" data-id="${article._id}">Edit</button>
                                    <button class="btn-delete" data-id="${article._id}">Delete</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>`;
        } catch (error) {
            articleList.innerHTML = '<p>Could not load articles.</p>';
        }
    };

    articleForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = articleIdInput.value;
        const formData = new FormData(articleForm);
        // Correctly handle checkbox value for FormData
        formData.set('published', document.getElementById('article-published').checked);
        
        const url = id ? `/api/articles/${id}` : '/api/articles';
        const method = id ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            if (!res.ok) throw new Error('Failed to save article.');
            resetArticleForm();
            loadArticles();
        } catch (error) {
            alert(error.message);
        }
    });

    articleList.addEventListener('click', async (e) => {
        const target = e.target;
        const id = target.dataset.id;

        if (target.classList.contains('btn-edit')) {
            const res = await fetch(`/api/articles/${id}`);
            const article = await res.json();
            articleIdInput.value = article._id;
            document.getElementById('article-title').value = article.title;
            document.getElementById('article-content').value = article.content;
            document.getElementById('article-author').value = article.author;
            document.getElementById('article-published').checked = article.published;
            document.getElementById('article-form').scrollIntoView({ behavior: 'smooth' });
        }

        if (target.classList.contains('btn-delete')) {
            if (!confirm('Are you sure you want to delete this article?')) return;
            await fetch(`/api/articles/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            loadArticles();
        }
    });

    loadArticles();
}

// --- MESSAGE MANAGEMENT ---
function handleMessageManagement(token) {
    const messageList = document.getElementById('message-list');
    const modal = document.getElementById('reply-modal');
    const replyForm = document.getElementById('reply-form');
    const closeModalBtn = modal.querySelector('.close-button');

    const loadMessages = async () => {
        const res = await fetch('/api/contact/messages', { headers: { 'Authorization': `Bearer ${token}` }});
        const messages = await res.json();
        messageList.innerHTML = messages.map(msg => `
            <div class="message-item">
                <p><strong>From:</strong> ${msg.name} (${msg.email})</p>
                <p><strong>Subject:</strong> ${msg.subject}</p>
                <p>${msg.message}</p>
                <p><strong>Status:</strong> ${msg.responded ? 'Responded' : 'New'}</p>
                <button class="reply-btn" data-id="${msg._id}" data-email="${msg.email}" data-subject="${msg.subject}">Reply</button>
            </div>
        `).join('');
    };

    messageList.addEventListener('click', (e) => {
        if (e.target.classList.contains('reply-btn')) {
            modal.style.display = 'block';
            document.getElementById('reply-message-id').value = e.target.dataset.id;
            document.getElementById('reply-to-email').value = e.target.dataset.email;
            document.getElementById('reply-subject').value = `Re: ${e.target.dataset.subject}`;
        }
    });

    replyForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const replyData = {
            messageId: document.getElementById('reply-message-id').value,
            to: document.getElementById('reply-to-email').value,
            subject: document.getElementById('reply-subject').value,
            text: document.getElementById('reply-text').value
        };
        await fetch('/api/contact/reply', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(replyData)
        });
        modal.style.display = 'none';
        replyForm.reset();
        loadMessages();
    });
    
    closeModalBtn.addEventListener('click', () => modal.style.display = 'none');
    window.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
    });

    loadMessages();
    
}