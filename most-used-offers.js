// Most Used Offers Management
// Using the existing Supabase client from the global scope

// DOM Elements
const mostUsedOffersContainer = document.getElementById('most-used-offers-container');
const editButton = document.getElementById('edit-most-used-offers');
const mostUsedOffersModal = document.getElementById('mostUsedOffersModal');
const mostUsedOffersCloseModalBtns = document.querySelectorAll('.close-modal');
const saveBtn = document.getElementById('saveMostUsedOffers');
const offersList = document.getElementById('mostUsedOffersList');

// Store current offers and state
let currentOffers = [];
let currentEditingIndex = -1;

// Open mostUsedOffersModal and show offers
editButton.addEventListener('click', async function () {
    console.log('Edit button clicked');
    try {
        // Toggle display of the offers container
        const container = document.getElementById('most-used-offers-container');
        if (container) {
            const newDisplay = container.style.display === 'none' ? 'block' : 'none';
            container.style.display = newDisplay;
        }

        // Show modal for editing
        showOffersModal();
        await fetchAndDisplayMostUsedOffers();
    } catch (error) {
        console.error('Error in edit button click handler:', error);
    }
});

// Close modal handlers
function closeModal() {
    mostUsedOffersModal.classList.remove('show');
    document.body.style.overflow = 'auto';
    document.getElementById('addNewMostUsedOffers').style.display = '';
}

mostUsedOffersCloseModalBtns.forEach(btn => {
    btn.addEventListener('click', closeModal);
});

// Close when clicking outside modal
mostUsedOffersModal.addEventListener('click', function (event) {
    if (event.target === mostUsedOffersModal) {
        closeModal();
    }
});

// Save button handler
saveBtn.addEventListener('click', closeModal);

// Modal Functions
function showOffersModal() {
    // Reset the modal position and opacity before showing
    mostUsedOffersModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // Trigger reflow
    void mostUsedOffersModal.offsetHeight;

    // Add show class to trigger the animation
    mostUsedOffersModal.classList.add('show');
}



// Fetch and display most used offers in the modal
async function fetchAndDisplayMostUsedOffers() {
    console.log('Starting to fetch offers...');

    try {
        // 1. Fetch data from Supabase
        console.log('Fetching data from Supabase...');
        const { data, error } = await supabase
            .from('most_used_travel_offers')
            .select('*')
            .eq('id', 1)
            .single();

        if (error) {
            console.error('Supabase error:', error);
            throw error;
        }

        console.log('Data received from Supabase:', data);

        if (!offersList) {
            console.error('offersList element not found');
            return;
        }

        // 2. Check if we have data
        if (!data || !data['sample-travel-website-domain']) {
            console.log('No offers data found');
            offersList.innerHTML = '<p>لا توجد عروض متاحة</p>';
            return;
        }

        // 3. Process the data
        try {
            console.log('Processing offers data...');
            let offersStr = data['sample-travel-website-domain'].trim();
            console.log('Raw offers string:', offersStr);

            // Clean up the string to make it valid JSON
            offersStr = offersStr.replace(/,\s*([}\]]|$)/g, '$1');
            if (!offersStr.startsWith('[')) {
                console.log('Wrapping single object in array');
                offersStr = `[${offersStr}]`;
            }

            // Convert property names to quoted strings
            const jsonStr = offersStr
                .replace(/([{\s])(\w+)(?=\s*:)/g, '$1"$2"')
                .replace(/'/g, '"');

            console.log('JSON string after cleanup:', jsonStr);

            // Parse the JSON
            currentOffers = JSON.parse(jsonStr);
            console.log('Parsed offers:', currentOffers);

            // 4. Validate the parsed data
            if (!Array.isArray(currentOffers)) {
                console.error('Parsed data is not an array:', currentOffers);
                throw new Error('تنسيق البيانات غير صحيح');
            }

            if (currentOffers.length === 0) {
                console.log('No offers found in the array');
                offersList.innerHTML = '<p>لا توجد عروض متاحة</p>';
                return;
            }

            // 5. Render the offers
            console.log('Rendering offers...');
            let html = '';
            currentOffers.forEach((offer, index) => {
                if (offer && typeof offer === 'object') {
                    html += `
                        <div class="offer-item">
                            <div>
                                <h4>${offer.title || 'عنوان غير محدد'}</h4>
                                ${offer.offerType ? `<p>${offer.offerType}</p>` : ''}
                                ${offer.adultAmount ? `<p>البالغين: ${offer.adultAmount}</p>` : ''}
                                ${offer.countries ? `<p>الدول: ${offer.countries}</p>` : ''}
                                ${offer.cities ? `<p>المدن: ${offer.cities}</p>` : ''}
                            </div>
                            <div>
                                <button class="btn small" onclick="editMostUsedOffer(${index})">تعديل</button>
                                <button class="btn small" onclick="deleteMostUsedOffer(${index})" style="background: #d20000; color: white;">حذف</button>
                            </div>
                        </div>`;
                }
            });

            offersList.innerHTML = html || '<p>لا توجد عروض صالحة للعرض</p>';
            console.log('Offers rendered successfully');

        } catch (parseError) {
            console.error('Error parsing offers:', parseError);
            offersList.innerHTML = `
                <p class="error">
                    خطأ في معالجة البيانات. يرجى التأكد من صحة تنسيق البيانات.
                    <br>${parseError.message}
                </p>`;
        }

    } catch (fetchError) {
        console.error('Error in fetchAndDisplayMostUsedOffers:', fetchError);
        if (offersList) {
            offersList.innerHTML = `
                <p class="error">
                    حدث خطأ في تحميل العروض. يرجى المحاولة مرة أخرى لاحقاً.
                    <br>${fetchError.message}
                </p>`;
        }
    }
}

