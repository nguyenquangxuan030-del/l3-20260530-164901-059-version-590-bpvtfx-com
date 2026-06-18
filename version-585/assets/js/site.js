document.addEventListener('DOMContentLoaded', () => {
    const mobileButton = document.querySelector('[data-mobile-menu-button]');
    const mobilePanel = document.querySelector('[data-mobile-panel]');

    if (mobileButton && mobilePanel) {
        mobileButton.addEventListener('click', () => {
            mobilePanel.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('.poster-frame img, .hero-bg, .hero-poster img, .poster-card img, .aside-related-item img').forEach((image) => {
        image.addEventListener('error', () => {
            const frame = image.closest('.poster-frame, .hero-poster, .poster-card, .aside-related-item');
            if (frame) {
                frame.dataset.missing = 'true';
            }
            image.style.opacity = '0';
        }, { once: true });
    });

    const hero = document.querySelector('[data-hero]');
    if (hero) {
        const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        const prev = hero.querySelector('[data-hero-prev]');
        const next = hero.querySelector('[data-hero-next]');
        let activeIndex = Math.max(0, slides.findIndex((slide) => slide.classList.contains('is-active')));
        let timer = null;

        const showSlide = (index) => {
            activeIndex = (index + slides.length) % slides.length;
            slides.forEach((slide, slideIndex) => {
                const isActive = slideIndex === activeIndex;
                slide.classList.toggle('is-active', isActive);
                slide.setAttribute('aria-hidden', String(!isActive));
            });
            dots.forEach((dot, dotIndex) => {
                dot.classList.toggle('is-active', dotIndex === activeIndex);
            });
        };

        const startTimer = () => {
            window.clearInterval(timer);
            timer = window.setInterval(() => showSlide(activeIndex + 1), 5200);
        };

        prev?.addEventListener('click', () => {
            showSlide(activeIndex - 1);
            startTimer();
        });

        next?.addEventListener('click', () => {
            showSlide(activeIndex + 1);
            startTimer();
        });

        dots.forEach((dot) => {
            dot.addEventListener('click', () => {
                showSlide(Number(dot.dataset.heroDot || 0));
                startTimer();
            });
        });

        showSlide(activeIndex);
        startTimer();
    }

    document.querySelectorAll('[data-filter-input]').forEach((input) => {
        const section = input.closest('section') || document;
        const scope = section.querySelector('[data-filter-scope]') || section;
        const cards = Array.from(scope.querySelectorAll('.movie-card[data-search]'));
        const counter = section.querySelector('[data-filter-count]');

        const applyFilter = () => {
            const query = input.value.trim().toLowerCase();
            let visible = 0;
            cards.forEach((card) => {
                const haystack = (card.dataset.search || '').toLowerCase();
                const matched = !query || haystack.includes(query);
                card.classList.toggle('is-hidden-card', !matched);
                if (matched) {
                    visible += 1;
                }
            });
            if (counter) {
                counter.textContent = `显示 ${visible} 部影片`;
            }
        };

        input.addEventListener('input', applyFilter);
        applyFilter();
    });

    const searchInput = document.getElementById('searchPageInput');
    const searchResults = document.getElementById('searchResults');
    const searchSummary = document.getElementById('searchResultSummary');
    const searchForm = document.getElementById('searchPageForm');

    if (searchInput && searchResults && window.MOVIE_SEARCH_DATA) {
        const params = new URLSearchParams(window.location.search);
        searchInput.value = params.get('q') || '';

        const escapeHtml = (value) => String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');

        const renderCard = (movie) => `
                <article class="movie-card">
                    <a class="poster-frame" href="${escapeHtml(movie.url)}" data-title="${escapeHtml(movie.title)}">
                        <img src="${escapeHtml(movie.cover)}" alt="${escapeHtml(movie.title)}" loading="lazy">
                        <span class="poster-overlay">立即观看</span>
                        <span class="year-badge">${escapeHtml(movie.year)}</span>
                    </a>
                    <div class="movie-card-body">
                        <a class="movie-title" href="${escapeHtml(movie.url)}">${escapeHtml(movie.title)}</a>
                        <p>${escapeHtml(movie.oneLine)}</p>
                        <div class="card-meta">
                            <span>${escapeHtml(movie.region)}</span>
                            <span>${escapeHtml(movie.type)}</span>
                        </div>
                        <a class="category-pill" href="${escapeHtml(movie.categoryUrl)}">${escapeHtml(movie.category)}</a>
                    </div>
                </article>`;

        const runSearch = () => {
            const query = searchInput.value.trim().toLowerCase();
            const data = window.MOVIE_SEARCH_DATA;
            const matches = query
                ? data.filter((movie) => movie.searchText.toLowerCase().includes(query))
                : data.slice(0, 36);
            const visible = matches.slice(0, 160);
            searchResults.innerHTML = visible.map(renderCard).join('');
            if (searchSummary) {
                if (query) {
                    const suffix = matches.length > visible.length ? `，当前展示前 ${visible.length} 条` : '';
                    searchSummary.textContent = `找到 ${matches.length} 部与“${searchInput.value.trim()}”相关的影片${suffix}。`;
                } else {
                    searchSummary.textContent = '默认展示 36 部热门影片；输入关键词后可搜索全站片库。';
                }
            }
        };

        searchForm?.addEventListener('submit', (event) => {
            event.preventDefault();
            const url = new URL(window.location.href);
            const query = searchInput.value.trim();
            if (query) {
                url.searchParams.set('q', query);
            } else {
                url.searchParams.delete('q');
            }
            window.history.replaceState({}, '', url.toString());
            runSearch();
        });

        searchInput.addEventListener('input', runSearch);
        runSearch();
    }

    document.querySelectorAll('[data-scroll-player]').forEach((link) => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            document.querySelector('[data-player]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    });
});
