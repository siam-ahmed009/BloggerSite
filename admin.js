document.addEventListener('DOMContentLoaded', () => {
  const page = window.location.pathname.split("/").pop();

  if (page === 'index.html' || page === '') {
    handleLoginPage();
  } else if (page === 'dashboard.html') {
    handleDashboardPage();
  } else if (page === 'edit-article.html') {
    handleEditArticlePage();
  }
});
const articleImageInput = document.getElementById('articleImage');
if (articleImageInput) {
  articleImageInput.addEventListener('change', function (e) {
    const file = e.target.files[0];
    const preview = document.getElementById('article-preview');
    const hiddenInput = document.getElementById('imageSrc');

    if (file) {
      const reader = new FileReader();
      reader.onload = function (evt) {
        const base64 = evt.target.result;
        preview.src = base64;
        preview.style.display = 'block';
        hiddenInput.value = base64; // store base64 image
      };
      reader.readAsDataURL(file);
    } else {
      preview.style.display = 'none';
    }
  });
}


// --- LOGIN PAGE ---
function handleLoginPage() {
  const loginForm = document.getElementById('login-form');
  if (!loginForm) return;

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorP = document.getElementById('login-error');

    try {
      const res = await fetch('http://localhost:5000/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (!res.ok) throw new Error('Login failed. Please check credentials.');

      const data = await res.json();
      localStorage.setItem('authToken', data.token);
      window.location.href = 'dashboard.html';
    } catch (error) {
      errorP.textContent = error.message;
      errorP.style.display = 'block';
    }
  });
}

// --- DASHBOARD PAGE ---
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

   showSection('hero');
  loadSiteContentForDashboard();  // Load existing content into forms
  setupSiteContentFormHandlers(); // <-- Call the working form logic
  loadArticlesForDashboard();
  fetchMessages();
}
function toggleSidebar() {
  const sidebar = document.querySelector('.sidebar');
  sidebar.classList.toggle('active');
}
// --- DROPDOWN + NAVIGATION ---
function toggleDropdown() {
  const dropdown = document.getElementById('site-content-dropdown');
  dropdown.style.display = dropdown.style.display === 'flex' ? 'none' : 'flex';
}

// Replace the old function with this new one
function showSection(sectionId) {
  // Hide all other sections
  document.querySelectorAll('.admin-section').forEach(section => {
    section.style.display = 'none';
  });

  // Show the requested section
  const sectionToShow = document.getElementById(sectionId);
  if (sectionToShow) {
    sectionToShow.style.display = 'block';
  }

  // --- NEW CODE ---
  // Get the sidebar element
  const sidebar = document.querySelector('.sidebar');

  // Check if the sidebar is active (open on mobile) and close it
  if (sidebar.classList.contains('active')) {
    sidebar.classList.remove('active');
  }
}

// --- HERO IMAGE PREVIEW ---
const heroImageInput = document.getElementById('heroImage');
if (heroImageInput) {
  heroImageInput.addEventListener('change', function (e) {
    const file = e.target.files[0];
    const preview = document.getElementById('hero-preview');
    const hiddenInput = document.getElementById('heroImageData');
    if (file) {
      const reader = new FileReader();
      reader.onload = function (evt) {
        const base64 = evt.target.result;
        preview.src = base64;
        preview.style.display = 'block';
        hiddenInput.value = base64; // Store base64 image data
      };
      reader.readAsDataURL(file);
    } else {
      preview.style.display = 'none';
    }
  });
}

// --- SITE CONTENT LOAD ---
// Load site content on dashboard
async function loadSiteContentForDashboard() {
  try {
    const res = await fetch('http://localhost:5000/api/content');
    const content = await res.json();

    document.getElementById('heroTitle').value = content.heroTitle || '';
    document.getElementById('heroDescription').value = content.heroDescription || '';
    document.getElementById('aboutTitle').value = content.aboutTitle || '';
    document.getElementById('aboutDescription1').value = content.aboutDescription1 || '';
    document.getElementById('aboutDescription2').value = content.aboutDescription2 || '';
    document.getElementById('footerAboutImage').value = content.footerAboutImage || '';
    document.getElementById('footerAboutText').value = content.footerAboutText || '';
  } catch (error) {
    console.error('Failed to load site content:', error);
  }
}