// Edit offer function
function editMostUsedOffer(index) {
    /* Hide the add new most used offer button */
    document.getElementById('addNewMostUsedOffers').style.display = 'none';



    currentEditingIndex = index;
    const offer = currentOffers[index];

    // Create edit form
    const formHtml = `
        <div class="edit-form">
            <h3>تعديل العرض</h3>
            <div class="form-group">
                <label for="edit-title">عنوان العرض</label>
                <input type="text" id="edit-title" value="${offer.title || ''}" required>
            </div>
            <div class="form-group">
                <label for="edit-offerType">نوع العرض</label>
                <select id="edit-offerType" class="form-control" required>
                    <option value="شهر عسل" ${offer.offerType === 'شهر عسل' ? 'selected' : ''}>شهر عسل</option>
                    <option value="عائلة" ${offer.offerType === 'عائلة' ? 'selected' : ''}>عائلة</option>
                    <option value="شباب" ${offer.offerType === 'شباب' ? 'selected' : ''}>شباب</option>
                    <option value="بنات" ${offer.offerType === 'بنات' ? 'selected' : ''}>بنات</option>
                    <option value="شخصين" ${offer.offerType === 'شخصين' ? 'selected' : ''}>شخصين</option>
                    <option value="اخرى" ${offer.offerType === 'اخرى' ? 'selected' : ''}>أخرى</option>
                </select>
            </div>
            <div class="form-group">
                <label for="edit-adultAmount">عدد البالغين</label>
                <input type="text" id="edit-adultAmount" value="${offer.adultAmount || ''}">
            </div>
            <div class="form-group">
                <label for="edit-countries">الدول (مفصولة بفاصلة)</label>
                <input type="text" id="edit-countries" value="${offer.countries || ''}">
            </div>
            <div class="form-group">
                <label for="edit-cities">المدن (مفصولة بفاصلة)</label>
                <input type="text" id="edit-cities" value="${offer.cities || ''}">
            </div>
            <div class="form-actions">
                <button type="button" class="btn primary" onclick="saveOfferChanges()">حفظ تغييرات العرض</button>
            </div>
        </div>
    `;

    // Show form in modal
    document.getElementById('mostUsedOffersList').innerHTML = formHtml;
};




// Add new offer form
function showAddOfferForm() {
    const formHtml = `
        <div class="edit-form">
            <h3>إضافة عرض جديد</h3>
            <div class="form-group">
                <label for="new-offer-title">عنوان العرض</label>
                <input type="text" id="new-offer-title" class="form-control" required>
            </div>
            <div class="form-group">
                <label for="edit-offerType">نوع العرض</label>
                <select id="edit-offerType" class="form-control" required>
                    <option value="شهر عسل">شهر عسل</option>
                    <option value="عائلة">عائلة</option>
                    <option value="شباب">شباب</option>
                    <option value="بنات">بنات</option>
                    <option value="شخصين">شخصين</option>
                    <option value="اخرى">أخرى</option>
                </select>
            </div>
            <div class="form-group">
                <label for="new-offer-adultAmount">عدد البالغين</label>
                <input type="number" id="new-offer-adultAmount" class="form-control">
            </div>
            <div class="form-group">
                <label for="new-offer-countries">الدول (مفصولة بفاصلة)</label>
                <input type="text" id="new-offer-countries" class="form-control">
            </div>
            <div class="form-group">
                <label for="new-offer-cities">المدن (مفصولة بفاصلة)</label>
                <input type="text" id="new-offer-cities" class="form-control">
            </div>
            <div class="form-actions">
                <button type="button" class="btn primary" onclick="saveNewMostUsedOffer()">حفظ العرض الجديد</button>
            </div>
        </div>
    `;

    document.getElementById('mostUsedOffersList').innerHTML = formHtml;
}


