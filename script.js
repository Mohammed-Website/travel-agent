// function to format numbers with commas
function formatNumber(num) {
    if (num === null || num === undefined || num === '') return '';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}





// Sample array data (will be replaced with data from JSON)
let offersData = {};

// Load data from JSON file
function loadOffersData() {
    return fetch('data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Merge the loaded data with default data structure
            offersData = {
                ...offersData, // Keep default data as fallback
                ...data,      // Override with loaded data
                offers: data.offers || offersData.offers // Handle offers array specially
            };
            console.log('Data loaded successfully:', offersData);
            return offersData;
        })
        .catch(error => {
            console.error('Error loading JSON data, using default data:', error);
            return offersData; // Return default data on error
        });
}

// DOM Elements
const offersContainer = document.querySelector('.offers-container');
const categoryButtons = document.querySelectorAll('.category-btn');
const ReadyToUseofferModal = document.getElementById('ready-to-use-offer-modal');
const closeReadyToUseOfferModal = document.querySelector('.close-modal');
const modalMainImage = document.getElementById('modal-main-image');
const thumbnailsContainer = document.getElementById('thumbnails');
const modalOfferTitle = document.getElementById('modal-offer-title');
const modalRating = document.getElementById('modal-rating');
const modalReviewCount = document.getElementById('modal-review-count');
const modalPrice = document.getElementById('modal-price');
const modalDates = document.getElementById('modal-dates');
const modalDescription = document.getElementById('modal-description');
const modalNote = document.getElementById('modal-note');
const addToFavBtn = document.getElementById('add-to-fav');
const addToCartBtn = document.getElementById('add-to-cart');
const whatsappBtn = document.getElementById('whatsapp-btn');
const favoritesIcon = document.getElementById('favorites-icon');
const cartIcon = document.getElementById('cart-icon');
const favoritesSidebar = document.getElementById('favorites-sidebar');
const cartSidebar = document.getElementById('cart-sidebar');
const closeFavoritesSidebar = document.querySelector('#favorites-sidebar .close-sidebar');
const closeCartSidebar = document.querySelector('#cart-sidebar .close-sidebar');
const favoritesContent = document.getElementById('favorites-content');
const cartContent = document.getElementById('cart-content');
const cartTotalPrice = document.getElementById('cart-total-price');
const checkoutBtn = document.getElementById('checkout-btn');

// Highlighted Offer Elements
const highlightedOfferTitle = document.getElementById('highlighted-offer-title');
const highlightedOfferDescription = document.getElementById('highlighted-offer-description');
const highlightedOfferImage = document.getElementById('highlighted-offer-image');
const highlightedOfferBtn = document.getElementById('highlighted-offer-btn');



// Fullscreen image viewer elements
const fullscreenOverlay = document.getElementById('fullscreen-image-overlay');
const fullscreenImage = document.getElementById('fullscreen-image');
const closeFullscreenBtn = document.querySelector('.close-fullscreen-image');




// State variables
let currentCategory = 'all';
let currentOffer = null;
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Update the init function to include slider initialization
async function init() {
    try {
        // Wait for data to load before initializing the slider
        await loadOffersData();

        // Set logo image src dynamically after data is loaded
        document.querySelector('.logo-img').src = offersData.companyLogo.image;

        updateFavoritesCount();

        // Initialize layout
        initializeLayout();

        // Now that we have the data, set up the UI
        setupEventListeners();
        updateCartCount();
        displayHighlightedOffer();

        // Initialize intro section with JSON data
        initializeIntroSection();

        // Initialize service goals section
        initializeServiceGoalsSection();

        // Initialize achievement counters
        initializeAchievementCounters();

        // Display initial offers
        displayOffers('all');

        // Fetch reviews after data is loaded
        fetchReviews();
    } catch (error) {
        console.error('Initialization error:', error);
    }
}

// Display highlighted offer
function displayHighlightedOffer() {
    if (offersData.highlightOffer) {
        const highlightData = offersData.highlightOffer;

        // Title
        if (highlightedOfferTitle) {
            highlightedOfferTitle.textContent = highlightData.title || 'عرض مميز';
        }

        // Description
        if (highlightedOfferDescription) {
            highlightedOfferDescription.textContent = highlightData.highlightOffer_description || highlightData.description || 'احجز الآن واحصل على خصم 20%';
        }

        // Image
        if (highlightedOfferImage) {
            highlightedOfferImage.src = highlightData.images[0];
            highlightedOfferImage.alt = highlightData.title || 'عرض مميز';
        }

        // Price, Old Price, Dates
        const priceElem = document.getElementById('highlighted-offer-price');
        const oldPriceElem = document.getElementById('highlighted-offer-oldPrice');
        const datesElem = document.getElementById('highlighted-offer-dates');
        if (priceElem) {
            const price = highlightData.price || '?';
            priceElem.textContent = price ? `${formatNumber(price)} ر.س` : '';
        }
        if (oldPriceElem) {
            const oldPrice = highlightData.oldPrice || '?';
            oldPriceElem.textContent = oldPrice ? `${formatNumber(oldPrice)} ر.س` : '';
        }
        if (datesElem) {
            datesElem.textContent = highlightData.dates || 'ترايخ العرض ليس محدد بعد';
        }
    }
}

