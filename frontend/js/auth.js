// Login functionality
const loginForm = document.getElementById('loginForm');

if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const errorEl = document.getElementById('errorMessage');

        // Validation
        if (!username || !password) {
            errorEl.textContent = 'Username and password are required';
            errorEl.classList.add('show');
            return;
        }

        // Check if user exists
        const user = storage.getUserByUsername(username);

        if (!user) {
            errorEl.textContent = 'User not found. Please register first.';
            errorEl.classList.add('show');
            return;
        }

        // Check password
        if (user.password !== password) {
            errorEl.textContent = 'Incorrect password';
            errorEl.classList.add('show');
            return;
        }

        // Store session
        sessionStorage.setItem('currentUser', JSON.stringify({
            id: user.id,
            username: user.username,
            fullName: user.fullName,
            email: user.email,
            role: user.role
        }));

        // Redirect to dashboard
        window.location.href = 'dashboard.html';
    });
}

// Check if already logged in
const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || 'null');
if (currentUser && document.getElementById('loginForm')) {
    window.location.href = 'dashboard.html';
}
