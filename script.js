document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.articles-container.articles-grid')) {
        handleArticlesPage();
}
    // if (document.getElementById('homepage-specific-element')) { handleHomePage(); }

    // Always run these universal handlers
    handleMobileMenu();
    handleContactForm();
});

/**
 * Manages the mobile menu and overlay functionality.
 */
function handleMobileMenu() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const closeMenuButton = document.getElementById('close-menu-button');
    const menuOverlay = document.getElementById('menu-overlay');

    // Exit if essential elements don't exist
    if (!mobileMenuButton || !mobileMenu || !closeMenuButton || !menuOverlay) {
        return;
    }

    const toggleMenu = (event) => {
        if (event) event.preventDefault();
        mobileMenu.classList.toggle('active');
        menuOverlay.classList.toggle('active');
    };

    const closeMenu = () => {
        mobileMenu.classList.remove('active');
        menuOverlay.classList.remove('active');
    };

    mobileMenuButton.addEventListener('click', toggleMenu);
    closeMenuButton.addEventListener('click', closeMenu);
    menuOverlay.addEventListener('click', closeMenu);
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
        const submitButton = contactForm.querySelector('button[type="submit"]');

        // Combine first and last name
        const firstName = document.getElementById('cf-firstName').value;
        const lastName = document.getElementById('cf-lastName').value;
        const name = `${firstName} ${lastName}`.trim();

        const formData = {
            name: name,
            email: document.getElementById('cf-email').value,
            subject: document.getElementById('cf-subject').value,
            message: document.getElementById('cf-message').value,
        };

        // Disable button to prevent multiple submissions
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';
        formMessage.style.display = 'none'; // Hide previous messages

        try {
            const response = await fetch('http://localhost:5000/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const result = await response.json();
            formMessage.style.display = 'block';

            if (response.ok) {
                formMessage.textContent = result.message;
                formMessage.style.color = 'green';
                contactForm.reset();
            } else {
                throw new Error(result.message || 'An unknown error occurred.');
            }
        } catch (error) {
            formMessage.textContent = error.message;
            formMessage.style.color = 'red';
        } finally {
            // Re-enable the button after the process is complete
            submitButton.disabled = false;
            submitButton.textContent = 'Submit';
        }
    });
}

async function handleArticlesPage() {
    const container = document.querySelector('.articles-container.articles-grid');
    if (!container) return;

    try {
        const response = await fetch('http://localhost:5000/api/articles');
        if (!response.ok) throw new Error('Could not load articles.');
        
        const allArticles = await response.json();
        const publishedArticles = allArticles.filter(a => a.published);

        container.innerHTML = publishedArticles.length ? publishedArticles.map(article => `
            <div class="article-card">
                <img src="http://localhost:5000${article.image}" alt="${article.title}" style="width:100%;">
                <h3>${article.title}</h3>
                <p>${article.content.substring(0, 100)}...</p>
            </div>
        `).join('') : '<p>No articles have been published yet.</p>';
    } catch (error) {
        container.innerHTML = `<p style="color:red;">${error.message}</p>`;
    }

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.dataset.filter;
            if (filter === 'all') {
                displayArticles(allArticles);
            } else if (filter === 'published') {
                displayArticles(allArticles.filter(a => a.published));
            } else if (filter === 'unpublished') {
                displayArticles(allArticles.filter(a => !a.published));
            }
        });
    });

    try {
        const response = await fetch('http://localhost:5000/api/articles');
        if (!response.ok) throw new Error('Failed to load articles from server.');
        allArticles = await response.json();
        // Initially display only published articles on the public site
        displayArticles(allArticles.filter(a => a.published));
    } catch (error) {
        container.innerHTML = `<p style="color:red;">${error.message}</p>`;
    }
}