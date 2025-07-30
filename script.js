document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Universal Logic (Always runs) ---
    handleMobileMenu();
    handleContactForm();

    // --- 2. Page-Specific Logic ---
    // We check which page we are on and run only the necessary code.
    if (document.getElementById('articles-container')) { // This ID is on the homepage
        handleHomePage();
    }
    if (document.querySelector('.articles-container.articles-grid')) { // This class is on the articles page
        handleArticlesPage();
    }
    // You can add more else if blocks for other pages like about.html if they need specific JS
});


/**
 * Handles the mobile menu and overlay functionality.
 */
function handleMobileMenu() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const closeMenuButton = document.getElementById('close-menu-button');
    const menuOverlay = document.getElementById('menu-overlay');

    if (!mobileMenu || !menuOverlay) return;

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
    if (closeMenuButton) closeMenuButton.addEventListener('click', closeMenu);
    if (menuOverlay) menuOverlay.addEventListener('click', closeMenu);
}

/**
 * Handles the submission of the main contact form.
 */
function handleContactForm() {
    const contactForm = document.getElementById('cf-form');
    if (!contactForm) return;

    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formMessage = document.getElementById('form-message');
        const firstName = document.getElementById('cf-firstName').value;
        const lastName = document.getElementById('cf-lastName').value;
        const name = `${firstName} ${lastName}`.trim();

        const formData = {
            name,
            email: document.getElementById('cf-email').value,
            subject: document.getElementById('cf-subject').value,
            message: document.getElementById('cf-message').value,
        };

        try {
            const response = await fetch('http://localhost:5000/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const result = await response.json();
            formMessage.style.display = 'block';

            if (response.ok) {
                formMessage.textContent = result.message;
                formMessage.style.color = 'green';
                contactForm.reset();
            } else {
                formMessage.textContent = result.message || 'An error occurred.';
                formMessage.style.color = 'red';
            }
        } catch (error) {
            formMessage.style.display = 'block';
            formMessage.textContent = 'Network error. Please try again.';
            formMessage.style.color = 'red';
        }
    });
}


/**
 * Fetches and displays the latest 4 articles on the homepage.
 */
async function handleHomePage() {
    const container = document.getElementById('articles-container');
    if (!container) return;

    try {
        const response = await fetch('http://localhost:5000/api/articles');
        if (!response.ok) throw new Error('Failed to load articles.');
        const allArticles = await response.json();
        
        // Display only the first 4 articles
        const articlesToDisplay = allArticles.slice(0, 4);

        container.innerHTML = articlesToDisplay.map(article => `
            <div class="article-card">
                <div class="article-image-wrapper">
                    <img src="http://localhost:5000${article.image}" alt="${article.title}" class="article-image">
                </div>
                <div class="article-content">
                    <h3>${article.title}</h3>
                    <p>${article.content.substring(0, 100)}...</p>
                    <div class="article-actions">
                        <a href="#" class="read-more">Read More</a>
                    </div>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Homepage article load error:', error);
        container.innerHTML = '<p>Could not load articles.</p>';
    }
}


/**
 * Handles the logic for the main Articles page, including filtering.
 */
async function handleArticlesPage() {
    const container = document.querySelector('.articles-container.articles-grid');
    const filterButtons = document.querySelectorAll('.filter-buttons button');
    if (!container || filterButtons.length === 0) return;

    let allArticles = []; // Store a master list of articles

    // Function to render articles to the page
    const displayArticles = (articles) => {
        container.innerHTML = ''; // Clear existing
        articles.forEach(article => {
            const card = document.createElement('div');
            card.className = 'article-card';
            card.innerHTML = `
                <div class="article-image-wrapper">
                    <img src="http://localhost:5000${article.image}" alt="${article.title}" class="article-image">
                </div>
                <div class="article-content">
                    <h3>${article.title}</h3>
                     <p>${article.content.substring(0, 100)}...</p>
                </div>
            `;
            container.appendChild(card);
        });
    };

    // Add click event listeners to filter buttons
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.dataset.filter;
            let filteredArticles = allArticles;

            if (filter === 'published') {
                filteredArticles = allArticles.filter(a => a.published === true);
            } else if (filter === 'unpublished') {
                filteredArticles = allArticles.filter(a => a.published !== true);
            }
            displayArticles(filteredArticles);
        });
    });

    // Initial fetch of all articles
    try {
        const response = await fetch('http://localhost:5000/api/articles');
        if (!response.ok) throw new Error('Failed to fetch articles.');
        
        allArticles = await response.json();
        displayArticles(allArticles); // Display all by default
    } catch (error) {
        console.error('Articles page load error:', error);
        container.innerHTML = '<p>Error loading articles.</p>';
    }
}