/**
 * Harvard Meal Planner - Main JavaScript
 * =======================================
 * 
 * Consolidated JavaScript for the entire application.
 * Uses event delegation and data attributes for clean separation.
 * 
 * Modules:
 * 1. Theme Management
 * 2. Flash Messages
 * 3. Navigation (Hamburger menu)
 * 4. Meal Actions (Dashboard)
 * 5. HUDS Menu Multi-Select
 * 6. Notifications Multi-Select
 * 7. Utility Functions
 */

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

const MealPlanner = {
    /**
     * Make an AJAX POST request and return JSON
     */
    async post(url, data = null) {
        const options = {
            method: 'POST',
            headers: { 'X-Requested-With': 'XMLHttpRequest' }
        };
        
        if (data) {
            options.headers['Content-Type'] = 'application/json';
            options.body = JSON.stringify(data);
        }
        
        const response = await fetch(url, options);
        return response.json();
    },

    /**
     * Animate element removal
     */
    animateRemove(element, callback) {
        element.style.transition = 'all 0.3s ease';
        element.style.opacity = '0';
        element.style.transform = 'translateX(20px)';
        setTimeout(() => {
            element.remove();
            if (callback) callback();
        }, 300);
    },

    /**
     * Check for HUDS favorite notifications on page load
     */
    checkHudsFavorites() {
        fetch('/check_huds_favorites')
            .then(response => response.json())
            .then(data => {
                if (data.notifications > 0) {
                    const badge = document.querySelector('.notification-badge');
                    if (badge) {
                        const current = parseInt(badge.textContent) || 0;
                        badge.textContent = current + data.notifications;
                        badge.style.display = 'flex';
                    }
                }
            })
            .catch(() => {}); // Silently fail
    }
};

// =============================================================================
// THEME MANAGEMENT
// =============================================================================

const ThemeManager = {
    init() {
        const theme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', theme);
        this.updateIcons(theme);
        
        // Bind toggle button
        const toggleBtn = document.getElementById('themeToggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggle());
        }
    },

    toggle() {
        const current = document.documentElement.getAttribute('data-theme');
        const newTheme = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        this.updateIcons(newTheme);
    },

    updateIcons(theme) {
        const eyeOpen = document.querySelector('.eye-open');
        const eyeClosed = document.querySelector('.eye-closed');
        if (eyeOpen && eyeClosed) {
            eyeOpen.style.display = theme === 'dark' ? 'none' : 'block';
            eyeClosed.style.display = theme === 'dark' ? 'block' : 'none';
        }
    }
};

// =============================================================================
// FLASH MESSAGES
// =============================================================================

const FlashMessages = {
    init() {
        document.querySelectorAll('.flash').forEach(flash => {
            setTimeout(() => {
                flash.style.opacity = '0';
                flash.style.transition = 'opacity 0.3s';
                setTimeout(() => flash.remove(), 300);
            }, 5000);
        });
    }
};

// =============================================================================
// NAVIGATION (Hamburger Menu)
// =============================================================================