// Set up all event listeners
function setupEventListeners() {
    // Category buttons
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            const category = button.dataset.category;
            currentCategory = category;
            displayOffers(category);

            // Update active button
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');


            document.querySelector('.offers-category-title')?.scrollIntoView({ behavior: 'smooth', block: 'center' });

        });
    });

    // Highlighted offer buttons
    if (highlightedOfferBtn) {
        highlightedOfferBtn.addEventListener('click', () => {
            // Open the highlightOffer in the modal
            if (offersData.highlightOffer) {
                openOfferModal(offersData.highlightOffer);
            } else {
                // Fallback: share on WhatsApp
                shareHighlightedOfferOnWhatsApp();
            }
        });
    }

    // Highlighted offer buttons
    if (highlightedOfferImage) {
        highlightedOfferImage.addEventListener('click', () => {
            // Open the highlightOffer in the modal
            if (offersData.highlightOffer) {
                openOfferModal(offersData.highlightOffer);
            } else {
                // Fallback: share on WhatsApp
                shareHighlightedOfferOnWhatsApp();
            }
        });
    }

    // Modal close button
    closeReadyToUseOfferModal.addEventListener('click', () => {
        ReadyToUseofferModal.style.display = 'none';
    });

    // Close ReadyToUseofferModal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === ReadyToUseofferModal) {
            ReadyToUseofferModal.style.display = 'none';
        }
    });

    // Favorites icon
    favoritesIcon.addEventListener('click', () => {
        favoritesSidebar.style.right = '0';
        displayFavorites();
    });

    // Cart icon
    cartIcon.addEventListener('click', () => {
        cartSidebar.style.right = '0';
        displayCart();
    });

    // Close favorites sidebar
    closeFavoritesSidebar.addEventListener('click', () => {
        favoritesSidebar.style.right = '-100%';
    });

    // Close cart sidebar
    closeCartSidebar.addEventListener('click', () => {
        cartSidebar.style.right = '-100%';
    });

    // Add to favorites button
    addToFavBtn.addEventListener('click', toggleFavorite);

    // Add to cart button
    addToCartBtn.addEventListener('click', addToCart);

    // WhatsApp button
    whatsappBtn.addEventListener('click', shareOnWhatsApp);

    // Checkout button
    checkoutBtn.addEventListener('click', checkout);


    if (modalMainImage) {
        modalMainImage.addEventListener('click', () => {
            console.log('modalMainImage clicked');
            fullscreenImage.src = modalMainImage.src;
            fullscreenOverlay.style.display = 'flex'; // Ensure overlay is visible
            // Force reflow to allow transition
            void fullscreenOverlay.offsetWidth;
            fullscreenOverlay.classList.add('active');
            console.log('Fullscreen overlay should be shown (display:flex, .active added)');
        });
    }

    if (fullscreenOverlay && closeFullscreenBtn) {
        closeFullscreenBtn.addEventListener('click', () => {
            fullscreenOverlay.style.display = 'none';
            fullscreenImage.src = '';
            setTimeout(() => {
                fullscreenOverlay.classList.remove('active');
            }, 5);
        });
        fullscreenOverlay.addEventListener('click', (e) => {
            if (e.target === fullscreenOverlay) {
                fullscreenOverlay.style.display = 'none';
                fullscreenImage.src = '';
                setTimeout(() => {
                    fullscreenOverlay.classList.remove('active');
                }, 5);
            }
        });
        // Prevent closing when clicking on the image or close button
        fullscreenImage.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
}

function getCategoryName(category) {
    switch (category) {
        case 'all': return 'كل العروض';
        case 'newest': return 'أحدث العروض';
        case 'popular': return 'الأكثر طلباً';
        case 'honeymoon': return 'عروض شهر العسل';
        case 'family': return 'عروض العائلات';
        case 'girls': return 'عروض البنات';
        case 'guys': return 'عروض الشباب';
        default: return category;
    }
}

