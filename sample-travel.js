













/* Code to reload the sounds to make sure there is no latency */
let clickSoundEffect = new Audio('click.ogg');
clickSoundEffect.preload = 'auto';

let successSoundEffect = new Audio('success.ogg');
successSoundEffect.preload = 'auto';

let errorSoundEffect = new Audio('error.ogg');
errorSoundEffect.preload = 'auto';

let isSoundEffectCooldown = false; // Flag to manage cooldown

function playSoundEffect(soundName) {

    if (isSoundEffectCooldown) return; // If in cooldown, do nothing

    isSoundEffectCooldown = true; // Set cooldown
    setTimeout(() => {
        isSoundEffectCooldown = false; // Reset cooldown after 150 milliseconds
    }, 150);

    // Play a sound effect only if the website is not muted
    let soundEffect;

    if (soundName === 'click') {
        soundEffect = clickSoundEffect;
    } else if (soundName === 'success') {
        soundEffect = successSoundEffect;
    } else if (soundName === 'error') {
        soundEffect = errorSoundEffect;
    }

    if (soundEffect) {
        soundEffect.currentTime = 0; // Ensure the audio plays from the start
        soundEffect.play();
    }
}













// Handle Dynamic Text Direction
document.querySelectorAll('.mughader_dynamic_direction_input_class').forEach(input => {
    input.addEventListener('input', function () {
        let firstChar = this.value.trim().charAt(0);

        if (firstChar) {
            // Check if the first character is Arabic
            if (firstChar.match(/[\u0600-\u06FF]/)) {
                this.style.direction = 'rtl';
            } else {
                this.style.direction = 'ltr';
            }
        }
    });
});




























scrollToWhoAreWe = function (elementIdName) {
    const targetDiv = document.getElementById(elementIdName);
    if (targetDiv) {
        const targetPosition = targetDiv.getBoundingClientRect().top + window.scrollY;
        const windowHeight = window.innerHeight;
        const scrollToPosition = targetPosition - (windowHeight / 2) + (targetDiv.clientHeight / 2);

        window.scrollTo({
            top: scrollToPosition,
            behavior: "smooth"
        });
    }
}


function scrollToMiddleOfElement(className) {
    const element = document.querySelector(`.${className}`);
    if (element) {
        const elementRect = element.getBoundingClientRect();
        const absoluteElementTop = elementRect.top + window.scrollY;
        const middlePosition = absoluteElementTop - (window.innerHeight / 2) + (elementRect.height / 2);

        window.scrollTo({
            top: middlePosition,
            behavior: 'smooth'
        });
    }
}
















































// Global object to store pre-loaded image elements
let sectionData = [];
const preloadedImages = {};
let currentActiveIndex = null;

// Function to create title cards with pre-loading and offer details
function createTitleCards(dataArray) {
    const section = document.getElementById("scrollable_cards_section_id");
    section.innerHTML = '';

    const mainTitle = document.createElement('h2');
    mainTitle.className = 'scrollable_section_title';
    mainTitle.textContent = 'عروضنا الخاصة';
    mainTitle.style.textAlign = 'center';
    section.appendChild(mainTitle);

    const titlesContainer = document.createElement('div');
    titlesContainer.className = 'title_cards_container';

    // Create hidden container for pre-loaded images
    const preloadContainer = document.createElement('div');
    preloadContainer.style.display = 'none';
    document.body.appendChild(preloadContainer);

    dataArray.forEach((data, index) => {
        // Create card
        const titleCard = document.createElement('div');
        titleCard.className = 'title_card';
        titleCard.dataset.index = index;

        // Create inner wrapper
        const innerWrapper = document.createElement('div');
        innerWrapper.className = 'title_card_inner_wrapper';

        // Add title card image if available
        if (data.title_card_image) {
            const img = document.createElement('img');
            img.src = data.title_card_image;
            img.alt = data.title || `Title Card ${index}`;
            innerWrapper.appendChild(img);
        }

        // Clean and add title
        const cleanedTitle = data.title
            .replace(/^عروض\s*/g, '') // remove "عروض" at the start
            .replace(/عرض/g, '');    // remove all "عرض"
        const title = document.createElement('h3');
        title.textContent = cleanedTitle.trim();
        innerWrapper.appendChild(title);

        // Add offer count if available
        if (data.offers && data.offers.length > 0) {
            const offerCount = document.createElement('div');
            offerCount.className = 'offer-count';
            offerCount.textContent = `${data.offers.length} عروض متاحة`;
            innerWrapper.appendChild(offerCount);
        }

        // Append innerWrapper to card
        titleCard.appendChild(innerWrapper);

        // Store pre-loaded offers
        preloadedImages[index] = [];
        if (data.offers && Array.isArray(data.offers)) {
            data.offers.forEach(offer => {
                if (offer.imageUrl) {
                    const img = new Image();
                    img.src = offer.imageUrl;
                    img.alt = offer.description;
                    preloadContainer.appendChild(img);
                    preloadedImages[index].push({
                        src: offer.imageUrl,
                        alt: offer.description,
                        element: img,
                        stars: offer.stars,
                        price: offer.price,
                        currency: offer.currency,
                        id: offer.id
                    });
                }
            });
        }

        // Click handler
        titleCard.addEventListener('click', () => {
            if (currentActiveIndex === index) {
                // Scroll to view
                const container = document.getElementById('scrollable_cards_container_id');
                if (container) {
                    container.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                }
                return;
            }

            document.querySelectorAll('.title_card').forEach(card => {
                card.classList.remove('active');
            });
            titleCard.classList.add('active');
            showImagesForTitle(index, data);
        });

        titlesContainer.appendChild(titleCard);
    });

    section.appendChild(titlesContainer);
}