const Navigation = {
    isMenuOpen: false,
    menuToggle: null,
    navLinks: null,

    init() {
        this.menuToggle = document.getElementById('menuToggle');
        this.navLinks = document.getElementById('navLinks');
        const navbarContainer = document.querySelector('.navbar .container');
        const navBrand = document.querySelector('.nav-brand');

        if (!this.menuToggle || !this.navLinks || !navbarContainer) return;

        this.menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            this.isMenuOpen ? this.close() : this.open();
        });

        this.navLinks.addEventListener('click', (e) => {
            if (e.target.closest('a') && this.isMenuOpen) this.close();
        });

        document.addEventListener('click', (e) => {
            if (this.isMenuOpen && !this.navLinks.contains(e.target) && !this.menuToggle.contains(e.target)) {
                this.close();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isMenuOpen) this.close();
        });

        this.checkFit(navbarContainer, navBrand);
        window.addEventListener('resize', () => {
            if (!this.isMenuOpen) this.checkFit(navbarContainer, navBrand);
        });
    },

    open() {
        this.navLinks.style.cssText = '';
        this.navLinks.classList.remove('nav-hidden');
        this.navLinks.classList.add('show');
        document.body.classList.add('menu-open');
        this.menuToggle.setAttribute('aria-expanded', 'true');
        this.isMenuOpen = true;
    },

    close() {
        this.navLinks.classList.remove('show');
        document.body.classList.remove('menu-open');
        this.menuToggle.setAttribute('aria-expanded', 'false');
        this.isMenuOpen = false;
        this.navLinks.classList.add('nav-hidden');
        this.navLinks.style.display = 'none';
    },

    checkFit(container, brand) {
        if (!brand || !this.navLinks || !container || this.isMenuOpen) return;

        this.navLinks.classList.remove('nav-hidden', 'show');
        this.navLinks.style.display = 'flex';
        this.navLinks.style.position = 'static';
        this.navLinks.style.flexDirection = 'row';
        this.menuToggle.style.display = 'none';

        const available = container.offsetWidth - brand.offsetWidth - 60;
        const needed = this.navLinks.scrollWidth;

        if (needed > available) {
            this.navLinks.classList.add('nav-hidden');
            this.navLinks.style.display = 'none';
            this.menuToggle.style.display = 'inline-flex';
        }
    }
};

// =============================================================================
// MEAL ACTIONS (Dashboard - favorites, ratings, eaten status)
// =============================================================================

const MealActions = {
    init() {
        // Use event delegation on the dashboard
        document.addEventListener('click', (e) => {
            const target = e.target;
            
            // Toggle favorite
            if (target.classList.contains('favorite-btn') || target.closest('.favorite-btn')) {
                const btn = target.classList.contains('favorite-btn') ? target : target.closest('.favorite-btn');
                const mealId = btn.dataset.mealId;
                if (mealId) this.toggleFavorite(mealId, btn);
            }
            
            // Toggle eaten
            if (target.classList.contains('eaten-btn') || target.closest('.eaten-btn')) {
                const btn = target.classList.contains('eaten-btn') ? target : target.closest('.eaten-btn');
                const mealId = btn.dataset.mealId;
                if (mealId) this.toggleEaten(mealId, btn);
            }
            
            // Rate meal (star click)
            if (target.classList.contains('star-btn')) {
                const mealId = target.dataset.mealId;
                const rating = target.dataset.rating;
                if (mealId && rating) this.rateMeal(mealId, rating, target);
            }
        });

        // Confirm delete forms
        document.querySelectorAll('form[action*="delete_meal"]').forEach(form => {
            form.addEventListener('submit', (e) => {
                if (!confirm('Are you sure you want to delete this meal?')) {
                    e.preventDefault();
                }
            });
        });
    },

    async toggleFavorite(mealId, button) {
        const data = await MealPlanner.post(`/toggle_favorite/${mealId}`);
        if (data.success) {
            button.textContent = data.is_favorite ? '❤️' : '🤍';
            button.classList.toggle('active', data.is_favorite);
            button.title = data.is_favorite ? 'Remove from favorites' : 'Add to favorites';
            
            // Also update parent item class (for history page)
            const historyItem = button.closest('.history-item');
            if (historyItem) {
                historyItem.classList.toggle('is-favorite', data.is_favorite);
            }
        }
    },

    async toggleEaten(mealId, button) {
        const data = await MealPlanner.post(`/toggle_eaten/${mealId}`);
        if (data.success) {
            const mealItem = button.closest('.meal-item');
            button.textContent = data.is_eaten ? '✅' : '⬜';
            button.classList.toggle('active', data.is_eaten);
            button.title = data.is_eaten ? 'Mark as not eaten' : 'Mark as eaten';
            mealItem.classList.toggle('eaten', data.is_eaten);
        }
    },

    async rateMeal(mealId, rating, starElement) {
        const formData = new FormData();
        formData.append('rating', rating);
        
        const response = await fetch(`/rate_meal/${mealId}`, {
            method: 'POST',
            headers: { 'X-Requested-With': 'XMLHttpRequest' },
            body: formData
        });
        const data = await response.json();
        
        if (data.success) {
            const container = starElement.closest('.meal-rating-inline');
            container.querySelectorAll('.star-btn').forEach((star, index) => {
                star.textContent = index < data.rating ? '★' : '☆';
                star.classList.toggle('filled', index < data.rating);
            });
        }
    }
};