// Display offers based on category
function displayOffers(category) {
    if (category === 'all') {
        // Clear container
        offersContainer.innerHTML = '';
        // Define the order and mapping of categories
        const categoryOrder = [
            { key: 'newest', label: 'أحدث العروض' },
            { key: 'popular', label: 'الأكثر طلباً' },
            { key: 'honeymoon', label: 'عروض شهر العسل' },
            { key: 'family', label: 'عروض العائلات' },
            { key: 'girls', label: 'عروض البنات' },
            { key: 'guys', label: 'عروض الشباب' }
        ];
        categoryOrder.forEach(cat => {
            // Filter offers for this category
            const filteredOffers = offersData.offers.filter(offer => offer.category && offer.category.includes(cat.key)).slice(0, 4);
            if (filteredOffers.length > 0) {
                // Create section title
                const sectionTitle = document.createElement('h2');
                sectionTitle.className = 'offers-category-title';
                sectionTitle.textContent = cat.label;
                offersContainer.appendChild(sectionTitle);
                // Create cards group
                const cardsGroup = document.createElement('div');
                cardsGroup.className = 'offers-cards-group';
                filteredOffers.forEach(offer => {
                    const offerCard = document.createElement('div');
                    offerCard.className = 'offer-card';
                    offerCard.innerHTML = `
                        <div class="offer-image-wrapper" style="position:relative;">
                            <img src="${offer.images[0]}" alt="${offer.title}" class="offer-image" loading="lazy" width="220" height="120">
                            ${offer.label ? `<span class="offer-label-badge">${offer.label}</span>` : ''}
                        </div>
                        <div class="offer-info">
                            <h3 class="offer-title">${offer.title}</h3>
                            <p class="offer-price">${formatNumber(offer.price)} ر.س <span class="old-price">${formatNumber(offer.oldPrice)} ر.س</span></p>
                            <p class="offer-dates">${offer.dates}</p>
                            <div class="offer-rating">
                                ${generateStars(offer.rating)} (${offer.reviews})
                            </div>
                        </div>
                    `;
                    offerCard.addEventListener('click', () => openOfferModal(offer));
                    cardsGroup.appendChild(offerCard);
                });
                offersContainer.appendChild(cardsGroup);
            }
        });
        // If no offers at all, show empty state
        if (offersContainer.innerHTML.trim() === '') {
            offersContainer.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <i class="fas fa-suitcase"></i>
                    <p>لا توجد عروض متاحة حالياً</p>
                </div>
            `;
        }
        return;
    }
    offersContainer.innerHTML = `
        <h2 class="offers-category-title">${getCategoryName(category)}</h2>
        <div class="offers-cards-group"></div>
    `;
    let filteredOffers = [];
    if (category === 'all') {
        filteredOffers = offersData.offers.slice(0, 6);
    } else {
        filteredOffers = offersData.offers.filter(offer =>
            offer.category.includes(category)
        );
    }
    const cardsGroup = offersContainer.querySelector('.offers-cards-group');
    if (filteredOffers.length === 0) {
        cardsGroup.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <i class="fas fa-suitcase"></i>
                <p>لا توجد عروض متاحة في هذه الفئة حالياً</p>
            </div>
        `;
        return;
    }
    filteredOffers.forEach(offer => {
        const offerCard = document.createElement('div');
        offerCard.className = 'offer-card';
        offerCard.innerHTML = `
            <div class="offer-image-wrapper" style="position:relative;">
                <img src="${offer.images[0]}" alt="${offer.title}" class="offer-image" loading="lazy" width="220" height="120">
                ${offer.label ? `<span class="offer-label-badge">${offer.label}</span>` : ''}
            </div>
            <div class="offer-info">
                <h3 class="offer-title">${offer.title}</h3>
                <p class="offer-price">${formatNumber(offer.price)} ر.س <span class="old-price">${formatNumber(offer.oldPrice)} ر.س</span></p>
                <p class="offer-dates">${offer.dates}</p>
                <div class="offer-rating">
                    ${generateStars(offer.rating)} (${offer.reviews})
                </div>
            </div>
        `;
        offerCard.addEventListener('click', () => openOfferModal(offer));
        cardsGroup.appendChild(offerCard);
    });
}

// Generate star rating HTML
function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let starsHTML = '';

    for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
            starsHTML += '<i class="fas fa-star"></i>';
        } else if (i === fullStars && hasHalfStar) {
            starsHTML += '<i class="fas fa-star-half-alt"></i>';
        } else {
            starsHTML += '<i class="far fa-star"></i>';
        }
    }

    return starsHTML;
}

