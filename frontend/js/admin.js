const API_BASE_URL = 'http://localhost:3000/api';

// Check authentication on page load
document.addEventListener('DOMContentLoaded', function() {
    if (!checkAuth()) return;
    
    const username = localStorage.getItem('username');
    document.getElementById('username').textContent = `Welcome, ${username}`;
    
    // Initialize form handlers
    setupFormHandlers();
});

function setupFormHandlers() {
    // Add Book Form
    const addBookForm = document.getElementById('addBookForm');
    if (addBookForm) {
        addBookForm.addEventListener('submit', handleAddBook);
    }

    // Update Book Form
    const updateBookForm = document.getElementById('updateBookForm');
    if (updateBookForm) {
        updateBookForm.addEventListener('submit', handleUpdateBook);
    }

    // Add Membership Form
    const addMembershipForm = document.getElementById('addMembershipForm');
    if (addMembershipForm) {
        addMembershipForm.addEventListener('submit', handleAddMembership);
    }

    // Update Membership Form
    const updateMembershipForm = document.getElementById('updateMembershipForm');
    if (updateMembershipForm) {
        updateMembershipForm.addEventListener('submit', handleUpdateMembership);
    }

    // Listen to radio button changes for extend/cancel
    document.querySelectorAll('input[name="action"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const extensionOptions = document.getElementById('extensionOptions');
            if (this.value === 'extend') {
                extensionOptions.style.display = 'block';
            } else {
                extensionOptions.style.display = 'none';
            }
        });
    });
}

function navigateTo(page) {
    console.log('=== navigateTo called with:', page);
    
    // Hide all pages - using BOTH class and inline style for guaranteed visibility control
    const pages = document.querySelectorAll('.page');
    console.log('Found', pages.length, 'pages');
    
    pages.forEach(p => {
        p.classList.remove('show');
        p.style.display = 'none';
    });

    // Show selected page
    const selectedPage = document.getElementById(page);
    console.log('Looking for page with id:', page);
    
    if (selectedPage) {
        console.log('Page found! Showing it...');
        selectedPage.classList.add('show');
        selectedPage.style.display = 'block';
        console.log('Page displayed:', page);
    } else {
        console.error('ERROR: Page not found with id:', page);
        return;
    }

    // Update active menu link
    const menuLinks = document.querySelectorAll('.menu-link');
    menuLinks.forEach(link => {
        link.classList.remove('active');
        link.style.fontWeight = 'normal';
        
        // Check if this link's onclick matches the page we're navigating to
        const onclickAttr = link.getAttribute('onclick');
        if (onclickAttr && onclickAttr.includes(`'${page}'`)) {
            link.classList.add('active');
            link.style.fontWeight = 'bold';
            console.log('Active link set:', link.textContent);
        }
    });
}

// ============= BOOK MANAGEMENT =============

async function handleAddBook(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    const messageDiv = document.getElementById('bookMessage');
    messageDiv.innerHTML = '';

    try {
        const response = await fetch(`${API_BASE_URL}/books`, {
            method: 'POST',
            headers: getAuthHeader(),
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            messageDiv.innerHTML = `<div class="alert alert-success">${result.message}</div>`;
            form.reset();
            setTimeout(() => {
                navigateTo('dashboard');
            }, 2000);
        } else {
            messageDiv.innerHTML = `<div class="alert alert-danger">${result.message}</div>`;
        }
    } catch (error) {
        messageDiv.innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
    }
}

async function searchBooks() {
    const searchTerm = document.getElementById('searchBookId').value;
    
    if (!searchTerm.trim()) {
        alert('Please enter a serial number or title');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/books/search/query?title=${searchTerm}&author=${searchTerm}`, {
            headers: getAuthHeader()
        });

        const result = await response.json();

        if (result.success && result.books.length > 0) {
            displayBookSearchResults(result.books);
        } else {
            alert('No books found');
        }
    } catch (error) {
        alert('Error searching books: ' + error.message);
    }
}

function displayBookSearchResults(books) {
    const tbody = document.getElementById('bookResultsBody');
    tbody.innerHTML = '';

    books.forEach(book => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${book.title}</td>
            <td>${book.author}</td>
            <td>${book.serialNumber}</td>
            <td>${book.availableCopies}</td>
            <td>
                <button class="btn btn-primary btn-sm" onclick="editBook('${book._id}')">Edit</button>
            </td>
        `;
        tbody.appendChild(row);
    });

    document.getElementById('bookSearchResults').classList.remove('hidden');
}