// Enhanced showImagesForTitle with smooth transitions
function showImagesForTitle(index, data) {
    let container = document.getElementById('scrollable_cards_container_id');
    const isNewContainer = !container;

    // If clicking the same title card, do nothing
    if (currentActiveIndex === index) return;

    // If container exists, fade out first
    if (container && !isNewContainer) {
        const cards = document.querySelectorAll(".scrollable_card");
        if (cards.length > 0) {
            // Add fade-out class to all cards
            cards.forEach(card => {
                card.classList.add('fade-out');
            });

            // Wait for fade out to complete before updating content
            setTimeout(() => {
                updateContent(container, index, data);
                currentActiveIndex = index;
            }, 300); // Match this with the fadeOut animation duration (300ms)
            return;
        }
    }

    // Create new container if it doesn't exist or has no cards
    if (!container) {
        container = document.createElement('div');
        container.id = 'scrollable_cards_container_id';
        document.getElementById("scrollable_cards_section_id").insertAdjacentElement('beforeend', container);
    }

    // Add loading indicator
    container.innerHTML = '<div class="loading-indicator">جاري التحميل...</div>';
    container.style.opacity = '1';

    // Small delay to allow DOM to update
    setTimeout(() => {
        updateContent(container, index, data);
        currentActiveIndex = index;
    }, 50);
}

