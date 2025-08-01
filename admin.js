document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('authToken');
    const API_BASE_URL = 'http://localhost:5000'; // Use a consistent base URL

    if (!token && !window.location.pathname.endsWith('index.html') && window.location.pathname !== '/') {
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
    
    if (window.location.pathname.endsWith('dashboard.html')) {
        const sectionSelector = document.getElementById('section-selector');
        const sections = document.querySelectorAll('.dashboard-section');

        sectionSelector.addEventListener('change', () => {
            sections.forEach(s => s.classList.add('hidden'));
            document.getElementById(sectionSelector.value)?.classList.remove('hidden');
        });
        sectionSelector.dispatchEvent(new Event('change'));

        initArticleManagement(token, API_BASE_URL);
        initMessageManagement(token, API_BASE_URL);
        initSiteContentForm(token, API_BASE_URL);
    }
});

function initSiteContentForm(token, baseUrl) {
    const form = document.getElementById('site-content-form');
    if (!form) return;
    const fields = ['heroTitle', 'heroDescription', 'aboutTitle', 'aboutDescription1', 'footerAboutText'];

    fetch(`${baseUrl}/api/site-content`).then(res => res.json()).then(data => {
        fields.forEach(field => {
            const el = document.getElementById(field);
            if (el && data) el.value = data[field] || '';
        });
    }).catch(err => console.error('Site Content Load Error:', err));

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const body = {};
        fields.forEach(f => { body[f] = document.getElementById(f)?.value; });

        try {
            const res = await fetch(`${baseUrl}/api/site-content`, {
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

function initArticleManagement(token, baseUrl) {
    const form = document.getElementById('article-form');
    const list = document.getElementById('article-list');
    const idInput = document.getElementById('article-id');
    const resetForm = () => { form.reset(); idInput.value = ''; };

    const loadArticles = async () => {
        const res = await fetch(`${baseUrl}/api/articles`);
        const articles = await res.json();
        list.innerHTML = `
            <table class="admin-table">
                <thead><tr><th>Title</th><th>Published</th><th>Actions</th></tr></thead>
                <tbody>
                    ${articles.map(a => `
                        <tr>
                            <td>${a.title}</td>
                            <td>${a.published ? 'Yes' : 'No'}</td>
                            <td class="action-buttons">
                                <button class="btn-edit" data-id="${a._id}">Edit</button>
                                <button class="btn-delete" data-id="${a._id}">Delete</button>
                            </td>
                        </tr>`).join('')}
                </tbody>
            </table>`;
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = idInput.value;
        const formData = new FormData(form);
        const url = id ? `${baseUrl}/api/articles/${id}` : `${baseUrl}/api/articles`;
        const method = id ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, { 
                method, 
                headers: { 'Authorization': `Bearer ${token}` }, // No 'Content-Type'
                body: formData 
            });
            if (!res.ok) throw new Error((await res.json()).message || 'Failed to save article.');
            resetForm();
            loadArticles();
        } catch (error) {
            alert(error.message);
        }
    });

    list.addEventListener('click', async (e) => {
        const id = e.target.dataset.id;
        if (e.target.matches('.btn-edit')) {
            const res = await fetch(`${baseUrl}/api/articles/${id}`);
            const a = await res.json();
            idInput.value = a._id;
            document.getElementById('article-title').value = a.title;
            document.getElementById('article-content').value = a.content;
            document.getElementById('article-author').value = a.author;
            document.getElementById('article-published').checked = a.published;
        } else if (e.target.matches('.btn-delete')) {
            if (!confirm('Are you sure?')) return;
            await fetch(`${baseUrl}/api/articles/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
            loadArticles();
        }
    });
    loadArticles();
}


function initMessageManagement(token, baseUrl) {
    const list = document.getElementById('message-list');
    const modal = document.getElementById('reply-modal');
    const form = document.getElementById('reply-form');
    const closeModalBtn = modal.querySelector('.close-button');

    const loadMessages = async () => {
        const res = await fetch(`${baseUrl}/api/contact/messages`, { headers: { 'Authorization': `Bearer ${token}` } });
        const messages = await res.json();
        list.innerHTML = messages.map(msg => `
            <div class="message-item">
                <p><strong>From:</strong> ${msg.name} (${msg.email})</p>
                <p><strong>Subject:</strong> ${msg.subject}</p>
                <p>${msg.message}</p>
                <p><strong>Status:</strong> ${msg.responded ? 'Responded' : 'New'}</p>
                <button class="reply-btn" data-id="${msg._id}" data-email="${msg.email}" data-subject="${msg.subject}">Reply</button>
            </div>`).join('');
    };

    list.addEventListener('click', e => {
        if (e.target.matches('.reply-btn')) {
            modal.style.display = 'block';
            document.getElementById('reply-message-id').value = e.target.dataset.id;
            document.getElementById('reply-to-email').value = e.target.dataset.email;
            document.getElementById('reply-subject').value = `Re: ${e.target.dataset.subject}`;
        }
    });

    form.addEventListener('submit', async e => {
        e.preventDefault();
        const data = {
            messageId: document.getElementById('reply-message-id').value,
            to: document.getElementById('reply-to-email').value,
            subject: document.getElementById('reply-subject').value,
            text: document.getElementById('reply-text').value
        };
        await fetch(`${baseUrl}/api/contact/reply`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(data)
        });
        modal.style.display = 'none';
        form.reset();
        loadMessages();
    });
    
    closeModalBtn.addEventListener('click', () => modal.style.display = 'none');
    loadMessages();
}