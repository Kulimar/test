document.addEventListener('DOMContentLoaded', () => {
    const gallery = document.querySelector('.gallery');

    // fallback image URLs used when the server is unavailable
    const fallbackUrls = [
        'https://raw.githubusercontent.com/Kulimar/test/main/images/20250511_094432.jpg',
        'https://raw.githubusercontent.com/Kulimar/test/main/images/IMG_3543.HEIC',
        'https://raw.githubusercontent.com/Kulimar/test/main/images/IMG_3587.HEIC',
        'https://raw.githubusercontent.com/Kulimar/test/main/images/IMG_3591.HEIC'
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

    // try loading image list from the local server; fall back to predefined URLs
    fetch('/images-list')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Server responded with ${response.status}`);
            }
            return response.json();
        })
        .then(files => {
            const urls = files.map(f => `/images/${f}`);
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
