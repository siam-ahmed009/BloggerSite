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
    const filterButtons = document.querySelectorAll('.filter-buttons button');
    
    if (!container) {
        console.error('Article container not found!');
        return;
    }

    let allArticles = []; // সার্ভার থেকে পাওয়া সব আর্টিকেল এখানে স্টোর করা হবে

    // এই ফাংশনটি আর্টিকেলগুলোকে HTML-এ প্রদর্শন করে
    const displayArticles = (articles) => {
        if (articles.length === 0) {
            container.innerHTML = '<p>No articles found matching the filter.</p>';
            return;
        }

        container.innerHTML = articles.map(article => `
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
    };

    // ফিল্টার বাটনগুলোতে ইভেন্ট লিসেনার যোগ করা
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.dataset.filter;
            let filteredArticles = allArticles;

            if (filter === 'published') {
                filteredArticles = allArticles.filter(a => a.published === true);
            } else if (filter === 'unpublished') {
                filteredArticles = allArticles.filter(a => a.published === false);
            }
            // 'all' এর জন্য কোনো ফিল্টারের প্রয়োজন নেই, কারণ `filteredArticles` এ ডিফল্টভাবে সব আর্টিকেল থাকে

            displayArticles(filteredArticles);
        });
    });

    // সার্ভার থেকে আর্টিকেল লোড করা
    try {
        container.innerHTML = '<p>Loading articles...</p>';
        const response = await fetch('http://localhost:5000/api/articles');
        if (!response.ok) {
            throw new Error('Could not connect to the server to load articles.');
        }
        
        allArticles = await response.json();
        
        // প্রাথমিকভাবে শুধুমাত্র পাবলিশড আর্টিকেলগুলো দেখানো হবে
        const publishedArticles = allArticles.filter(a => a.published === true);
        displayArticles(publishedArticles);
    } catch (error) {
        console.error('Article load error:', error);
        container.innerHTML = `<p style="color: red;">${error.message}</p>`;
    }
}