// Open offer ReadyToUseofferModal with details
function openOfferModal(offer) {
    currentOffer = offer;

    // Fallbacks for highlightOffer fields
    const images = offer.images || (offer.highlightData.images[0] ? [offer.highlightData.images[0]] : []);
    const title = offer.title || offer.title || 'عرض مميز';
    const price = offer.price || '?';
    const oldPrice = offer.oldPrice || '?';
    const description = offer.description || offer.highlightOffer_description || '';
    const dates = offer.dates || '';
    const note = offer.note || '';
    const rating = offer.rating || 0;
    const reviews = offer.reviews || 0;

    // Set main image
    modalMainImage.src = images[0] || '';
    modalMainImage.alt = title;
    modalMainImage.onclick = function () {
        fullscreenImage.src = modalMainImage.src;
        fullscreenOverlay.style.display = 'flex'; // Ensure overlay is visible
        fullscreenOverlay.classList.add('active');
    };

    // Set thumbnails
    thumbnailsContainer.innerHTML = '';
    images.forEach((image, index) => {
        const thumbnail = document.createElement('img');
        thumbnail.src = image;
        thumbnail.alt = title;
        thumbnail.className = 'thumbnail' + (index === 0 ? ' active' : '');
        thumbnail.loading = 'lazy';
        thumbnail.width = 60;
        thumbnail.height = 60;
        thumbnail.addEventListener('click', () => {
            modalMainImage.src = image;
            document.querySelectorAll('.thumbnail').forEach(thumb =>
                thumb.classList.remove('active')
            );
            thumbnail.classList.add('active');
        });
        thumbnailsContainer.appendChild(thumbnail);
    });

    // Set offer details
    modalOfferTitle.textContent = title;
    modalRating.innerHTML = generateStars(rating);
    modalReviewCount.textContent = `(${reviews})`;
    modalPrice.innerHTML = `
        ${formatNumber(price)} ر.س 
        <span class="old-price">${formatNumber(oldPrice)} ر.س</span>
    `;
    modalDates.textContent = dates;
    modalDescription.textContent = description;
    modalNote.textContent = note || '';

    // Update favorite button state
    const isFavorite = favorites.some(fav => fav.id === offer.id);
    addToFavBtn.classList.toggle('active', isFavorite);
    addToFavBtn.innerHTML = `
        <i class="${isFavorite ? 'fas' : 'far'} fa-heart"></i> 
        ${isFavorite ? 'في المفضلة' : 'المفضلة'}
    `;

    // Show modal
    ReadyToUseofferModal.style.display = 'block';
}

// Toggle offer favorite status
function toggleFavorite() {
    if (!currentOffer) return;

    const index = favorites.findIndex(fav => fav.id === currentOffer.id);

    if (index === -1) {
        // Add to favorites
        favorites.push(currentOffer);
        addToFavBtn.classList.add('active');
        addToFavBtn.innerHTML = '<i class="fas fa-heart"></i> في المفضلة';
    } else {
        // Remove from favorites
        favorites.splice(index, 1);
        addToFavBtn.classList.remove('active');
        addToFavBtn.innerHTML = '<i class="far fa-heart"></i> المفضلة';
    }

    // Save to localStorage
    localStorage.setItem('favorites', JSON.stringify(favorites));

    // Update favorites display if sidebar is open
    if (favoritesSidebar.style.right === '0px') {
        displayFavorites();
    }

    updateFavoritesCount();
}

// Display favorites in sidebar
function displayFavorites() {
    favoritesContent.innerHTML = '';

    if (favorites.length === 0) {
        favoritesContent.innerHTML = `
            <div class="empty-state">
                <i class="far fa-heart"></i>
                <p>لا توجد عروض في المفضلة</p>
            </div>
        `;
        return;
    }

    favorites.forEach((offer, index) => {
        const favItem = document.createElement('div');
        favItem.className = 'fav-item';
        favItem.innerHTML = `
            <span class="item-serial">${index + 1}</span>
            <img src="${offer.images[0]}" alt="${offer.title}" class="fav-item-img" loading="lazy" width="80" height="80">
            <div class="fav-item-details">
                <h4 class="fav-item-title">${offer.title}</h4>
                <p class="fav-item-price">${formatNumber(offer.price)} ر.س</p>
                <button class="add-to-cart-btn" data-id="${offer.id}">
                    <i class="fas fa-cart-plus"></i> أضف للسلة
                </button>
                <button class="remove-fav-btn" data-id="${offer.id}">
                    <i class="fas fa-trash"></i> إزالة
                </button>
            </div>
        `;
        favoritesContent.appendChild(favItem);
    });

    // Add event listeners to dynamically created buttons
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const offerId = parseInt(e.target.closest('button').dataset.id);
            const offer = offersData.offers.find(o => o.id === offerId);
            if (offer) {
                addToCartItem(offer);
            }
        });
    });

    document.querySelectorAll('.remove-fav-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const offerId = parseInt(e.target.closest('button').dataset.id);
            const index = favorites.findIndex(fav => fav.id === offerId);
            if (index !== -1) {
                favorites.splice(index, 1);
                localStorage.setItem('favorites', JSON.stringify(favorites));
                displayFavorites();
                updateFavoritesCount();

                // Update favorite button in ReadyToUseofferModal if this offer is currently displayed
                if (currentOffer && currentOffer.id === offerId) {
                    addToFavBtn.classList.remove('active');
                    addToFavBtn.innerHTML = '<i class="far fa-heart"></i> المفضلة';
                }
            }
        });
    });
}

