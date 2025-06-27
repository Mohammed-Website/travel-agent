function openModal() {
    const createCustomOfferModal = document.getElementById("create-custom-offer-modal-id");
    createCustomOfferModal.classList.add("show");
    createCustomOfferModal.style.opacity = '1';
    document.body.classList.add("overflow-hidden"); // Disable main page scroll
    // Focus first input
    setTimeout(() => {
        const firstInput = createCustomOfferModal.querySelector('input, select, textarea, button');
        if (firstInput) firstInput.focus();
    }, 100);
    // Trap focus
    trapFocus(createCustomOfferModal);
}

function closeModal() {
    const createCustomOfferModal = document.getElementById("create-custom-offer-modal-id");
    createCustomOfferModal.classList.remove("show");
    document.body.classList.remove("overflow-hidden");
    setTimeout(() => {
        createCustomOfferModal.style.opacity = '0';
    }, 5);
}

// Trap focus inside modal
function trapFocus(modal) {
    const focusable = modal.querySelectorAll('input, select, textarea, button, [tabindex]:not([tabindex="-1"])');
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    function handleTab(e) {
        if (e.key === 'Tab') {
            if (e.shiftKey) {
                if (document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                }
            } else {
                if (document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        } else if (e.key === 'Escape') {
            closeModal();
        }
    }
    modal.addEventListener('keydown', handleTab);
    // Remove listener on close
    modal.addEventListener('transitionend', function cleanup() {
        if (!modal.classList.contains('show')) {
            modal.removeEventListener('keydown', handleTab);
            modal.removeEventListener('transitionend', cleanup);
        }
    });
}

const createCustomOfferModal = document.getElementById('create-custom-offer-modal-id');

createCustomOfferModal.addEventListener('click', function (e) {
    // Check if the click was directly on the background, not inside the modal content
    if (e.target === createCustomOfferModal) {
        closeModal();
    }
});


// تحديث تاريخ العودة تلقائيًا
function updateReturnDate() {
    const depDateStr = document.getElementById("departureDate").value;
    const nights = parseInt(document.getElementById("total-nights-input-id").value);

    const depDate = parseArabicDate(depDateStr);
    const returnDateEl = document.getElementById("returnDate");

    if (depDate && !isNaN(nights) && nights > 0) {
        depDate.setDate(depDate.getDate() + nights);
        returnDateEl.innerText = formatArabicDate(depDate);
    } else {
        returnDateEl.innerText = "-";
    }
}


document.getElementById("departureDate").addEventListener("input", updateReturnDate);
document.getElementById("total-nights-input-id").addEventListener("input", updateReturnDate);

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
    insertNewClick('your-travel-company.com');



    const adults = document.getElementById("adults").value;
    const children = document.getElementById("children").value;
    const childAges = Array.from(document.getElementById("childrenAges").querySelectorAll('input')).map(i => i.value).filter(a => a);
    const departure = document.getElementById("departureDate").value;
    const totalNights = document.getElementById("total-nights-input-id").value;
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
    message += `\n📅 تاريخ الذهاب: ${departure}\n🕒 عدد الليالي: ${totalNights}\n🔙 تاريخ العودة: ${returnDate}`;
    message += `\n🌍 الوجهات: ${countries} (${cities})`;
    message += `\n✈️ تشمل الباقة: ${inclusions.join(', ') || 'بدون'}`;
    message += `\n💳 ميزانية العرض: ${budgetType}\n\nيرجى تزويدي بأفضل عرض متوفر. شكرًا!`;

    const encoded = encodeURIComponent(message);
    const phone = "+966569446280"; // استبدل هذا برقمك
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