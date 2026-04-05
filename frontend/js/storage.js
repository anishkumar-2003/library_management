// Storage utility for managing localStorage
class Storage {
    constructor() {
        this.initializeDefaults();
    }

    initializeDefaults() {
        // Always ensure demo users exist
        const demoUsers = [
            {
                id: 1,
                fullName: 'Admin User',
                email: 'admin@library.com',
                username: 'admin',
                password: 'admin123',
                role: 'Admin'
            },
            {
                id: 2,
                fullName: 'John User',
                email: 'user@library.com',
                username: 'user1',
                password: 'user123',
                role: 'User'
            }
        ];
        
        // Get existing users or initialize with demo users
        let users = JSON.parse(localStorage.getItem('users') || '[]');
        if (users.length === 0) {
            users = demoUsers;
        } else {
            // Ensure demo users exist in the list
            const adminExists = users.some(u => u.username === 'admin');
            const user1Exists = users.some(u => u.username === 'user1');
            
            if (!adminExists) {
                users.push(demoUsers[0]);
            }
            if (!user1Exists) {
                users.push(demoUsers[1]);
            }
        }
        localStorage.setItem('users', JSON.stringify(users));

        if (!localStorage.getItem('memberships')) {
            localStorage.setItem('memberships', JSON.stringify([]));
        }

        if (!localStorage.getItem('books')) {
            localStorage.setItem('books', JSON.stringify([]));
        }

        if (!localStorage.getItem('issues')) {
            localStorage.setItem('issues', JSON.stringify([]));
        }

        if (!localStorage.getItem('returns')) {
            localStorage.setItem('returns', JSON.stringify([]));
        }

        if (!localStorage.getItem('membershipCounter')) {
            localStorage.setItem('membershipCounter', '1000');
        }

        if (!localStorage.getItem('issueCounter')) {
            localStorage.setItem('issueCounter', '1');
        }

        if (!localStorage.getItem('returnCounter')) {
            localStorage.setItem('returnCounter', '1');
        }
    }

    // User methods
    getUsers() {
        return JSON.parse(localStorage.getItem('users') || '[]');
    }

    getUserByUsername(username) {
        const users = this.getUsers();
        return users.find(u => u.username === username);
    }

    addUser(user) {
        const users = this.getUsers();
        user.id = Math.max(...users.map(u => u.id), 0) + 1;
        users.push(user);
        localStorage.setItem('users', JSON.stringify(users));
        return user;
    }

    updateUser(username, updatedData) {
        const users = this.getUsers();
        const index = users.findIndex(u => u.username === username);
        if (index !== -1) {
            users[index] = { ...users[index], ...updatedData };
            localStorage.setItem('users', JSON.stringify(users));
            return users[index];
        }
        return null;
    }

    // Membership methods
    getMemberships() {
        return JSON.parse(localStorage.getItem('memberships') || '[]');
    }

    addMembership(membership) {
        const memberships = this.getMemberships();
        const counter = parseInt(localStorage.getItem('membershipCounter'));
        membership.membershipNumber = `MEM${counter}`;
        membership.joinDate = new Date().toISOString().split('T')[0];
        memberships.push(membership);
        localStorage.setItem('memberships', JSON.stringify(memberships));
        localStorage.setItem('membershipCounter', (counter + 1).toString());
        return membership;
    }

    getMembershipByNumber(membershipNumber) {
        const memberships = this.getMemberships();
        return memberships.find(m => m.membershipNumber === membershipNumber);
    }

    updateMembership(membershipNumber, updatedData) {
        const memberships = this.getMemberships();
        const index = memberships.findIndex(m => m.membershipNumber === membershipNumber);
        if (index !== -1) {
            memberships[index] = { ...memberships[index], ...updatedData };
            localStorage.setItem('memberships', JSON.stringify(memberships));
            return memberships[index];
        }
        return null;
    }

    getMembershipByName(name) {
        const memberships = this.getMemberships();
        return memberships.find(m => m.memberName.toLowerCase().includes(name.toLowerCase()));
    }

    // Book methods
    getBooks() {
        return JSON.parse(localStorage.getItem('books') || '[]');
    }

    addBook(book) {
        const books = this.getBooks();
        book.id = Math.max(...books.map(b => b.id || 0), 0) + 1;
        book.id = book.id || Math.random().toString(36).substr(2, 9);
        books.push(book);
        localStorage.setItem('books', JSON.stringify(books));
        return book;
    }

    getBookByIsbn(isbn) {
        const books = this.getBooks();
        return books.find(b => b.isbn === isbn);
    }

    updateBook(isbn, updatedData) {
        const books = this.getBooks();
        const index = books.findIndex(b => b.isbn === isbn);
        if (index !== -1) {
            books[index] = { ...books[index], ...updatedData };
            localStorage.setItem('books', JSON.stringify(books));
            return books[index];
        }
        return null;
    }

    searchBooks(query) {
        const books = this.getBooks();
        return books.filter(b =>
            b.title?.toLowerCase().includes(query.title?.toLowerCase() || '') &&
            b.author?.toLowerCase().includes(query.author?.toLowerCase() || '') &&
            (query.type === '' || b.type === query.type) &&
            b.isbn?.toLowerCase().includes(query.isbn?.toLowerCase() || '')
        );
    }

    // Issue methods
    getIssues() {
        return JSON.parse(localStorage.getItem('issues') || '[]');
    }

    addIssue(issue) {
        const issues = this.getIssues();
        const counter = parseInt(localStorage.getItem('issueCounter'));
        issue.issueId = `ISS${counter}`;
        issue.status = 'Pending';
        issues.push(issue);
        localStorage.setItem('issues', JSON.stringify(issues));
        localStorage.setItem('issueCounter', (counter + 1).toString());
        return issue;
    }

    getIssueById(issueId) {
        const issues = this.getIssues();
        return issues.find(i => i.issueId === issueId);
    }

    getPendingIssues() {
        const issues = this.getIssues();
        return issues.filter(i => i.status === 'Pending');
    }

    // Return methods
    getReturns() {
        return JSON.parse(localStorage.getItem('returns') || '[]');
    }

    addReturn(returnData) {
        const returns = this.getReturns();
        const counter = parseInt(localStorage.getItem('returnCounter'));
        returnData.returnId = `RET${counter}`;
        returns.push(returnData);
        localStorage.setItem('returns', JSON.stringify(returns));
        localStorage.setItem('returnCounter', (counter + 1).toString());

        // Update issue status
        const issues = this.getIssues();
        const issueIndex = issues.findIndex(i => i.issueId === returnData.issueId);
        if (issueIndex !== -1) {
            issues[issueIndex].status = 'Returned';
            localStorage.setItem('issues', JSON.stringify(issues));
        }

        return returnData;
    }
}

// Create global storage instance
const storage = new Storage();