// Save logic for each individual section
function setupSiteContentFormHandlers() {
  const heroForm = document.getElementById('hero-form');
  const aboutForm = document.getElementById('about-form');
  const footerForm = document.getElementById('footer-form');

  const token = localStorage.getItem('authToken');

  if (heroForm) {
    heroForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const updatedContent = {
        heroTitle: document.getElementById('heroTitle').value,
        heroDescription: document.getElementById('heroDescription').value,
        aboutTitle: document.getElementById('aboutTitle')?.value || '',
        aboutDescription1: document.getElementById('aboutDescription1')?.value || '',
        aboutDescription2: document.getElementById('aboutDescription2')?.value || '',
        footerAboutImage: document.getElementById('footerAboutImage')?.value || '',
        footerAboutText: document.getElementById('footerAboutText')?.value || ''
      };

      const heroImageInput = document.getElementById('heroImage');
      const file = heroImageInput.files[0];

      if (file) {
        const reader = new FileReader();
        reader.onload = async function (evt) {
          updatedContent.heroImage = evt.target.result; // Base64

          try {
            const res = await fetch('http://localhost:5000/api/content', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify(updatedContent)
            });

            if (!res.ok) throw new Error('Failed to update site content');
            alert('Content updated successfully!');
          } catch (err) {
            alert('Error: ' + err.message);
          }
        };
        reader.readAsDataURL(file);
      } else {
        try {
          const res = await fetch('http://localhost:5000/api/content', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updatedContent)
          });

          if (!res.ok) throw new Error('Failed to update site content');
          alert('Content updated successfully!');
        } catch (err) {
          alert('Error: ' + err.message);
        }
      }
    });

    const footerImageInput = document.getElementById('footerImage');
if (footerImageInput) {
  footerImageInput.addEventListener('change', function (e) {
    const file = e.target.files[0];
    const preview = document.getElementById('footer-preview');
    const hiddenInput = document.getElementById('footerAboutImage');
    if (file) {
      const reader = new FileReader();
      reader.onload = function (evt) {
        const base64 = evt.target.result;
        preview.src = base64;
        preview.style.display = 'block';
        hiddenInput.value = base64; // Store base64 image
      };
      reader.readAsDataURL(file);
    } else {
      preview.style.display = 'none';
    }
  });
}

  }

  
  // ABOUT FORM
  
  if (aboutForm) {
    aboutForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        aboutTitle: document.getElementById('aboutTitle').value,
        aboutDescription1: document.getElementById('aboutDescription1').value,
        aboutDescription2: document.getElementById('aboutDescription2').value
      };

      try {
        const res = await fetch('http://localhost:5000/api/content', {
          method: 'PUT', 
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error('Failed to update about section');
        alert('About section updated!');
      } catch (err) {
        alert('Error updating About: ' + err.message);
      }
    });
  }

  // FOOTER FORM
  if (footerForm) {
    footerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        footerAboutImage: document.getElementById('footerAboutImage').value,
        footerAboutText: document.getElementById('footerAboutText').value
      };

      try {
        const res = await fetch('http://localhost:5000/api/content', {
          method: 'PUT', 
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error('Failed to update footer section');
        alert('Footer section updated!');
      } catch (err) {
        alert('Error updating Footer: ' + err.message);
      }
    });
  }
}


// --- ARTICLES DASHBOARD ---
async function loadArticlesForDashboard() {
  const container = document.getElementById('dashboard-articles-container');
  try {
    const res = await fetch('http://localhost:5000/api/articles');
    const articles = await res.json();

    let html = `
      <table class="admin-table">
        <thead><tr><th>Title</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>`;

   articles.forEach(article => {
      // Only render row if article has a valid _id
      if (article && article._id) {
        html += `
          <tr>
            <td>${article.title || '(Untitled)'}</td>
            <td>${article.date ? new Date(article.date).toLocaleDateString() : '—'}</td>
            <td>${article.status || 'Draft'}</td>
            <td>
              <a href="edit-article.html?id=${article._id}" class="btn-edit">Edit</a>
              <button onclick="deleteArticle('${article._id}')" class="btn-delete">Delete</button>
            </td>
          </tr>`;
      }
    });

    html += '</tbody></table>';
    container.innerHTML = html;
  } catch (err) {
     console.error('Error loading articles:', err);
    container.innerHTML = '<p>Error loading articles.</p>';
  }
}

