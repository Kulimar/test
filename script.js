document.addEventListener('DOMContentLoaded', () => {
    const gallery = document.querySelector('.gallery');

    // Manually specified image URLs while automatic loading is disabled
    const imageUrls = [
        'https://raw.githubusercontent.com/Kulimar/test/main/images/20250511_094432.jpg',
        'https://raw.githubusercontent.com/Kulimar/test/main/images/IMG_3543.HEIC',
        'https://raw.githubusercontent.com/Kulimar/test/main/images/IMG_3587.HEIC',
        'https://raw.githubusercontent.com/Kulimar/test/main/images/IMG_3591.HEIC'
    ];

    imageUrls.forEach((url, index) => {
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
