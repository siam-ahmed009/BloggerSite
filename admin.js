
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('authToken');
    const API_BASE_URL = 'http://localhost:5000';

    if (!token && !window.location.pathname.endsWith('index.html')) {
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

    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            try {
                const response = await fetch(`${API_BASE_URL}/api/admin/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.message || 'Login failed.');
                localStorage.setItem('authToken', data.token);
                window.location.href = 'dashboard.html';
            } catch (error) {
                alert(error.message);
            }
        });
    }

    if (window.location.pathname.endsWith('dashboard.html')) {
        const navLinks = document.querySelectorAll('.admin-nav-link');
        const sections = document.querySelectorAll('.dashboard-section');

        const hideAllSections = () => {
            sections.forEach(s => s.classList.add('hidden'));
        };

        const showSection = (sectionId) => {
            hideAllSections();
            const sectionToShow = document.getElementById(sectionId);
            if (sectionToShow) {
                sectionToShow.classList.remove('hidden');
            }
        };

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                if (e.target.dataset.section) {
                    e.preventDefault();
                    navLinks.forEach(navLink => navLink.classList.remove('active'));
                    e.target.classList.add('active');
                    showSection(e.target.dataset.section);
                }
            });
        });

        handleSiteContentNav();

        showSection('dashboard-home-section');

        initArticleManagement(token, API_BASE_URL);
        initMessageManagement(token, API_BASE_URL);
        initSiteContentForm(token, API_BASE_URL);
    }
});

function handleSiteContentNav() {
    const navButtons = document.querySelectorAll('.content-nav-btn');
    const contentPanels = document.querySelectorAll('.content-panel');

    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            contentPanels.forEach(panel => panel.classList.add('hidden'));
            const targetSectionId = button.dataset.contentSection;
            const targetSection = document.getElementById(targetSectionId);
            if (targetSection) {
                targetSection.classList.remove('hidden');
            }
        });
    });
}


function initSiteContentForm(token, baseUrl) {
    const form = document.getElementById('site-content-form');
    if (!form) return;
    const fields = ['heroTitle', 'heroDescription', 'aboutTitle', 'aboutDescription1', 'footerAboutText'];

    // CORRECTED: Added Authorization header to the initial GET request
    fetch(`${baseUrl}/api/site-content`, {
        headers: { 'Authorization': `Bearer ${token}` }
    }).then(res => res.json()).then(data => {
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

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("article-form");
  const list = document.getElementById("article-list");

  async function loadArticles() {
    try {
      const res = await fetch("http://localhost:5000/api/articles");
      const articles = await res.json();
      list.innerHTML = articles.map(a => `
        <div style="border:1px solid #ccc;padding:10px;margin-bottom:10px">
          <h3>${a.title}</h3>
          <p>${a.content.substring(0,100)}...</p>
          <button onclick="editArticle('${a._id}')">Edit</button>
        </div>
      `).join('');
    } catch (err) {
      list.innerHTML = "<p style='color:red'>Error loading articles.</p>";
    }
  }

  window.editArticle = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/articles/${id}`);
      const a = await res.json();
      document.getElementById("article-id").value = a._id;
      document.getElementById("article-title").value = a.title;
      document.getElementById("article-author").value = a.author;
      document.getElementById("article-content").value = a.content;
      document.getElementById("article-published").checked = a.published;
    } catch (err) {
      alert("Failed to load article for editing.");
    }
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("article-id").value;
    const data = new FormData();
    data.append("title", document.getElementById("article-title").value);
    data.append("author", document.getElementById("article-author").value);
    data.append("content", document.getElementById("article-content").value);
    data.append("published", document.getElementById("article-published").checked);
    const image = document.getElementById("article-image").files[0];
    if (image) data.append("image", image);

    try {
      const response = await fetch(
        `http://localhost:5000/api/articles${id ? '/' + id : ''}`,
        {
          method: id ? "PUT" : "POST",
          body: data
        }
      );
      const result = await response.json();
      alert(result.message || "Saved!");
      form.reset();
      loadArticles();
    } catch (err) {
      alert("Error saving article: " + err.message);
    }
  });

  loadArticles();
});

function initMessageManagement(token, baseUrl) {
    const list = document.getElementById('message-list');
    const modal = document.getElementById('reply-modal');
    const form = document.getElementById('reply-form');
    const closeModalBtn = modal.querySelector('.close-button');

    const loadMessages = async () => {
        try {
            // This fetch request already had the Authorization header
            const res = await fetch(`${baseUrl}/api/contact/messages`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (!res.ok) throw new Error('Failed to load messages.');
            // const messages = await res.json();
             if (!messages || messages.length === 0) {
                list.innerHTML = `<p class="no-messages-found">No messages found.</p>`;
                return;
            }
            list.innerHTML = messages.map(msg => `
                <div class="message-item">
                    <p><strong>From:</strong> ${msg.name} (${msg.email})</p>
                    <p><strong>Subject:</strong> ${msg.subject}</p>
                    <p>${msg.message}</p>
                    <p><strong>Status:</strong> ${msg.responded ? 'Responded' : 'New'}</p>
                    <button class="reply-btn" data-id="${msg._id}" data-email="${msg.email}" data-subject="${msg.subject}">Reply</button>
                </div>`).join('');
        } catch (error) {
            list.innerHTML = `<p style="color:red;">${error.message}</p>`;
        }
    };

    list.addEventListener('click', e => {
        if (e.target.matches('.reply-btn')) {
            modal.style.display = 'block';
            document.getElementById('reply-message-id').value = e.target.dataset.id;
            document.getElementById('reply-to-email').value = e.target.dataset.email;
            document.getElementById('reply-subject').value = `Re: ${e.target.dataset.subject}`;
        }
    });

   if (form) {
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
    }
    
    closeModalBtn.addEventListener('click', () => modal.style.display = 'none');
    loadMessages();
}