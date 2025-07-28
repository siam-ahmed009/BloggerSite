document.addEventListener('DOMContentLoaded', async () => {
    
    // --- 1. Universal Logic (Menu, Contact Form) ---
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const desktopMenuTrigger = document.getElementById('desktop-menu-trigger');
    const mobileMenu = document.getElementById('mobile-menu');
    const closeMenuButton = document.getElementById('close-menu-button');
    const menuOverlay = document.getElementById('menu-overlay');

    if (mobileMenu && menuOverlay) {
        // NEW FUNCTION to toggle the menu's visibility
        const toggleMenu = (event) => {
            if (event) event.preventDefault();
            mobileMenu.classList.toggle('active');
            menuOverlay.classList.toggle('active');
        };

        // This function is for the 'X' button and overlay clicks
        const closeMenu = () => {
            mobileMenu.classList.remove('active');
            menuOverlay.classList.remove('active');
        };

        // CHANGED: The menu buttons now use the new toggleMenu function
        if (mobileMenuButton) mobileMenuButton.addEventListener('click', toggleMenu);
        if (desktopMenuTrigger) desktopMenuTrigger.addEventListener('click', toggleMenu);
        
        // These listeners remain the same to ensure the 'X' and overlay still close the menu
        if (closeMenuButton) closeMenuButton.addEventListener('click', closeMenu);
        if (menuOverlay) menuOverlay.addEventListener('click', closeMenu);
    }
    
    const contactForm = document.getElementById('cf-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const msg = document.getElementById('cf-success-message');
            if (msg) { msg.style.display = 'block'; setTimeout(() => { msg.style.display = 'none'; }, 5000); }
            this.reset();
        });
    }

    // --- 2. Articles Data (Central source for both pages) ---
    let articles = [];
    let siteContent = {};

     try {
        // Fetch data from your new back-end API
        // const response = await fetch('http://localhost:5000/api/articles');
        // articles = await response.json();
         const [articlesRes, contentRes] = await Promise.all([
            fetch('http://localhost:5000/api/articles'),
            fetch('http://localhost:5000/api/content')
        ]);
        articles = await articlesRes.json();
        siteContent = await contentRes.json();
    } catch (error) {
        // console.error('Failed to fetch articles:', error);
        console.error('Failed to fetch initial site data:', error);
        
    }

    // --- 3. Page-Specific Logic ---
    const homepageContainer = document.getElementById("articles-container");
    const articlesPageContainer = document.getElementById("full-articles-container");

