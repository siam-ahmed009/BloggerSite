document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        // If on any page other than login and no token, redirect
        if (!window.location.pathname.endsWith('index.html') && window.location.pathname !== '/') {
            window.location.href = 'index.html';
        }
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

            try {
                const response = await fetch('http://localhost:5000/api/admin/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.message || 'Login failed');
                
                localStorage.setItem('authToken', data.token);
                window.location.href = 'dashboard.html';
            } catch (error) {
                alert(error.message);
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

        // Initialize all functionality
        handleArticleManagement(token);
        handleMessageManagement(token);
        // Add your site content management function call here
        // handleSiteContentForm(token);
    }
});


// --- ARTICLE MANAGEMENT ---
function handleArticleManagement(token) {
    const articleForm = document.getElementById('article-form');
    const articleList = document.getElementById('article-list');
    const articleIdInput = document.getElementById('article-id');
    const clearFormBtn = document.getElementById('clear-article-form-btn');

    const resetArticleForm = () => {
        articleForm.reset();
        articleIdInput.value = '';
    };

    // Load articles into the table
    const loadArticles = async () => {
        const res = await fetch('http://localhost:5000/api/articles');
        const articles = await res.json();
        articleList.innerHTML = `
            <table class="admin-table">
                <thead><tr><th>Title</th><th>Author</th><th>Published</th><th>Actions</th></tr></thead>
                <tbody>
                    ${articles.map(article => `
                        <tr>
                            <td>${article.title}</td>
                            <td>${article.author}</td>
                            <td>${article.published ? 'Yes' : 'No'}</td>
                            <td class="action-buttons">
                                <button class="btn-edit" data-id="${article._id}">Edit</button>
                                <button class="btn-delete" data-id="${article._id}">Delete</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>`;
    };

    // Handle form submission (Create or Update)
    articleForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const articleId = articleIdInput.value;
        const formData = new FormData();
        formData.append('title', document.getElementById('article-title').value);
        formData.append('content', document.getElementById('article-content').value);
        formData.append('author', document.getElementById('article-author').value);
        formData.append('published', document.getElementById('article-published').checked);
        
        const imageFile = document.getElementById('article-image').files[0];
        if (imageFile) {
            formData.append('image', imageFile);
        }

        const url = articleId ? `http://localhost:5000/api/articles/${articleId}` : 'http://localhost:5000/api/articles';
        const method = articleId ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, { method, headers: { 'Authorization': `Bearer ${token}` }, body: formData });
            if (!res.ok) throw new Error('Failed to save article.');
            resetArticleForm();
            loadArticles();
        } catch (error) {
            alert(error.message);
        }
    });

    // Handle clicks on Edit and Delete buttons
    articleList.addEventListener('click', async (e) => {
        const target = e.target;
        const id = target.dataset.id;

        // Edit button
        if (target.classList.contains('btn-edit')) {
            const res = await fetch(`http://localhost:5000/api/articles/${id}`);
            const article = await res.json();
            articleIdInput.value = article._id;
            document.getElementById('article-title').value = article.title;
            document.getElementById('article-content').value = article.content;
            document.getElementById('article-author').value = article.author;
            document.getElementById('article-published').checked = article.published;
            window.scrollTo(0, 0); // Scroll to top to see the form
        }

        // Delete button
        if (target.classList.contains('btn-delete')) {
            if (!confirm('Are you sure you want to delete this article?')) return;
            try {
                const res = await fetch(`http://localhost:5000/api/articles/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!res.ok) throw new Error('Failed to delete article.');
                loadArticles();
            } catch (error) {
                alert(error.message);
            }
        }
    });

    clearFormBtn.addEventListener('click', resetArticleForm);
    loadArticles(); // Initial load
}


// --- MESSAGE MANAGEMENT ---
function handleMessageManagement(token) {
    const messageList = document.getElementById('message-list');
    const modal = document.getElementById('reply-modal');
    const closeModalBtn = modal.querySelector('.close-button');
    const replyForm = document.getElementById('reply-form');

    const loadMessages = async () => {
        const res = await fetch('http://localhost:5000/api/contact/messages', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
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
            document.getElementById('reply-message-id').value = e.target.dataset.id;
            document.getElementById('reply-to-email').value = e.target.dataset.email;
            document.getElementById('reply-subject').value = `Re: ${e.target.dataset.subject}`;
            modal.style.display = 'block';
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

        try {
            const res = await fetch('http://localhost:5000/api/contact/reply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(replyData)
            });
            if (!res.ok) throw new Error('Failed to send reply.');
            modal.style.display = 'none';
            replyForm.reset();
            loadMessages();
        } catch (error) {
            alert(error.message);
        }
    });

    closeModalBtn.addEventListener('click', () => modal.style.display = 'none');
    window.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
    });

    loadMessages(); // Initial load
}