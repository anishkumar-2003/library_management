// Maintenance module functionality
const currentUser = checkAuthAndRole();
if (!currentUser || currentUser.role !== 'Admin') {
    alert('Access denied. Only admins can access maintenance.');
    window.location.href = 'dashboard.html';
} else {
    // Add Membership
    const addMembershipForm = document.getElementById('addMembershipForm');
    if (addMembershipForm) {
        addMembershipForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const memberName = document.getElementById('memberName').value.trim();
            const memberEmail = document.getElementById('memberEmail').value.trim();
            const memberPhone = document.getElementById('memberPhone').value.trim();
            const memberAddress = document.getElementById('memberAddress').value.trim();
            const membershipDuration = document.querySelector('input[name="membershipDuration"]:checked').value;
            const errorEl = document.getElementById('addMembershipError');

            clearError('addMembershipError');

            // Validation
            if (!memberName || !memberEmail || !memberPhone || !memberAddress) {
                showError('addMembershipError', 'All fields are mandatory');
                return;
            }

            if (!validateEmail(memberEmail)) {
                showError('addMembershipError', 'Invalid email address');
                return;
            }

            if (!validatePhoneNumber(memberPhone)) {
                showError('addMembershipError', 'Phone number must be 10 digits');
                return;
            }

            try {
                const expiryDate = addMonths(new Date(), parseInt(membershipDuration));
                
                const membership = {
                    memberName,
                    memberEmail,
                    memberPhone,
                    memberAddress,
                    membershipDuration: parseInt(membershipDuration),
                    expiryDate: getFormattedDate(expiryDate),
                    status: 'Active'
                };

                storage.addMembership(membership);
                alert('Membership added successfully!');
                addMembershipForm.reset();
            } catch (error) {
                showError('addMembershipError', 'Error adding membership');
            }
        });
    }

    // Update Membership
    const searchMembershipBtn = document.getElementById('searchMembershipBtn');
    if (searchMembershipBtn) {
        searchMembershipBtn.addEventListener('click', () => {
            const membershipNumber = document.getElementById('membershipNumberSearch').value.trim();
            const errorEl = document.getElementById('updateMembershipError');

            clearError('updateMembershipError');

            if (!membershipNumber) {
                showError('updateMembershipError', 'Membership number is required');
                return;
            }

            const membership = storage.getMembershipByNumber(membershipNumber);
            if (!membership) {
                showError('updateMembershipError', 'Membership not found');
                return;
            }

            document.getElementById('updateMemberName').value = membership.memberName;
            document.getElementById('updateMemberEmail').value = membership.memberEmail;
            document.getElementById('updateExpiryDate').value = membership.expiryDate;
            document.getElementById('membershipDetails').style.display = 'block';
        });
    }

    const updateMembershipForm = document.getElementById('updateMembershipForm');
    if (updateMembershipForm) {
        updateMembershipForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const membershipNumber = document.getElementById('membershipNumberSearch').value.trim();
            const action = document.querySelector('input[name="membershipAction"]:checked').value;
            const errorEl = document.getElementById('updateMembershipError');

            clearError('updateMembershipError');

            if (!membershipNumber) {
                showError('updateMembershipError', 'Membership number is required');
                return;
            }

            const membership = storage.getMembershipByNumber(membershipNumber);
            if (!membership) {
                showError('updateMembershipError', 'Membership not found');
                return;
            }

            try {
                if (action === 'extend') {
                    const newExpiryDate = addMonths(new Date(membership.expiryDate), 6);
                    storage.updateMembership(membershipNumber, {
                        expiryDate: getFormattedDate(newExpiryDate),
                        status: 'Active'
                    });
                    alert('Membership extended by 6 months!');
                } else if (action === 'cancel') {
                    storage.updateMembership(membershipNumber, { status: 'Cancelled' });
                    alert('Membership cancelled!');
                }

                document.getElementById('membershipDetails').style.display = 'none';
                updateMembershipForm.reset();
            } catch (error) {
                showError('updateMembershipError', 'Error updating membership');
            }
        });
    }

    // Add Book
    const addBookForm = document.getElementById('addBookForm');
    if (addBookForm) {
        addBookForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const bookType = document.querySelector('input[name="bookType"]:checked').value;
            const bookTitle = document.getElementById('bookTitle').value.trim();
            const bookAuthor = document.getElementById('bookAuthor').value.trim();
            const bookIsbn = document.getElementById('bookIsbn').value.trim();
            const bookPublisher = document.getElementById('bookPublisher').value.trim();
            const bookYear = document.getElementById('bookYear').value;
            const bookQuantity = document.getElementById('bookQuantity').value;
            const errorEl = document.getElementById('addBookError');

            clearError('addBookError');

            if (!bookTitle || !bookAuthor || !bookIsbn || !bookPublisher || !bookYear || !bookQuantity) {
                showError('addBookError', 'All fields are mandatory');
                return;
            }

            if (storage.getBookByIsbn(bookIsbn)) {
                showError('addBookError', 'Book with this ISBN already exists');
                return;
            }

            try {
                const book = {
                    type: bookType,
                    title: bookTitle,
                    author: bookAuthor,
                    isbn: bookIsbn,
                    publisher: bookPublisher,
                    year: parseInt(bookYear),
                    quantity: parseInt(bookQuantity),
                    availableQuantity: parseInt(bookQuantity)
                };

                storage.addBook(book);
                alert('Book added successfully!');
                addBookForm.reset();
            } catch (error) {
                showError('addBookError', 'Error adding book');
            }
        });
    }

    // Update Book
    const searchBookBtn = document.getElementById('searchBookBtn');
    if (searchBookBtn) {
        searchBookBtn.addEventListener('click', () => {
            const isbn = document.getElementById('updateBookIsbn').value.trim();
            const errorEl = document.getElementById('updateBookError');

            clearError('updateBookError');

            if (!isbn) {
                showError('updateBookError', 'ISBN is required');
                return;
            }

            const book = storage.getBookByIsbn(isbn);
            if (!book) {
                showError('updateBookError', 'Book not found');
                return;
            }

            document.querySelector('input[name="updateBookType"][value="' + book.type + '"]').checked = true;
            document.getElementById('updateBookTitle').value = book.title;
            document.getElementById('updateBookAuthor').value = book.author;
            document.getElementById('updateBookPublisher').value = book.publisher;
            document.getElementById('updateBookYear').value = book.year;
            document.getElementById('updateBookQuantity').value = book.quantity;

            document.getElementById('bookDetails').style.display = 'block';
        });
    }

    const updateBookForm = document.getElementById('updateBookForm');
    if (updateBookForm) {
        updateBookForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const isbn = document.getElementById('updateBookIsbn').value.trim();
            const bookType = document.querySelector('input[name="updateBookType"]:checked').value;
            const title = document.getElementById('updateBookTitle').value.trim();
            const author = document.getElementById('updateBookAuthor').value.trim();
            const publisher = document.getElementById('updateBookPublisher').value.trim();
            const year = document.getElementById('updateBookYear').value;
            const quantity = document.getElementById('updateBookQuantity').value;
            const errorEl = document.getElementById('updateBookError');

            clearError('updateBookError');

            if (!title || !author || !publisher || !year || !quantity) {
                showError('updateBookError', 'All fields are mandatory');
                return;
            }

            try {
                storage.updateBook(isbn, {
                    type: bookType,
                    title,
                    author,
                    publisher,
                    year: parseInt(year),
                    quantity: parseInt(quantity)
                });

                alert('Book updated successfully!');
                document.getElementById('bookDetails').style.display = 'none';
                updateBookForm.reset();
            } catch (error) {
                showError('updateBookError', 'Error updating book');
            }
        });
    }

    // User Management
    const userTypeRadios = document.querySelectorAll('input[name="userType"]');
    const newUserFields = document.getElementById('newUserFields');
    const existingUserFields = document.getElementById('existingUserFields');

    userTypeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'newUser') {
                newUserFields.style.display = 'block';
                existingUserFields.style.display = 'none';
            } else {
                newUserFields.style.display = 'none';
                existingUserFields.style.display = 'block';
            }
        });
    });

    const searchUserBtn = document.getElementById('searchUserBtn');
    if (searchUserBtn) {
        searchUserBtn.addEventListener('click', () => {
            const username = document.getElementById('existingUsername').value.trim();
            const errorEl = document.getElementById('userManagementError');

            clearError('userManagementError');

            if (!username) {
                showError('userManagementError', 'Username is required');
                return;
            }

            const user = storage.getUserByUsername(username);
            if (!user) {
                showError('userManagementError', 'User not found');
                return;
            }

            document.getElementById('existingUserDisplay').value = user.fullName;
            document.getElementById('existingUserEmailDisplay').value = user.email;
            document.querySelector('input[name="existingUserRole"][value="' + user.role + '"]').checked = true;
            document.getElementById('userFieldsContainer').style.display = 'block';
        });
    }

    const userManagementForm = document.getElementById('userManagementForm');
    if (userManagementForm) {
        userManagementForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const userType = document.querySelector('input[name="userType"]:checked').value;
            const errorEl = document.getElementById('userManagementError');

            clearError('userManagementError');

            if (userType === 'newUser') {
                const name = document.getElementById('newUserName').value.trim();
                const email = document.getElementById('newUserEmail').value.trim();
                const username = document.getElementById('newUsername').value.trim();
                const password = document.getElementById('newUserPassword').value;
                const role = document.querySelector('input[name="userRole"]:checked').value;

                if (!name || !email || !username || !password) {
                    showError('userManagementError', 'All fields are mandatory');
                    return;
                }

                if (storage.getUserByUsername(username)) {
                    showError('userManagementError', 'Username already exists');
                    return;
                }

                try {
                    storage.addUser({
                        fullName: name,
                        email,
                        username,
                        password,
                        role
                    });

                    alert('New user added successfully!');
                    userManagementForm.reset();
                } catch (error) {
                    showError('userManagementError', 'Error adding user');
                }
            } else {
                const username = document.getElementById('existingUsername').value.trim();
                const role = document.querySelector('input[name="existingUserRole"]:checked').value;

                if (!username) {
                    showError('userManagementError', 'Please search for a user first');
                    return;
                }

                try {
                    storage.updateUser(username, { role });
                    alert('User role updated successfully!');
                    document.getElementById('userFieldsContainer').style.display = 'none';
                    userManagementForm.reset();
                } catch (error) {
                    showError('userManagementError', 'Error updating user');
                }
            }
        });
    }
}
