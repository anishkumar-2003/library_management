// Common utility functions
function checkAuthAndRole() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || 'null');
    if (!currentUser) {
        window.location.href = 'login.html';
        return null;
    }
    return currentUser;
}

function logout() {
    sessionStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

function showError(elementId, message) {
    const errorEl = document.getElementById(elementId);
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.classList.add('show');
        setTimeout(() => {
            errorEl.classList.remove('show');
        }, 5000);
    }
}

function clearError(elementId) {
    const errorEl = document.getElementById(elementId);
    if (errorEl) {
        errorEl.classList.remove('show');
    }
}

function showSuccess(message) {
    // Simple alert for demo purposes
    alert(message);
}

// Tab switching functionality
document.addEventListener('DOMContentLoaded', () => {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');

            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Add active class to clicked button and corresponding content
            button.classList.add('active');
            const activeContent = document.getElementById(tabId);
            if (activeContent) {
                activeContent.classList.add('active');
            }
        });
    });

    // Set up navbar links
    const maintenanceLink = document.getElementById('maintenanceLink');
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || 'null');
    
    if (maintenanceLink && currentUser && currentUser.role !== 'Admin') {
        maintenanceLink.style.display = 'none';
    }

    // Display current user info
    const userNameDisplay = document.getElementById('userNameDisplay');
    const userRoleDisplay = document.getElementById('userRoleDisplay');
    
    if (userNameDisplay && currentUser) {
        userNameDisplay.textContent = currentUser.fullName || currentUser.username;
    }
    
    if (userRoleDisplay && currentUser) {
        userRoleDisplay.textContent = currentUser.role;
    }

    // Chart Link dummy functionality
    const chartLinks = document.querySelectorAll('.chart-link');
    chartLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            alert('Chart Link - Navigation reference for charts and reports');
        });
    });

    // Modal functionality
    const modal = document.getElementById('finePayModal');
    const closeModalBtn = document.querySelector('.close-modal');
    const closeFinePayBtn = document.getElementById('closeFinePayBtn');

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    if (closeFinePayBtn) {
        closeFinePayBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    if (modal) {
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
});

// Date utility functions
function addMonths(date, months) {
    const newDate = new Date(date);
    newDate.setMonth(newDate.getMonth() + months);
    return newDate;
}

function getFormattedDate(date) {
    if (typeof date === 'string') {
        return date;
    }
    return date.toISOString().split('T')[0];
}

function calculateDays(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
}

function calculateFine(days, finePerDay = 10) {
    if (days <= 0) return 0;
    return days * finePerDay;
}

// Validation functions
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validateUsername(username) {
    return username.length >= 3;
}

function validatePassword(password) {
    return password.length >= 6;
}

function validatePhoneNumber(phone) {
    return /^\d{10}$/.test(phone.replace(/\D/g, ''));
}

// Check if at least one search field is filled
function validateSearchFields(fields) {
    return fields.some(field => field && field.trim() !== '');
}