// =============================================================================
// HUDS MENU MULTI-SELECT
// =============================================================================

const HudsMenu = {
    selectedItems: new Set(),
    selectedMealType: null,

    init() {
        // Only initialize on HUDS menu page
        if (!document.getElementById('selectionBar')) return;

        document.addEventListener('click', (e) => {
            // Select all button
            if (e.target.classList.contains('select-all-btn')) {
                const section = e.target.closest('.meal-section');
                const mealType = section.dataset.mealType;
                this.selectAllInSection(e.target, mealType);
            }
        });

        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('meal-checkbox')) {
                this.handleCheckboxChange(e.target);
            }
        });

        // HUDS favorite toggle
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('favorite-huds-btn') || e.target.closest('.favorite-huds-btn')) {
                const btn = e.target.classList.contains('favorite-huds-btn') ? e.target : e.target.closest('.favorite-huds-btn');
                const itemName = btn.dataset.itemName;
                if (itemName) this.toggleFavorite(itemName, btn);
            }
        });
    },

    handleCheckboxChange(checkbox) {
        const mealType = checkbox.dataset.mealType;
        const itemName = checkbox.dataset.itemName;

        if (checkbox.checked) {
            if (this.selectedItems.size === 0) {
                this.selectedMealType = mealType;
                this.enableOnlyMealType(mealType);
            }
            this.selectedItems.add(itemName);
            checkbox.closest('.menu-item').classList.add('selected');
        } else {
            this.selectedItems.delete(itemName);
            checkbox.closest('.menu-item').classList.remove('selected');
            if (this.selectedItems.size === 0) {
                this.selectedMealType = null;
                this.enableAllMealTypes();
            }
        }
        this.updateSelectionBar();
    },

    enableOnlyMealType(allowedType) {
        document.querySelectorAll('.meal-checkbox').forEach(cb => {
            if (cb.dataset.mealType !== allowedType) {
                cb.disabled = true;
                cb.closest('.menu-item').classList.add('disabled');
            }
        });
        document.querySelectorAll('.select-all-btn').forEach(btn => {
            const section = btn.closest('.meal-section');
            if (section.dataset.mealType !== allowedType) btn.disabled = true;
        });
    },

    enableAllMealTypes() {
        document.querySelectorAll('.meal-checkbox').forEach(cb => {
            cb.disabled = false;
            cb.closest('.menu-item').classList.remove('disabled');
        });
        document.querySelectorAll('.select-all-btn').forEach(btn => btn.disabled = false);
    },

    selectAllInSection(button, mealType) {
        const section = button.closest('.meal-section');
        const checkboxes = section.querySelectorAll('.meal-checkbox:not(:disabled)');
        const allChecked = Array.from(checkboxes).every(cb => cb.checked);

        checkboxes.forEach(cb => {
            if (allChecked) {
                cb.checked = false;
                this.selectedItems.delete(cb.dataset.itemName);
                cb.closest('.menu-item').classList.remove('selected');
            } else {
                if (this.selectedItems.size === 0) {
                    this.selectedMealType = mealType;
                    this.enableOnlyMealType(mealType);
                }
                cb.checked = true;
                this.selectedItems.add(cb.dataset.itemName);
                cb.closest('.menu-item').classList.add('selected');
            }
        });

        button.textContent = allChecked ? 'Select All' : 'Deselect All';
        if (this.selectedItems.size === 0) {
            this.selectedMealType = null;
            this.enableAllMealTypes();
        }
        this.updateSelectionBar();
    },

    updateSelectionBar() {
        const bar = document.getElementById('selectionBar');
        const countEl = document.getElementById('selectionCount');
        const mealTypeEl = document.getElementById('selectionMealType');

        if (this.selectedItems.size > 0) {
            bar.style.display = 'flex';
            countEl.textContent = this.selectedItems.size;
            mealTypeEl.textContent = `(${this.selectedMealType})`;
        } else {
            bar.style.display = 'none';
        }
    },

    clearSelection() {
        document.querySelectorAll('.meal-checkbox').forEach(cb => {
            cb.checked = false;
            cb.closest('.menu-item').classList.remove('selected');
        });
        this.selectedItems.clear();
        this.selectedMealType = null;
        this.enableAllMealTypes();
        this.updateSelectionBar();
        document.querySelectorAll('.select-all-btn').forEach(btn => btn.textContent = 'Select All');
    },

    async addSelectedMeals() {
        if (this.selectedItems.size === 0) {
            alert('No items selected');
            return;
        }

        const date = document.getElementById('date').value;
        const data = await MealPlanner.post('/add_multiple_meals', {
            items: Array.from(this.selectedItems),
            meal_type: this.selectedMealType,
            meal_date: date
        });

        if (data.success) {
            alert(`Added ${data.count} items to your ${this.selectedMealType} plan!`);
            this.clearSelection();
        } else {
            alert('Error adding meals: ' + (data.error || 'Unknown error'));
        }
    },

    async toggleFavorite(itemName, button) {
        const data = await MealPlanner.post(`/toggle_huds_favorite/${encodeURIComponent(itemName)}`);
        if (data.success) {
            const heart = button.querySelector('.heart');
            const menuItem = button.closest('.menu-item');
            heart.textContent = data.is_favorite ? '❤️' : '🤍';
            heart.classList.toggle('filled', data.is_favorite);
            menuItem.classList.toggle('is-favorite', data.is_favorite);
        }
    }
};

