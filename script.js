document.addEventListener('DOMContentLoaded', async () => {
    
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const desktopMenuTrigger = document.getElementById('desktop-menu-trigger');
    const mobileMenu = document.getElementById('mobile-menu');
    const closeMenuButton = document.getElementById('close-menu-button');
    const menuOverlay = document.getElementById('menu-overlay');
     const contactForm = document.getElementById('cf-form');
    
    
    if (mobileMenu && menuOverlay) {
        const toggleMenu = (event) => {
            if (event) event.preventDefault();
            mobileMenu.classList.toggle('active');
            menuOverlay.classList.toggle('active');
        };

        const closeMenu = () => {
            mobileMenu.classList.remove('active');
            menuOverlay.classList.remove('active');
        };

        if (mobileMenuButton) mobileMenuButton.addEventListener('click', toggleMenu);
        if (desktopMenuTrigger) desktopMenuTrigger.addEventListener('click', toggleMenu);
        
        if (closeMenuButton) closeMenuButton.addEventListener('click', closeMenu);
        if (menuOverlay) menuOverlay.addEventListener('click', closeMenu);
    }
    
    

// Mobile dropdown logic
    const mobileDropdownToggle = document.querySelector('.mobile-dropdown-toggle');
    if (mobileDropdownToggle) {
        mobileDropdownToggle.addEventListener('click', (e) => {
            e.preventDefault();
            const submenu = mobileDropdownToggle.nextElementSibling;
            const arrow = mobileDropdownToggle.querySelector('.mobile-dropdown-arrow');
            submenu.classList.toggle('active');
            arrow.classList.toggle('open');
        });
    }




  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('cf-firstName').value + ' ' + document.getElementById('cf-lastName').value;
      const email = document.getElementById('cf-email').value;
      const subject = document.getElementById('cf-subject').value;
      const message = document.getElementById('cf-message').value;

      try {
        const res = await fetch('http://localhost:5000/api/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ name, email, subject, message })
        });

        if (!res.ok) throw new Error('Failed to submit message');

       document.getElementById('cf-success-message').style.display = 'block';
setTimeout(() => {
  document.getElementById('cf-success-message').style.display = 'none';
}, 5000);
contactForm.reset();
        
      } catch (error) {
        alert('Error sending message: ' + error.message);
      }
    });
  }

    let articles = [];
    let siteContent = {};

     try {
        
         const [articlesRes, contentRes] = await Promise.all([
            fetch('http://localhost:5000/api/articles'),
            fetch('http://localhost:5000/api/content')
        ]);
        articles = await articlesRes.json();
        siteContent = await contentRes.json();
    } catch (error) {
        
        console.error('Failed to fetch initial site data:', error);
        
    }


    const homepageContainer = document.getElementById("articles-container");
    const articlesPageContainer = document.getElementById("full-articles-container");

    if (document.body.contains(document.getElementById('hero-section'))) {
        populatePublicContent(siteContent);
    }

    if (homepageContainer) {
        setupHomepage(articles);
    }
    if (articlesPageContainer) {
        setupArticlesPage(articles);
    }

    document.getElementById('loader').style.display = 'none';
    document.querySelector('.content-wrapper').style.visibility = 'visible';
});

function populatePublicContent(content) {
    if (!content) return;

    // Helper to safely update content
    const updateText = (id, text) => {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    };
    const updateHTML = (id, html) => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = html;
    };
    const updateSrc = (id, src) => {
        const el = document.getElementById(id);
        if (el) el.src = src;
    };

    // Update Hero Section
    updateText('hero-title', content.heroTitle);
    updateText('hero-description', content.heroDescription);
    updateSrc('hero-image', content.heroImage);

    // Update About Me Section
    updateText('about-me-title', content.aboutTitle);
    updateText('about-me-desc-1', content.aboutDescription1);
    updateText('about-me-desc-2', content.aboutDescription2);
    
    // Update Footer
    updateSrc('footer-about-image', content.footerAboutImage);
    // Note: Using innerHTML for the footer text to keep the "Read more" link
    updateHTML('footer-about-text', `${content.footerAboutText}<br><a href="about.html">Read more about Timothy Sykes...</a>`);
}

