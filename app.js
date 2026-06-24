/**
 * Epic Games Store-themed free games grid manager.
 * Implements defensive layout truncation, dynamic timers, and skeleton screens.
 */
(() => {
    "use strict";

    const JSON_URL = 'games.json';
    const container = document.getElementById('games-container');

    /**
     * Renders a placeholder skeleton screen indicating a loading state.
     */
    const renderSkeletons = () => {
        container.innerHTML = '';
        const skeletonCount = 4;
        
        for (let i = 0; i < skeletonCount; i++) {
            const skeletonHTML = `
                <div class="skeleton-card" aria-hidden="true">
                    <div class="skeleton-image skeleton-shimmer"></div>
                    <div class="skeleton-content">
                        <div class="skeleton-text skeleton-title skeleton-shimmer"></div>
                        <div class="skeleton-text skeleton-desc-1 skeleton-shimmer"></div>
                        <div class="skeleton-text skeleton-desc-2 skeleton-shimmer"></div>
                        <div class="skeleton-text skeleton-desc-3 skeleton-shimmer"></div>
                        <div class="skeleton-footer">
                            <div class="skeleton-text skeleton-time skeleton-shimmer"></div>
                        </div>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', skeletonHTML);
        }
    };

    /**
     * Safely limits description text length to minimize UI shifting.
     * @param {string} text 
     * @param {number} limit 
     * @returns {string}
     */
    const truncateText = (text, limit = 100) => {
        if (!text) return '';
        if (text.length <= limit) return text;
        return text.substring(0, limit).trim() + '...';
    };

    /**
     * Calculates time remaining and returns formatted message and status structure.
     * @param {string} dateString 
     * @returns {{ displayText: string, isEndingSoon: boolean, isExpired: boolean }}
     */
    const calculateTimeRemaining = (dateString) => {
        const fallback = { displayText: 'Offer ended', isEndingSoon: false, isExpired: true };
        if (!dateString) return fallback;

        const targetTime = new Date(dateString).getTime();
        const now = Date.now();
        const diff = targetTime - now;

        if (isNaN(targetTime) || diff <= 0) {
            return fallback;
        }

        const oneDayMs = 24 * 60 * 60 * 1000;
        const oneHourMs = 60 * 60 * 1000;

        const days = Math.floor(diff / oneDayMs);
        const hours = Math.floor((diff % oneDayMs) / oneHourMs);

        let displayText = '';
        if (days > 0) {
            displayText = `Ends in ${days} ${days === 1 ? 'day' : 'days'}, ${hours} ${hours === 1 ? 'hour' : 'hours'}`;
        } else {
            displayText = `Ends in ${hours} ${hours === 1 ? 'hour' : 'hours'}`;
        }

        return {
            displayText,
            isEndingSoon: diff < oneDayMs,
            isExpired: false
        };
    };

    /**
     * Builds and displays the game card elements inside the main UI grid container.
     * @param {Array} games 
     */
    const renderGames = (games) => {
        container.innerHTML = '';

        if (!games || games.length === 0) {
            container.innerHTML = `
                <div class="error-container">
                    <p class="error-title">No free games currently available</p>
                    <p class="error-msg">Please check back again later.</p>
                </div>
            `;
            return;
        }

        games.forEach(game => {
            const { title, description, image, expiryDate } = game;
            const timeStatus = calculateTimeRemaining(expiryDate);
            const truncatedDesc = truncateText(description, 100);
            
            // Build direct external link to browse the Epic Store library for the item
            const queryParam = encodeURIComponent(title);
            const epicStoreUrl = `https://store.epicgames.com/en-US/browse?q=${queryParam}`;

            const card = document.createElement('a');
            card.href = epicStoreUrl;
            card.target = '_blank';
            card.rel = 'noopener noreferrer';
            card.className = 'game-card-link';
            card.setAttribute('aria-label', `Claim ${title} on Epic Games Store. ${timeStatus.displayText}`);

            card.innerHTML = `
                <article class="game-card">
                    <div class="image-wrapper">
                        ${timeStatus.isEndingSoon && !timeStatus.isExpired ? '<span class="urgency-badge">Ending Soon!</span>' : ''}
                        <img class="game-image" src="${image}" alt="${title}" loading="lazy" onerror="this.onerror=null; this.src='https://placehold.co/600x338/202020/aaaaaa?text=Image+Unavailable';">
                    </div>
                    <div class="card-content">
                        <h2 class="game-title">${title}</h2>
                        <p class="game-desc">${truncatedDesc}</p>
                        <div class="card-footer">
                            <span class="timer-label">Free Now</span>
                            <span class="timer-value ${timeStatus.isEndingSoon && !timeStatus.isExpired ? 'ending-soon' : ''}">
                                ${timeStatus.displayText}
                            </span>
                        </div>
                    </div>
                </article>
            `;

            container.appendChild(card);
        });
    };

    /**
     * Renders UI indicating a networking or structural data extraction issue.
     */
    const renderError = () => {
        container.innerHTML = `
            <div class="error-container" role="alert">
                <p class="error-title">Failed to load free games</p>
                <p class="error-msg">We encountered an issue pulling the store database listings. Please try again.</p>
                <button id="retry-btn" class="btn-retry">Try Again</button>
            </div>
        `;

        document.getElementById('retry-btn')?.addEventListener('click', (e) => {
            e.preventDefault();
            init();
        });
    };

    /**
     * Initial controller loop responsible for launching loading state and retrieving target payload.
     */
    const init = async () => {
        renderSkeletons();
        
        try {
            const response = await fetch(JSON_URL);
            if (!response.ok) {
                throw new Error(`HTTP network fault code: ${response.status}`);
            }
            const data = await response.json();
            
            // Render actual content payload
            renderGames(data);
        } catch (error) {
            console.error('Error retrieving store games configuration:', error);
            renderError();
        }
    };

    // Begin loader logic when elements are ready
    document.addEventListener('DOMContentLoaded', init);
})();