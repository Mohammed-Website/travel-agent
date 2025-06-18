


// Helper function to get star rating from URL
function getStarRatingFromUrl(url) {
    try {
        const urlObj = new URL(url);
        const stars = urlObj.searchParams.get('stars');
        return stars ? parseInt(stars, 10) : null;
    } catch (e) {
        console.error('Error parsing URL for star rating:', e);
        return null;
    }
}

// Helper function to get price from URL
function getPriceFromUrl(url) {
    try {
        const urlObj = new URL(url);
        const price = urlObj.searchParams.get('price');
        const currency = urlObj.searchParams.get('currency') || 'SAR';

        if (!price) return null;

        return {
            amount: parseFloat(price),
            currency: currency
        };
    } catch (e) {
        console.error('Error parsing URL for price:', e);
        return null;
    }
}

// DOM Elements
const offersContainer = document.getElementById('offers-container');
const addOfferBtn = document.getElementById('add-offer');
const editModal = document.getElementById('editModal');
const offerForm = document.getElementById('offer-form');
const saveOfferBtn = document.getElementById('save-offer');
const addImageBtn = document.getElementById('add-image');
const imagesContainer = document.getElementById('images-container');
const closeModalBtns = document.querySelectorAll('.close-modal-btn');
const modalTitle = document.getElementById('modalTitle');

// Current offer being edited
let currentOffer = null;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    await loadOffers();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Add offer button
    addOfferBtn.addEventListener('click', () => {
        document.getElementById('title-card-preview').style.display = 'none';
        document.getElementById('title-card-preview').src = '';
        currentOffer = null;
        modalTitle.textContent = 'إضافة عرض جديد';
        offerForm.reset();
        showModal();
    });


    // Close modal buttons
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', hideModal);
    });


    // Close when clicking outside modal
    editModal.addEventListener('click', (e) => {
        if (e.target === editModal) {
            hideModal();
        }
    });


    // Prevent modal content from closing the modal when clicked
    document.querySelector('.modal-content').addEventListener('click', (e) => {
        e.stopPropagation();
    });
}


// Modal functions
function showModal() {
    // Make modal visible before animation
    editModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // Trigger reflow to ensure CSS applies before animation
    void editModal.offsetWidth;

    // Start animation
    editModal.classList.add('show');
}

function hideModal() {
    // Start fade out animation
    editModal.classList.remove('show');

    // Wait for animation to complete before hiding completely
    setTimeout(() => {
        editModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }, 300); // Match this with your CSS transition duration
}



// Load offers from Supabase
async function loadOffers() {
    offersContainer.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>جاري تحميل العروض...</p></div>';

    const { data, error } = await supabase
        .from('sample_travel_table')
        .select('*')

    if (error) {
        console.error('Error loading offers:', error);
        offersContainer.innerHTML = '<div class="error-message">حدث خطأ في تحميل العروض</div>';
        return;
    }

    renderOffers(data);
}

// Fullscreen image viewer elements
const fullscreenViewer = document.createElement('div');
fullscreenViewer.className = 'fullscreen-viewer';
fullscreenViewer.innerHTML = `
    <span class="close-fullscreen">&times;</span>
    <img class="fullscreen-image">
`;
document.body.appendChild(fullscreenViewer);

// Add click handler to rendered offer images
function renderOffers(offers) {
    if (offers.length === 0) {
        offersContainer.innerHTML = '<div class="no-offers">لا توجد عروض متاحة</div>';
        return;
    }

    offersContainer.innerHTML = '';

    offers.forEach(offer => {
        const offerCard = document.createElement('div');
        offerCard.className = 'offer-card';

        // Filter out invalid image URLs from the sup_images_array
        const validImages = offer.sup_images_array ? offer.sup_images_array.filter(img =>
            img[0] && (img[0].startsWith('http') || img[0].startsWith('/'))
        ) : [];

        offerCard.innerHTML = `
            <div class="card-body">
                <h3 class="offer-title">${offer.title}</h3>
                <div class="images-preview">
                    <!-- Display title_card_image first if it exists -->
                    ${offer.title_card_image ? `
                        <img src="${offer.title_card_image}" alt="صورة العنوان" class="image-thumbnail title-card-image" 
                             data-fullsrc="${offer.title_card_image}" onerror="this.style.display='none'">
                    ` : ''}
                    
                    <!-- Display other images -->
                    ${validImages.map(img => `
                        <img src="${img[0]}" alt="${img[1] || 'صورة العرض'}" class="image-thumbnail" 
                             data-fullsrc="${img[0]}" onerror="this.style.display='none'">
                    `).join('')}
                </div>
            </div>
            <div class="card-actions">
                <button class="btn edit-btn edit-offer" data-id="${offer.id}">تعديل</button>
                <button class="btn delete-btn delete-offer" data-id="${offer.id}">حذف</button>
            </div>
        `;
        offersContainer.appendChild(offerCard);
    });

    // Add click handlers to images for fullscreen view
    document.querySelectorAll('.image-thumbnail').forEach(img => {
        img.addEventListener('click', (e) => {
            openFullscreenImage(e.target.dataset.fullsrc || e.target.src);
        });
    });

    // Add event listeners to buttons
    document.querySelectorAll('.edit-offer').forEach(btn => {
        btn.addEventListener('click', (e) => editOffer(btn.dataset.id, e));
    });

    document.querySelectorAll('.delete-offer').forEach(btn => {
        btn.addEventListener('click', () => deleteOffer(btn.dataset.id));
    });
}



