// Initialize Supabase

// DOM Elements
const navButtons = document.querySelectorAll('.nav-btn');
const contentSections = document.querySelectorAll('.content-section');

// Company Info Elements
const companyLogoInput = document.getElementById('company-logo');
const companyLogoPreview = document.getElementById('company-logo-preview');
const companyLogoPreviewMain = document.getElementById('company-logo-preview-main');
const introImagesContainer = document.getElementById('intro-images-container');
const addIntroImageBtn = document.getElementById('add-intro-image');
const saveCompanyInfoBtn = document.getElementById('save-company-info');

// Highlight Offer Elements
const highlightTitleInput = document.getElementById('highlight-title');
const highlightDescriptionInput = document.getElementById('highlight-description');
const highlightPriceInput = document.getElementById('highlight-price');
const highlightOldPriceInput = document.getElementById('highlight-old-price');
const highlightDatesInput = document.getElementById('highlight-dates');
const highlightNoteInput = document.getElementById('highlight-note');
const highlightRatingInput = document.getElementById('highlight-rating');
const highlightReviewsInput = document.getElementById('highlight-reviews');
const highlightImagesContainer = document.getElementById('highlight-images-container');
const addHighlightImageBtn = document.getElementById('add-highlight-image');
const saveHighlightOfferBtn = document.getElementById('save-highlight-offer');
const highlightCurrencyInput = document.getElementById('highlight-currency');

// Offers Elements
const offersList = document.getElementById('offers-list');
const addNewOfferBtn = document.getElementById('add-new-offer');
const offerCurrencyInput = document.getElementById('offer-currency');



// Modal Elements
const offerModal = document.getElementById('offer-modal');
const modalTitle = document.getElementById('modal-title');
const offerTitleInput = document.getElementById('offer-title');
const offerLabelInput = document.getElementById('offer-label');
const offerDescriptionInput = document.getElementById('offer-description');
const offerPriceInput = document.getElementById('offer-price');
const offerOldPriceInput = document.getElementById('offer-old-price');
const offerDatesInput = document.getElementById('offer-dates');
const offerNoteInput = document.getElementById('offer-note');
const offerRatingInput = document.getElementById('offer-rating');
const offerReviewsInput = document.getElementById('offer-reviews');
const offerImagesContainer = document.getElementById('offer-images-container');
const addOfferImageBtn = document.getElementById('add-offer-image');
const saveOfferBtn = document.getElementById('save-offer');
const cancelOfferBtn = document.getElementById('cancel-offer');

// Modal Elements
const closeModalButtons = document.querySelectorAll('.close-modal');

// Global Variables
let currentOfferId = null;
let companyData = null;
let highlightOfferData = null;
let offersData = [];

// Event Listeners
document.addEventListener('DOMContentLoaded', initDashboard);
navButtons.forEach(btn => btn.addEventListener('click', switchSection));

// Company Info Events
companyLogoInput.addEventListener('change', handleCompanyLogoUpload);
addIntroImageBtn.addEventListener('click', () => createImageInput(introImagesContainer, 'intro'));
saveCompanyInfoBtn.addEventListener('click', saveCompanyInfo);

// Highlight Offer Events
addHighlightImageBtn.addEventListener('click', () => createImageInput(highlightImagesContainer, 'highlight'));
saveHighlightOfferBtn.addEventListener('click', saveHighlightOffer);

// Offer Modal Events
addOfferImageBtn.addEventListener('click', () => createImageInput(offerImagesContainer, 'offer'));

// Offers Events
addNewOfferBtn.addEventListener('click', openNewOfferModal);
offersList.addEventListener('click', handleOfferAction);



// Modal Events
saveOfferBtn.addEventListener('click', saveOffer);
cancelOfferBtn.addEventListener('click', closeOfferModal);
closeModalButtons.forEach(btn => btn.addEventListener('click', function (e) {
    const modal = e.target.closest('.modal');
    if (modal) closeModal(modal);
}));