// Populate the dynamic content if on the homepage
    if (document.body.contains(document.getElementById('hero-section'))) {
        populatePublicContent(siteContent);
    }

    if (homepageContainer) {
        setupHomepage(articles);
    }
    if (articlesPageContainer) {
        setupArticlesPage(articles);
    }
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
    
    const articlesToDisplay = articles.slice(0, 4);

    articlesToDisplay.forEach((article, index) => {
        const card = document.createElement("div");
        card.className = "article-card";
        card.dataset.articleIndex = index;
        card.innerHTML = `
            <div class="article-image-wrapper">
                <img src="${article.imageSrc}" alt="${article.title}" class="article-image">
            </div>
            <div class="article-content">
                <h3>${article.title}</h3>
                <div class="article-meta"><span> ${new Date(article.date).toLocaleDateString()}</span></div>
                <p>${article.description}</p>
                <div class="article-actions">
                    <button class="btn-icon preview-btn" aria-label="Preview"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M288 32c-80.8 0-145.5 36.8-192.6 80.6-46.8 43.5-78.1 95.4-93 131.1-3.3 7.9-3.3 16.7 0 24.6 14.9 35.7 46.2 87.7 93 131.1 47.1 43.7 111.8 80.6 192.6 80.6s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1 3.3-7.9 3.3-16.7 0-24.6-14.9-35.7-46.2-87.7-93-131.1-47.1-43.7-111.8-80.6-192.6-80.6zM144 256a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm144-64c0 35.3-28.7 64-64 64-11.5 0-22.3-3-31.7-8.4-1 10.9-.1 22.1 2.9 33.2 13.7 51.2 66.4 81.6 117.6 67.9s81.6-66.4 67.9-117.6c-12.2-45.7-55.5-74.8-101.1-70.8 5.3 9.3 8.4 20.1 8.4 31.7z"/></svg></button>
                    <a href="articles.html?id=${index}" class="read-more">Full View</a>
                </div>
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
        const target = event.target;
        const card = target.closest('.article-card');
        if (!card) return;
        
        if (target.closest('.preview-btn')) {
            event.preventDefault();
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
    const container = document.getElementById("full-articles-container");
    const relatedSection = document.getElementById("related-articles-section");
    const urlParams = new URLSearchParams(window.location.search);
    const articleId = urlParams.get('id');
    const searchContainer = document.querySelector('.search-container'); // Get the search bar

    const renderCards = (articlesToRender) => {
        container.innerHTML = '';
        articlesToRender.forEach((article) => {
            const originalIndex = articles.indexOf(article);
            const card = document.createElement("div");
            card.className = "article-card";
            card.innerHTML = `
                <div class="article-image-wrapper"><img src="${article.imageSrc}" alt="${article.title}" class="article-image"></div>
                <div class="article-content">
                    <h3>${article.title}</h3>
                    <div class="article-meta">
                        <span><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 640 640"> <path d="M224 64C241.7 64 256 78.3 256 96L256 128L384 128L384 96C384 78.3 398.3 64 416 64C433.7 64 448 78.3 448 96L448 128L480 128C515.3 128 544 156.7 544 192L544 480C544 515.3 515.3 544 480 544L160 544C124.7 544 96 515.3 96 480L96 192C96 156.7 124.7 128 160 128L192 128L192 96C192 78.3 206.3 64 224 64zM160 304L160 336C160 344.8 167.2 352 176 352L208 352C216.8 352 224 344.8 224 336L224 304C224 295.2 216.8 288 208 288L176 288C167.2 288 160 295.2 160 304zM288 304L288 336C288 344.8 295.2 352 304 352L336 352C344.8 352 352 344.8 352 336L352 304C352 295.2 344.8 288 336 288L304 288C295.2 288 288 295.2 288 304zM432 288C423.2 288 416 295.2 416 304L416 336C416 344.8 423.2 352 432 352L464 352C472.8 352 480 344.8 480 336L480 304C480 295.2 472.8 288 464 288L432 288zM160 432L160 464C160 472.8 167.2 480 176 480L208 480C216.8 480 224 472.8 224 464L224 432C224 423.2 216.8 416 208 416L176 416C167.2 416 160 423.2 160 432zM304 416C295.2 416 288 423.2 288 432L288 464C288 472.8 295.2 480 304 480L336 480C344.8 480 352 472.8 352 464L352 432C352 423.2 344.8 416 336 416L304 416zM416 432L416 464C416 472.8 423.2 480 432 480L464 480C472.8 480 480 472.8 480 464L480 432C480 423.2 472.8 416 464 416L432 416C423.2 416 416 423.2 416 432z"/>
</svg> ${new Date(article.date).toLocaleDateString()} <svg xmlns="http://www.w3.org/2000/svg" 
     width="18" height="18" fill="currentColor" viewBox="0 0 640 640"> <path d="M352 173.3L352 384C352 401.7 337.7 416 320 416C302.3 416 288 401.7 288 384L288 173.3L246.6 214.7C234.1 227.2 213.8 227.2 201.3 214.7C188.8 202.2 188.8 181.9 201.3 169.4L297.3 73.4C309.8 60.9 330.1 60.9 342.6 73.4L438.6 169.4C451.1 181.9 451.1 202.2 438.6 214.7C426.1 227.2 405.8 227.2 393.3 214.7L352 173.3zM320 464C364.2 464 400 428.2 400 384L480 384C515.3 384 544 412.7 544 448L544 480C544 515.3 515.3 544 480 544L160 544C124.7 544 96 515.3 96 480L96 448C96 412.7 124.7 384 160 384L240 384C240 428.2 275.8 464 320 464zM464 488C477.3 488 488 477.3 488 464C488 450.7 477.3 440 464 440C450.7 440 440 450.7 440 464C440 477.3 450.7 488 464 488z"/>
</svg> ${article.status || 'not published'}</span> 
                      
                    </div>
                    <p>${article.description}</p>
                    <div class="article-actions">
                         <a href="articles.html?id=${originalIndex}" class="read-more">Full View</a>
                    </div>
                </div>`;
            container.appendChild(card);
        });
    };

    if (articleId !== null && articles[articleId]) {
        // --- SINGLE ARTICLE VIEW ---
container.classList.remove('articles-grid');

        if (searchContainer) {
            searchContainer.style.display = 'none'; // Hide the search bar
        }
        
        const articleIndex = parseInt(articleId, 10);
        const article = articles[articleIndex];
        
        const mainTitle = document.querySelector('.full-articles-title');
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
            </div>
        `;
        if(relatedSection) {
            relatedSection.style.display = 'block';
            renderOtherArticles(articles, articleIndex);
        }

    } else {
        // --- ALL ARTICLES VIEW (WITH FIXED SEARCH) ---
        renderCards(articles);
        const searchInput = document.getElementById('article-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                const query = searchInput.value.toLowerCase();
                const filtered = articles.filter(a => {
                    // Create a formatted date string to match what the user sees
                    const formattedDate = new Date(a.date).toLocaleDateString();

                    return a.title.toLowerCase().includes(query) ||
                           a.date.includes(query) || // Search raw date (e.g., "2025-07")
                           formattedDate.includes(query) || // Search formatted date (e.g., "7/21/2025")
                           (a.status && a.status.toLowerCase().includes(query));
                });
                renderCards(filtered);
            });
        }
    }
}

function renderOtherArticles(articles, currentArticleId) {
    const otherContainer = document.getElementById("related-articles-container");
    if (!otherContainer) return;
    otherContainer.innerHTML = '';
    
    const otherArticles = articles.filter((_, index) => index !== currentArticleId).slice(0, 4);

    otherArticles.forEach((article) => {
        const originalIndex = articles.indexOf(article);
        const card = document.createElement("div");
        card.className = "article-card";
        
        card.innerHTML = `
            <a href="articles.html?id=${originalIndex}" style="text-decoration: none; color: inherit; display: flex; flex-direction: column; height: 100%;">
                <div class="article-image-wrapper">
                    <img src="${article.imageSrc}" alt="${article.title}" class="article-image" loading="lazy">
                </div>
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