// Setup event listeners
function setupEventListeners() {
    // Add new offer
    addOfferBtn.addEventListener('click', () => {
        document.getElementById('title-card-preview').style.display = 'none';
        document.getElementById('title-card-preview').src = '';
        document.getElementById('remove-title-card-image').style.display = 'none';
        currentOffer = null;
        modalTitle.textContent = 'إضافة عرض جديد';
        offerForm.reset();
        imagesContainer.innerHTML = '';
        showModal();
    });

    // Add image field
    addImageBtn.addEventListener('click', addImageField);

    // Save offer
    saveOfferBtn.addEventListener('click', saveOffer);

    // Close modal
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', hideModal);
    });


    // Close modal when clicking outside
    editModal.addEventListener('click', (e) => {
        if (e.target === editModal) {
            hideModal();
        }
    });
}

// Helper function to convert star rating text to numeric value
function getNumericStarRating(ratingText) {
    if (!ratingText) return '5'; // Default to 5 stars if no rating
    
    const ratingMap = {
        'one star': '1',
        'two stars': '2',
        'three stars': '3',
        'four stars': '4',
        'five stars': '5'
    };
    
    return ratingMap[ratingText.toLowerCase()] || '5'; // Default to 5 if no match
}

// Edit existing offer with title card image
async function editOffer(offerId, event) {
    const clickedButton = event.currentTarget;
    clickedButton.disabled = true;
    clickedButton.innerHTML = '<span class="spinner"></span>';

    const { data, error } = await supabase
        .from('sample_travel_table')
        .select('*')
        .eq('id', offerId)
        .single();

    if (error) {
        console.error('Error loading offer:', error);
        alert('حدث خطأ أثناء تحميل العرض');
        return;
    }

    currentOffer = data;
    modalTitle.textContent = 'تعديل العرض';
    document.getElementById('offer-id').value = data.id;
    document.getElementById('offer-title').value = data.title;

    // Clear and reset title card image
    const titleCardPreview = document.getElementById('title-card-preview');
    const removeTitleCardBtn = document.getElementById('remove-title-card-image');

    if (data.title_card_image) {
        titleCardPreview.src = data.title_card_image;
        titleCardPreview.style.display = 'block';
        removeTitleCardBtn.style.display = 'inline-block';
    } else {
        titleCardPreview.style.display = 'none';
        removeTitleCardBtn.style.display = 'none';
    }

    imagesContainer.innerHTML = '';
    currentOffer.originalImages = [...data.sup_images_array];

    // Add existing images with their details
    if (!Array.isArray(data.sup_images_array)) {
        console.warn('sup_images_array is not an array or is undefined');
        return;
    }
    
    data.sup_images_array.forEach((image, index) => {
        try {
            // Safely extract values with fallbacks
            const imageUrl = Array.isArray(image) && image.length > 0 ? image[0] : '';
            const title = Array.isArray(image) && image.length > 1 ? image[1] : '';
            const starRating = Array.isArray(image) && image.length > 2 ? image[2] : '5'; // Default to 5 stars
            const price = Array.isArray(image) && image.length > 3 ? image[3] : '';
            const currency = Array.isArray(image) && image.length > 4 ? image[4] : 'BHD'; // Default to BHD

            console.log(`Processing image ${index + 1}:`, { 
                imageUrl: imageUrl.substring(0, 50) + (imageUrl.length > 50 ? '...' : ''), 
                title, 
                starRating, 
                price, 
                currency 
            });


            // Add the image with its description and other details
            addImageField(imageUrl, title, true);

            // Get the newly added image field
            const imageFields = document.querySelectorAll('.image-field');
            const lastImageField = imageFields[imageFields.length - 1];
            
            if (lastImageField) {
                // Use setTimeout to ensure the DOM is fully updated
                setTimeout(() => {
                    const starSelect = lastImageField.querySelector('.star-rating-select');
                    const priceInput = lastImageField.querySelector('.price-input');
                    const currencySelect = lastImageField.querySelector('.currency-select');
                    const descInput = lastImageField.querySelector('.desc-input');

                    // Set the values
                    if (starSelect) {
                        const numericRating = getNumericStarRating(starRating);
                        starSelect.value = numericRating;
                        console.log(`Set star rating for image ${index + 1} to:`, numericRating, '(original:', starRating + ')');
                    }
                    
                    if (priceInput && price) {
                        priceInput.value = price;
                        console.log(`Set price for image ${index + 1} to:`, price);
                    }
                    
                    if (currencySelect) {
                        currencySelect.value = currency;
                        console.log(`Set currency for image ${index + 1} to:`, currency);
                    }
                    
                    if (descInput && title) {
                        descInput.value = title;
                        // Trigger any floating label updates if needed
                        const event = new Event('input', { bubbles: true });
                        descInput.dispatchEvent(event);
                    }
                }, 100); // Small delay to ensure DOM is ready
            }
        } catch (error) {
            console.error(`Error processing image ${index + 1}:`, error);
            // Continue with the next image even if one fails
        }
    });

    showModal();
    clickedButton.disabled = false;
    clickedButton.innerHTML = 'تعديل';
}

// Initialize title card image selection with improved handling
function initializeTitleCardHandlers() {
    const titleCardInput = document.getElementById('title-card-image');
    const titleCardLabel = document.querySelector('label[for="title-card-image"]');

    // Handle file selection change
    titleCardInput.addEventListener('change', function (e) {
        const file = e.target.files[0];
        const preview = document.getElementById('title-card-preview');
        const removeBtn = document.getElementById('remove-title-card-image');

        if (file) {
            preview.src = URL.createObjectURL(file);
            preview.style.display = 'block';
            removeBtn.style.display = 'inline-block';

            preview.onload = function () {
                URL.revokeObjectURL(this.src);
            };
        }
    });

    // Prevent default behavior on label click to avoid double file dialog
    if (titleCardLabel) {
        titleCardLabel.addEventListener('click', function (e) {
            // Prevent the default action
            e.preventDefault();

            // Don't handle events that bubbled up from the input itself
            if (e.target === titleCardInput) return;

            // Use setTimeout to break the event chain
            setTimeout(() => {
                titleCardInput.click();
            }, 0);
        });
    }
}