// Add offer to cart
function addToCart() {
    if (!currentOffer) return;
    addToCartItem(currentOffer);
}

// Add specific offer to cart
function addToCartItem(offer) {
    const existingItem = cart.find(item => item.id === offer.id);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...offer,
            quantity: 1
        });
    }

    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));

    // Update cart count
    updateCartCount();

    // Show confirmation
    alert(`تمت إضافة "${offer.title}" إلى سلة التسوق`);

    // Update cart display if sidebar is open
    if (cartSidebar.style.right === '0px') {
        displayCart();
    }
}

function displayCart() {
    console.log("Displaying cart..."); // Debug log
    console.log("Current cart contents:", JSON.stringify(cart, null, 2)); // Debug log

    cartContent.innerHTML = '';

    if (cart.length === 0) {
        console.log("Cart is empty"); // Debug log
        cartContent.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-shopping-cart"></i>
                <p>سلة التسوق فارغة</p>
            </div>
        `;
        cartTotalPrice.textContent = '0 ر.س';
        return;
    }

    let total = 0;

    cart.forEach((item, index) => {
        // Safely get values with fallbacks
        const itemId = item.id || 'unknown';
        const itemTitle = item.title || item.name || 'عنوان غير معروف';
        const itemPrice = item.price || 0;
        const itemQuantity = item.quantity || 1;
        let itemImage;
        if (item.images && item.images.length > 0 && item.images[0]) {
            itemImage = item.images[0];
        } else if (item.image) {
            itemImage = item.image;
        } else {
            itemImage = 'https://via.placeholder.com/150?text=No+Image';
        }
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <span class="item-serial">${index + 1}</span>
            <img src="${itemImage}" alt="${itemTitle}" class="cart-item-img" loading="lazy" width="80" height="80">
            <div class="cart-item-details">
                <h4 class="cart-item-title">${itemTitle}</h4>
                <p class="cart-item-price">${formatNumber(itemPrice)} ر.س</p>
                <div class="cart-item-actions">
                    <div class="quantity-control">
                        <button class="quantity-btn minus" data-id="${itemId}">-</button>
                        <span class="quantity">${itemQuantity}</span>
                        <button class="quantity-btn plus" data-id="${itemId}">+</button>
                    </div>
                    <span class="remove-item" data-id="${itemId}">إزالة</span>
                </div>
            </div>
        `;
        cartContent.appendChild(cartItem);
        total += itemPrice * itemQuantity;
    });

    // Update total
    console.log("Calculated total:", total); // Debug log
    cartTotalPrice.textContent = `${formatNumber(total)} ر.س`;

    // Add event listeners to dynamically created buttons
    document.querySelectorAll('.quantity-btn.minus').forEach(button => {
        button.addEventListener('click', (e) => {
            const offerId = e.target.closest('button').dataset.id;
            console.log("Decreasing quantity for item:", offerId); // Debug log
            updateCartItemQuantity(offerId, -1);
        });
    });

    document.querySelectorAll('.quantity-btn.plus').forEach(button => {
        button.addEventListener('click', (e) => {
            const offerId = e.target.closest('button').dataset.id;
            console.log("Increasing quantity for item:", offerId); // Debug log
            updateCartItemQuantity(offerId, 1);
        });
    });

    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', (e) => {
            const offerId = e.target.closest('span').dataset.id;
            console.log("Removing item from cart:", offerId); // Debug log
            removeFromCart(offerId);
        });
    });
}

// Update cart item quantity
function updateCartItemQuantity(offerId, change) {
    // Convert offerId to same type as stored in cart (some are strings, some numbers)
    const itemIndex = cart.findIndex(item =>
        item.id == offerId || item.id.toString() === offerId.toString()
    );

    if (itemIndex !== -1) {
        cart[itemIndex].quantity = (cart[itemIndex].quantity || 1) + change;

        if (cart[itemIndex].quantity <= 0) {
            cart.splice(itemIndex, 1);
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        displayCart();
    }
}

// Remove item from cart
function removeFromCart(offerId) {
    // Convert offerId to same type as stored in cart
    const itemIndex = cart.findIndex(item =>
        item.id == offerId || item.id.toString() === offerId.toString()
    );

    if (itemIndex !== -1) {
        cart.splice(itemIndex, 1);
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        displayCart();
    }
}

// Update cart count in header
function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    document.querySelector('.cart-count').textContent = count;
}