function updateContent(container, index, data) {
    // Clear the container
    container.innerHTML = '';
    container.style.opacity = '1'; // Ensure container is visible

    // If no data, show message
    if (!data || data.length === 0) {
        container.innerHTML = '<div class="no-offers">لا توجد عروض متاحة حالياً</div>';
        return;
    }

    // Add title
    const sectionTitle = document.createElement('h2');
    sectionTitle.className = 'scrollable_section_title';
    sectionTitle.textContent = data.title;
    container.appendChild(sectionTitle);

    // Create row for offers
    const row = document.createElement('div');
    row.className = 'scrollable_cards_row';

    // Add pre-loaded offers
    if (preloadedImages[index] && preloadedImages[index].length > 0) {
        preloadedImages[index].forEach((offer, idx) => {
            const card = document.createElement('div');
            card.className = 'scrollable_card';
            card.dataset.offerId = offer.id;
            card.dataset.cardIndex = idx;  // Store the card index

            // Create image container
            const imageContainer = document.createElement('div');
            imageContainer.className = 'card-image-container';

            // Add image
            const img = offer.element.cloneNode();
            img.loading = 'lazy';
            img.alt = offer.alt || 'عرض سياحي';
            img.title = offer.alt || '';

            // Create badge for offer number
            const badge = document.createElement('div');
            badge.className = 'card-badge';
            badge.textContent = `عرض ${idx + 1}`; // Changed to English for better alignment

            // Create card content
            const cardContent = document.createElement('div');
            cardContent.className = 'card-content';

            // Add title
            const title = document.createElement('h3');
            title.className = 'card-title';

            // Clean and add title
            const cleanedTitle = data.title
                .replace(/^عروض\s*/g, '')
                .replace(/عرض/g, '');

            title.textContent = cleanedTitle.trim();

            // Add description
            const description = document.createElement('p');
            description.className = 'card-description';
            description.textContent = offer.alt || 'Tour offer details';

            // Create footer for price and rating
            const footer = document.createElement('div');
            footer.className = 'card-footer';

            // Add price
            const priceContainer = document.createElement('div');
            priceContainer.className = 'price-container';

            const priceSpan = document.createElement('span');
            priceSpan.className = 'card-price';
            priceSpan.textContent = offer.price || '0';

            const currencySpan = document.createElement('span');
            currencySpan.className = 'card-currency';
            currencySpan.textContent = offer.currency || 'USD';

            priceContainer.appendChild(priceSpan);
            priceContainer.appendChild(currencySpan);

            // Add rating
            const ratingContainer = document.createElement('div');
            ratingContainer.className = 'card-rating';

            if (offer.stars > 0) {
                const ratingText = document.createElement('span');
                ratingText.textContent = offer.stars.toFixed(1);

                const starsSpan = document.createElement('span');
                starsSpan.className = 'stars';
                starsSpan.textContent = '★'.repeat(Math.floor(offer.stars));

                ratingContainer.appendChild(ratingText);
                ratingContainer.appendChild(starsSpan);
            }

            // Assemble the card
            footer.appendChild(priceContainer);
            if (offer.stars > 0) {
                footer.appendChild(ratingContainer);
            }

            cardContent.appendChild(title);
            cardContent.appendChild(description);
            cardContent.appendChild(footer);

            imageContainer.appendChild(img);
            imageContainer.appendChild(badge);

            card.appendChild(imageContainer);
            card.appendChild(cardContent);

            // Add click handler for fullscreen
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.card-badge')) {
                    openFullScreenImage(offer.src, offer.alt, idx);  // Pass the correct index
                }
            });

            // Add to row
            row.appendChild(card);
        });
    } else {
        // No offers available
        const noOffers = document.createElement('div');
        noOffers.className = 'no-offers';
        noOffers.textContent = 'لا توجد عروض متاحة حالياً';
        noOffers.style.textAlign = 'center';
        noOffers.style.padding = '20px';
        noOffers.style.width = '100%';
        row.appendChild(noOffers);
    }

    container.appendChild(row);

    // Fade in
    setTimeout(() => {
        container.style.opacity = '1';
    }, 10);

    // Scroll to view
    container.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
    });
}

// Modified getAndTransformSupabaseData to include all offer details
async function getAndTransformSupabaseData() {
    try {
        const { data, error } = await supabase
            .from('sample_travel_table')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        if (!data) return null;

        return data.map(offer => {
            const result = {
                title: offer.title,
                title_card_image: offer.title_card_image,
                offers: [] // Array to store all offers with their details
            };

            if (offer.sup_images_array && Array.isArray(offer.sup_images_array)) {
                offer.sup_images_array.forEach((imgData, index) => {
                    if (!imgData || !imgData[0]) return; // Skip invalid entries

                    const [imageUrl, description, stars, price, currency] = imgData;

                    // Handle different star rating formats
                    let starCount = 0;

                    if (typeof stars === 'string') {
                        // Handle string format (e.g., "five stars")
                        const starTextToNumber = {
                            'one star': 1,
                            'two stars': 2,
                            'three stars': 3,
                            'four stars': 4,
                            'five stars': 5
                        };
                        starCount = starTextToNumber[stars.toLowerCase()] || 0;
                    } else if (typeof stars === 'number') {
                        // Handle numeric format (e.g., 5)
                        starCount = Math.min(5, Math.max(0, Math.floor(stars)));
                    } else if (stars) {
                        // Fallback for any other non-null/undefined value
                        starCount = 5; // Default to 5 stars for any unexpected value
                    }

                    result.offers.push({
                        id: `offer_${index}`,
                        imageUrl,
                        description: description || offer.title,
                        stars: starCount,
                        price: price || '0',
                        currency: currency || 'SAR',
                        originalData: imgData // Keep original data for compatibility
                    });
                });
            }


            return result;
        });
    } catch (err) {
        console.error('Error fetching data:', err);
        return null;
    }
}

// Main function to load data and create title cards
async function loadDataAndCreateCards() {

    // 1. Get data from Supabase
    const sectionData = await getAndTransformSupabaseData();

    if (!sectionData) {
        console.error('Failed to get data from Supabase');
        return;
    }

    // 2. Create title cards with the data
    createTitleCards(sectionData);
}



