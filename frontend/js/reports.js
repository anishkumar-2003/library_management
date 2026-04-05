// Reports module functionality
document.addEventListener('DOMContentLoaded', () => {
    const currentUser = checkAuthAndRole();
    if (!currentUser) return;

    // Issued Books Report
    const filterIssuedBtn = document.getElementById('filterIssuedBtn');
    if (filterIssuedBtn) {
        filterIssuedBtn.addEventListener('click', () => {
            displayIssuedBooksReport();
        });

        // Display on load
        displayIssuedBooksReport();
    }

    function displayIssuedBooksReport() {
        const memberName = document.getElementById('issuedMemberName').value.trim().toLowerCase();
        const bookTitle = document.getElementById('issuedBookTitle').value.trim().toLowerCase();
        const issues = storage.getIssues();
        const tbody = document.getElementById('issuedBooksTable');

        let filteredIssues = issues;

        if (memberName) {
            filteredIssues = filteredIssues.filter(i => i.memberName.toLowerCase().includes(memberName));
        }

        if (bookTitle) {
            filteredIssues = filteredIssues.filter(i => i.bookTitle.toLowerCase().includes(bookTitle));
        }

        tbody.innerHTML = '';

        if (filteredIssues.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No records found</td></tr>';
            return;
        }

        filteredIssues.forEach(issue => {
            const statusLabel = issue.status === 'Pending' ? '⏳ Pending' : '✓ Returned';
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${issue.issueId}</td>
                <td>${issue.memberName}</td>
                <td>${issue.bookTitle}</td>
                <td>${issue.author}</td>
                <td>${issue.issueDate}</td>
                <td>${issue.returnDate}</td>
                <td>${statusLabel}</td>
            `;
        });
    }

    // Returned Books Report
    const filterReturnedBtn = document.getElementById('filterReturnedBtn');
    if (filterReturnedBtn) {
        filterReturnedBtn.addEventListener('click', () => {
            displayReturnedBooksReport();
        });

        // Display on load
        displayReturnedBooksReport();
    }

    function displayReturnedBooksReport() {
        const memberName = document.getElementById('returnedMemberName').value.trim().toLowerCase();
        const bookTitle = document.getElementById('returnedBookTitle').value.trim().toLowerCase();
        const returns = storage.getReturns();
        const tbody = document.getElementById('returnedBooksTable');

        let filteredReturns = returns;

        if (memberName) {
            filteredReturns = filteredReturns.filter(r => r.memberName.toLowerCase().includes(memberName));
        }

        if (bookTitle) {
            filteredReturns = filteredReturns.filter(r => r.bookTitle.toLowerCase().includes(bookTitle));
        }

        tbody.innerHTML = '';

        if (filteredReturns.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align: center;">No records found</td></tr>';
            return;
        }

        filteredReturns.forEach(ret => {
            const fineStatus = ret.fine > 0 ? (ret.finePaid ? '✓ Paid' : '⚠ Pending') : 'No Fine';
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${ret.returnId}</td>
                <td>${ret.memberName}</td>
                <td>${ret.bookTitle}</td>
                <td>${ret.bookTitle}</td>
                <td>${ret.issueDate}</td>
                <td>${ret.returnDate}</td>
                <td>₹${ret.fine.toFixed(2)}</td>
                <td>${fineStatus}</td>
            `;
        });
    }

    // Membership Report
    const filterMembershipBtn = document.getElementById('filterMembershipBtn');
    if (filterMembershipBtn) {
        filterMembershipBtn.addEventListener('click', () => {
            displayMembershipReport();
        });

        // Display on load
        displayMembershipReport();
    }

    function displayMembershipReport() {
        const memberName = document.getElementById('reportMemberName').value.trim().toLowerCase();
        const status = document.getElementById('membershipStatus').value;
        const memberships = storage.getMemberships();
        const tbody = document.getElementById('membershipTable');

        let filteredMemberships = memberships;

        if (memberName) {
            filteredMemberships = filteredMemberships.filter(m => m.memberName.toLowerCase().includes(memberName));
        }

        if (status) {
            filteredMemberships = filteredMemberships.filter(m => m.status === status);
        }

        tbody.innerHTML = '';

        if (filteredMemberships.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No records found</td></tr>';
            return;
        }

        filteredMemberships.forEach(membership => {
            let statusLabel = membership.status;
            let statusColor = '';

            if (membership.status === 'Cancelled') {
                statusLabel = '✗ Cancelled';
                statusColor = 'color: red;';
            } else if (membership.status === 'Expired') {
                statusLabel = '⏳ Expired';
                statusColor = 'color: orange;';
            } else {
                statusLabel = '✓ Active';
                statusColor = 'color: green;';
            }

            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${membership.membershipNumber}</td>
                <td>${membership.memberName}</td>
                <td>${membership.memberEmail}</td>
                <td>${membership.memberPhone}</td>
                <td>${membership.joinDate}</td>
                <td>${membership.expiryDate}</td>
                <td style="${statusColor}">${statusLabel}</td>
            `;
        });
    }

    // Filter event listeners
    document.getElementById('issuedMemberName')?.addEventListener('keyup', displayIssuedBooksReport);
    document.getElementById('issuedBookTitle')?.addEventListener('keyup', displayIssuedBooksReport);
    document.getElementById('returnedMemberName')?.addEventListener('keyup', displayReturnedBooksReport);
    document.getElementById('returnedBookTitle')?.addEventListener('keyup', displayReturnedBooksReport);
    document.getElementById('reportMemberName')?.addEventListener('keyup', displayMembershipReport);
    document.getElementById('membershipStatus')?.addEventListener('change', displayMembershipReport);
});