// Share offer via WhatsApp
function shareOnWhatsApp() {
    if (!currentOffer) return;

    const phoneNumber = '+966569446280'; // Replace with your WhatsApp number
    const message = `أهلاً، حاب استفسر عن العرض التالي:
    
*${currentOffer.title}*
- السعر القديم: ${formatNumber(currentOffer.oldPrice)} ر.س
- السعر الحالي: ${formatNumber(currentOffer.price)} ر.س
${currentOffer.description}

${currentOffer.dates}
${currentOffer.note ? 'ملاحظة: ' + currentOffer.note : ''}

${currentOffer.images && currentOffer.images.length > 0 ? `صورة العرض: ${currentOffer.images[0]}` : ''}

الرجاء تزويدي بتوافر العرض او بالعروض المشابهة.`;

    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}

// Checkout via WhatsApp
function checkout() {
    if (cart.length === 0) return;

    const phoneNumber = '+966569446280'; // Replace with your WhatsApp number
    let message = `أهلاً، حاب احجز العروض التالية:\n\n`;
    let total = 0;

    cart.forEach(item => {
        message += `*${item.title}*
الكمية: ${item.quantity}
- السعر القديم: ${formatNumber(item.oldPrice)} ر.س
- السعر الحالي: ${formatNumber(item.price)} ر.س
المجموع: ${formatNumber(item.price * item.quantity)} ر.س
${item.images && item.images.length > 0 ? `صورة العرض: ${item.images[0]}` : ''}\n\n\n`;
        total += item.price * item.quantity;
    });

    message += `*المجموع الكلي: ${formatNumber(total)} ر.س*\n\nالرجاء تزويدي بتوافر هذه العروض.`;

    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}

// Share highlighted offer via WhatsApp
function shareHighlightedOfferOnWhatsApp() {
    const phoneNumber = '+966569446280'; // Replace with your WhatsApp number
    const highlightData = offersData.highlightOffer || {};

    let message = `أهلاً بك، أرغب في الاستفسار عن العرض المميز:\n\n`;

    if (highlightData.title) {
        message += `*${highlightData.title}*\n`;
    }

    if (highlightData.description) {
        message += `${highlightData.description}\n\n`;
    }

    if (highlightData.price && highlightData.oldPrice) {
        message += `السعر القديم: ${formatNumber(highlightData.oldPrice)} ر.س\n`;
        message += `السعر الحالي: ${formatNumber(highlightData.price)} ر.س\n`;
    }

    if (highlightData.dates) {
        message += `التواريخ: ${highlightData.dates}\n`;
    }

    if (highlightData.discount) {
        message += `الخصم: ${highlightData.discount}\n\n`;
    }

    if (highlightData.images && highlightData.images.length > 0) {
        message += `صورة العرض: ${highlightData.images[0]}\n\n`;
    }

    message += `الرجاء تزويدي بتوافر العرض او بالعروض المشابهة.`;

    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}

// Add this function
function updateFavoritesCount() {
    const count = favorites.length;
    document.querySelector('.favorites-count').textContent = count;
}

// Dynamically set the sticky top of .categories to match header height
function updateCategoriesStickyTop() {
    const header = document.querySelector('header');
    const categories = document.querySelector('.categories');
    if (header && categories) {
        const headerHeight = header.offsetHeight;
        categories.style.top = headerHeight + 'px';
    }
}

// Function to update header height CSS custom property and intro section height
function updateHeaderHeight() {
    const header = document.querySelector('header');
    const introSection = document.querySelector('.intro-section');

    if (header) {
        const headerHeight = header.offsetHeight;
        document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);

        // Also directly set the intro section height as a fallback
        if (introSection) {
            const windowHeight = window.innerHeight;
            const newHeight = windowHeight - headerHeight;
            introSection.style.height = `${newHeight}px`;
            introSection.style.minHeight = `${newHeight}px`;
        }
    }
}

// Function to handle viewport height changes (especially for mobile browsers)
function updateViewportHeight() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);

    // Update intro section height again with new viewport height
    updateHeaderHeight();
}

// Initialize layout functions
function initializeLayout() {
    updateHeaderHeight();
    updateCategoriesStickyTop();
    updateViewportHeight();
}

// Initialize on DOM content loaded
window.addEventListener('DOMContentLoaded', initializeLayout);

// Initialize the app
init();

// Service Goals and Achievements Section Management
function initializeServiceGoalsSection() {
    const serviceGoalsImagesContainer = document.getElementById('serviceGoalsImages');

    if (!serviceGoalsImagesContainer || !offersData?.webIntroImages?.images) return;

    // Clear existing images
    serviceGoalsImagesContainer.innerHTML = '';

    // Create image elements from JSON data
    offersData.webIntroImages.images.forEach((imageUrl, index) => {
        const img = document.createElement('img');
        img.src = imageUrl;
        img.alt = `Service goal background ${index + 1}`;
        img.classList.add('service-goals-image');
        if (index === 0) img.classList.add('active');
        serviceGoalsImagesContainer.appendChild(img);
    });

    // Image switching logic
    const serviceImages = document.querySelectorAll('.service-goals-image');
    let currentServiceImageIndex = 0;

    function switchServiceImage() {
        if (serviceImages.length === 0) return;

        // Remove active class from current image
        serviceImages[currentServiceImageIndex].classList.remove('active');

        // Move to next image
        currentServiceImageIndex = (currentServiceImageIndex + 1) % serviceImages.length;

        // Add active class to new image
        serviceImages[currentServiceImageIndex].classList.add('active');
    }

    // Start image switching every 6 seconds (slower than intro for variety)
    const serviceImageInterval = setInterval(switchServiceImage, 6000);

    return () => {
        clearInterval(serviceImageInterval);
    };
}