// --- HOMEPAGE FUNCTIONS ---
function setupHomepage(articles) {
    const container = document.getElementById("articles-container");
    const modal = document.getElementById('article-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalDescription = document.getElementById('modal-description');
    const modalImage = document.getElementById('modal-image');
    const closeModalBtn = document.getElementById('modal-close-btn');
    
    const articlesToDisplay = articles.slice(0, 3);

    articlesToDisplay.forEach((article, index) => {
        const card = document.createElement("div");
        card.className = "article-card";
        card.dataset.articleIndex = index;
        card.innerHTML = `
            <a href="articles.html?id=${index}" class="article-card-link">
                <div class="article-image-wrapper">
                    <img src="${article.imageSrc}" alt="${article.title}" class="article-image">
                </div>
               ${article.status === 'Published' && article.photocardImage ? `<div class="photocard-wrapper"><img src="${article.photocardImage}" alt="Photocard" class="photocard-image"></div>` : ''}
              <div class="article-content">
                    <h3>${article.title}</h3>
                    <div class="article-meta"><span> ${new Date(article.date).toLocaleDateString()}</span></div>
                    <p>${article.description}</p>
                </div>
            </a>
            <div class="article-actions">
                <button class="btn-icon preview-btn" aria-label="Preview"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M12 15a3 3 0 100-6 3 3 0 000 6z" /><path fill-rule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113C21.182 17.022 16.97 20.25 12.001 20.25c-4.97 0-9.185-3.223-10.675-7.69a.75.75 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z" clip-rule="evenodd" /></svg></button>
            </div>`;        
        container.appendChild(card);
    });

    function openModal(title, description, imageSrc) {
        if (!modal) return;
        modalImage.src = imageSrc;
        modalImage.alt = title;
        modalTitle.textContent = title;
        modalDescription.textContent = description;
        modal.classList.add('active');
    }

    function closeModal() {
        if (!modal) return;
        modal.classList.remove('active');
    }

      container.addEventListener('click', (event) => {
        const previewButton = event.target.closest('.preview-btn');
        if (previewButton) {
            event.preventDefault(); // Prevent the link from firing
            const card = previewButton.closest('.article-card');
            if (!card) return;
            
            const articleIndex = parseInt(card.dataset.articleIndex, 10);
            const article = articles[articleIndex];
            if (article) {
                openModal(article.title, article.description, article.imageSrc);
            }
        }
    });

    if (modal) {
        closeModalBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (event) => {
            if (event.target === modal) closeModal();
        });
    }
}