// Initialize Dashboard
async function initDashboard() {
    try {
        // Load all data
        await Promise.all([
            loadCompanyInfo(),
            loadHighlightOffer(),
            loadOffers()
        ]);

        // Update UI
        updateCompanyInfoUI();
        updateHighlightOfferUI();
        updateOffersListUI();

    } catch (error) {
        console.error('Error initializing dashboard:', error);
        alert('حدث خطأ أثناء تحميل البيانات. يرجى المحاولة مرة أخرى.');
    }
}

// Navigation
function switchSection(e) {
    const sectionId = e.currentTarget.dataset.section;

    // Update active nav button
    navButtons.forEach(btn => btn.classList.remove('active'));
    e.currentTarget.classList.add('active');

    // Show selected section
    contentSections.forEach(section => section.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
}

// Company Info Functions
async function loadCompanyInfo() {
    const { data, error } = await supabase
        .from('company_info')
        .select('*')
        .single();

    if (error) throw error;
    companyData = data;
}

function updateCompanyInfoUI() {
    if (!companyData) return;

    // Update company logo
    if (companyData.company_logo?.image) {
        const logoUrl = getImageUrl(companyData.company_logo.image);
        companyLogoPreview.src = logoUrl;
        companyLogoPreviewMain.src = logoUrl;
    }

    // Update intro images
    introImagesContainer.innerHTML = '';
    if (companyData.web_intro_images?.images?.length > 0) {
        companyData.web_intro_images.images.forEach((image, index) => {
            createImageThumbnail(introImagesContainer, image, 'intro', index);
        });
    }
}

async function handleCompanyLogoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    try {
        // Sanitize filename to remove invalid characters
        const sanitizedFileName = file.name
            .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace non-alphanumeric chars with underscore
            .replace(/_{2,}/g, '_') // Replace multiple underscores with single
            .replace(/^_|_$/g, ''); // Remove leading/trailing underscores

        // Upload to Supabase Storage
        const filePath = `company-logos/${Date.now()}_${sanitizedFileName}`;
        const { data, error } = await supabase.storage
            .from('images')
            .upload(filePath, file);

        if (error) throw error;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('images')
            .getPublicUrl(data.path);

        // Update company data
        companyData.company_logo = { image: publicUrl };

        // Update UI
        companyLogoPreview.src = publicUrl;
        companyLogoPreviewMain.src = publicUrl;

    } catch (error) {
        console.error('Error uploading company logo:', error);
        alert('حدث خطأ أثناء رفع شعار الشركة. يرجى المحاولة مرة أخرى.');
    }
}

async function saveCompanyInfo() {
    try {
        // Update company data with current intro images
        const introImages = getImageUrlsFromContainer(introImagesContainer);
        companyData.web_intro_images = { images: introImages };

        // Update in database
        const { error } = await supabase
            .from('company_info')
            .upsert(companyData);

        if (error) throw error;

        alert('تم حفظ معلومات الشركة بنجاح!');
    } catch (error) {
        console.error('Error saving company info:', error);
        alert('حدث خطأ أثناء حفظ معلومات الشركة. يرجى المحاولة مرة أخرى.');
    }
}

// Highlight Offer Functions
async function loadHighlightOffer() {
    const { data, error } = await supabase
        .from('offers')
        .select('*')
        .eq('id', 2) // Assuming highlight offer has id 2 as in the JSON
        .maybeSingle();

    if (error) throw error;
    highlightOfferData = data;
}

