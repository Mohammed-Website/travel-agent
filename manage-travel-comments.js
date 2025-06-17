// DOM Elements
const commentsContainer = document.getElementById('comments-container');
const addCommentBtn = document.getElementById('add-comment');
const comments_editModal = document.getElementById('edit-comment-modal');
const closeModalBtn = document.getElementById('close-edit-modal');
const cancelEditBtn = document.getElementById('cancel-edit');
const saveEditBtn = document.getElementById('save-edit');

// Form Elements
const editReviewDate = document.getElementById('edit-review-date');
const editReviewerName = document.getElementById('edit-reviewer-name');
const editCommentText = document.getElementById('edit-comment-text');
const editStarsInput = document.getElementById('edit-stars');
const starOptions = document.querySelectorAll('.star-option');

// State
let editingCommentId = null;
const COLUMN_NAME = "khalil_travel_company";

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    loadComments();
    setupEventListeners();
    setupStarRating();
});

// Fetch comments from Supabase
async function loadComments() {
    try {
        showLoading(true);

        const { data, error } = await supabase
            .from("all_customers_comments")
            .select(COLUMN_NAME)
            .eq("id", 1)
            .single();

        if (error) throw error;

        const comments = data?.[COLUMN_NAME] || [];
        renderComments(comments);
    } catch (error) {
        console.error('Error loading comments:', error);
        showError('حدث خطأ في تحميل التعليقات');
    } finally {
        showLoading(false);
    }
}

// Render comments to the DOM
function renderComments(comments) {
    if (!comments || comments.length === 0) {
        commentsContainer.innerHTML = `
            <div class="empty-state">
                <i class="far fa-comment-dots"></i>
                <p>لا توجد تعليقات حتى الآن</p>
            </div>
        `;
        return;
    }

    // Clear and set up container for horizontal scrolling
    commentsContainer.innerHTML = `
        <div class="comments-scroll-container">
            ${comments.map((comment, index) => `
                <div class="comment-card" style="--i: ${index}">
                    <div class="comment-header">
                        <span class="comment-date">${formatDate(comment.review_date)}</span>
                        <div class="comment-stars">${'★'.repeat(comment.stars)}${'☆'.repeat(5 - comment.stars)}</div>
                    </div>
                    <div class="comment-body">
                        <div class="comment-author">
                            <div class="comment-avatar">
                                ${comment.reviewer_name ? comment.reviewer_name.charAt(0).toUpperCase() : '?'}
                            </div>
                            <span class="comment-author-name">${comment.reviewer_name || 'زائر'}</span>
                        </div>
                        <p class="comment-text">${comment.comment || 'لا يوجد نص'}</p>
                    </div>
                    <div class="comment-actions">
                        <button class="btn btn-edit btn-sm" onclick="editComment(${index})">
                            <i class="fas fa-edit"></i> تعديل
                        </button>
                        <button class="btn btn-delete btn-sm" onclick="deleteComment(${index})">
                            <i class="fas fa-trash"></i> حذف
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// Format date to YYYY-MM-DD
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG');
}

// Format time ago (e.g., "منذ ساعة")
function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    const intervals = {
        سنة: 31536000,
        شهر: 2592000,
        أسبوع: 604800,
        يوم: 86400,
        ساعة: 3600,
        دقيقة: 60,
        ثانية: 1
    };

    for (const [unit, seconds] of Object.entries(intervals)) {
        const interval = Math.floor(diffInSeconds / seconds);
        if (interval >= 1) {
            return `منذ ${interval} ${unit}`;
        }
    }

    return 'الآن';
}

// Show loading state
function showLoading(show) {
    if (show) {
        commentsContainer.innerHTML = `
            <div class="comments-loading"></div>
        `;
    }
}

