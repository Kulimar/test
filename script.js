document.addEventListener('DOMContentLoaded', () => {
    const gallery = document.querySelector('.gallery');

    // fallback image URLs used when the server is unavailable
    const fallbackUrls = [
        'images/20250511_094432.jpg'
    ];

    const renderImages = (urls) => {
        urls.forEach((url, index) => {
            const photo = document.createElement('div');
            photo.classList.add('photo', 'fade-in');
            photo.style.animationDelay = `${index * 0.2}s`;

            const img = document.createElement('img');
            img.src = url;
            img.alt = url.split('/').pop();

            photo.appendChild(img);
            gallery.appendChild(photo);

            photo.addEventListener('click', () => {
                photo.classList.toggle('expanded');
            });
        });
    };

    // load image list from a static file; fall back to predefined URLs
    fetch('images-list.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Server responded with ${response.status}`);
            }
            return response.json();
        })
        .then(files => {
            const urls = files.map(f => `images/${f}`);
            renderImages(urls);
        })
        .catch(err => {
            console.error('Error loading images:', err);
            renderImages(fallbackUrls);
        });

    const toggleButton = document.getElementById('theme-toggle');
    const toggleIcon = document.getElementById('theme-icon');

    toggleButton.addEventListener('click', () => {
        document.body.classList.toggle('dark');
        const isDark = document.body.classList.contains('dark');
        toggleIcon.setAttribute('data-lucide', isDark ? 'sun' : 'moon');
        lucide.createIcons();
    });

    lucide.createIcons();
});