// Save new offer function
saveNewMostUsedOffer = async function () {
    try {
        // Get form values
        const newOffer = {
            title: document.getElementById('new-offer-title').value.trim(),
            offerType: document.getElementById('edit-offerType').value.trim(),
            adultAmount: document.getElementById('new-offer-adultAmount').value.trim(),
            countries: document.getElementById('new-offer-countries').value.trim(),
            cities: document.getElementById('new-offer-cities').value.trim()
        };

        // Validate required fields
        if (!newOffer.title) {
            alert('الرجاء إدخال عنوان العرض');
            return;
        }

        console.log('Adding new offer:', newOffer);

        // Add to current offers array
        currentOffers.push(newOffer);

        // Convert to the required format for Supabase
        const offersString = currentOffers.map(offer =>
            `{\n        title: \"${offer.title}\",\n        offerType: \"${offer.offerType}\",\n        adultAmount: \"${offer.adultAmount}\",\n        countries: \"${offer.countries}\",\n        cities: \"${offer.cities}\"\n    }`
        ).join(',');

        // Update in Supabase
        const { error } = await supabase
            .from('most_used_travel_offers')
            .update({
                'sample-travel-website-domain': offersString
            })
            .eq('id', 1);

        if (error) {
            console.error('Error adding new offer:', error);
            throw error;
        }

        console.log('New offer added successfully');
        console.log('Updated offers array:', currentOffers);

        // Refresh the display
        await fetchAndDisplayMostUsedOffers();


        document.getElementById('addNewMostUsedOffers').style.display = '';


    } catch (error) {
        console.error('Error in saveNewOffer:', error);
        alert('حدث خطأ أثناء إضافة العرض الجديد: ' + error.message);
    }
}

// Add event listener for the "Add New Offer" button
document.getElementById('addNewMostUsedOffers').onclick = function () {
    showAddOfferForm();
    document.getElementById('addNewMostUsedOffers').style.display = 'none';
}





// Delete offer function
window.deleteMostUsedOffer = async function (index) {
    if (!confirm('هل أنت متأكد من حذف هذا العرض؟')) {
        return;
    }

    try {
        console.log('Deleting offer at index:', index);

        // Remove the offer from the currentOffers array
        currentOffers.splice(index, 1);

        // Convert the updated array to the required format for Supabase
        const offersString = currentOffers.map(offer =>
            `{\n        title: \"${offer.title}\",\n        offerType: \"${offer.offerType}\",\n        adultAmount: \"${offer.adultAmount}\",\n        countries: \"${offer.countries}\",\n        cities: \"${offer.cities}\"\n    }`
        ).join(',');

        // Update in Supabase
        const { error } = await supabase
            .from('most_used_travel_offers')
            .update({
                'sample-travel-website-domain': offersString
            })
            .eq('id', 1);

        if (error) {
            console.error('Error deleting offer:', error);
            throw error;
        }


        // Refresh the display
        await fetchAndDisplayMostUsedOffers();

    } catch (error) {
        console.error('Error in deleteMostUsedOffer:', error);
        alert('حدث خطأ أثناء حذف العرض: ' + error.message);
    }
};




// Cancel edit function
window.cancelEdit = function () {
    fetchAndDisplayMostUsedOffers();
    currentEditingIndex = -1;
};

// Save offer changes function
window.saveOfferChanges = async function () {
    console.log('Starting to save offer changes...');
    if (currentEditingIndex === -1) {
        console.log('No offer is being edited');
        return;
    }

    try {
        console.log('Getting form values...');
        const updatedOffer = {
            title: document.getElementById('edit-title').value,
            offerType: document.getElementById('edit-offerType').value,
            adultAmount: document.getElementById('edit-adultAmount').value,
            countries: document.getElementById('edit-countries').value,
            cities: document.getElementById('edit-cities').value
        };

        console.log('Updated offer data:', updatedOffer);

        // Update in local array
        currentOffers[currentEditingIndex] = updatedOffer;
        console.log('Local offers array updated');

        // Update in Supabase
        console.log('Updating in Supabase...');
        const { data, error } = await supabase
            .from('most_used_travel_offers')
            .update({ 'sample-travel-website-domain': JSON.stringify(currentOffers) })
            .eq('id', 1);

        if (error) {
            console.error('Supabase update error:', error);
            throw error;
        }

        console.log('Supabase update successful');

        // Refresh the display
        console.log('Refreshing display...');
        await fetchAndDisplayMostUsedOffers();
        console.log('Display refreshed');

    } catch (error) {
        console.error('Error in saveOfferChanges:', error);
        alert('حدث خطأ أثناء تحديث العرض: ' + error.message);
    } finally {
        console.log('Cleaning up...');
        currentEditingIndex = -1;
        console.log('Edit mode reset');
    }
};

