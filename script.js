document.addEventListener('DOMContentLoaded', () => {
    const photos = document.querySelectorAll('.photo');

    photos.forEach((photo, index) => {
        // initial fade-in animation delay
        photo.classList.add('fade-in');
        photo.style.animationDelay = `${index * 0.2}s`;

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