function updateHighlightOfferUI() {
    if (!highlightOfferData) return;

    // Fill form fields
    highlightTitleInput.value = highlightOfferData.title || '';
    highlightDescriptionInput.value = highlightOfferData.highlight_offer_description || highlightOfferData.description || '';
    highlightPriceInput.value = highlightOfferData.price || '';
    highlightOldPriceInput.value = highlightOfferData.old_price || '';
    highlightDatesInput.value = highlightOfferData.dates || '';
    highlightNoteInput.value = highlightOfferData.note || '';
    highlightRatingInput.value = highlightOfferData.rating || '';
    highlightReviewsInput.value = highlightOfferData.reviews || '';
    highlightCurrencyInput.value = highlightOfferData.currency || 'SAR';

    // Update images
    highlightImagesContainer.innerHTML = '';
    if (highlightOfferData.images?.length > 0) {
        highlightOfferData.images.forEach((image, index) => {
            createImageThumbnail(highlightImagesContainer, image, 'highlight', index);
        });
    }
}

async function saveHighlightOffer() {
    try {
        // Prepare data to update/insert
        const updatedData = {
            id: 2, // Always use id 2 for highlight offer
            title: highlightTitleInput.value,
            highlight_offer_description: highlightDescriptionInput.value,
            description: highlightDescriptionInput.value,
            price: parseFloat(highlightPriceInput.value),
            old_price: parseFloat(highlightOldPriceInput.value),
            dates: highlightDatesInput.value,
            note: highlightNoteInput.value,
            rating: parseFloat(highlightRatingInput.value),
            reviews: parseInt(highlightReviewsInput.value),
            images: getImageUrlsFromContainer(highlightImagesContainer),
            updated_at: new Date().toISOString(),
            currency: highlightCurrencyInput.value
        };

        if (highlightOfferData && highlightOfferData.id) {
            // Update existing highlight offer
            const { error } = await supabase
                .from('offers')
                .update(updatedData)
                .eq('id', highlightOfferData.id);

            if (error) throw error;
        } else {
            // Insert new highlight offer with id = 2
            const { error } = await supabase
                .from('offers')
                .insert(updatedData);

            if (error) throw error;
        }

        // Reload data
        await loadHighlightOffer();
        updateHighlightOfferUI();

        alert('تم حفظ العرض المميز بنجاح!');
    } catch (error) {
        console.error('Error saving highlight offer:', error);
        alert('حدث خطأ أثناء حفظ العرض المميز. يرجى المحاولة مرة أخرى.');
    }
}

// Offers Functions
async function loadOffers() {
    const { data, error } = await supabase
        .from('offers')
        .select('*')
        .neq('id', 2) // Exclude highlight offer
        .order('id', { ascending: true });

    if (error) throw error;
    offersData = data;
}

function updateOffersListUI() {
    offersList.innerHTML = '';

    if (offersData.length === 0) {
        offersList.innerHTML = '<p class="no-offers">لا توجد عروض متاحة حالياً</p>';
        return;
    }

    offersData.forEach(offer => {
        const offerCard = document.createElement('div');
        offerCard.className = 'offer-card';
        offerCard.dataset.id = offer.id;

        // Format price with commas
        const formattedPrice = offer.price?.toLocaleString() || '0';
        const formattedOldPrice = offer.old_price?.toLocaleString() || '0';
        const currency = offer.currency || 'SAR';
        let currencySymbol = 'ر.س';
        if (currency === 'BHD') currencySymbol = 'د.ب';
        if (currency === 'USD') currencySymbol = '$';

        offerCard.innerHTML = `
            <h3>${offer.title}</h3>
            <span class="offer-label">${offer.label}</span>
            <div>
                <span class="offer-old-price">${formattedOldPrice} ${currencySymbol}</span>
                <span class="offer-price">${formattedPrice} ${currencySymbol}</span>
            </div>
            <p class="offer-dates">${offer.dates}</p>
            <div class="offer-images">
                ${offer.images?.slice(0, 3).map(img => `
                    <img src="${getImageUrl(img)}" alt="Offer Image">
                `).join('')}
            </div>
            <div class="offer-actions">
                <button class="btn edit-btn" data-action="edit">
                    <i class="mdi mdi-pencil"></i> تعديل
                </button>
                <button class="btn delete-btn" data-action="delete">
                    <i class="mdi mdi-delete"></i> حذف
                </button>
            </div>
        `;

        offersList.appendChild(offerCard);
    });
}