// Call the initialization on DOMContentLoaded
document.addEventListener('DOMContentLoaded', initializeTitleCardHandlers);

document.getElementById('remove-title-card-image').addEventListener('click', function () {
    if (confirm('هل أنت متأكد من حذف هذه الصورة؟')) {
        const preview = document.getElementById('title-card-preview');
        const input = document.getElementById('title-card-image');
        const removeBtn = document.getElementById('remove-title-card-image');

        preview.src = '';
        preview.style.display = 'none';
        input.value = '';
        removeBtn.style.display = 'none';

        // Mark for removal if this was an existing image
        if (currentOffer?.title_card_image) {
            if (!currentOffer.removedTitleCardImage) {
                currentOffer.removedTitleCardImage = currentOffer.title_card_image;
            }
        }
    }
});

// Modified addImageField function with removal tracking
function addImageField(url = '', alt = '', isExistingImage = false) {
    const div = document.createElement('div');
    div.className = 'image-field';

    const fileId = `file-input-${Date.now()}`;

    // Create file input (hidden)
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.id = fileId;
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';

    // Create file label with icon
    const fileLabel = document.createElement('label');
    fileLabel.htmlFor = fileId;
    fileLabel.className = 'file-label';
    fileLabel.innerHTML = `
        <i class="upload-icon">📷</i>
        <span>${isExistingImage ? 'تغيير الصورة' : 'اختر صورة'}</span>
    `;

    // Add click handler for replacement label
    fileLabel.addEventListener('click', (e) => {
        e.preventDefault();
        if (e.target === fileInput) return;

        // Clear the input to allow selecting the same file again
        fileInput.value = '';

        // Use setTimeout to break the event chain
        setTimeout(() => fileInput.click(), 0);
    });

    // Create description input container
    const descContainer = document.createElement('div');
    descContainer.className = 'desc-input-container';

    // Create description input
    const descInput = document.createElement('input');
    descInput.type = 'text';
    descInput.className = 'desc-input';
    descInput.placeholder = ' '; // Space is required for the floating label effect
    descInput.value = alt || '';
    descInput.required = true;
    descInput.ariaLabel = 'وصف الصورة';

    // Create floating label
    const floatingLabel = document.createElement('span');
    floatingLabel.className = 'floating-label';
    floatingLabel.textContent = 'أدخل وصفًا للعرض';

    // Append elements
    descContainer.appendChild(descInput);
    descContainer.appendChild(floatingLabel);

    // Create star rating input
    const starRatingContainer = document.createElement('div');
    starRatingContainer.className = 'star-rating-container';

    const starRatingLabel = document.createElement('label');
    starRatingLabel.textContent = 'عدد النجوم:';
    starRatingLabel.htmlFor = `stars-${fileId}`;

    const starRatingSelect = document.createElement('select');
    starRatingSelect.className = 'star-rating-select';
    starRatingSelect.id = `stars-${fileId}`;
    starRatingSelect.name = 'star-rating';

    // Add star options (1-5)
    for (let i = 1; i <= 5; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = '★'.repeat(i);
        starRatingSelect.appendChild(option);
    }

    // Set default value to 5 stars for new images, or use existing rating if editing
    if (isExistingImage && url.startsWith('http')) {
        const starRating = getStarRatingFromUrl(url);
        if (starRating) {
            starRatingSelect.value = starRating;
        }
    } else {
        starRatingSelect.value = '5'; // Default to 5 stars for new images
    }



    starRatingContainer.appendChild(starRatingLabel);
    starRatingContainer.appendChild(starRatingSelect);


    // Create price input container
    const priceContainer = document.createElement('div');
    priceContainer.className = 'price-container';

    const priceLabel = document.createElement('label');
    priceLabel.textContent = 'سعر العرض:';
    priceLabel.htmlFor = `price-${fileId}`;

    const priceInput = document.createElement('input');
    priceInput.type = 'number';
    priceInput.className = 'price-input';
    priceInput.id = `price-${fileId}`;
    priceInput.placeholder = 'السعر';
    priceInput.min = '0';
    priceInput.step = '0.01';

    // Set default price if editing
    if (isExistingImage && url.startsWith('http')) {
        const price = getPriceFromUrl(url);
        if (price) {
            priceInput.value = price.amount;
        }
    }

    const currencySelect = document.createElement('select');
    currencySelect.className = 'currency-select';
    currencySelect.name = 'currency';

    // Add currency options
    const currencies = [
        { value: 'SAR', symbol: 'ر.س' },
        { value: 'BHD', symbol: 'د. ب' },
        { value: 'USD', symbol: '$' },
        { value: 'EUR', symbol: '€' }
    ];

    currencies.forEach(currency => {
        const option = document.createElement('option');
        option.value = currency.value;
        option.textContent = `${currency.symbol} (${currency.value})`;
        currencySelect.appendChild(option);
    });

    // Set default currency if editing
    if (isExistingImage && url.startsWith('http')) {
        const price = getPriceFromUrl(url);
        if (price && price.currency) {
            currencySelect.value = price.currency;
        }
    }



    // Create remove button
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'remove-btn';
    removeBtn.innerHTML = '&times;';
    removeBtn.ariaLabel = 'إزالة الصورة';
    removeBtn.dataset.imageUrl = url || '';


    priceContainer.appendChild(priceLabel);
    priceContainer.appendChild(priceInput);
    priceContainer.appendChild(currencySelect);
    priceContainer.appendChild(removeBtn);



    // Create preview container
    const previewContainer = document.createElement('div');
    previewContainer.className = 'preview-container';

    // For existing images
    if (url && typeof url === 'string' && url.startsWith('http')) {
        const previewImg = document.createElement('img');
        previewImg.src = url;
        previewImg.className = 'image-preview';
        previewImg.alt = alt || 'معاينة الصورة';
        previewContainer.appendChild(previewImg);

        // Add click handler for fullscreen
        previewImg.addEventListener('click', () => {
            openFullscreenImage(url);
        });

        if (isExistingImage) {
            const hiddenInput = document.createElement('input');
            hiddenInput.type = 'hidden';
            hiddenInput.className = 'original-image-url';
            hiddenInput.value = url;
            div.appendChild(hiddenInput);
        }
    } else {
        // Show placeholder for new uploads
        const placeholder = document.createElement('div');
        placeholder.className = 'upload-placeholder';
        placeholder.innerHTML = '<i class="placeholder-icon">📷</i><span>معاينة الصورة ستظهر هنا</span>';
        previewContainer.appendChild(placeholder);
    }

    // Set up file input change handler
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            previewContainer.innerHTML = '';

            // Update the label to show the file name
            const maxLength = 20;
            let displayName = file.name;
            if (file.name.length > maxLength) {
                const extensionIndex = file.name.lastIndexOf('.');
                const extension = extensionIndex !== -1 ? file.name.substring(extensionIndex) : '';
                const mainName = file.name.substring(0, maxLength - extension.length - 3);
                displayName = mainName + '...' + extension;
            }

            fileLabel.querySelector('span').textContent = displayName;

            // Create and show preview
            const previewImg = document.createElement('img');
            previewImg.src = URL.createObjectURL(file);
            previewImg.className = 'image-preview';
            previewImg.alt = 'معاينة الصورة المحددة';
            previewContainer.appendChild(previewImg);

            // Add fullscreen handler
            previewImg.addEventListener('click', () => {
                openFullscreenImage(URL.createObjectURL(file));
            });

            // Clean up object URL when done
            previewImg.onload = function () {
                URL.revokeObjectURL(this.src);
            };
        }
    });

    // Assemble the DOM elements
    const fieldsContainer = document.createElement('div');
    fieldsContainer.className = 'image-fields-container';

    fieldsContainer.appendChild(descInput);
    fieldsContainer.appendChild(starRatingContainer);
    fieldsContainer.appendChild(priceContainer);

    div.appendChild(previewContainer);
    div.appendChild(fileLabel);
    div.appendChild(fieldsContainer);
    div.appendChild(fileInput);

    // In the remove button click handler
    removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm('هل أنت متأكد من حذف هذه الصورة؟')) {
            // Only try to add to removedImages if currentOffer exists
            if (url && window.currentOffer) {
                if (!window.currentOffer.removedImages) {
                    window.currentOffer.removedImages = [];
                }
                window.currentOffer.removedImages.push(url);
            }
            // Add fade out animation and remove the element
            div.style.animation = 'fadeOut 0.3s ease';
            div.addEventListener('animationend', () => div.remove(), { once: true });
        }
    });

    imagesContainer.appendChild(div);
}