// --- ARTICLES PAGE FUNCTIONS (FIXED) ---
function setupArticlesPage(articles) {
    const container = document.getElementById('full-articles-container');
    const relatedSection = document.getElementById("related-articles-section");
    const urlParams = new URLSearchParams(window.location.search);
    const articleId = urlParams.get('id');

    const statusFilterFromUrl = urlParams.get('status');
    const searchFilterContainer = document.querySelector('.search-filter-container');

    const filterIcon = document.getElementById('filter-icon');
    const filterDropdown = document.getElementById('filter-dropdown');
    const searchInput = document.getElementById('article-search-input');
    const mainTitle = document.querySelector('.full-articles-title');
    
    const renderCards = (articlesToRender) => {
        container.innerHTML = '';
        articlesToRender.forEach((article) => {
            const originalIndex = articles.indexOf(article);
            const card = document.createElement("div");
            card.className = "article-card";

            card.innerHTML = `
                <a href="articles.html?id=${originalIndex}" class="article-card-link">
                    <div class="article-image-wrapper">
                        <img src="${article.imageSrc}" alt="${article.title}" class="article-image">
                    </div>
                    ${article.status === 'Published' && article.photocardImage ? `<div class="photocard-wrapper"><img src="${article.photocardImage}" alt="Photocard" class="photocard-image"></div>` : ''}
                    <div class="article-content">
                        <h3>${article.title}</h3>
                        <div class="article-meta">
                            <span>${new Date(article.date).toLocaleDateString()} | ${article.status}</span>
                        </div>
                        
                          <p>${article.description}</p>
                    </div>
                </a>`;  
        container.appendChild(card);
    });
};


    if (articleId !== null && articles[articleId]) {
        // --- SINGLE ARTICLE VIEW ---
        container.classList.remove('articles-grid');
        if (searchFilterContainer) searchFilterContainer.style.display = 'none';
        
        const articleIndex = parseInt(articleId, 10);
        const article = articles[articleIndex];
        
        if(mainTitle) mainTitle.style.display = 'none';
        
        container.innerHTML = `
            <div class="single-article-view">
                <div class="article-header">
                    <h1>${article.title}</h1>
                    <div class="article-meta-full">
                        <span>Published on ${new Date(article.date).toLocaleDateString()}</span>
                    </div>
                </div>
                <img src="${article.imageSrc}" alt="${article.title}" class="full-article-image">
                <div class="article-body">
                    <p>${article.fullDescription || article.description}</p>
                </div>
                <div class="share-buttons">
                    <span>Share:</span>
                    <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}" target="_blank" class="share-btn share-facebook"><svg fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg></a>
                    <a href="https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(article.title)}" target="_blank" class="share-btn share-twitter"><svg fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.223.085a4.93 4.93 0 004.6 3.42 9.86 9.86 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg></a>
                </div>
            </div>`;
        if(relatedSection) {
            relatedSection.style.display = 'block';
            renderOtherArticles(articles, articleIndex);
        }

    } else {
    // --- ALL ARTICLES VIEW ---
        let currentArticleSet = articles;

        // Apply URL filter first
        if (statusFilterFromUrl === 'Published' || statusFilterFromUrl === 'Draft') {
            currentArticleSet = articles.filter(a => a.status === statusFilterFromUrl);
            if (mainTitle) mainTitle.textContent = `${statusFilterFromUrl} Articles`;
        } else {
             if (mainTitle) mainTitle.textContent = `All Articles`;
        }
        
        renderCards(currentArticleSet);

        // Filter Icon Logic
        if (filterIcon && filterDropdown) {
            filterIcon.addEventListener('click', (event) => {
                event.stopPropagation();
                filterDropdown.style.display = filterDropdown.style.display === 'block' ? 'none' : 'block';
            });

            filterDropdown.addEventListener('click', (event) => {
                const status = event.target.dataset.status;
                if (status === 'All') {
                    currentArticleSet = articles;
                } else {
                    currentArticleSet = articles.filter(article => article.status === status);
                }
                renderCards(currentArticleSet);
                mainTitle.textContent = status === 'All' ? 'All Articles' : `${status} Articles`;
                searchInput.value = ''; // Reset search on new filter
                filterDropdown.style.display = 'none';
            });
        }

       // Search Logic
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                const query = searchInput.value.toLowerCase();
                const searchResults = currentArticleSet.filter(a => a.title.toLowerCase().includes(query));
                renderCards(searchResults);
            });
        }
    }
}




function renderOtherArticles(articles, currentArticleId) {
    const otherContainer = document.getElementById("related-articles-container");
    if (!otherContainer) return;
    otherContainer.innerHTML = '';
    
    const otherArticles = articles.filter((_, index) => index !== currentArticleId).slice(0, 3);

    otherArticles.forEach((article) => {
        const originalIndex = articles.indexOf(article);
        const card = document.createElement("div");
        card.className = "article-card";
        
        card.innerHTML = `
            <a href="articles.html?id=${originalIndex}" style="text-decoration: none; color: inherit; display: flex; flex-direction: column; height: 100%;">
                <div class="article-image-wrapper">
                    <img src="${article.imageSrc}" alt="${article.title}" class="article-image" loading="lazy">
                </div>
                ${article.status === 'Published' && article.photocardImage ? `
                    <div class="photocard-wrapper">
                        <img src="${article.photocardImage}" alt="Photocard" class="photocard-image">
                    </div>` : ''
                }
                <div class="article-content">
                    <h3>${article.title}</h3>
                    <p>${article.description}</p>
                    <div class="article-meta">
                        <span>Published on ${new Date(article.date).toLocaleDateString()}</span>
                    </div>
                </div>
            </a>
        `;
        otherContainer.appendChild(card);
    });
}


// Global click listener to close dropdown
window.addEventListener('click', () => {
    const filterDropdown = document.getElementById('filter-dropdown');
    if (filterDropdown && filterDropdown.style.display === 'block') {
        filterDropdown.style.display = 'none';
    }
});