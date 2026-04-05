// Registration functionality
const registerForm = document.getElementById('registerForm');

if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const fullName = document.getElementById('fullName').value.trim();
        const email = document.getElementById('email').value.trim();
        const username = document.getElementById('regUsername').value.trim();
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const role = document.querySelector('input[name="role"]:checked').value;
        const errorEl = document.getElementById('errorMessage');

        // Validation
        if (!fullName || !email || !username || !password || !confirmPassword) {
            errorEl.textContent = 'All fields are required';
            errorEl.classList.add('show');
            return;
        }

        if (!validateEmail(email)) {
            errorEl.textContent = 'Please enter a valid email address';
            errorEl.classList.add('show');
            return;
        }

        if (!validateUsername(username)) {
            errorEl.textContent = 'Username must be at least 3 characters long';
            errorEl.classList.add('show');
            return;
        }

        if (!validatePassword(password)) {
            errorEl.textContent = 'Password must be at least 6 characters long';
            errorEl.classList.add('show');
            return;
        }

        if (password !== confirmPassword) {
            errorEl.textContent = 'Passwords do not match';
            errorEl.classList.add('show');
            return;
        }

        // Check if username already exists
        if (storage.getUserByUsername(username)) {
            errorEl.textContent = 'Username already exists. Please choose a different one.';
            errorEl.classList.add('show');
            return;
        }

        // Register user
        try {
            const newUser = {
                fullName,
                email,
                username,
                password,
                role
            };

            storage.addUser(newUser);

            alert('Registration successful! Please log in.');
            window.location.href = 'login.html';
        } catch (error) {
            errorEl.textContent = 'Error during registration. Please try again.';
            errorEl.classList.add('show');
        }
    });
}

// Check if already logged in
const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || 'null');
if (currentUser && document.getElementById('registerForm')) {
    window.location.href = 'dashboard.html';
}