// Call function to fetch the data from the Supabase database
loadDataAndCreateCards();



// Global variables to track current image and all images in the gallery
let currentFullscreenIndex = 0;
let fullscreenImages = [];
let currentFullscreenContainer = null;

function openFullScreenImage(src, text, index = 0) {
    const currentRow = document.querySelector('.scrollable_cards_row:not([style*="display: none"])');
    if (!currentRow) return;

    const cards = Array.from(currentRow.querySelectorAll('.scrollable_card'));
    fullscreenImages = cards.map((card, idx) => ({
        src: card.querySelector('img').src,
        alt: card.querySelector('img').alt || text,
        cardIndex: idx  // Store the original card index
    }));

    currentFullscreenIndex = fullscreenImages.findIndex(img => img.src === src || img.src.endsWith(src));
    if (currentFullscreenIndex === -1) currentFullscreenIndex = 0;

    if (currentFullscreenContainer) {
        updateFullscreenImage();
        return;
    }

    document.body.style.overflow = 'hidden';

    const fullScreenDiv = document.createElement('div');
    fullScreenDiv.className = 'full_screen_container';
    currentFullscreenContainer = fullScreenDiv;

    setTimeout(() => fullScreenDiv.classList.add('visible'), 10);

    const leftArrow = document.createElement('button');
    leftArrow.className = 'nav-arrow right' + (fullscreenImages.length <= 1 ? ' hidden' : '');
    leftArrow.innerHTML = '&larr;';
    leftArrow.addEventListener('click', (e) => {
        e.stopPropagation();
        navigateImages(1);
    });

    const rightArrow = document.createElement('button');
    rightArrow.className = 'nav-arrow left' + (fullscreenImages.length <= 1 ? ' hidden' : '');
    rightArrow.innerHTML = '&rarr;';
    rightArrow.addEventListener('click', (e) => {
        e.stopPropagation();
        navigateImages(-1);
    });

    const exitButton = document.createElement('button');
    exitButton.innerText = 'عودة';
    exitButton.className = 'exit_button';
    exitButton.title = 'إغلاق (Esc)';
    exitButton.addEventListener('click', closeFullScreenImage);

    const title = document.createElement('h2');
    title.className = 'full_screen_title';
    title.textContent = fullscreenImages[currentFullscreenIndex]?.alt || text;

    const imageContainer = document.createElement('div');
    imageContainer.className = 'image-container';

    const fullScreenImage = document.createElement('img');
    fullScreenImage.src = fullscreenImages[currentFullscreenIndex]?.src || src;
    fullScreenImage.alt = fullscreenImages[currentFullscreenIndex]?.alt || text;
    fullScreenImage.className = 'full_screen_image fade-in';






    /* Open full screen image functionality */
    fullScreenImage.addEventListener("click", () => {
        const fullView = document.createElement("div");
        fullView.className = "fullscreen-overlay fade-in"; // Fading animation here

        const animatedImg = document.createElement("img");
        animatedImg.src = fullScreenImage.src;
        animatedImg.className = "fullscreen-image-content zoom-fade-in"; // Zoom + fade only on image

        fullView.appendChild(animatedImg);
        document.body.appendChild(fullView);

        // Close on click
        fullView.addEventListener("click", () => {
            // Trigger both fade out (overlay) and zoom out (image)
            fullView.classList.remove("fade-in");
            fullView.classList.add("fade-out");

            animatedImg.classList.remove("zoom-fade-in");
            animatedImg.classList.add("zoom-fade-out");

            animatedImg.addEventListener("animationend", () => {
                fullView.remove();
            }, { once: true });
        });
    });







    imageContainer.appendChild(fullScreenImage);

    const whatsappButton = document.createElement('a');
    whatsappButton.className = 'whatsapp_button';
    whatsappButton.innerHTML = '<ion-icon name="logo-whatsapp"></ion-icon> إرسال هذا العرض';
    const imageUrl = fullscreenImages[currentFullscreenIndex]?.src || src;
    whatsappButton.href = `https://wa.me/+966569446280?text=💎%20طلب%20حجز%20عرض%20جديد%20💎%0A%0Aسلام%20عليكم،%20حاب%20أسأل%20عن%20عرض%0A*${encodeURIComponent(fullscreenImages[currentFullscreenIndex]?.alt || text)}*%0Aوحاب%20أعرف%20تفاصيل%20أكثر%20عن%20عروضكم%20المشابهة.%0A%0A🔗%20رابط%20صورة%20العرض:%0A${encodeURIComponent(imageUrl)}%0A%0Aبإنتظار%20ردكم%20وشكرًا%20لكم`;
    whatsappButton.target = '_blank';
    whatsappButton.rel = 'noopener noreferrer';

    // ⬇️ Fullscreen Card Data Extraction
    const clickedCard = cards[index];
    const detailsContainer = document.createElement('div');
    detailsContainer.className = 'fullscreen_card_details';

    if (clickedCard) {
        const cardTitle = clickedCard.querySelector('.card-title')?.textContent || '';
        const cardDesc = clickedCard.querySelector('.card-description')?.textContent || '';
        const cardPrice = clickedCard.querySelector('.card-price')?.textContent || '';
        const cardCurrency = clickedCard.querySelector('.card-currency')?.textContent || '';
        const cardBadge = clickedCard.querySelector('.card-badge')?.textContent || '';

        detailsContainer.innerHTML = `
            <div class="badge">${cardBadge}</div>
            <h3 class="detail-title">${cardTitle}</h3>
            <p class="detail-description">${cardDesc}</p>
            <div class="price-info">
                <span class="price">${cardPrice}</span>
                <span class="currency">${cardCurrency}</span>
            </div>
        `;
    }

    fullScreenDiv.appendChild(exitButton);
    fullScreenDiv.appendChild(leftArrow);
    fullScreenDiv.appendChild(rightArrow);
    fullScreenDiv.appendChild(title);
    fullScreenDiv.appendChild(imageContainer);
    fullScreenDiv.appendChild(detailsContainer);
    fullScreenDiv.appendChild(whatsappButton);

    fullScreenDiv.addEventListener('click', (e) => {
        if (e.target === fullScreenDiv) closeFullScreenImage();
    });

    document.body.appendChild(fullScreenDiv);

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') closeFullScreenImage();
        else if (e.key === 'ArrowLeft') navigateImages(-1);
        else if (e.key === 'ArrowRight') navigateImages(1);
    };

    document.addEventListener('keydown', handleKeyDown);
    updateArrowVisibility();

    fullScreenDiv.cleanup = () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
    };

    function navigateImages(direction) {
        if (fullscreenImages.length <= 1) return;

        currentFullscreenIndex += direction;

        if (currentFullscreenIndex < 0) currentFullscreenIndex = fullscreenImages.length - 1;
        else if (currentFullscreenIndex >= fullscreenImages.length) currentFullscreenIndex = 0;

        updateFullscreenImage();
    }

    function updateFullscreenImage() {
        const currentImage = fullscreenImages[currentFullscreenIndex];
        if (!currentImage) return;

        const img = fullScreenDiv.querySelector('.full_screen_image');
        img.classList.remove('fade-in');
        img.classList.add('fade-out');

        setTimeout(() => {
            // Update image
            img.src = currentImage.src;
            img.alt = currentImage.alt;
            img.classList.remove('fade-out');
            img.classList.add('fade-in');

            // Update title
            const title = fullScreenDiv.querySelector('.full_screen_title');
            if (title) title.textContent = currentImage.alt;

            // Update WhatsApp link
            const whatsappButton = fullScreenDiv.querySelector('.whatsapp_button');
            if (whatsappButton) {
                const imageUrl = currentImage.src;
                whatsappButton.href = `https://wa.me/+966569446280?text=💎%20طلب%20حجز%20عرض%20جديد%20💎%0A%0Aسلام%20عليكم،%20حاب%20أسأل%20عن%20عرض%0A*${encodeURIComponent(currentImage.alt)}*%0Aوحاب%20أعرف%20تفاصيل%20أكثر%20عن%20عروضكم%20المشابهة.%0A%0A🔗%20رابط%20صورة%20العرض:%0A${encodeURIComponent(imageUrl)}%0A%0Aبإنتظار%20ردكم%20وشكرًا%20لكم`;
            }

            // Update card details using the stored cardIndex
            const currentRow = document.querySelector('.scrollable_cards_row:not([style*="display: none"])');
            if (currentRow) {
                const cards = Array.from(currentRow.querySelectorAll('.scrollable_card'));
                const relatedCard = cards[currentImage.cardIndex];  // Use the stored index

                const cardTitle = relatedCard?.querySelector('.card-title')?.textContent || '';
                const cardDesc = relatedCard?.querySelector('.card-description')?.textContent || '';
                const cardPrice = relatedCard?.querySelector('.card-price')?.textContent || '';
                const cardCurrency = relatedCard?.querySelector('.card-currency')?.textContent || '';
                const cardBadge = relatedCard?.querySelector('.card-badge')?.textContent || '';

                const detailsContainer = fullScreenDiv.querySelector('.fullscreen_card_details');
                if (detailsContainer) {
                    detailsContainer.innerHTML = `
                        <div class="badge">${cardBadge}</div>
                        <h3 class="detail-title">${cardTitle}</h3>
                        <p class="detail-description">${cardDesc}</p>
                        <div class="price-info">
                            <span class="price">${cardPrice}</span>
                            <span class="currency">${cardCurrency}</span>
                        </div>
                    `;
                }
            }

            updateArrowVisibility();
        }, 200);
    }


    function updateArrowVisibility() {
        const leftArrow = fullScreenDiv.querySelector('.nav-arrow.left');
        const rightArrow = fullScreenDiv.querySelector('.nav-arrow.right');

        if (fullscreenImages.length <= 1) {
            leftArrow?.classList.add('hidden');
            rightArrow?.classList.add('hidden');
        } else {
            leftArrow?.classList.remove('hidden');
            rightArrow?.classList.remove('hidden');
        }
    }

    function closeFullScreenImage() {
        if (!currentFullscreenContainer) return;

        currentFullscreenContainer.style.opacity = '0';

        setTimeout(() => {
            if (currentFullscreenContainer.cleanup) currentFullscreenContainer.cleanup();
            currentFullscreenContainer.remove();
            currentFullscreenContainer = null;
        }, 500);
    }
}


































