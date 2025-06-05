function openModal() {
    const modal = document.getElementById("offerModal");
    modal.classList.add("show");
    modal.style.opacity = '1';
    document.body.classList.add("overflow-hidden"); // Disable main page scroll
}

function closeModal() {
    const modal = document.getElementById("offerModal");
    modal.style.opacity = '0';

    setTimeout(() => {
        modal.classList.remove("show");
        document.body.classList.remove("overflow-hidden"); // Re-enable scroll
    }, 500);
}
const modal = document.getElementById('offerModal');

modal.addEventListener('click', function (e) {
    // Check if the click was directly on the background, not inside the modal content
    if (e.target === modal) {
        closeModal();
    }
});


// تحديث تاريخ العودة تلقائيًا
function updateReturnDate() {
    const depDateStr = document.getElementById("departureDate").value;
    const days = parseInt(document.getElementById("totalDays").value);

    const depDate = parseArabicDate(depDateStr);
    const returnDateEl = document.getElementById("returnDate");

    if (depDate && !isNaN(days) && days > 0) {
        depDate.setDate(depDate.getDate() + days);
        returnDateEl.innerText = formatArabicDate(depDate);
    } else {
        returnDateEl.innerText = "-";
    }
}


document.getElementById("departureDate").addEventListener("input", updateReturnDate);
document.getElementById("totalDays").addEventListener("input", updateReturnDate);

// أعمار الأطفال
document.getElementById("children").addEventListener("input", () => {
    const count = parseInt(document.getElementById("children").value || "0");
    const container = document.getElementById("childrenAges");
    container.innerHTML = '';
    for (let i = 1; i <= count; i++) {
        const input = document.createElement("input");
        input.type = "number";
        input.placeholder = `عمر الطفل ${i}`;
        input.className = "border p-1 rounded w-24";
        input.min = 0;
        container.appendChild(input);
    }
});

// إرسال عبر واتساب
document.getElementById("offerForm").addEventListener("submit", function (e) {
    e.preventDefault();


    /* insert a new click count in the Supbase database */
    insertNewClick('sample-table');



    const adults = document.getElementById("adults").value;
    const children = document.getElementById("children").value;
    const childAges = Array.from(document.getElementById("childrenAges").querySelectorAll('input')).map(i => i.value).filter(a => a);
    const departure = document.getElementById("departureDate").value;
    const totalDays = document.getElementById("totalDays").value;
    const returnDate = document.getElementById("returnDate").innerText;
    const countries = document.getElementById("countries").value;
    const cities = document.getElementById("cities").value;
    const inclusions = Array.from(document.querySelectorAll("input[type='checkbox']:checked")).map(cb => cb.parentElement.querySelector("span").innerText.trim());
    const budgetType = document.getElementById("budgetType").value;
    const offerType = document.getElementById("offerType").value;

    let message = `أهلاً، حاب اطلب عرض سياحي مخصص بناءً على التالي:\n\n`;
    message += `🧳 نوع العرض: ${offerType}`;
    message += `\n👤 عدد المسافرين: ${adults} بالغ${children && parseInt(children) > 0 ? ` / ${children} طفل` : ''}`;
    if (children && parseInt(children) > 0 && childAges.length > 0) {
        message += ` (أعمارهم: ${childAges.join(', ')})`;
    }
    message += `\n📅 تاريخ الذهاب: ${departure}\n🕒 عدد الأيام: ${totalDays}\n🔙 تاريخ العودة: ${returnDate}`;
    message += `\n🌍 الوجهات: ${countries} (${cities})`;
    message += `\n✈️ تشمل الباقة: ${inclusions.join(', ') || 'بدون'}`;
    message += `\n💳 ميزانية العرض: ${budgetType}\n\nيرجى تزويدي بأفضل عرض متوفر. شكرًا!`;

    const encoded = encodeURIComponent(message);
    const phone = "+966506411444"; // استبدل هذا برقمك
    window.open(`https://wa.me/${phone}?text=${encoded}`, '_blank');
});