async function editBook(bookId) {
    try {
        const response = await fetch(`${API_BASE_URL}/books/${bookId}`, {
            headers: getAuthHeader()
        });

        const result = await response.json();

        if (result.success) {
            const book = result.book;
            const form = document.getElementById('updateBookForm');

            // Store book ID in form for update
            form.dataset.bookId = bookId;

            // Populate form fields
            document.getElementById('updateBookTitle').value = book.title;
            document.getElementById('updateBookAuthor').value = book.author;
            document.getElementById('updateBookISBN').value = book.isbn || '';
            document.getElementById('updateBookCategory').value = book.category;
            document.getElementById('updateBookPublication').value = book.publication || '';
            document.getElementById('updateBookCopies').value = book.totalCopies;
            document.querySelector(`input[name="type"][value="${book.type}"]`).checked = true;

            form.classList.remove('hidden');
            document.getElementById('bookSearchResults').classList.add('hidden');
        }
    } catch (error) {
        alert('Error loading book: ' + error.message);
    }
}

async function handleUpdateBook(e) {
    e.preventDefault();
    
    const form = e.target;
    const bookId = form.dataset.bookId;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    const messageDiv = document.getElementById('updateBookMessage');
    messageDiv.innerHTML = '';

    try {
        const response = await fetch(`${API_BASE_URL}/books/${bookId}`, {
            method: 'PUT',
            headers: getAuthHeader(),
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            messageDiv.innerHTML = `<div class="alert alert-success">${result.message}</div>`;
            setTimeout(() => {
                cancelUpdateBook();
            }, 2000);
        } else {
            messageDiv.innerHTML = `<div class="alert alert-danger">${result.message}</div>`;
        }
    } catch (error) {
        messageDiv.innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
    }
}

function cancelUpdateBook() {
    document.getElementById('updateBookForm').classList.add('hidden');
    document.getElementById('bookSearchResults').classList.add('hidden');
    document.getElementById('searchBookId').value = '';
}

// ============= MEMBERSHIP MANAGEMENT =============

async function handleAddMembership(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    const messageDiv = document.getElementById('membershipMessage');
    messageDiv.innerHTML = '';

    try {
        const response = await fetch(`${API_BASE_URL}/memberships`, {
            method: 'POST',
            headers: getAuthHeader(),
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            messageDiv.innerHTML = `<div class="alert alert-success">${result.message}<br>Membership Number: ${result.membership.membershipNumber}</div>`;
            form.reset();
            setTimeout(() => {
                navigateTo('dashboard');
            }, 2000);
        } else {
            messageDiv.innerHTML = `<div class="alert alert-danger">${result.message}</div>`;
        }
    } catch (error) {
        messageDiv.innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
    }
}

async function searchMembership() {
    const membershipNumber = document.getElementById('membershipNumberInput').value;
    
    if (!membershipNumber.trim()) {
        alert('Please enter a membership number');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/memberships/number/${membershipNumber}`, {
            headers: getAuthHeader()
        });

        const result = await response.json();

        if (result.success) {
            const membership = result.membership;
            const form = document.getElementById('updateMembershipForm');

            form.dataset.membershipNumber = membershipNumber;
            document.getElementById('updateMemberName').value = membership.memberName;
            document.getElementById('updateMemberEndDate').value = new Date(membership.endDate).toLocaleDateString();

            form.classList.remove('hidden');
        } else {
            alert(result.message || 'Membership not found');
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

async function handleUpdateMembership(e) {
    e.preventDefault();
    
    const form = e.target;
    const membershipNumber = form.dataset.membershipNumber;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    const messageDiv = document.getElementById('updateMembershipMessage');
    messageDiv.innerHTML = '';

    try {
        const response = await fetch(`${API_BASE_URL}/memberships/${membershipNumber}`, {
            method: 'PUT',
            headers: getAuthHeader(),
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            messageDiv.innerHTML = `<div class="alert alert-success">${result.message}</div>`;
            setTimeout(() => {
                cancelUpdateMembership();
            }, 2000);
        } else {
            messageDiv.innerHTML = `<div class="alert alert-danger">${result.message}</div>`;
        }
    } catch (error) {
        messageDiv.innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
    }
}

function cancelUpdateMembership() {
    document.getElementById('updateMembershipForm').classList.add('hidden');
    document.getElementById('membershipNumberInput').value = '';
}

// Show/Hide extension options based on action
document.addEventListener('DOMContentLoaded', function() {
    const extensionOptions = document.getElementById('extensionOptions');
    if (extensionOptions) {
        extensionOptions.style.display = 'block';
    }
});