document.getElementById("user_comment_form").addEventListener("submit", async function (event) {
    event.preventDefault();
    const button = document.querySelector("#user_comment_form button[type='submit']");

    // Disable button to prevent multiple submissions
    button.disabled = true;
    button.style.background = "gray";
    button.innerText = "جاري النشر";

    // Get input values
    let reviewer_name = document.getElementById("user_comment_username").value.trim();
    let comment = document.getElementById("user_comment_text").value.trim();
    let stars = parseInt(document.getElementById("user_comment_stars").value);
    let review_date = new Date().toISOString().split("T")[0]; // format: YYYY-MM-DD

    try {
        // Get the current highest ID
        let { data: existingReviews, error: selectError } = await supabase
            .from("sample_customers_comments")
            .select("id")
            .order("id", { ascending: false })
            .limit(1);

        if (selectError) throw selectError;

        let nextId = existingReviews.length ? existingReviews[0].id + 1 : 1;

        // Insert new review manually with the next ID
        const { error: insertError } = await supabase.from("sample_customers_comments").insert([{
            id: nextId,
            review_date,
            reviewer_name,
            comment,
            stars
        }]);

        if (insertError) throw insertError;

        document.getElementById("user_comment_form").reset();
        await fetchReviews(); // Refresh UI
        showSuccessNotification();

    } catch (error) {
        console.error("Error submitting comment:", error.message);
    } finally {
        // Re-enable button
        button.disabled = false;
        button.style.background = "linear-gradient(to top, rgb(106, 75, 31), rgb(194, 156, 102))";
        button.innerText = "إرسال";
    }
});