// Render offers in the main page
function renderOffers() {
    if (!mostedUsedOffersContainer) return;

    mostedUsedOffersContainer.innerHTML = '';

    if (currentOffers.length === 0) {
        mostedUsedOffersContainer.innerHTML = '<p class="no-offers">لا توجد عروض متاحة حالياً</p>';
        return;
    }

    currentOffers.forEach((offer, index) => {
        const offerElement = document.createElement('div');
        offerElement.className = 'offer-card';
        offerElement.innerHTML = `
            <h3>${offer.title || 'عنوان غير محدد'}</h3>
            <p><strong>نوع العرض:</strong> ${offer.offerType || 'غير محدد'}</p>
            <p><strong>عدد البالغين:</strong> ${offer.adultAmount || 'غير محدد'}</p>
            <p><strong>الدول:</strong> ${offer.countries || 'غير محدد'}</p>
            <p><strong>المدن:</strong> ${offer.cities || 'غير محدد'}</p>
        `;
        mostedUsedOffersContainer.appendChild(offerElement);
    });
}

// Render offers in the edit modal
function renderOffersList() {
    if (!offersList) return;

    offersList.innerHTML = '';

    currentOffers.forEach((offer, index) => {
        const offerItem = document.createElement('div');
        offerItem.className = 'offer-edit-item';
        offerItem.dataset.index = index;
        offerItem.innerHTML = `
            <div class="form-group">
                <label>عنوان العرض</label>
                <input type="text" class="offer-title" value="${offer.title || ''}" required>
            </div>
            <div class="form-group">
                <label>نوع العرض</label>
                <input type="text" class="offer-type" value="${offer.offerType || ''}" required>
            </div>
            <div class="form-group">
                <label>عدد البالغين</label>
                <input type="number" class="offer-adultAmount" value="${offer.adultAmount || ''}">
            </div>
            <div class="form-group">
                <label>الدول (مفصولة بشرطة - )</label>
                <input type="text" class="offer-countries" value="${offer.countries || ''}" required>
            </div>
            <div class="form-group">
                <label>المدن (مفصولة بشرطة - )</label>
                <input type="text" class="offer-cities" value="${offer.cities || ''}" required>
            </div>
            <button type="button" class="btn danger remove-offer">حذف</button>
        `;

        offersList.appendChild(offerItem);
    });

    // Add event listeners to remove buttons
    document.querySelectorAll('.remove-offer').forEach(btn => {
        btn.addEventListener('click', function () {
            const index = this.closest('.offer-edit-item').dataset.index;
            currentOffers.splice(index, 1);
            renderOffersList();
        });
    });
}

// Add new offer form
function addOfferForm() {
    const newOffer = {
        title: '',
        offerType: '',
        adultAmount: '',
        countries: '',
        cities: ''
    };

    currentOffers.push(newOffer);
    renderOffersList();

    // Scroll to the bottom to show the new form
    const newItem = offersList.lastElementChild;
    if (newItem) {
        newItem.scrollIntoView({ behavior: 'smooth' });
    }
}

// Save offers to Supabase
async function saveOffers() {
    try {
        // Update currentOffers with form values
        const offerItems = document.querySelectorAll('.offer-edit-item');
        const updatedOffers = [];

        offerItems.forEach(item => {
            updatedOffers.push({
                title: item.querySelector('.offer-title').value,
                offerType: item.querySelector('.offer-type').value,
                adultAmount: item.querySelector('.offer-adultAmount').value,
                countries: item.querySelector('.offer-countries').value,
                cities: item.querySelector('.offer-cities').value
            });
        });

        currentOffers = updatedOffers;

        // Convert to the required format for Supabase
        const offersString = currentOffers.map(offer =>
            `{\n        title: \"${offer.title}\",\n        offerType: \"${offer.offerType}\",\n        adultAmount: \"${offer.adultAmount}\",\n        countries: \"${offer.countries}\",\n        cities: \"${offer.cities}\"\n    }`
        ).join(',');

        // Update in Supabase
        const { error } = await supabase
            .from('most_used_travel_offers')
            .upsert({
                id: 1,
                'sample-travel-website-domain': offersString
            });

        if (error) throw error;

        // Update the display
        renderOffers();


        if (!mostUsedOffersModal) return;
        // Remove show class to trigger fade out animation
        mostUsedOffersModal.classList.remove('show');


    } catch (error) {
        console.error('Error saving offers:', error);
        alert('حدث خطأ أثناء حفظ التغييرات');
    }
}