function openNewOfferModal() {
    currentOfferId = null;
    modalTitle.textContent = 'إضافة عرض جديد';

    // Reset form
    offerTitleInput.value = '';
    offerLabelInput.value = 'جديد';
    offerDescriptionInput.value = '';
    offerPriceInput.value = '';
    offerOldPriceInput.value = '';
    offerDatesInput.value = '';
    offerNoteInput.value = '';
    offerRatingInput.value = '';
    offerReviewsInput.value = '';
    offerImagesContainer.innerHTML = '';
    offerCurrencyInput.value = 'SAR';

    // Uncheck all categories
    document.querySelectorAll('[name="offer-category"]').forEach(checkbox => {
        checkbox.checked = false;
    });

    openModal(offerModal);
}

function openEditOfferModal(offerId) {
    const offer = offersData.find(o => o.id === offerId);
    if (!offer) return;

    currentOfferId = offerId;
    modalTitle.textContent = 'تعديل العرض';

    // Fill form
    offerTitleInput.value = offer.title || '';
    offerLabelInput.value = offer.label || 'جديد';
    offerDescriptionInput.value = offer.description || '';
    offerPriceInput.value = offer.price || '';
    offerOldPriceInput.value = offer.old_price || '';
    offerDatesInput.value = offer.dates || '';
    offerNoteInput.value = offer.note || '';
    offerRatingInput.value = offer.rating || '';
    offerReviewsInput.value = offer.reviews || '';
    offerCurrencyInput.value = offer.currency || 'SAR';

    // Check categories
    document.querySelectorAll('[name="offer-category"]').forEach(checkbox => {
        checkbox.checked = offer.category?.includes(checkbox.value) || false;
    });

    // Load images
    offerImagesContainer.innerHTML = '';
    if (offer.images?.length > 0) {
        offer.images.forEach((image, index) => {
            createImageThumbnail(offerImagesContainer, image, 'offer', index);
        });
    }

    openModal(offerModal);
}

async function saveOffer() {
    try {
        // Get selected categories
        const categories = Array.from(document.querySelectorAll('[name="offer-category"]:checked'))
            .map(checkbox => checkbox.value);

        // Prepare offer data
        const offerData = {
            title: offerTitleInput.value,
            label: offerLabelInput.value,
            description: offerDescriptionInput.value,
            price: parseFloat(offerPriceInput.value),
            old_price: parseFloat(offerOldPriceInput.value),
            dates: offerDatesInput.value,
            note: offerNoteInput.value,
            rating: parseFloat(offerRatingInput.value),
            reviews: parseInt(offerReviewsInput.value),
            category: categories,
            images: getImageUrlsFromContainer(offerImagesContainer),
            updated_at: new Date().toISOString(),
            currency: offerCurrencyInput.value
        };

        if (currentOfferId) {
            // Update existing offer
            const { error } = await supabase
                .from('offers')
                .update(offerData)
                .eq('id', currentOfferId);

            if (error) throw error;
        } else {
            // Create new offer
            const { data, error } = await supabase
                .from('offers')
                .insert(offerData)
                .select();

            if (error) throw error;
            currentOfferId = data[0].id;
        }

        // Reload offers
        await loadOffers();
        updateOffersListUI();

        closeModal(offerModal);
        alert(`تم ${currentOfferId ? 'تحديث' : 'إضافة'} العرض بنجاح!`);
    } catch (error) {
        console.error('Error saving offer:', error);
        alert('حدث خطأ أثناء حفظ العرض. يرجى المحاولة مرة أخرى.');
    }
}

