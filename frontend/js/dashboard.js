// Dashboard functionality
// Check authentication and get current user
const currentUser = checkAuthAndRole();
if (currentUser) {
    // Disable maintenance link if user is not admin
    const maintenanceLink = document.getElementById('maintenanceLink');
    const maintenanceCard = document.getElementById('maintenanceCard');
    
    if (currentUser.role !== 'Admin') {
        if (maintenanceLink) maintenanceLink.style.display = 'none';
        if (maintenanceCard) maintenanceCard.style.display = 'none';
    }

    // Update dashboard statistics
    updateDashboardStats();
}

function updateDashboardStats() {
    const books = storage.getBooks();
    const memberships = storage.getMemberships();
    const issues = storage.getIssues();
    const returns = storage.getReturns();
    const pendingIssues = issues.filter(i => i.status === 'Pending').length;

    document.getElementById('totalBooksCount').textContent = books.length;
    document.getElementById('totalMembershipsCount').textContent = memberships.length;
    document.getElementById('booksIssuedCount').textContent = issues.length;
    document.getElementById('pendingReturnsCount').textContent = pendingIssues;
}