// Function to Fetch and Display Reviews
async function fetchReviews() {
    try {
        const { data, error } = await supabase
            .from('sample_customers_comments')
            .select('*')
            .order('review_date', { ascending: false });

        if (error) throw error;

        let user_clint_rate_area = document.getElementById("user_clint_rate_area");
        user_clint_rate_area.innerHTML = ""; // Clear old reviews

        data.forEach(item => {
            const { review_date, reviewer_name, comment, stars } = item;

            if (!comment.trim()) return;

            let clintRateDiv = document.createElement("div");
            clintRateDiv.classList.add("user_card_rate_div");

            clintRateDiv.innerHTML = `
                <div class="card_clint_rate_date_div">
                    <h3>${review_date}</h3>
                </div>
                <div class="card_clint_rate_info_div">
                    <img src="مكتب-سياحي/مكتب-سياحي.webp" alt="وقت الصعود للسفر والسياحة - مكتب سياحي" title="وقت الصعود للسفر والسياحة - مكتب سياحي">
                    <h4>${reviewer_name}</h4>
                </div>
                <div class="card_clint_rate_comment_div">
                    <h5>${comment}</h5>
                </div>
                <div class="card_clint_rate_star_div">
                    ${"★".repeat(stars)}${"☆".repeat(5 - stars)}
                </div>
            `;

            user_clint_rate_area.appendChild(clintRateDiv);
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

// Fetch Reviews on Page Load
document.addEventListener('DOMContentLoaded', fetchReviews);


















/* Function to trach the first inserted letter in the inputs with the class name of "mughader_dynamic_direction_input_class" to set their direction value */
document.querySelectorAll('.mughader_dynamic_direction_input_class').forEach(input => {
    input.addEventListener('input', function () {
        let firstChar = this.value.trim().charAt(0);

        if (firstChar) {
            // Check if the first character is Arabic
            if (firstChar.match(/[\u0600-\u06FF]/)) {
                this.style.direction = 'rtl';
            } else {
                this.style.direction = 'ltr';
            }
        }
    });
});












/* Open WhatsApp */
openWhatsAppNumber = function () {

    insertNewClick('sample-travel-website-domain');

    const whatsappNumber = "+966569446280";
    const message = encodeURIComponent('سلام عليكم ورحمة الله وبركاته'); // Optional pre-filled message
    const url = `https://wa.me/${whatsappNumber}?text=${message}`;
    window.open(url, "_blank"); // Opens in a new tab
}



/* Function to insert a new click number in the Supabase */
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






















/* Function to store the emails in the Supabase */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

document.querySelector('.email_subscription_form button').addEventListener('click', async () => {
    const emailInput = document.querySelector('.email_subscription_form input');
    const email = emailInput.value.trim();

    if (!email || !isValidEmail(email)) {
        alert('يرجى إدخال بريد إلكتروني صالح');
        emailInput.focus();
        return;
    }

    const domainColumn = 'sample-travel-website-domain'; // Set your domain column here
    await saveEmailToDomainColumn(domainColumn, email);
});

async function saveEmailToDomainColumn(columnName, email) {
    // Step 1: Get all rows
    const { data: rows, error } = await supabase
        .from('account_counter')
        .select(`id, ${columnName}`);

    if (error) {
        console.error('Fetch error:', error);
        return;
    }

    // Step 2: Find first row where the column is null (empty)
    const emptyRow = rows.find(row => !row[columnName]);

    if (emptyRow) {
        // Step 3: Update that row
        const { error: updateError } = await supabase
            .from('account_counter')
            .update({ [columnName]: email })
            .eq('id', emptyRow.id);

        if (updateError) console.error('Update error:', updateError);
        else alert('تم الاشتراك بنجاح!');
    } else {
        // Step 4: Insert a new row
        const { error: insertError } = await supabase
            .from('account_counter')
            .insert([{ [columnName]: email }]);

        if (insertError) console.error('Insert error:', insertError);
        else alert('تم الاشتراك بنجاح!');
    }
}



















/* Function to count webstie vistrors number in the Supabase */
async function updateVisitorCount(website) {

    // Step 1: Get current month name
    const monthNames = [
        "january", "february", "march", "april",
        "may", "june", "july", "august",
        "september", "october", "november", "december"
    ];
    const currentMonth = monthNames[new Date().getMonth()];

    // Step 2: Fetch the current row for the website
    const { data, error } = await supabase
        .from("visitor_counter")
        .select("*")
        .eq("website", website)
        .single();

    if (error) {
        console.error("Error fetching data:", error.message);
        return;
    }

    // Step 3: Parse the current value (e.g., "Visit 4")
    let rawValue = data[currentMonth];
    let currentCount = 0;

    if (rawValue && typeof rawValue === "string" && rawValue.startsWith("Visit ")) {
        currentCount = parseInt(rawValue.replace("Visit ", ""), 10) || 0;
    }

    // Step 4: Increment the value
    let newCount = currentCount + 1;
    let newValue = `Visit ${newCount}`;

    // Step 5: Update the table
    const { error: updateError } = await supabase
        .from("visitor_counter")
        .update({ [currentMonth]: newValue })
        .eq("website", website);

    if (updateError) {
        console.error("Error updating value:", updateError.message);
        return;
    }
}

// Run the website visitors counter
updateVisitorCount('sample-travel-website-domain');
