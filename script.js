document.addEventListener('DOMContentLoaded', () => {
    const gallery = document.querySelector('.gallery');
    const loadingContainer = document.getElementById('loading-container');
    const loadingBar = document.getElementById('loading-bar');
    let totalImages = 0;
    let loadedImages = 0;
    let imageUrls = [];
    let currentIndex = 0;

    const audio = document.getElementById('bg-music');
    const maxVolume = 0.2;
    const fadeDuration = 10000; // ms
    let audioStarted = false;
    let fadeOutScheduled = false;

    const fadeIn = () => {
        const start = Date.now();
        const step = () => {
            const progress = (Date.now() - start) / fadeDuration;
            audio.volume = Math.min(maxVolume, maxVolume * progress);
            if (progress < 1) requestAnimationFrame(step);
        };
        step();
    };

    const fadeOut = () => {
        const startVolume = audio.volume;
        const start = Date.now();
        const step = () => {
            const progress = (Date.now() - start) / fadeDuration;
            audio.volume = Math.max(0, startVolume * (1 - progress));
            if (progress < 1) requestAnimationFrame(step);
        };
        step();
    };

    const maybeStartAudio = () => {
        if (audioStarted) return;
        audio.volume = 0;
        audio.play()
            .then(() => {
                audioStarted = true;
                fadeIn();
                audio.addEventListener('timeupdate', () => {
                    if (!fadeOutScheduled && audio.duration && audio.duration - audio.currentTime <= fadeDuration / 1000) {
                        fadeOutScheduled = true;
                        fadeOut();
                    }
                });
            })
            .catch(() => {
                // still blocked – wait for user interaction
            });
    };

    // Start playback on the first user gesture if it didn't autoplay
    document.addEventListener('click', () => maybeStartAudio(), { once: true });

    // create lightbox elements for full screen viewing
    const lightbox = document.createElement('div');
    lightbox.id = 'lightbox';
    lightbox.className = 'lightbox';

    const lightboxImg = document.createElement('img');
    lightboxImg.id = 'lightbox-img';

    const closeBtn = document.createElement('button');
    closeBtn.id = 'lightbox-close';
    closeBtn.setAttribute('aria-label', 'Close');
    const closeIcon = document.createElement('i');
    closeIcon.dataset.lucide = 'x';
    closeBtn.appendChild(closeIcon);

    const prevBtn = document.createElement('button');
    prevBtn.id = 'lightbox-prev';
    prevBtn.className = 'nav-btn prev';
    prevBtn.setAttribute('aria-label', 'Previous image');
    const prevIcon = document.createElement('i');
    prevIcon.dataset.lucide = 'chevron-left';
    prevBtn.appendChild(prevIcon);

    const nextBtn = document.createElement('button');
    nextBtn.id = 'lightbox-next';
    nextBtn.className = 'nav-btn next';
    nextBtn.setAttribute('aria-label', 'Next image');
    const nextIcon = document.createElement('i');
    nextIcon.dataset.lucide = 'chevron-right';
    nextBtn.appendChild(nextIcon);

    lightbox.appendChild(closeBtn);
    lightbox.appendChild(prevBtn);
    lightbox.appendChild(lightboxImg);
    lightbox.appendChild(nextBtn);
    document.body.appendChild(lightbox);

    const openLightbox = (index) => {
        currentIndex = index;
        lightboxImg.src = imageUrls[currentIndex];
        lightbox.classList.add('open');
        if (window.lucide) lucide.createIcons();
    };

    const closeLightbox = () => {
        lightbox.classList.remove('open');
    };

    const showPrev = () => {
        currentIndex = (currentIndex - 1 + imageUrls.length) % imageUrls.length;
        lightboxImg.src = imageUrls[currentIndex];
    };

    const showNext = () => {
        currentIndex = (currentIndex + 1) % imageUrls.length;
        lightboxImg.src = imageUrls[currentIndex];
    };

    closeBtn.addEventListener('click', closeLightbox);
    prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showPrev();
    });
    nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showNext();
    });
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    const updateLoadingBar = () => {
        if (!loadingContainer) return;
        const pct = totalImages ? (loadedImages / totalImages) * 100 : 0;
        loadingBar.style.width = `${pct}%`;
        if (totalImages && loadedImages >= totalImages) {
            loadingContainer.classList.add('hidden');
        } else {
            loadingContainer.classList.remove('hidden');
        }
    };
    const apiBase =
      'https://kulimar-gallery.netlify.app/.netlify/functions'; // full Netlify functions URL
    const likeEndpoint = `${apiBase}/likes`;

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
        totalImages = urls.length;
        loadedImages = 0;
        updateLoadingBar();

        imageUrls = urls;
        urls.forEach((url, index) => {
            const photo = document.createElement('div');
            const id = url.split('/').pop();
            photo.classList.add('photo', 'fade-in');
            photo.dataset.id = id;
            photo.style.animationDelay = `${index * 0.2}s`;

            const img = document.createElement('img');
            img.src = url;
            img.alt = id;
            img.addEventListener('load', () => {
                loadedImages++;
                updateLoadingBar();
            });
            img.addEventListener('error', () => {
                loadedImages++;
                updateLoadingBar();
            });

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
            photo.addEventListener('mouseenter', maybeStartAudio);

            photo.addEventListener('click', (e) => {
                if (e.target.closest('.like-btn')) return; // ignore like clicks
                openLightbox(index);
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
