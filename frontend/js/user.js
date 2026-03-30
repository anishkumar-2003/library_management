const API_BASE_URL = 'http://localhost:3000/api';

// Check authentication on page load
document.addEventListener('DOMContentLoaded', function() {
    if (!checkAuth()) return;
    
    const username = localStorage.getItem('username');
    document.getElementById('username').textContent = `Welcome, ${username}`;
    
    // Initialize form handlers
    setupFormHandlers();
    
    // Set today's date for issue date
    const today = new Date().toISOString().split('T')[0];
    const issueDate = document.getElementById('issueDateField');
    if (issueDate) {
        issueDate.value = today;
    }
});

function setupFormHandlers() {
    // Book Issue Form
    const issueForm = document.getElementById('bookIssueForm');
    if (issueForm) {
        issueForm.addEventListener('submit', handleBookIssue);
        
        // Add event listener for membership lookup
        document.getElementById('membershipNum').addEventListener('blur', function() {
            lookupMembership(this.value);
        });
        
        // Add event listener for book title click to open modal
        document.getElementById('bookIdIssue').addEventListener('click', function() {
            openBookSelectModal();
        });
    }

    // Return Book Form
    const returnForm = document.getElementById('returnBookForm');
    if (returnForm) {
        returnForm.addEventListener('submit', handleReturnBook);
    }

    // Pay Fine Form
    const payFineForm = document.getElementById('payFineForm');
    if (payFineForm) {
        payFineForm.addEventListener('submit', handlePayFine);
    }

    // Return date field
    const returnDateField = document.getElementById('returnDateField');
    if (returnDateField) {
        returnDateField.addEventListener('change', function() {
            validateReturnDate(this.value);
        });
    }
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

// ============= BOOK AVAILABLE PAGE =============

async function searchAvailableBooks() {
    const title = document.getElementById('searchTitle').value;
    const author = document.getElementById('searchAuthor').value;

    if (!title && !author) {
        alert('Please enter at least one search criteria');
        return;
    }

    try {
        const query = `?title=${title}&author=${author}`;
        const response = await fetch(`${API_BASE_URL}/books/search/query${query}`, {
            headers: getAuthHeader()
        });

        const result = await response.json();

        if (result.success && result.books.length > 0) {
            displayAvailableBooks(result.books);
        } else {
            document.getElementById('availableBooksTable').classList.add('hidden');
            document.getElementById('searchMessage').innerHTML = `<div class="alert alert-warning">No books found</div>`;
        }
    } catch (error) {
        document.getElementById('searchMessage').innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
    }
}

function displayAvailableBooks(books) {
    const tbody = document.getElementById('availableBooksBody');
    tbody.innerHTML = '';

    books.forEach(book => {
        const row = document.createElement('tr');
        const isAvailable = book.availableCopies > 0;
        
        row.innerHTML = `
            <td>${book.title}</td>
            <td>${book.author}</td>
            <td>${book.category}</td>
            <td>${book.availableCopies}/${book.totalCopies}</td>
            <td>
                <input type="radio" name="selectedBook" value="${book._id}" 
                       data-title="${book.title}" data-author="${book.author}" 
                       ${!isAvailable ? 'disabled' : ''}>
            </td>
        `;
        tbody.appendChild(row);
    });

    document.getElementById('availableBooksTable').classList.remove('hidden');
}

// ============= BOOK ISSUE PAGE =============

function openBookSelectModal() {
    const modal = document.getElementById('bookSelectModal');
    modal.classList.add('show');
    loadAllBooks();
}

function closeBookSelectModal() {
    document.getElementById('bookSelectModal').classList.remove('show');
}

async function loadAllBooks() {
    try {
        const response = await fetch(`${API_BASE_URL}/books/available/list`, {
            headers: getAuthHeader()
        });

        const result = await response.json();

        if (result.success) {
            displayBooksForSelection(result.books);
        }
    } catch (error) {
        alert('Error loading books: ' + error.message);
    }
}

function displayBooksForSelection(books) {
    const tbody = document.getElementById('bookSelectBody');
    tbody.innerHTML = '';

    books.forEach(book => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${book.title}</td>
            <td>${book.author}</td>
            <td>${book.availableCopies}</td>
            <td>
                <button class="btn btn-primary btn-sm" onclick="selectBookForIssue('${book._id}', '${book.title}', '${book.author}')">
                    Select
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function selectBookForIssue(bookId, title, author) {
    document.getElementById('bookIdIssue').value = title;
    document.getElementById('bookIdIssue').dataset.bookId = bookId;
    document.getElementById('bookAuthorIssue').value = author;
    
    // Calculate return date (15 days from today)
    const today = new Date();
    const returnDate = new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000);
    document.getElementById('returnDateField').value = returnDate.toISOString().split('T')[0];
    
    closeBookSelectModal();
}

async function lookupMembership(membershipNumber) {
    if (!membershipNumber) return;

    try {
        const response = await fetch(`${API_BASE_URL}/memberships/number/${membershipNumber}`, {
            headers: getAuthHeader()
        });

        const result = await response.json();

        if (result.success) {
            document.getElementById('memberNameIssue').value = result.membership.memberName;
        } else {
            document.getElementById('memberNameIssue').value = '';
            alert(result.message || 'Membership not found');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function validateReturnDate(returnDate) {
    const issueDate = new Date(document.getElementById('issueDateField').value);
    const selectedReturnDate = new Date(returnDate);
    const maxReturnDate = new Date(issueDate.getTime() + 15 * 24 * 60 * 60 * 1000);

    if (selectedReturnDate > maxReturnDate) {
        alert('Return date cannot be more than 15 days from issue date');
        document.getElementById('returnDateField').value = maxReturnDate.toISOString().split('T')[0];
    } else if (selectedReturnDate < issueDate) {
        alert('Return date cannot be before issue date');
        document.getElementById('returnDateField').value = issueDate.toISOString().split('T')[0];
    }
}

async function handleBookIssue(e) {
    e.preventDefault();

    const membershipNumber = document.getElementById('membershipNum').value;
    const bookId = document.getElementById('bookIdIssue').dataset.bookId;
    const returnDate = document.getElementById('returnDateField').value;
    const remarks = document.getElementById('remarksIssue').value;

    if (!membershipNumber || !bookId || !returnDate) {
        alert('Please fill all required fields');
        return;
    }

    const messageDiv = document.getElementById('issueMessage');
    messageDiv.innerHTML = '';

    try {
        const response = await fetch(`${API_BASE_URL}/issues/issue`, {
            method: 'POST',
            headers: getAuthHeader(),
            body: JSON.stringify({
                membershipNumber,
                bookId,
                returnDate,
                remarks
            })
        });

        const result = await response.json();

        if (result.success) {
            messageDiv.innerHTML = `<div class="alert alert-success">${result.message}</div>`;
            resetIssueForm();
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

function resetIssueForm() {
    document.getElementById('bookIssueForm').reset();
    document.getElementById('issueDateField').value = new Date().toISOString().split('T')[0];
}

// ============= RETURN BOOK PAGE =============

async function fetchIssueRecords() {
    const membershipNumber = document.getElementById('membershipReturn').value;

    if (!membershipNumber) {
        alert('Please enter membership number');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/issues/member/${membershipNumber}`, {
            headers: getAuthHeader()
        });

        const result = await response.json();

        if (result.success && result.issues.length > 0) {
            displayIssueRecords(result.issues);
        } else {
            alert('No active issues found');
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

function displayIssueRecords(issues) {
    const activeIssues = issues.filter(issue => issue.status === 'issued');
    const tbody = document.getElementById('issueRecordsBody');
    tbody.innerHTML = '';

    if (activeIssues.length === 0) {
        alert('No active issues to return');
        return;
    }

    activeIssues.forEach(issue => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${issue.bookTitle}</td>
            <td>${new Date(issue.issueDate).toLocaleDateString()}</td>
            <td>${new Date(issue.returnDate).toLocaleDateString()}</td>
            <td>${issue.bookAuthor}</td>
            <td>
                <button class="btn btn-primary btn-sm" onclick="selectIssueToReturn('${issue._id}', '${issue.bookTitle}', '${issue.bookAuthor}', '${issue.serialNumber}', '${issue.issueDate}')">
                    Select
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });

    document.getElementById('issueRecordsTable').classList.remove('hidden');
}

function selectIssueToReturn(issueId, title, author, serialNo, issueDate) {
    document.getElementById('returnBookForm').dataset.issueId = issueId;
    document.getElementById('returnBookTitle').value = title;
    document.getElementById('returnAuthor').value = author;
    document.getElementById('returnSerialNo').value = serialNo;
    document.getElementById('returnIssueDateReturn').value = issueDate.split('T')[0];
    document.getElementById('returnDateActual').value = new Date().toISOString().split('T')[0];

    document.getElementById('returnBookForm').classList.remove('hidden');
    document.getElementById('issueRecordsTable').classList.add('hidden');
}

async function handleReturnBook(e) {
    e.preventDefault();

    const issueRecordId = e.target.dataset.issueId;
    const returnDate = document.getElementById('returnDateActual').value;

    const messageDiv = document.getElementById('returnMessage');
    messageDiv.innerHTML = '';

    try {
        const response = await fetch(`${API_BASE_URL}/issues/return`, {
            method: 'POST',
            headers: getAuthHeader(),
            body: JSON.stringify({
                issueRecordId,
                returnDate
            })
        });

        const result = await response.json();

        if (result.success) {
            if (result.fineAmount > 0) {
                messageDiv.innerHTML = `<div class="alert alert-warning">Book returned. Fine amount: Rs. ${result.fineAmount}</div>`;
            } else {
                messageDiv.innerHTML = `<div class="alert alert-success">${result.message}</div>`;
            }

            setTimeout(() => {
                if (result.fineAmount > 0) {
                    navigateTo('pay-fine');
                } else {
                    cancelReturnBook();
                }
            }, 2000);
        } else {
            messageDiv.innerHTML = `<div class="alert alert-danger">${result.message}</div>`;
        }
    } catch (error) {
        messageDiv.innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
    }
}

function cancelReturnBook() {
    document.getElementById('returnBookForm').classList.add('hidden');
    document.getElementById('issueRecordsTable').classList.add('hidden');
    document.getElementById('membershipReturn').value = '';
}

// ============= PAY FINE PAGE =============

async function fetchPendingFines() {
    const membershipNumber = document.getElementById('membershipFine').value;

    if (!membershipNumber) {
        alert('Please enter membership number');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/issues/member/${membershipNumber}`, {
            headers: getAuthHeader()
        });

        const result = await response.json();

        if (result.success) {
            const pendingFines = result.issues.filter(issue => issue.fineAmount > 0 && !issue.finePaid);
            displayPendingFines(pendingFines);
        } else {
            alert('No fines found');
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

function displayPendingFines(fines) {
    const tbody = document.getElementById('pendingFinesBody');
    tbody.innerHTML = '';

    if (fines.length === 0) {
        alert('No pending fines');
        return;
    }

    fines.forEach(fine => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${fine.bookTitle}</td>
            <td>${new Date(fine.returnDate).toLocaleDateString()}</td>
            <td>Rs. ${fine.fineAmount}</td>
            <td>
                <button class="btn btn-primary btn-sm" onclick="selectFineToPay('${fine._id}', '${fine.bookTitle}', '${fine.bookAuthor}', ${fine.fineAmount})">
                    Select
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });

    document.getElementById('pendingFinesTable').classList.remove('hidden');
}

function selectFineToPayfunction(issueId, title, author, fineAmount) {
    document.getElementById('payFineForm').dataset.issueId = issueId;
    document.getElementById('fineBookTitle').value = title;
    document.getElementById('fineAuthorName').value = author;
    document.getElementById('fineAmount').value = fineAmount;

    document.getElementById('payFineForm').classList.remove('hidden');
    document.getElementById('pendingFinesTable').classList.add('hidden');
}

async function handlePayFine(e) {
    e.preventDefault();

    const issueRecordId = e.target.dataset.issueId;
    const fineAmount = parseFloat(document.getElementById('fineAmount').value);
    const finePaid = document.getElementById('finePaidCheckbox').checked;

    if (!finePaid) {
        alert('Please confirm that fine is paid');
        return;
    }

    const messageDiv = document.getElementById('fineMessage');
    messageDiv.innerHTML = '';

    try {
        const response = await fetch(`${API_BASE_URL}/issues/pay-fine`, {
            method: 'POST',
            headers: getAuthHeader(),
            body: JSON.stringify({
                issueRecordId,
                fineAmount
            })
        });

        const result = await response.json();

        if (result.success) {
            messageDiv.innerHTML = `<div class="alert alert-success">${result.message}</div>`;
            setTimeout(() => {
                cancelPayFine();
            }, 2000);
        } else {
            messageDiv.innerHTML = `<div class="alert alert-danger">${result.message}</div>`;
        }
    } catch (error) {
        messageDiv.innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
    }
}

function cancelPayFine() {
    document.getElementById('payFineForm').classList.add('hidden');
    document.getElementById('pendingFinesTable').classList.add('hidden');
    document.getElementById('membershipFine').value = '';
}

// ============= REPORTS =============

async function fetchMyIssues() {
    const membershipNumber = document.getElementById('membershipMyIssues').value;

    if (!membershipNumber) {
        alert('Please enter membership number');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/issues/member/${membershipNumber}`, {
            headers: getAuthHeader()
        });

        const result = await response.json();

        if (result.success) {
            const activeIssues = result.issues.filter(issue => issue.status === 'issued');
            displayMyIssues(activeIssues);
        } else {
            document.getElementById('myIssuesMessage').innerHTML = `<div class="alert alert-warning">No active issues found</div>`;
        }
    } catch (error) {
        document.getElementById('myIssuesMessage').innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
    }
}

function displayMyIssues(issues) {
    const tbody = document.getElementById('myIssuesBody');
    tbody.innerHTML = '';

    issues.forEach(issue => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${issue.bookTitle}</td>
            <td>${issue.bookAuthor}</td>
            <td>${new Date(issue.issueDate).toLocaleDateString()}</td>
            <td>${new Date(issue.returnDate).toLocaleDateString()}</td>
            <td><span class="alert alert-info">${issue.status}</span></td>
        `;
        tbody.appendChild(row);
    });

    document.getElementById('myIssuesTable').classList.remove('hidden');
}

async function fetchOverdueBooks() {
    const membershipNumber = document.getElementById('membershipOverdue').value;

    if (!membershipNumber) {
        alert('Please enter membership number');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/issues/member/${membershipNumber}`, {
            headers: getAuthHeader()
        });

        const result = await response.json();

        if (result.success) {
            const today = new Date();
            const overdueIssues = result.issues.filter(issue => 
                issue.status === 'issued' && new Date(issue.returnDate) < today
            );
            displayOverdueBooks(overdueIssues);
        } else {
            document.getElementById('overdueMessage').innerHTML = `<div class="alert alert-warning">No overdue books found</div>`;
        }
    } catch (error) {
        document.getElementById('overdueMessage').innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
    }
}

function displayOverdueBooks(issues) {
    const tbody = document.getElementById('overdueBody');
    tbody.innerHTML = '';

    issues.forEach(issue => {
        const returnDate = new Date(issue.returnDate);
        const today = new Date();
        const daysOverdue = Math.floor((today - returnDate) / (1000 * 60 * 60 * 24));
        const fineAmount = daysOverdue * 5;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${issue.bookTitle}</td>
            <td>${issue.bookAuthor}</td>
            <td>${returnDate.toLocaleDateString()}</td>
            <td>${daysOverdue}</td>
            <td>Rs. ${fineAmount}</td>
        `;
        tbody.appendChild(row);
    });

    document.getElementById('overdueTable').classList.remove('hidden');
}

async function fetchMyPendingFines() {
    const membershipNumber = document.getElementById('membershipPendingFines').value;

    if (!membershipNumber) {
        alert('Please enter membership number');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/issues/member/${membershipNumber}`, {
            headers: getAuthHeader()
        });

        const result = await response.json();

        if (result.success) {
            const pendingFines = result.issues.filter(issue => issue.fineAmount > 0 && !issue.finePaid);
            displayMyPendingFines(pendingFines);
        } else {
            document.getElementById('myPendingFinesMessage').innerHTML = `<div class="alert alert-warning">No pending fines</div>`;
        }
    } catch (error) {
        document.getElementById('myPendingFinesMessage').innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
    }
}

function displayMyPendingFines(fines) {
    const tbody = document.getElementById('myPendingFinesBody');
    tbody.innerHTML = '';

    fines.forEach(fine => {
        const returnDate = new Date(fine.returnDate);
        const today = new Date();
        const daysOverdue = Math.floor((today - returnDate) / (1000 * 60 * 60 * 24));

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${fine.bookTitle}</td>
            <td>${returnDate.toLocaleDateString()}</td>
            <td>Rs. ${fine.fineAmount}</td>
            <td>${daysOverdue}</td>
        `;
        tbody.appendChild(row);
    });

    document.getElementById('myPendingFinesTable').classList.remove('hidden');
}
