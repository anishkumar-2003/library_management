// Transactions module functionality
document.addEventListener('DOMContentLoaded', () => {
    const currentUser = checkAuthAndRole();
    if (!currentUser) return;

    // Book Availability Search
    const bookAvailabilityForm = document.getElementById('bookAvailabilityForm');
    if (bookAvailabilityForm) {
        bookAvailabilityForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const title = document.getElementById('searchBookTitle').value.trim();
            const author = document.getElementById('searchBookAuthor').value.trim();
            const type = document.getElementById('searchBookType').value;
            const isbn = document.getElementById('searchBookIsbn').value.trim();
            const errorEl = document.getElementById('bookAvailabilityError');

            clearError('bookAvailabilityError');

            // At least one field required
            if (!validateSearchFields([title, author, type, isbn])) {
                showError('bookAvailabilityError', 'Please enter at least one search criteria');
                return;
            }

            const results = storage.searchBooks({ title, author, type, isbn });

            if (results.length === 0) {
                showError('bookAvailabilityError', 'No books found matching your criteria');
                return;
            }

            // Display results
            displayBookAvailabilityResults(results);
        });
    }

    function displayBookAvailabilityResults(books) {
        const resultsDiv = document.getElementById('bookAvailabilityResults');
        const tbody = document.getElementById('bookAvailabilityTable');

        tbody.innerHTML = '';

        books.forEach(book => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td><input type="radio" name="selectedBook" value="${book.isbn}"></td>
                <td>${book.title}</td>
                <td>${book.author}</td>
                <td>${book.type}</td>
                <td>${book.isbn}</td>
                <td>${book.publisher}</td>
                <td>${book.availableQuantity || book.quantity}</td>
            `;
        });

        resultsDiv.style.display = 'block';
    }

    // Issue Book
    const issueBookForm = document.getElementById('issueBookForm');
    if (issueBookForm) {
        // Populate book titles
        const books = storage.getBooks();
        const bookTitlesList = document.getElementById('bookTitles');
        bookTitlesList.innerHTML = '';
        books.forEach(book => {
            const option = document.createElement('option');
            option.value = book.title;
            bookTitlesList.appendChild(option);
        });

        // Auto-fill author when book is selected
        document.getElementById('issueBookTitle').addEventListener('change', () => {
            const bookTitle = document.getElementById('issueBookTitle').value;
            const book = books.find(b => b.title === bookTitle);
            if (book) {
                document.getElementById('issueAuthor').value = book.author;
            }
        });

        // Auto-fill return date when issue date is set
        document.getElementById('issueDate').addEventListener('change', () => {
            const issueDate = new Date(document.getElementById('issueDate').value);
            const returnDate = new Date(issueDate.getTime() + 15 * 24 * 60 * 60 * 1000);
            document.getElementById('returnDate').value = getFormattedDate(returnDate);
        });

        // Set today as minimum issue date
        document.getElementById('issueDate').min = new Date().toISOString().split('T')[0];

        issueBookForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const bookTitle = document.getElementById('issueBookTitle').value.trim();
            const memberNumber = document.getElementById('issueMemberNumber').value.trim();
            const issueDate = document.getElementById('issueDate').value;
            const returnDate = document.getElementById('returnDate').value;
            const remarks = document.getElementById('issueRemarks').value.trim();
            const errorEl = document.getElementById('issueBookError');

            clearError('issueBookError');

            if (!bookTitle || !memberNumber || !issueDate || !returnDate) {
                showError('issueBookError', 'Book name, Member number, Issue date, and Return date are mandatory');
                return;
            }

            const book = books.find(b => b.title === bookTitle);
            const membership = storage.getMembershipByNumber(memberNumber);

            if (!book) {
                showError('issueBookError', 'Book not found');
                return;
            }

            if (!membership) {
                showError('issueBookError', 'Member not found');
                return;
            }

            const issueDateObj = new Date(issueDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (issueDateObj < today) {
                showError('issueBookError', 'Issue date cannot be in the past');
                return;
            }

            const returnDateObj = new Date(returnDate);
            const maxReturnDate = new Date(issueDateObj.getTime() + 15 * 24 * 60 * 60 * 1000);

            if (returnDateObj > maxReturnDate) {
                showError('issueBookError', 'Return date cannot be more than 15 days from issue date');
                return;
            }

            try {
                const issue = {
                    bookTitle,
                    author: book.author,
                    bookIsbn: book.isbn,
                    memberNumber,
                    memberName: membership.memberName,
                    issueDate,
                    returnDate,
                    remarks,
                    createdAt: new Date().toISOString()
                };

                storage.addIssue(issue);
                alert('Book issued successfully!');
                issueBookForm.reset();
            } catch (error) {
                showError('issueBookError', 'Error issuing book');
            }
        });
    }

    // Return Book
    const returnBookForm = document.getElementById('returnBookForm');
    if (returnBookForm) {
        const finePayModal = document.getElementById('finePayModal');
        let currentReturnData = null;

        returnBookForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const bookTitle = document.getElementById('returnBookTitle').value.trim();
            const serialNumber = document.getElementById('returnSerialNumber').value.trim();
            const returnDate = document.getElementById('returnReturnDate').value;
            const remarks = document.getElementById('returnRemarks').value.trim();
            const errorEl = document.getElementById('returnBookError');

            clearError('returnBookError');

            if (!bookTitle || !serialNumber || !returnDate) {
                showError('returnBookError', 'Book name, Serial number, and Return date are mandatory');
                return;
            }

            // Find the issue record
            const issues = storage.getIssues();
            const issue = issues.find(i => i.bookTitle === bookTitle && i.status === 'Pending');

            if (!issue) {
                showError('returnBookError', 'No pending issue found for this book');
                return;
            }

            // Calculate fine
            const issueDate = new Date(issue.issueDate);
            const expectedReturnDate = new Date(issue.returnDate);
            const actualReturnDate = new Date(returnDate);

            let fine = 0;
            if (actualReturnDate > expectedReturnDate) {
                const daysLate = calculateDays(actualReturnDate, expectedReturnDate);
                fine = Math.abs(daysLate) * 10; // 10 per day fine
            }

            currentReturnData = {
                issueId: issue.issueId,
                bookTitle,
                memberNumber: issue.memberNumber,
                memberName: issue.memberName,
                serialNumber,
                issueDate: issue.issueDate,
                returnDate,
                fine,
                remarks,
                finePaid: fine === 0
            };

            // Show fine payment modal
            document.getElementById('fineMemberName').value = issue.memberName;
            document.getElementById('fineBookTitle').value = bookTitle;
            document.getElementById('fineAmount').value = fine.toFixed(2);
            document.getElementById('finePaidCheckbox').checked = fine === 0;
            document.getElementById('finePayRemarks').value = '';

            finePayModal.style.display = 'flex';
        });

        // Fine payment form
        const finePayForm = document.getElementById('finePayForm');
        if (finePayForm) {
            finePayForm.addEventListener('submit', (e) => {
                e.preventDefault();

                const finePaidCheckbox = document.getElementById('finePaidCheckbox');
                const fineAmount = parseFloat(document.getElementById('fineAmount').value);
                const errorEl = document.getElementById('finePayError');

                clearError('finePayError');

                // If fine exists, checkbox must be checked
                if (fineAmount > 0 && !finePaidCheckbox.checked) {
                    showError('finePayError', 'Fine payment is mandatory to complete return');
                    return;
                }

                try {
                    currentReturnData.finePaid = finePaidCheckbox.checked;
                    currentReturnData.finePayRemarks = document.getElementById('finePayRemarks').value.trim();
                    currentReturnData.returnedAt = new Date().toISOString();

                    storage.addReturn(currentReturnData);
                    alert('Book returned successfully!');

                    finePayModal.style.display = 'none';
                    returnBookForm.reset();
                    currentReturnData = null;
                } catch (error) {
                    showError('finePayError', 'Error completing return');
                }
            });
        }
    }
});