// Save offer with individual image handling and removal
async function saveOffer() {

    const title = document.getElementById('offer-title').value;
    const offerId = document.getElementById('offer-id').value;


    // Validate title
    if (!title || title.trim() === '') {
        alert('يجب إدخال عنوان العرض');
        return;
    }

    // Get all image fields
    const imageElements = document.querySelectorAll('#images-container > div');

    // Check if there are any images
    if (imageElements.length === 0) {
        alert('يجب إضافة صورة واحدة على الأقل');
        return;
    }

    // Validate each image field
    for (const div of imageElements) {
        const fileInput = div.querySelector('input[type="file"]');
        const descInput = div.querySelector('input[type="text"]');
        const originalUrlInput = div.querySelector('input.original-image-url');

        // For existing images that weren't replaced
        if (originalUrlInput && fileInput.files.length === 0) {
            if (!descInput.value || descInput.value.trim() === '') {
                alert('يجب إدخال وصف لكل صورة');
                descInput.focus();
                return;
            }
        }
        // For new or replaced images
        else {
            if (fileInput.files.length === 0) {
                alert('يجب اختيار صورة لكل حقل');
                return;
            }
            if (!descInput.value || descInput.value.trim() === '') {
                alert('يجب إدخال وصف لكل صورة');
                descInput.focus();
                return;
            }
        }
    }

    saveOfferBtn.disabled = true;
    saveOfferBtn.innerHTML = '<span class="spinner"></span> جاري الحفظ';

    try {
        const filesToDelete = new Set(); // Track files to delete
        let titleCardImageUrl = currentOffer?.title_card_image || null;
        const titleCardPreview = document.getElementById('title-card-preview');
        const titleCardFileInput = document.getElementById('title-card-image');

        // Check if we have a preview image (either existing or newly selected)
        if (titleCardPreview?.src && !titleCardPreview.src.includes('placeholder')) {
            // If it's a new image (blob URL), upload it
            if (titleCardPreview.src.startsWith('blob:') && titleCardFileInput?.files.length > 0) {
                try {
                    const file = titleCardFileInput.files[0];
                    const fileExt = file.name.split('.').pop();
                    const fileName = `title-card-${Date.now()}.${fileExt}`;
                    const filePath = fileName;

                    // Delete old title card image if it exists
                    if (currentOffer?.title_card_image) {
                        try {
                            const urlObj = new URL(currentOffer.title_card_image);
                            const oldFilePath = urlObj.pathname.split('/').pop();
                            await supabase
                                .storage
                                .from('sample-travel-bucket')
                                .remove([oldFilePath]);
                        } catch (e) {
                            console.error('Error deleting old title card image:', e);
                        }
                    }

                    // Upload the image
                    const { data: uploadData, error: uploadError } = await supabase
                        .storage
                        .from('sample-travel-bucket')
                        .upload(filePath, file, {
                            cacheControl: '3600',
                            upsert: false,
                            contentType: file.type
                        });

                    if (uploadError) throw uploadError;

                    // Get the public URL
                    const { data: { publicUrl } } = supabase
                        .storage
                        .from('sample-travel-bucket')
                        .getPublicUrl(filePath);

                    // Create URL with query parameters
                    const imageUrl = new URL(publicUrl);

                    // Add star rating if available
                    const starSelect = document.querySelector('.star-rating-select');
                    if (starSelect?.value) {
                        imageUrl.searchParams.set('stars', starSelect.value);
                    }

                    // Add price and currency if available
                    const priceInput = document.querySelector('.price-input');
                    const currencySelect = document.querySelector('.currency-select');
                    if (priceInput?.value) {
                        imageUrl.searchParams.set('price', priceInput.value);
                        if (currencySelect?.value) {
                            imageUrl.searchParams.set('currency', currencySelect.value);
                        }
                    }

                    titleCardImageUrl = imageUrl.toString();

                } catch (error) {
                    console.error('Error uploading title card image:', error);
                    alert(`حدث خطأ في رفع صورة العنوان: ${error.message}`);
                }
            }
            // If it's an existing image, keep using the same URL
            else if (titleCardPreview.dataset.originalSrc) {
                titleCardImageUrl = titleCardPreview.dataset.originalSrc;
            }
        }
        // If title card was removed
        else if (currentOffer?.removedTitleCardImage || !titleCardPreview?.src) {
            try {
                if (currentOffer?.title_card_image) {
                    const urlObj = new URL(currentOffer.title_card_image);
                    const filePath = urlObj.pathname.split('/sample-travel-bucket/')[1];
                    filesToDelete.add(filePath);
                }
                titleCardImageUrl = null;
            } catch (e) {
                console.error('Error removing title card image:', e);
            }
        }


        // Get the current images from the database
        const currentImages = currentOffer?.sup_images_array || [];

        // First, upload all new images and get their public URLs
        const imageUploadPromises = [];
        const imageElements = document.querySelectorAll('.image-field');
        const imageUrlMap = new Map(); // Maps temp blob URLs to Supabase URLs

        // Process each image field to upload new images
        for (const div of imageElements) {
            const fileInput = div.querySelector('input[type="file"]');
            const img = div.querySelector('img');
            const isExisting = div.dataset.isExisting === 'true';
            const originalUrl = div.dataset.originalUrl;
            const removeBtn = div.querySelector('.remove-btn');

            // Skip if this image was removed
            if (removeBtn?.style.display === 'none') continue;

            // If this is a new image (blob URL), upload it to Supabase
            if (img?.src.startsWith('blob:') && fileInput?.files.length > 0) {
                const file = fileInput.files[0];
                const fileExt = file.name.split('.').pop();
                const fileName = `img-${Date.now()}-${Math.random().toString(36).substring(2, 10)}.${fileExt}`;
                const filePath = fileName;

                const uploadPromise = supabase.storage
                    .from('sample-travel-bucket')
                    .upload(filePath, file, {
                        cacheControl: '3600',
                        upsert: false,
                        contentType: file.type
                    })
                    .then(({ data, error }) => {
                        if (error) throw error;
                        return supabase.storage
                            .from('sample-travel-bucket')
                            .getPublicUrl(filePath);
                    })
                    .then(({ data: { publicUrl } }) => {
                        // Map the blob URL to the Supabase URL
                        if (img) {
                            imageUrlMap.set(img.src, publicUrl);
                            // Store the URL in a data attribute for later use
                            img.dataset.originalUrl = publicUrl;
                        }
                        return publicUrl;
                    });

                imageUploadPromises.push(uploadPromise);
            } else if (img && !img.src.startsWith('blob:') && img.dataset.originalUrl) {
                // For existing images, ensure we have the original URL
                imageUrlMap.set(img.src, img.dataset.originalUrl);
            }
        }

        // Wait for all uploads to complete
        await Promise.all(imageUploadPromises);

        // Now process all visible images with their final URLs
        const visibleImages = Array.from(document.querySelectorAll('.preview-container img'))
            .map(img => {
                const imageField = img.closest('.image-field');
                const descInput = imageField?.querySelector('.desc-input');
                const starSelect = imageField?.querySelector('.star-rating-select');
                const priceInput = imageField?.querySelector('.price-input');
                const currencySelect = imageField?.querySelector('.currency-select');

                // Get the final URL - either from the map or the original URL
                let imageUrl = img.src;
                if (imageUrl.startsWith('blob:')) {
                    // If we still have a blob URL, try to get the uploaded URL from the map
                    imageUrl = imageUrlMap.get(img.src) || '';
                } else if (img.dataset.originalUrl) {
                    // For existing images, use the original URL
                    imageUrl = img.dataset.originalUrl;
                }

                // Remove any query parameters
                imageUrl = imageUrl.split('?')[0];

                // Convert star rating to text
                const starText = {
                    '1': 'one star',
                    '2': 'two stars',
                    '3': 'three stars',
                    '4': 'four stars',
                    '5': 'five stars'
                }[starSelect?.value || '5'];

                // Create the image data array in the required format
                const imageData = [
                    imageUrl, // Full image URL (Supabase public URL)
                    descInput?.value || '', // Description
                    starText, // Star rating as text (e.g., "five stars")
                    priceInput?.value || '', // Price
                    currencySelect?.value || 'SAR' // Currency
                ];

                console.log('Processed image data:', imageData);
                return imageData;
            })
            .filter(imgData => imgData[0]); // Filter out any entries without a valid URL

        // Create a map of existing images for quick lookup and track their original indices
        const existingImagesMap = new Map();
        currentImages.forEach((img, index) => {
            if (img && img[0]) {
                existingImagesMap.set(img[0], {
                    description: img[1] || '',
                    originalIndex: index,
                    isVisible: visibleImages.some(visibleImg => visibleImg.src === img[0])
                });
            }
        });

        // Create an array to store the final images and track replacements
        const finalImages = [...currentImages];
        const removedImageUrls = new Set();
        const replacedImages = new Map(); // Track URL replacements (oldUrl -> newUrl)

        // Process each image field to upload new images
        const imageFields = document.querySelectorAll('.image-field');

        for (const div of imageFields) {
            const fileInput = div.querySelector('input[type="file"]');
            const descInput = div.querySelector('input[type="text"]');
            const isExisting = div.dataset.isExisting === 'true';
            const originalUrl = div.dataset.originalUrl;
            const removeBtn = div.querySelector('.remove-btn');

            // Skip if this image was removed
            if (removeBtn?.style.display === 'none') {
                // Add to removed images if it was existing
                if (isExisting && originalUrl) {
                    removedImageUrls.add(originalUrl);
                }
                continue;
            }

            try {
                // Case 1: Existing image that was replaced
                if (isExisting && fileInput.files.length > 0) {

                    const file = fileInput.files[0];
                    const fileName = originalUrl.split('/').pop(); // Keep same filename
                    const filePath = fileName; // Store directly in root

                    // Delete old image first
                    try {
                        const urlObj = new URL(originalUrl);
                        const oldFilePath = urlObj.pathname.split('/').pop();
                        await supabase
                            .storage
                            .from('sample-travel-bucket')
                            .remove([oldFilePath]);
                        removedImageUrls.add(originalUrl);
                    } catch (e) {
                        console.error('Error deleting old image:', e);
                    }

                    const { error: uploadError } = await supabase
                        .storage
                        .from('sample-travel-bucket')
                        .upload(filePath, file, {
                            upsert: true, // Overwrite existing
                            contentType: file.type
                        });

                    if (uploadError) throw uploadError;

                    const { data: { publicUrl } } = supabase
                        .storage
                        .from('sample-travel-bucket')
                        .getPublicUrl(filePath);

                    // Track this replacement
                    replacedImages.set(originalUrl, publicUrl);

                    // Find and update the image in finalImages
                    const existingImage = existingImagesMap.get(originalUrl);
                    if (existingImage !== undefined) {
                        // Update at the original index to maintain position
                        finalImages[existingImage.originalIndex] = [publicUrl, descInput.value];
                    } else {
                        // If not found (shouldn't happen), add it to the end
                        finalImages.push([publicUrl, descInput.value]);
                    }
                }
                // Case 2: Existing image not replaced
                else if (isExisting) {
                    // Update the description if it changed
                    const existingIndex = finalImages.findIndex(img => img[0] === originalUrl);
                    if (existingIndex !== -1) {
                        finalImages[existingIndex][1] = descInput.value;
                    }
                }
                // Case 3: New image
                else if (!isExisting && fileInput.files.length > 0) {

                    const file = fileInput.files[0];
                    const fileExt = file.name.split('.').pop();
                    const shortId = Math.random().toString(36).substring(2, 6); // shorter random ID
                    const fileName = `${shortId}.${fileExt}`;
                    const filePath = fileName;


                    const { error: uploadError } = await supabase
                        .storage
                        .from('sample-travel-bucket')
                        .upload(filePath, file, {
                            upsert: true, // Overwrite existing
                            contentType: file.type
                        });

                    if (uploadError) throw uploadError;

                    const { data: { publicUrl } } = supabase
                        .storage
                        .from('sample-travel-bucket')
                        .getPublicUrl(filePath);

                    finalImages.push([publicUrl, descInput.value]);
                }
            } catch (e) {
                console.error('Error processing image:', e);
                throw e;
            }
        }

        // 3. Process and upload all images
        const sup_images_array = [];

        // Process each visible image in the form
        for (const field of document.querySelectorAll('.image-field')) {
            const img = field.querySelector('img');
            const descInput = field.querySelector('input[type="text"]');
            const fileInput = field.querySelector('input[type="file"]');

            // Skip if no image or image was removed
            if (!img || !img.src || field.querySelector('.remove-btn')?.style.display === 'none') {
                continue;
            }

            const description = descInput?.value || '';
            const isBlobUrl = img.src.startsWith('blob:');

            // For existing images (not blob URLs)
            if (!isBlobUrl) {
                const imageUrl = img.dataset.originalSrc || img.src;
                if (imageUrl) {
                    sup_images_array.push([imageUrl, description]);
                }
                continue;
            }

            // For new images (blob URLs), we need to upload them
            if (fileInput?.files.length > 0) {
                try {
                    const file = fileInput.files[0];
                    const fileExt = file.name.split('.').pop();
                    const shortId = Math.random().toString(36).substring(2, 6); // shorter random ID
                    const fileName = `${shortId}.${fileExt}`;
                    const filePath = fileName;


                    // Upload the file to Supabase storage
                    const { error: uploadError } = await supabase
                        .storage
                        .from('sample-travel-bucket')
                        .upload(filePath, file, {
                            cacheControl: '3600',
                            upsert: false,
                            contentType: file.type
                        });

                    if (uploadError) throw uploadError;

                    // Get the public URL
                    const { data: { publicUrl } } = supabase
                        .storage
                        .from('sample-travel-bucket')
                        .getPublicUrl(filePath);

                    sup_images_array.push([publicUrl, description]);

                } catch (error) {
                    console.error('Error uploading image:', error);
                    alert(`حدث خطأ في رفع الصورة: ${error.message}`);
                    continue;
                }
            }
        }


        // Delete all removed images
        if (removedImageUrls.size > 0) {
            const filesToDelete = new Set();
            for (const url of removedImageUrls) {
                try {
                    const urlObj = new URL(url);
                    const filePath = urlObj.pathname.split('/sample-travel-bucket/')[1];
                    filesToDelete.add(filePath);
                } catch (e) {
                    console.error('Error parsing removed image URL:', e);
                }
            }

            if (filesToDelete.size > 0) {
                const { error: deleteError } = await supabase
                    .storage
                    .from('sample-travel-bucket')
                    .remove([...filesToDelete]);

                if (deleteError) {
                    console.error('Error deleting old files:', deleteError);
                    // Continue anyway - this isn't critical enough to fail the whole operation
                }
            }
        }

        // Handle title card image
        let finalTitleCardImage = null;
        const titleCardInput = document.getElementById('title-card-image');
        const titleCardPreviewElement = document.getElementById('title-card-preview');

        // Check if there's a new title card image to upload
        if (titleCardInput?.files.length > 0) {
            try {
                const file = titleCardInput.files[0];
                const fileExt = file.name.split('.').pop();
                const fileName = `title-card-${Date.now()}.${fileExt}`;
                const filePath = fileName;;

                // Upload new title card image
                const { error: uploadError } = await supabase
                    .storage
                    .from('sample-travel-bucket')
                    .upload(filePath, file, {
                        cacheControl: '3600',
                        upsert: false,
                        contentType: file.type
                    });

                if (uploadError) throw uploadError;

                // Get public URL
                const { data: { publicUrl } } = supabase
                    .storage
                    .from('sample-travel-bucket')
                    .getPublicUrl(filePath);

                // If there was a previous title card image, mark it for deletion
                if (currentOffer?.title_card_image) {
                    removedImageUrls.add(currentOffer.title_card_image);
                }

                finalTitleCardImage = publicUrl;

            } catch (error) {
                console.error('Error uploading title card image:', error);
                throw new Error('حدث خطأ في رفع صورة العنوان');
            }
        }
        // If no new image but there's an existing one, keep it
        else if (titleCardPreviewElement?.src &&
            !titleCardPreviewElement.src.includes('placeholder') &&
            !titleCardPreviewElement.src.startsWith('blob:')) {
            finalTitleCardImage = titleCardPreviewElement.src;
        }
        // If the title card was removed
        else if (titleCardPreviewElement?.src.includes('placeholder') && currentOffer?.title_card_image) {
            // The existing title card image will be in removedImageUrls and will be deleted
            removedImageUrls.add(currentOffer.title_card_image);
            finalTitleCardImage = null;
        }

        // 6. Prepare offer data
        const offerData = {
            title,
            sup_images_array: visibleImages, // Use the visibleImages array we prepared earlier
            title_card_image: finalTitleCardImage,
            created_at: new Date().toISOString()
        };

        console.log('Saving offer data:', JSON.stringify(offerData, null, 2));


        if (offerId) {
            const { error } = await supabase
                .from('sample_travel_table')
                .update(offerData)
                .eq('id', offerId);
            if (error) throw error;
        } else {
            const { error } = await supabase
                .from('sample_travel_table')
                .insert(offerData);
            if (error) throw error;
        }

        await loadOffers();
        hideModal();
    } catch (error) {
        console.error("Error saving offer:", error);
        alert(`حدث خطأ أثناء حفظ العرض: ${error.message}`);
    } finally {
        saveOfferBtn.disabled = false;
        saveOfferBtn.textContent = 'حفظ';
    }
}

