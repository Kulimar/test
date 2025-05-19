document.addEventListener('DOMContentLoaded', () => {
    const gallery = document.querySelector('.gallery');
    // API endpoint for storing and retrieving likes
    // Uses the relative /api/likes path so it works locally and when deployed
    const likeEndpoint = '/api/likes';

    const localLikes = new Set(JSON.parse(localStorage.getItem('likedImages') || '[]'));
    const saveLocalLikes = () => localStorage.setItem('likedImages', JSON.stringify([...localLikes]));

    const fetchLikes = (ids) => {
        if (!ids.length) return;
        fetch(`${likeEndpoint}?ids=${ids.join(',')}`)
            .then(r => r.json())
            .then(({ counts, liked }) => {
                ids.forEach(id => {
                    const photo = document.querySelector(`.photo[data-id="${id}"]`);
                    if (!photo) return;
                    const countEl = photo.querySelector('.like-count');
                    const btn = photo.querySelector('.like-btn');
                    countEl.textContent = counts[id] ?? 0;
                    const isLiked = localLikes.has(id) || liked.includes(id);
                    if (isLiked) localLikes.add(id);
                    btn.dataset.liked = isLiked;
                    btn.setAttribute('aria-pressed', isLiked);
                    btn.classList.toggle('liked', isLiked);
                });
                saveLocalLikes();
                if (window.lucide) lucide.createIcons();
            })
            .catch(err => {
                console.error('Error loading likes:', err);
                ids.forEach(id => {
                    const photo = document.querySelector(`.photo[data-id="${id}"]`);
                    if (!photo) return;
                    const btn = photo.querySelector('.like-btn');
                    const countEl = photo.querySelector('.like-count');
                    countEl.textContent = countEl.textContent || 0;
                    const isLiked = localLikes.has(id);
                    btn.dataset.liked = isLiked;
                    btn.setAttribute('aria-pressed', isLiked);
                    btn.classList.toggle('liked', isLiked);
                });
            });
    };

    // fallback image URLs used when the server is unavailable
    const fallbackUrls = [
        'images/20250511_094432.jpg'
    ];

    const renderImages = (urls) => {
        urls.forEach((url, index) => {
            const photo = document.createElement('div');
            const id = url.split('/').pop();
            photo.classList.add('photo', 'fade-in');
            photo.dataset.id = id;
            photo.style.animationDelay = `${index * 0.2}s`;

            const img = document.createElement('img');
            img.src = url;
            img.alt = id;

            const overlay = document.createElement('div');
            overlay.className = 'overlay';

            const btn = document.createElement('button');
            btn.className = 'like-btn';
            btn.setAttribute('aria-pressed', 'false');
            btn.setAttribute('aria-label', 'Like image');
            const icon = document.createElement('i');
            icon.dataset.lucide = 'heart';
            btn.appendChild(icon);

            const countSpan = document.createElement('span');
            countSpan.className = 'like-count';
            countSpan.textContent = '0';

            overlay.appendChild(btn);
            overlay.appendChild(countSpan);

            photo.appendChild(img);
            photo.appendChild(overlay);
            gallery.appendChild(photo);

            photo.addEventListener('click', (e) => {
                if (e.target.closest('.like-btn')) return; // ignore like clicks
                photo.classList.toggle('expanded');
            });

            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const likedNow = btn.dataset.liked !== 'true';
                btn.dataset.liked = likedNow;
                btn.setAttribute('aria-pressed', likedNow);
                btn.classList.toggle('liked', likedNow);
                countSpan.textContent = +countSpan.textContent + (likedNow ? 1 : -1);

                if (likedNow) {
                    localLikes.add(id);
                } else {
                    localLikes.delete(id);
                }
                saveLocalLikes();

                try {
                    const verb = likedNow ? 'POST' : 'DELETE';
                    const resp = await fetch(likeEndpoint, {
                        method: verb,
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ imageId: id })
                    });
                    if (!resp.ok) {
                        console.error('Could not save like');
                    }
                } catch (err) {
                    console.error('Error saving like:', err);
                }
            });
        });

        // Now that all <i data-lucide="heart"> elements exist, replace them with SVGs
        if (window.lucide) lucide.createIcons();
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
            fetchLikes(urls.map(u => u.split('/').pop()));
        })
        .catch(err => {
            console.error('Error loading images:', err);
            renderImages(fallbackUrls);
            fetchLikes(fallbackUrls.map(u => u.split('/').pop()));
        });

    const toggleButton = document.getElementById('theme-toggle');
    const toggleIcon = document.getElementById('theme-icon');

    toggleButton.addEventListener('click', () => {
        document.body.classList.toggle('dark');
        const isDark = document.body.classList.contains('dark');
        toggleIcon.setAttribute('data-lucide', isDark ? 'sun' : 'moon');
        if (window.lucide) lucide.createIcons();
    });

});
