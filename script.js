document.addEventListener('DOMContentLoaded', () => {
    const gallery = document.querySelector('.gallery');

    fetch('/images-list')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Server responded with ${response.status}`);
            }
            return response.json();
        })
        .then(files => {
            files.forEach((file, index) => {
                const photo = document.createElement('div');
                photo.classList.add('photo', 'fade-in');
                photo.style.animationDelay = `${index * 0.2}s`;

                const img = document.createElement('img');
                img.src = `/images/${file}`;
                img.alt = file;

                photo.appendChild(img);
                gallery.appendChild(photo);

                photo.addEventListener('click', () => {
                    photo.classList.toggle('expanded');
                });
            });
        })
        .catch(err => console.error('Error loading images:', err));

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