// Show error message
function showError(message) {
    commentsContainer.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-exclamation-circle"></i>
            <p>${message}</p>
        </div>
    `;
}

// Add new comment
addCommentBtn.addEventListener('click', () => {
    editingCommentId = null;
    resetForm();
    openModal();
});

// Close modal buttons
closeModalBtn.addEventListener('click', closeModal);
cancelEditBtn.addEventListener('click', closeModal);

// Save comment
saveEditBtn.addEventListener('click', saveComment);

// Close modal when clicking outside
comments_editModal.addEventListener('click', (e) => {
    if (e.target === comments_editModal) {
        closeModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !comments_editModal.classList.contains('hidden')) {
        closeModal();
    }
});



// Setup star rating interaction
function setupStarRating() {
    starOptions.forEach(star => {
        star.addEventListener('click', () => {
            const value = parseInt(star.dataset.value);
            updateStarRating(value);
        });
    });
}

// Update star rating UI
function updateStarRating(rating) {
    starOptions.forEach((star, index) => {
        const starIcon = star.querySelector('i');
        if (index < rating) {
            star.classList.add('active');
            starIcon.classList.remove('far');
            starIcon.classList.add('fas');
        } else {
            star.classList.remove('active');
            starIcon.classList.remove('fas');
            starIcon.classList.add('far');
        }
    });
    editStarsInput.value = rating;
}

// Open modal for adding/editing comment
function openModal() {
    console.log('Opening modal');
    comments_editModal.classList.add('show');
    document.body.style.overflow = 'hidden';

    // Set today's date as default
    if (!editReviewDate.value) {
        const today = new Date().toISOString().split('T')[0];
        editReviewDate.value = today;
    }

    // Focus on the first input
    editReviewerName.focus();
}

// Close modal
function closeModal() {
    comments_editModal.classList.remove('show');
    document.body.style.overflow = '';
}

// Reset form fields
function resetForm() {
    console.log('Resetting form');
    editReviewerName.value = '';
    editCommentText.value = '';
    updateStarRating(5); // Default to 5 stars

    // Set today's date
    const today = new Date().toISOString().split('T')[0];
    editReviewDate.value = today;
}

// Edit comment
window.editComment = async function (index) {
    try {
        const { data } = await supabase
            .from("all_customers_comments")
            .select(COLUMN_NAME)
            .eq("id", 1)
            .single();

        const comments = data?.[COLUMN_NAME] || [];
        const comment = comments[index];

        if (!comment) throw new Error('Comment not found');

        editingCommentId = index;

        // Fill the form
        editReviewDate.value = comment.review_date || '';
        editReviewerName.value = comment.reviewer_name || '';
        editCommentText.value = comment.comment || '';
        updateStarRating(comment.stars || 5);

        openModal();
    } catch (error) {
        console.error('Error preparing edit:', error);
        alert('حدث خطأ أثناء تحميل التعليق للتعديل');
    }
};

// Delete comment
window.deleteComment = async function (index) {
    if (!confirm('هل أنت متأكد من حذف هذا التعليق؟')) return;

    try {
        const { data } = await supabase
            .from("all_customers_comments")
            .select(COLUMN_NAME)
            .eq("id", 1)
            .single();

        let comments = data?.[COLUMN_NAME] || [];
        comments.splice(index, 1);

        const { error } = await supabase
            .from("all_customers_comments")
            .update({ [COLUMN_NAME]: comments })
            .eq("id", 1);

        if (error) throw error;

        loadComments();
        showToast('تم حذف التعليق بنجاح', 'success');
    } catch (error) {
        console.error('Error deleting comment:', error);
        showToast('حدث خطأ أثناء حذف التعليق', 'error');
    }
};

// Save comment (add new or update)
async function saveComment() {
    const commentData = {
        review_date: editReviewDate.value,
        reviewer_name: editReviewerName.value.trim(),
        comment: editCommentText.value.trim(),
        stars: parseInt(editStarsInput.value) || 5
    };

    // Basic validation
    if (!commentData.reviewer_name) {
        showToast('الرجاء إدخال اسم المستخدم', 'error');
        editReviewerName.focus();
        return;
    }

    if (!commentData.comment) {
        showToast('الرجاء إدخال نص التعليق', 'error');
        editCommentText.focus();
        return;
    }

    try {
        // Get current comments
        const { data } = await supabase
            .from("all_customers_comments")
            .select(COLUMN_NAME)
            .eq("id", 1)
            .single();

        let comments = data?.[COLUMN_NAME] || [];

        if (editingCommentId !== null) {
            // Update existing comment
            comments[editingCommentId] = commentData;
        } else {
            // Add new comment
            comments.unshift(commentData);
        }

        // Save to Supabase
        const { error } = await supabase
            .from("all_customers_comments")
            .update({ [COLUMN_NAME]: comments })
            .eq("id", 1);

        if (error) throw error;

        // Update UI
        closeModal();
        loadComments();

        showToast(
            editingCommentId !== null ? 'تم تحديث التعليق بنجاح' : 'تمت إضافة التعليق بنجاح',
            'success'
        );

    } catch (error) {
        console.error('Error saving comment:', error);
        showToast('حدث خطأ أثناء حفظ التعليق', 'error');
    }
}

// Show toast notification
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    document.body.appendChild(toast);

    // Trigger reflow
    void toast.offsetWidth;

    toast.classList.add('show');

    // Remove toast after delay
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// Add some basic toast styles
const toastStyles = document.createElement('style');
toastStyles.textContent = `
    .toast {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%) translateY(100px);
        background: #333;
        color: white;
        padding: 12px 24px;
        border-radius: 4px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 9999;
        opacity: 0;
        transition: all 0.3s ease;
    }
    
    .toast.show {
        transform: translateX(-50%) translateY(0);
        opacity: 1;
    }
    
    .toast-success {
        background: #4caf50;
    }
    
    .toast-error {
        background: #f44336;
    }
`;
document.head.appendChild(toastStyles);