flatpickr("#departureDate", {
    locale: "ar",
    dateFormat: "Y-m-d",
    disableMobile: true // Forces desktop version even on phones
});
// Arabic month names
const arabicMonths = [
    "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
    "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
];




// Convert Arabic date string like "14 أبريل 2025" to a Date object
function parseArabicDate(arabicDateStr) {
    const parts = arabicDateStr.split(' ');
    const day = parseInt(parts[0]);
    const monthIndex = arabicMonths.indexOf(parts[1]);
    const year = parseInt(parts[2]);
    if (monthIndex === -1 || isNaN(day) || isNaN(year)) return null;
    return new Date(year, monthIndex, day);
}

// Format date to Arabic string like "14 أبريل 2025"
function formatArabicDate(date) {
    const day = date.getDate();
    const month = arabicMonths[date.getMonth()];
    const year = date.getFullYear();
    return `${day.toString()} ${month} ${year.toString()}`;
}



flatpickr("#departureDate", {
    locale: "ar",
    dateFormat: "Y-m-d", // raw format
    disableMobile: true,
    onChange: function (selectedDates, dateStr, instance) {
        const date = selectedDates[0];
        if (date) {
            const day = date.getDate();
            const month = arabicMonths[date.getMonth()];
            const year = date.getFullYear();
            const formattedArabicDate = `${day.toString()} ${month} ${year.toString()}`;

            // Set it back in the input
            document.getElementById("departureDate").value = formattedArabicDate;
        }
    }
});









// Data for the mostUsedOffers
// Update the mostUsedOffers array with data from Supabase
async function fetchMostUsedOffers() {
    try {
        const { data, error } = await supabase
            .from('most_used_travel_offers')
            .select('*')
            .eq('id', 1)
            .single();

        if (error) throw error;

        if (data && data['sample-travel-website-domain']) {
            try {
                // Clean and parse the offers data
                let offersStr = data['sample-travel-website-domain'].trim();
                offersStr = offersStr.replace(/,\s*([}\]]|$)/g, '$1');
                if (!offersStr.startsWith('[')) {
                    offersStr = `[${offersStr}]`;
                }
                const jsonStr = offersStr
                    .replace(/([{\s])(\w+)(?=\s*:)/g, '$1"$2"')
                    .replace(/'/g, '"');
                
                const parsedOffers = JSON.parse(jsonStr);
                return Array.isArray(parsedOffers) ? parsedOffers : [];
            } catch (parseError) {
                console.error('Error parsing offers:', parseError);
                return [];
            }
        }
        return [];
    } catch (error) {
        console.error('Error fetching most used offers:', error);
        return [];
    }
}

// Initialize the offers
let mostUsedOffers = [];

// Load and display the offers when the page loads
document.addEventListener('DOMContentLoaded', async () => {
    mostUsedOffers = await fetchMostUsedOffers();

    mostUsedOffers.forEach(offer => {
        const offerItem = document.createElement('div');
        offerItem.className = 'offer-item';
        offerItem.textContent = offer.title;
        offerItem.onclick = () => selectOffer(offer); // Handle offer selection
        mostUsedOffersList.appendChild(offerItem);
    });
});






// Handle offer selection
function selectOffer(offer) {
    playSoundEffect('success');

    // Set values in the form
    document.getElementById("offerType").value = offer.offerType;
    document.getElementById("countries").value = offer.countries;
    document.getElementById("cities").value = offer.cities;

    // Get all offer items
    const allOffers = document.querySelectorAll('.offer-item');

    // Reset color of all offer items
    allOffers.forEach(item => {
        item.style.backgroundColor = ''; // Reset background color
        item.style.color = ''; // Reset text color
    });

    // Get the clicked offer item
    const offerItem = event.target;

    // Apply the animation directly with JavaScript
    offerItem.style.transition = 'background-color 0.3s ease, color 0.3s ease'; // Set the transition
    offerItem.style.backgroundColor = '#4CAF50'; // Set background color to green
    offerItem.style.color = 'white'; // Set text color to white
}