// Global functions for onclick handlers (for backward compatibility)
window.clearSelection = () => HudsMenu.clearSelection();
window.addSelectedMeals = () => HudsMenu.addSelectedMeals();

// =============================================================================
// NOTIFICATIONS MULTI-SELECT
// =============================================================================

const Notifications = {
    selectedIds: new Set(),

    init() {
        // Only initialize on notifications page
        if (!document.getElementById('notificationSelectionBar')) return;

        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('notification-select-checkbox')) {
                this.handleCheckboxChange(e.target);
            }
        });

        document.addEventListener('click', (e) => {
            // Delete single notification
            if (e.target.classList.contains('notification-delete-btn')) {
                const id = e.target.dataset.notificationId;
                if (id) this.deleteSingle(id, e.target);
            }
        });
    },

    handleCheckboxChange(checkbox) {
        const id = checkbox.dataset.notificationId;
        const item = checkbox.closest('.notification-item');

        if (checkbox.checked) {
            this.selectedIds.add(id);
            item.classList.add('selected');
        } else {
            this.selectedIds.delete(id);
            item.classList.remove('selected');
        }
        this.updateSelectionBar();
        this.updateSelectAllButton();
    },

    updateSelectionBar() {
        const bar = document.getElementById('notificationSelectionBar');
        const countEl = document.getElementById('notificationSelectionCount');

        if (this.selectedIds.size > 0) {
            bar.style.display = 'flex';
            countEl.textContent = this.selectedIds.size;
        } else {
            bar.style.display = 'none';
        }
    },

    updateSelectAllButton() {
        const checkboxes = document.querySelectorAll('.notification-select-checkbox');
        const allChecked = Array.from(checkboxes).every(cb => cb.checked);
        const btn = document.getElementById('selectAllText');
        if (btn) btn.textContent = allChecked ? 'Deselect All' : 'Select All';
    },

    toggleSelectAll() {
        const checkboxes = document.querySelectorAll('.notification-select-checkbox');
        const allChecked = Array.from(checkboxes).every(cb => cb.checked);

        checkboxes.forEach(cb => {
            cb.checked = !allChecked;
            const item = cb.closest('.notification-item');
            const id = cb.dataset.notificationId;

            if (!allChecked) {
                this.selectedIds.add(id);
                item.classList.add('selected');
            } else {
                this.selectedIds.delete(id);
                item.classList.remove('selected');
            }
        });

        this.updateSelectionBar();
        this.updateSelectAllButton();
    },

    clearSelection() {
        document.querySelectorAll('.notification-select-checkbox').forEach(cb => {
            cb.checked = false;
            cb.closest('.notification-item').classList.remove('selected');
        });
        this.selectedIds.clear();
        this.updateSelectionBar();
        this.updateSelectAllButton();
    },

    async deleteSelected() {
        if (this.selectedIds.size === 0) return;

        const ids = Array.from(this.selectedIds);
        const data = await MealPlanner.post('/delete_multiple_notifications', { notification_ids: ids });

        if (data.success) {
            ids.forEach(id => {
                const item = document.querySelector(`.notification-item[data-notification-id="${id}"]`);
                if (item) MealPlanner.animateRemove(item);
            });

            this.selectedIds.clear();
            this.updateSelectionBar();

            setTimeout(() => {
                if (document.querySelectorAll('.notification-item').length === 0) {
                    location.reload();
                }
            }, 350);
        }
    },

    async deleteSingle(id, button) {
        const data = await MealPlanner.post(`/delete_notification/${id}`);
        if (data.success) {
            const item = button.closest('.notification-item');
            this.selectedIds.delete(String(id));
            this.updateSelectionBar();

            MealPlanner.animateRemove(item, () => {
                if (document.querySelectorAll('.notification-item').length === 0) {
                    location.reload();
                }
            });
        }
    }
};