// Achievement Numbers Counting Animation
function initializeAchievementCounters() {
    const achievementNumbers = document.querySelectorAll('.achievement-number');

    // Intersection Observer to trigger counting when section is visible
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const numberElement = entry.target;
                const targetNumber = parseInt(numberElement.getAttribute('data-target'));

                if (!numberElement.classList.contains('counted')) {
                    animateNumber(numberElement, targetNumber);
                    numberElement.classList.add('counted');
                }
            }
        });
    }, {
        threshold: 0.5,
        rootMargin: '0px 0px -50px 0px'
    });

    // Observe all achievement numbers
    achievementNumbers.forEach(number => {
        observer.observe(number);
    });
}

// Animate number counting
function animateNumber(element, targetNumber) {
    const duration = 2000; // 2 seconds
    const startTime = performance.now();
    const startNumber = 0;

    // Check if target has a plus sign
    const hasPlusSign = element.getAttribute('data-target').includes('+');
    const actualTargetNumber = Math.abs(targetNumber); // Remove sign for calculation

    function updateNumber(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentNumber = Math.floor(startNumber + (actualTargetNumber - startNumber) * easeOutQuart);

        // Format number with commas and add plus sign if needed
        const formattedNumber = formatNumber(currentNumber);
        element.textContent = hasPlusSign ? `+${formattedNumber}` : formattedNumber;

        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        } else {
            // Ensure final number is exact
            const finalFormattedNumber = formatNumber(actualTargetNumber);
            element.textContent = hasPlusSign ? `+${finalFormattedNumber}` : finalFormattedNumber;
        }
    }

    requestAnimationFrame(updateNumber);
}

// Function to initialize intro section with images from JSON data
function initializeIntroSection() {
    const introImagesContainer = document.getElementById('introImages');
    const headlines = document.querySelectorAll('.intro-headline, .intro-subhead, .intro-cta');
    const scrollHint = document.getElementById('scrollHint');

    // Get images from the loaded data, fallback to default images
    const imagesData = offersData.webIntroImages.images;

    // Clear existing images
    if (introImagesContainer) {
        introImagesContainer.innerHTML = '';
    }

    // Create image elements
    imagesData.forEach((imageUrl, index) => {
        const img = document.createElement('img');
        img.src = imageUrl;
        img.alt = `Travel destination ${index + 1}`;
        img.classList.add('intro-image');
        if (index === 0) img.classList.add('active');
        if (introImagesContainer) {
            introImagesContainer.appendChild(img);
        }
    });

    // Image switching logic
    const images = document.querySelectorAll('.intro-image');
    let currentImageIndex = 0;

    function switchImage() {
        if (images.length === 0) return;

        // Remove active class from current image
        images[currentImageIndex].classList.remove('active');

        // Move to next image
        currentImageIndex = (currentImageIndex + 1) % images.length;

        // Add active class to new image
        images[currentImageIndex].classList.add('active');
    }

    // Start image switching every 5 seconds
    const imageInterval = setInterval(switchImage, 5000);

    // Animate elements on page load
    setTimeout(() => {
        headlines.forEach(headline => {
            headline.classList.add('active');
        });
        if (scrollHint) {
            scrollHint.classList.add('active');
        }
    }, 500);

    // Return cleanup function
    return () => {
        clearInterval(imageInterval);
    };
}

// Handle mobile viewport height
function adjustViewportHeight() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

window.addEventListener('resize', adjustViewportHeight);
adjustViewportHeight();