async function deleteOffer(offerId) {
    if (!confirm('هل أنت متأكد من حذف هذا العرض؟ لا يمكن التراجع عن هذه العملية.')) {
        return;
    }

    try {
        // First delete images from storage if needed
        const offer = offersData.find(o => o.id === offerId);
        if (offer?.images?.length > 0) {
            // You might want to implement image deletion logic here
        }

        // Delete from database
        const { error } = await supabase
            .from('offers')
            .delete()
            .eq('id', offerId);

        if (error) throw error;

        // Reload offers
        await loadOffers();
        updateOffersListUI();

        alert('تم حذف العرض بنجاح!');
    } catch (error) {
        console.error('Error deleting offer:', error);
        alert('حدث خطأ أثناء حذف العرض. يرجى المحاولة مرة أخرى.');
    }
}

function handleOfferAction(e) {
    const card = e.target.closest('.offer-card');
    if (!card) return;

    const offerId = parseInt(card.dataset.id);
    const action = e.target.closest('[data-action]')?.dataset.action;

    if (action === 'edit') {
        openEditOfferModal(offerId);
    } else if (action === 'delete') {
        deleteOffer(offerId);
    }
}



// Image Helper Functions
function createImageInput(container, type) {
    const inputId = `image-upload-${type}-${Date.now()}`;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.id = inputId;
    input.style.display = 'none';
    input.style.position = 'absolute';
    input.style.left = '-9999px';

    input.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            // Sanitize filename to remove invalid characters
            const sanitizedFileName = file.name
                .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace non-alphanumeric chars with underscore
                .replace(/_{2,}/g, '_') // Replace multiple underscores with single
                .replace(/^_|_$/g, ''); // Remove leading/trailing underscores

            // Upload to Supabase Storage
            const filePath = `${type}-images/${Date.now()}_${sanitizedFileName}`;
            const { data, error } = await supabase.storage
                .from('images')
                .upload(filePath, file);

            if (error) throw error;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('images')
                .getPublicUrl(data.path);

            // Create thumbnail
            createImageThumbnail(container, publicUrl, type, container.children.length);

        } catch (error) {
            console.error('Error uploading image:', error);
            alert('حدث خطأ أثناء رفع الصورة. يرجى المحاولة مرة أخرى.');
        } finally {
            // Clean up the input element
            if (input.parentNode) {
                input.parentNode.removeChild(input);
            }
        }
    });

    // Append to body and trigger click
    document.body.appendChild(input);

    // Use a small delay to ensure the input is properly attached
    setTimeout(() => {
        input.click();
    }, 100);
}

function createImageThumbnail(container, imageUrl, type, index) {
    const thumbnailWrapper = document.createElement('div');
    thumbnailWrapper.className = 'image-thumbnail-wrapper';

    const thumbnail = document.createElement('img');
    thumbnail.className = 'image-thumbnail';
    thumbnail.src = getImageUrl(imageUrl);
    thumbnail.alt = `${type} image ${index}`;

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-thumbnail';
    deleteBtn.innerHTML = '<i class="mdi mdi-close"></i>';
    deleteBtn.addEventListener('click', () => {
        thumbnailWrapper.remove();
    });

    thumbnailWrapper.appendChild(thumbnail);
    thumbnailWrapper.appendChild(deleteBtn);
    container.appendChild(thumbnailWrapper);
}

function getImageUrlsFromContainer(container) {
    const thumbnails = container.querySelectorAll('.image-thumbnail');
    return Array.from(thumbnails).map(img => img.src);
}

function getImageUrl(pathOrUrl) {
    if (pathOrUrl.startsWith('http')) {
        return pathOrUrl;
    }

    // For paths, construct URL (adjust based on your storage setup)
    return `${supabaseUrl}/storage/v1/object/public/images/${pathOrUrl}`;
}

function extractPathFromUrl(url) {
    if (!url.includes('/storage/v1/object/public/images/')) {
        return null;
    }

    return url.split('/storage/v1/object/public/images/')[1];
}

// Modal Functions
function openModal(modal) {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function closeOfferModal() {
    closeModal(offerModal);
    currentOfferId = null;
}