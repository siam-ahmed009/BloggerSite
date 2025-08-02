document.addEventListener('DOMContentLoaded', () => {
//     if (document.querySelector('.articles-container.articles-grid')) {
//         handleArticlesPage();
// }
    
    handleMobileMenu();
    handleContactForm();
    handleArticlesPage();
});

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

async function handleArticlesPage() {
    const container = document.querySelector('.articles-container.articles-grid');
    const filterButtons = document.querySelectorAll('.filter-buttons button');
    
    // যদি এই পেজটি আর্টিকেল পেজ না হয়, তাহলে এই ফাংশনটি কিছুই করবে না।
    if (!container || !filterButtons.length) {
        return;
    }

    let allArticles = []; // সার্ভার থেকে সব আর্টিকেল এখানে রাখা হবে

    // এই ফাংশনটি আর্টিকেলগুলোকে HTML কার্ড হিসেবে প্রদর্শন করে
    const displayArticles = (articles) => {
        if (!articles || articles.length === 0) {
            container.innerHTML = '<p>No articles found.</p>';
            return;
        }

        container.innerHTML = articles.map(article => `
            <div class="article-card">
                <div class="article-image-wrapper">
                    <img src="http://localhost:5000${article.image}" alt="${article.title}" class="article-image">
                </div>
                <div class="article-content">
                    <h3>${article.title}</h3>
                    <p>${article.content.substring(0, 120)}...</p>
                    <a href="#" class="read-more">Read More</a>
                </div>
            </div>
        `).join('');
    };

    // ফিল্টার বাটনগুলোর কার্যকারিতা
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.dataset.filter;
            // শুধুমাত্র পাবলিশড আর্টিকেলগুলো নিয়েই কাজ করা হবে
            const publishedArticles = allArticles.filter(a => a.published);
            let articlesToDisplay = [...publishedArticles]; // নতুন একটি অ্যারে তৈরি করা হলো

            if (filter === 'newest') {
                // নতুন আর্টিকেল আগে দেখানোর জন্য (default sort)
                articlesToDisplay.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            } else if (filter === 'oldest') {
                // পুরাতন আর্টিকেল আগে দেখানোর জন্য
                articlesToDisplay.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            }
            // 'all' এর জন্য ডিফল্ট সর্টিং (newest) কাজ করবে
            
            displayArticles(articlesToDisplay);
        });
    });
    // সার্ভার থেকে আর্টিকেল লোড এবং প্রদর্শন
     try {
        container.innerHTML = '<p>Loading articles, please wait...</p>';
        const response = await fetch('http://localhost:5000/api/articles');
        
        if (!response.ok) {
            throw new Error(`Failed to load articles. Server responded with status: ${response.status}`);
        }
        
        allArticles = await response.json();
        
        // ডিফল্টভাবে শুধুমাত্র পাবলিশড আর্টিকেলগুলো দেখানো হবে
        const publishedArticles = allArticles.filter(a => a.published);
        displayArticles(publishedArticles);

    } catch (error) {
        console.error('Article loading failed:', error);
        container.innerHTML = `<p style="color: red;">Error: Could not retrieve articles. Please ensure the server is running.</p>`;
    }
}

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