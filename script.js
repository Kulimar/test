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
});