async function deleteArticle(id) {
  if (!confirm('Delete this article?')) return;

  const token = localStorage.getItem('authToken');
  try {
    const res = await fetch(`http://localhost:5000/api/articles/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!res.ok) throw new Error('Failed to delete article');
    loadArticlesForDashboard();
  } catch (err) {
    alert('Error deleting: ' + err.message);
  }
}

function handleEditArticlePage() {
  
  const form = document.getElementById('edit-article-form');
  if (!form) return; // prevent null errors

   const token = localStorage.getItem('authToken'); // ✅ ensure token exists
  if (!token) {
    window.location.href = 'index.html'; // redirect to login if missing
    return;
  }
  const urlParams = new URLSearchParams(window.location.search);
  const articleId = urlParams.get('id');

  // If editing an article
  if (articleId) {
    fetch(`http://localhost:5000/api/articles/${articleId}`)
      .then(async res => {
        if (!res.ok) {
          throw new Error(`Article not found (status ${res.status})`);
        }
        return res.json();
      })
      .then(article => {
        document.getElementById('form-title').textContent = 'Edit Article';
        document.getElementById('article-id').value = article._id;
        document.getElementById('title').value = article.title || '';
        document.getElementById('date').value = article.date ? article.date.split('T')[0] : '';
        document.getElementById('imageSrc').value = article.imageSrc || '';
        document.getElementById('description').value = article.description || '';
        document.getElementById('fullDescription').value = article.fullDescription || '';
        document.getElementById('status').value = article.status || '';

        if (article.photocardImage) {
            document.getElementById('photocard-preview').src = article.photocardImage;
            document.getElementById('photocard-preview').style.display = 'block';
            document.getElementById('photocardImageSrc').value = article.photocardImage;
        }

        // Show/hide photocard based on status
        const photoContainer = document.getElementById('photocard-container');
        if (article.status === 'Published') {
          photoContainer.style.display = 'block';
        } else {
          photoContainer.style.display = 'none';
        }

        // Add status change listener
        const statusDropdown = document.getElementById('status');
        if (statusDropdown) {
          statusDropdown.addEventListener('change', function () {
            photoContainer.style.display = this.value === 'Published' ? 'block' : 'none';
          });
        }
      })
      .catch(err => {
        alert('Error loading article: ' + err.message);
        window.location.href = 'dashboard.html';
      });
  }

  const photocardImageInput = document.getElementById('photocardImage');
  if (photocardImageInput) {
    photocardImageInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      const preview = document.getElementById('photocard-preview');
      const hiddenInput = document.getElementById('photocardImageSrc');

      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          preview.src = event.target.result;
          preview.style.display = 'block';
          hiddenInput.value = event.target.result; // store base64 image
        };
        reader.readAsDataURL(file);
      } else {
        preview.style.display = 'none';
      }
    });
  }
      
  // Form submission handler
  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const payload = {
      title: document.getElementById('title').value,
      date: document.getElementById('date').value,
      imageSrc: document.getElementById('imageSrc').value,
      description: document.getElementById('description').value,
      fullDescription: document.getElementById('fullDescription').value,
      status: document.getElementById('status').value,
      photocardImage: document.getElementById('status').value === 'Published' 
        ? (document.getElementById('photocardImageSrc') ? document.getElementById('photocardImageSrc').value : '')
        : ''
    };

    try {
      const method = articleId ? 'PUT' : 'POST';
      const endpoint = articleId
        ? `http://localhost:5000/api/articles/${articleId}`
        : `http://localhost:5000/api/articles`;

      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Failed to save article');

      alert('Article saved successfully!');
      window.location.href = 'dashboard.html';
    } catch (err) {
      alert('Error saving article: ' + err.message);
    }
  });
}


const API_BASE = 'http://localhost:5000/api';