// Delete offer
async function deleteOffer(offerId) {
    if (!confirm('هل أنت متأكد من حذف هذا العرض؟ سيتم حذف جميع الصور المرتبطة به.')) return;

    try {
        // First get the offer to access image URLs
        const { data: offer, error: fetchError } = await supabase
            .from('sample_travel_table')
            .select('*')
            .eq('id', offerId)
            .single();

        if (fetchError) throw fetchError;

        // Array to collect all files to delete (content images + title card image)
        let filesToDelete = [];

        // 1. Add content images to delete list
        if (offer.images && offer.images.length > 0) {
            filesToDelete = offer.images.map(img => {
                try {
                    const url = img[0];
                    // For newer Supabase storage URLs:
                    if (url.includes('/storage/v1/object/public/sample-travel-bucket/')) {
                        return url.split('/storage/v1/object/public/sample-travel-bucket/')[1];
                    }
                    // For older format or direct paths:
                    return url.replace(/^.*sample-travel-bucket\//, '');
                } catch (e) {
                    console.error('Error parsing image URL:', img[0], e);
                    return null;
                }
            }).filter(Boolean);
        }

        // 2. Add title card image to delete list if it exists
        if (offer.title_card_image) {
            try {
                const url = offer.title_card_image;
                // For newer Supabase storage URLs:
                if (url.includes('/storage/v1/object/public/sample-travel-bucket/')) {
                    filesToDelete.push(url.split('/storage/v1/object/public/sample-travel-bucket/')[1]);
                } else {
                    // For older format or direct paths:
                    filesToDelete.push(url.replace(/^.*sample-travel-bucket\//, ''));
                }
            } catch (e) {
                console.error('Error parsing title card image URL:', offer.title_card_image, e);
            }
        }

        // 3. Delete all files from storage
        if (filesToDelete.length > 0) {

            const { error: deleteError, data: deleteResult } = await supabase
                .storage
                .from('sample-travel-bucket')
                .remove(filesToDelete);


            if (deleteError) {
                console.error('Error deleting images:', deleteError);
                throw new Error('فشل في حذف الصور من التخزين');
            }

            if (!deleteResult || deleteResult.length === 0) {
                console.error('No files were actually deleted');
                throw new Error('لم يتم حذف أي ملفات من التخزين');
            }
        }

        // 4. Delete the offer record from database
        const { error } = await supabase
            .from('sample_travel_table')
            .delete()
            .eq('id', offerId);

        if (error) throw error;

        await loadOffers();
    } catch (error) {
        console.error('Error deleting offer:', error);
        alert(`حدث خطأ أثناء حذف العرض: ${error.message}`);
    }
}


























// Open fullscreen image with fade animation
function openFullscreenImage(src) {
    const img = fullscreenViewer.querySelector('.fullscreen-image');
    img.src = src;

    fullscreenViewer.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent scrolling
}

// Close fullscreen image
function closeFullscreen() {
    fullscreenViewer.classList.remove('active');
    document.body.style.overflow = ''; // Re-enable scrolling
}

// Function to clean up unused images from storage
async function cleanupUnusedImages() {
    try {
        // 1. Get all used images from the database
        const { data: offers, error: offersError } = await supabase
            .from('sample_travel_table')
            .select('title_card_image, sup_images_array');

        if (offersError) throw offersError;


        // 2. Create a Set of all used image paths (just the filenames)
        const usedImagePaths = new Set();

        // Function to extract just the filename from URL or path
        const extractFilename = (path) => {
            if (!path) return null;
            // Handle both full URLs and file paths
            try {
                // If it's a URL, parse it
                if (path.startsWith('http')) {
                    const url = new URL(path);
                    path = url.pathname;
                }
                // Get the last part after the last slash
                const filename = path.split('/').pop() || '';
                // Remove any query parameters or hashes
                return filename.split('?')[0].split('#')[0];
            } catch (e) {
                console.error('Error parsing path:', path, e);
                return null;
            }
        };


        // Track all used images
        offers.forEach((offer, index) => {

            // Process title card image
            if (offer.title_card_image) {
                const filename = extractFilename(offer.title_card_image);
                if (filename) {
                    usedImagePaths.add(filename);
                }
            }

            // Process images array
            if (offer.sup_images_array?.length > 0) {

                // Handle both array of arrays and array of objects format
                offer.sup_images_array.forEach((item, i) => {
                    try {
                        let imageUrl;

                        // Check if it's an array [url, ...] format
                        if (Array.isArray(item) && item.length > 0) {
                            imageUrl = item[0]; // First element is the URL
                        }
                        // Check if it's an object with url property
                        else if (item && typeof item === 'object' && item.url) {
                            imageUrl = item.url;
                        }
                        // If it's a direct URL string
                        else if (typeof item === 'string') {
                            imageUrl = item;
                        }

                        if (imageUrl) {
                            const filename = extractFilename(imageUrl);
                            if (filename) {
                                usedImagePaths.add(filename);
                            }
                        }
                    } catch (e) {
                        console.error(`Error processing image at index ${i}:`, e);
                    }
                });
            }
        });


        // 3. List all files in the storage bucket
        const bucketName = 'sample-travel-bucket';


        // Recursive function to list all files in a folder and its subfolders
        const listAllFiles = async (folder = '') => {
            const allFiles = [];

            try {
                const { data: files, error } = await supabase
                    .storage
                    .from(bucketName)
                    .list(folder);

                if (error) {
                    console.error(`Error listing files in ${folder}:`, error);
                    throw error;
                }

                for (const file of files) {
                    const fullPath = folder ? `${folder}/${file.name}` : file.name;

                    if (file.metadata) {
                        // It's a file
                        allFiles.push({
                            ...file,
                            fullPath: fullPath,
                            filename: file.name // Store just the filename for comparison
                        });
                    } else {
                        // It's a directory, recursively get its files
                        const subFiles = await listAllFiles(fullPath);
                        allFiles.push(...subFiles);
                    }
                }
            } catch (error) {
                console.error(`Error processing folder ${folder}:`, error);
                throw error;
            }

            return allFiles;
        };

        // Get all files
        const files = await listAllFiles();

        // 4. Find and delete unused files
        const deletedFiles = [];
        const keptFiles = [];
        const errors = [];


        for (const file of files) {
            const filename = file.name;
            const isUsed = usedImagePaths.has(filename);

            const fileInfo = {
                path: file.fullPath,
                filename: filename,
                size: file.metadata?.size,
                type: file.metadata?.mimetype,
                isUsed: isUsed
            };

            if (!isUsed) {
                try {
                    const { error: deleteError } = await supabase
                        .storage
                        .from(bucketName)
                        .remove([file.fullPath]);

                    if (deleteError) {
                        console.error(`  Error deleting:`, deleteError);
                        errors.push({ file: file.fullPath, error: deleteError });
                    } else {
                        deletedFiles.push(file.fullPath);
                    }
                } catch (err) {
                    console.error(`  Error processing:`, err);
                    errors.push({ file: file.fullPath, error: err });
                }
            } else {
                keptFiles.push(file.fullPath);
            }
        }

        // Prepare the final result
        const result = {
            totalFiles: files.length,
            usedImages: usedImagePaths.size,
            unusedFiles: files.length - usedImagePaths.size,
            deletedFiles: deletedFiles.length,
            keptFiles: keptFiles.length,
            deletedFileNames: deletedFiles,
            keptFileNames: keptFiles,
            errors: errors.length,
            errorDetails: errors,
            usedImagePaths: Array.from(usedImagePaths) // For debugging
        };


        return result;

    } catch (error) {
        console.error('Error in cleanupUnusedImages:', error);
        throw error;
    }
}

// Call a function to delete all the unused images from the Supabase Storage Bucket
cleanupUnusedImages();


// Close when clicking X or outside image
fullscreenViewer.addEventListener('click', (e) => {
    if (e.target.classList.contains('fullscreen-viewer') ||
        e.target.classList.contains('close-fullscreen')) {
        closeFullscreen();
    }
});

// Close with ESC key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && fullscreenViewer.classList.contains('active')) {
        closeFullscreen();
    }
});

// Close with ESC key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && fullscreenViewer.classList.contains('active')) {
        closeFullscreen();
    }
});

// Close with ESC key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && fullscreenViewer.classList.contains('active')) {
        closeFullscreen();
    }
});