/* Comments */
document.getElementById("user_comment_form").addEventListener("submit", async function (event) {
    event.preventDefault();
    const button = document.querySelector("#user_comment_form button[type='submit']");
    button.disabled = true;
    button.style.background = "gray";
    button.style.color = "white";
    button.innerText = "Posting...";

    let reviewer_name = document.getElementById("user_comment_username").value.trim();
    let comment = document.getElementById("user_comment_text").value.trim();
    let stars = parseInt(document.getElementById("user_comment_stars").value);
    let review_date = new Date().toISOString().split("T")[0];

    const newComment = {
        review_date,
        reviewer_name,
        comment,
        stars
    };

    try {
        // Target column name
        const column = "khalil_travel_company";

        // Fetch existing array in that column (assume row with id = 1)
        const { data, error: fetchError } = await supabase
            .from("all_customers_comments")
            .select(column)
            .eq("id", 1)
            .single();

        if (fetchError) throw fetchError;

        const existingArray = data[column] || [];

        const updatedArray = [newComment, ...existingArray];

        // Update the column with the new array
        const { error: updateError } = await supabase
            .from("all_customers_comments")
            .update({ [column]: updatedArray })
            .eq("id", 1);

        if (updateError) throw updateError;

        document.getElementById("user_comment_form").reset();
        await fetchReviews(); // Optional: refresh UI
        showSuccessNotification();

    } catch (error) {
        console.error("Error inserting comment:", error.message);
    } finally {
        button.disabled = false;
        button.style.background = "#f0f0f0";
        button.style.color = "black";
        button.innerText = "Submit";
    }
});


// Function to Fetch and Display Reviews
async function fetchReviews() {
    try {
        const column = "khalil_travel_company";

        const { data, error } = await supabase
            .from("all_customers_comments")
            .select(column)
            .eq("id", 1)
            .single();

        if (error) throw error;

        const reviews = data[column] || [];

        let user_clint_rate_area = document.getElementById("user_clint_rate_area");
        if (!user_clint_rate_area) return;

        user_clint_rate_area.innerHTML = "";

        reviews.forEach(item => {
            const { review_date, reviewer_name, comment, stars } = item;

            if (!comment.trim()) return;

            // Use a fallback image if company logo is not available
            const logoImage = offersData?.companyLogo?.image || 'https://via.placeholder.com/150?text=Logo';

            const div = document.createElement("div");
            div.classList.add("user_card_rate_div");
            div.innerHTML = `
                <div class="card_clint_rate_date_div"><h3>${review_date}</h3></div>
                <div class="card_clint_rate_info_div">
                    <img src="${logoImage}" alt="Company Logo" title="Company Logo">
                    <h4>${reviewer_name}</h4>
                </div>
                <div class="card_clint_rate_comment_div"><h5>${comment}</h5></div>
                <div class="card_clint_rate_star_div">
                    ${"★".repeat(stars)}${"☆".repeat(5 - stars)}
                </div>
            `;
            user_clint_rate_area.appendChild(div);
        });

    } catch (error) {
        console.error("Error fetching reviews:", error.message);
    }
}


// Function to Show Floating Success Notification
function showSuccessNotification() {
    let notification = document.getElementById("new_comment_success_notification");
    notification.style.display = "block";

    setTimeout(() => {
        notification.style.opacity = "1";
        notification.style.transform = "translateX(-50%) translateY(0px)";
    }, 10);

    setTimeout(() => {
        notification.style.opacity = "0";
        notification.style.transform = "translateX(-50%) translateY(10px)";
        setTimeout(() => {
            notification.style.display = "none";
        }, 400);
    }, 3000);
}


fetchReviews();













/* Insert new click data in the Supabase */
async function insertNewClick(website) {

    // Step 1: Get current month name
    const monthNames = [
        "january", "february", "march", "april",
        "may", "june", "july", "august",
        "september", "october", "november", "december"
    ];
    const currentMonth = monthNames[new Date().getMonth()];

    // Step 2: Fetch the current row for the website
    const { data, error } = await supabase
        .from("click_counter")
        .select("*")
        .eq("website", website)
        .single();

    if (error) {
        console.error("Error fetching data:", error.message);
        return;
    }

    // Step 3: Parse the current value (e.g., "Clicks 4")
    let rawValue = data[currentMonth];
    let currentCount = 0;

    if (rawValue && typeof rawValue === "string" && rawValue.startsWith("Clicks ")) {
        currentCount = parseInt(rawValue.replace("Clicks ", ""), 10) || 0;
    }

    // Step 4: Increment the value
    let newCount = currentCount + 1;
    let newValue = `Clicks ${newCount}`;

    // Step 5: Update the table
    const { error: updateError } = await supabase
        .from("click_counter")
        .update({ [currentMonth]: newValue })
        .eq("website", website);

    if (updateError) {
        console.error("Error updating value:", updateError.message);
        return;
    }
}














/* Elements Animation On Scroll */
const animatedElements = document.querySelectorAll('.animate-on-scroll');

function animateOnScroll() {
    const triggerPoint = window.innerHeight * 0.9;

    animatedElements.forEach(el => {
        const rect = el.getBoundingClientRect();
        const midpoint = rect.top + rect.height / 2;

        if (midpoint < triggerPoint) {
            el.classList.add('in-view');
        }
    });
}

window.addEventListener('scroll', animateOnScroll);
window.addEventListener('resize', animateOnScroll);
document.addEventListener('DOMContentLoaded', animateOnScroll); // safer than immediate call