async function fetchMessages() {
  const container = document.getElementById('messages-container');
  if (!container) return;

  const token = localStorage.getItem('authToken'); // ✅ Get stored token
if (!token) {
    container.innerHTML = '<p style="color:orange;">Not authenticated. Please login.</p>';
    return;
  }



  try {
    const res = await fetch(`${API_BASE}/messages`, {
      headers: {
        'Authorization': `Bearer ${token}` // ✅ Pass token for authenticateAdmin
      }
    });

    if (res.status === 401 || res.status === 403) {
      container.innerHTML = '<p style="color:red;">Unauthorized. Please login again.</p>';
      return;
    }



    if (!res.ok) throw new Error(`Server error (${res.status})`);

    const messages = await res.json();
    container.innerHTML = '';


    (messages || []).forEach(msg => {
      const card = document.createElement('div');
      card.className = 'message-card';
      card.style = 'display: flex; justify-content: space-between; align-items: center; border: 1px solid #ccc; padding: 1rem; margin-bottom: 1rem;';
      card.innerHTML = `
        <div>
            <p><strong>Name:</strong> ${escapeHtml(msg.name)}</p>
            <p><strong>Email:</strong> ${escapeHtml(msg.email)}</p>
        </div>
        <button class="reply-button" 
          data-id="${msg._id}" 
          data-name="${escapeHtml(msg.name)}" 
          data-email="${escapeHtml(msg.email)}" 
          data-subject="${escapeHtml(msg.subject)}" 
          data-message="${escapeHtml(msg.message)}">
          Reply
        </button>`;
      container.appendChild(card);
    });

  } catch (err) {
    console.error('Error loading messages:', err);
    container.innerHTML = `<p style="color:red;">Failed to load messages: ${escapeHtml(err.message)}</p>`;
  }
}

// Simple HTML-escape to avoid accidental XSS when injecting user data
function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Use event delegation to open reply modal (safe even if messages are rendered later)
document.addEventListener('click', (e) => {
  const btn = e.target.closest && e.target.closest('.reply-button');
  if (!btn) return;

  const id = btn.dataset.id;
  const name = btn.dataset.name;
  const email = btn.dataset.email;
  const subject = btn.dataset.subject;
  const message = btn.dataset.message;

  // Fill modal content
  const modal = document.getElementById('replyModal');
  if (!modal) {
    console.warn('replyModal not found in DOM.');
    return;
  }

  document.getElementById('modal-name').textContent = name || '';
  document.getElementById('modal-email').textContent = email || '';
  document.getElementById('modal-subject').textContent = subject || '';
  document.getElementById('modal-message').textContent = message || '';
  document.getElementById('modal-reply-text').value = '';

  // store id on the send button (or modal) for later
  const sendBtn = document.getElementById('send-reply-modal-btn');
  if (sendBtn) sendBtn.dataset.messageId = id;

  // show modal
  modal.style.display = 'flex';
});

// Safe attachment of send-reply handler (only if element exists)
(function attachSendReplyHandler() {
  const sendBtn = document.getElementById('send-reply-modal-btn');
  if (!sendBtn) {
    // If button isn't present yet, try again shortly (useful during dev when scripts load before markup)
    document.addEventListener('DOMContentLoaded', () => {
      const retryBtn = document.getElementById('send-reply-modal-btn');
      if (retryBtn) bindSendReply(retryBtn);
    });
    return;
  }
  bindSendReply(sendBtn);

  function bindSendReply(button) {
    button.addEventListener('click', async () => {
      const id = button.dataset.messageId;
      const reply = (document.getElementById('modal-reply-text') || {}).value || '';

      if (!id) {
        return alert('No message selected to reply to.');
      }
      if (!reply.trim()) {
        return alert('Reply cannot be empty.');
      }

      const token = localStorage.getItem('authToken');
      if (!token) return alert('Not authenticated. Please login.');

      const payload = { reply: reply.trim() };
      try {
        // Try POST first, then fallback to PUT if server expects PUT
        let res = await fetch(`${API_BASE}/messages/${id}/reply`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        if (res.status === 404 || res.status === 405) {
          // fallback to PUT
          res = await fetch(`${API_BASE}/messages/${id}/reply`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
          });
        }

        if (res.status === 401 || res.status === 403) {
          throw new Error('Unauthorized. Your session may have expired. Please login again.');
        }

        const body = await safeJson(res);

        if (!res.ok) {
          // body may contain message field
          throw new Error(body && body.message ? body.message : `Reply failed (${res.status})`);
        }

        alert('Reply saved and (optionally) emailed to user.');
        closeModal();
        fetchMessages();

      } catch (err) {
        console.error('Reply error:', err);
        alert('Error sending reply: ' + err.message);
      }
    });
  }

  // small helper to avoid JSON.parse errors on empty responses
  async function safeJson(response) {
    try {
      return await response.json();
    } catch (e) {
      return null;
    }
  }
})();



// Close modal function (ensure it exists)
function closeModal() {
  const modal = document.getElementById('replyModal');
  if (modal) modal.style.display = 'none';
}