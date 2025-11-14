class SearchManager {
    constructor() {
        this.searchInput = document.getElementById('site-search');
        this.searchResults = document.getElementById('search-results');
        this.searchButton = document.querySelector('.search-button');
        this.init();
    }

    init() {
        if (!this.searchInput || !this.searchResults || !this.searchButton) {
            console.error('Search elements not found');
            return;
        }

        // Add event listeners
        this.searchInput.addEventListener('input', this.debounce(() => this.handleSearch(), 300));
        this.searchButton.addEventListener('click', () => this.handleSearch());
        
        // Close search results when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.searchInput.contains(e.target) && !this.searchResults.contains(e.target)) {
                this.searchResults.style.display = 'none';
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === '/' && document.activeElement !== this.searchInput) {
                e.preventDefault();
                this.searchInput.focus();
            } else if (e.key === 'Escape' && this.searchResults.style.display !== 'none') {
                this.searchResults.style.display = 'none';
                this.searchInput.blur();
            }
        });
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    handleSearch() {
        const query = this.searchInput.value.trim().toLowerCase();
        if (query.length === 0) {
            this.searchResults.style.display = 'none';
            return;
        }

        const results = this.searchContent(query);
        this.displaySearchResults(results, query);
    }

    searchContent(query) {
        const results = [];
        
        // Search navigation items (always available)
        const navItems = [
            { name: 'Dashboard', page: 'dashboard', icon: 'fa-home' },
            { name: 'My Plants', page: 'collection', icon: 'fa-leaf' },
            { name: 'Wishlist', page: 'wishlist', icon: 'fa-heart' },
            { name: 'Add Plant', page: 'add-plant', icon: 'fa-plus' },
            { name: 'Discover', page: 'discover', icon: 'fa-compass' },
            { name: 'Calendar', page: 'calendar', icon: 'fa-calendar-alt' }
        ];

        navItems.forEach(item => {
            if (this.matchesSearch(item.name, query)) {
                results.push({
                    title: item.name,
                    category: 'Navigation',
                    type: 'page',
                    icon: item.icon,
                    data: item.page
                });
            }
        });

        // Search in plant collection if available
        try {
            const plantManager = window.app?.plantManager;
            if (plantManager && typeof plantManager.getAllPlants === 'function') {
                const plants = plantManager.getAllPlants();
                plants.forEach(plant => {
                    if (this.matchesSearch(plant.name, query) || 
                        this.matchesSearch(plant.species, query) || 
                        this.matchesSearch(plant.description, query)) {
                        results.push({
                            title: plant.name,
                            subtitle: plant.species,
                            category: 'My Plants',
                            type: 'plant',
                            icon: 'fa-leaf',
                            data: plant
                        });
                    }
                });
            }
        } catch (error) {
            console.error('Error searching plants:', error);
        }

        // Search in wishlist if available
        try {
            const wishlistManager = window.app?.wishlistManager;
            if (wishlistManager && typeof wishlistManager.getWishlist === 'function') {
                const wishlist = wishlistManager.getWishlist();
                wishlist.forEach(item => {
                    if (this.matchesSearch(item.name, query) || 
                        this.matchesSearch(item.notes, query)) {
                        results.push({
                            title: item.name,
                            subtitle: item.notes,
                            category: 'Wishlist',
                            type: 'wishlist',
                            icon: 'fa-heart',
                            data: item
                        });
                    }
                });
            }
        } catch (error) {
            console.error('Error searching wishlist:', error);
        }

        return results;
    }

    matchesSearch(text, query) {
        return text && text.toLowerCase().includes(query);
    }

    displaySearchResults(results, query) {
        if (results.length === 0) {
            this.searchResults.innerHTML = `
                <div class="search-result-item">
                    <div class="search-result-title">
                        <i class="fas fa-search"></i>
                        No results found
                    </div>
                </div>`;
            this.searchResults.style.display = 'block';
            return;
        }

        const html = results.map(result => {
            const highlightedTitle = this.highlightText(result.title, query);
            const subtitle = result.subtitle ? this.highlightText(result.subtitle, query) : '';
            
            return `
                <div class="search-result-item" data-type="${result.type}" data-id="${result.type === 'page' ? result.data : result.data.id}">
                    <div class="search-result-title">
                        <i class="fas ${result.icon}"></i>
                        ${highlightedTitle}
                    </div>
                    ${subtitle ? `<div class="search-result-subtitle">${subtitle}</div>` : ''}
                    <div class="search-result-category">${result.category}</div>
                </div>
            `;
        }).join('');

        this.searchResults.innerHTML = html;
        this.searchResults.style.display = 'block';

        // Add click handlers to results
        this.searchResults.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', () => this.handleResultClick(item));
        });
    }

    highlightText(text, query) {
        if (!text) return '';
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<span class="search-highlight">$1</span>');
    }

    handleResultClick(resultElement) {
        const type = resultElement.dataset.type;
        const id = resultElement.dataset.id;

        switch (type) {
            case 'page':
                window.app?.showPage(id);
                break;
            case 'plant':
                window.app?.showPage('collection');
                // TODO: Scroll to and highlight the specific plant
                break;
            case 'wishlist':
                window.app?.showPage('wishlist');
                // TODO: Scroll to and highlight the specific wishlist item
                break;
        }

        // Clear search
        this.searchInput.value = '';
        this.searchResults.style.display = 'none';
    }
}