// Global functions for onclick handlers
window.toggleSelectAll = () => Notifications.toggleSelectAll();
window.clearNotificationSelection = () => Notifications.clearSelection();
window.deleteSelectedNotifications = () => Notifications.deleteSelected();

// =============================================================================
// STAR RATING INPUT (Add/Edit Meal Forms)
// =============================================================================

const StarRatingInput = {
    init() {
        const ratingInput = document.getElementById('ratingInput');
        if (!ratingInput) return;

        const ratingValue = document.getElementById('rating');
        const stars = ratingInput.querySelectorAll('.star-input');

        stars.forEach(star => {
            star.addEventListener('click', () => {
                const value = parseInt(star.dataset.value);
                ratingValue.value = value;
                this.updateStars(stars, value);
            });

            star.addEventListener('mouseenter', () => {
                const value = parseInt(star.dataset.value);
                this.highlightStars(stars, value);
            });
        });

        ratingInput.addEventListener('mouseleave', () => {
            this.updateStars(stars, parseInt(ratingValue.value));
        });
    },

    updateStars(stars, value) {
        stars.forEach((star, index) => {
            star.textContent = index < value ? '★' : '☆';
            star.classList.toggle('filled', index < value);
        });
    },

    highlightStars(stars, value) {
        stars.forEach((star, index) => {
            star.textContent = index < value ? '★' : '☆';
        });
    }
};

// =============================================================================
// INITIALIZATION
// =============================================================================

// Initialize theme immediately (before DOMContentLoaded)
ThemeManager.init();

document.addEventListener('DOMContentLoaded', () => {
    FlashMessages.init();
    Navigation.init();
    MealActions.init();
    HudsMenu.init();
    Notifications.init();
    StarRatingInput.init();
});
