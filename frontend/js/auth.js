const API_BASE_URL = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - Initializing auth...');
    
    // Tab switching
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', function() {
            console.log('Tab clicked:', this.getAttribute('data-tab'));
            const tabName = this.getAttribute('data-tab');
            
            // Remove active class from all buttons and contents
            document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button and corresponding content
            this.classList.add('active');
            document.getElementById(tabName).classList.add('active');
        });
    });

    // Admin Login Form
    const adminForm = document.getElementById('adminLoginForm');
    if (adminForm) {
        console.log('Admin form found, attaching submit handler');
        adminForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('Admin form submitted');
            
            const username = document.getElementById('admin-username').value;
            const password = document.getElementById('admin-password').value;
            const errorMsg = document.getElementById('errorMessage');
            
            console.log('Attempting login with username:', username);
            
            try {
                const response = await fetch(`${API_BASE_URL}/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password })
                });
                
                console.log('Response status:', response.status);
                const data = await response.json();
                console.log('Response data:', data);
                
                if (data.success) {
                    if (data.user.userType === 'admin') {
                        localStorage.setItem('token', data.token);
                        localStorage.setItem('userType', data.user.userType);
                        localStorage.setItem('username', data.user.username);
                        console.log('Login successful, redirecting to admin-home');
                        window.location.href = 'pages/admin-home.html';
                    } else {
                        errorMsg.textContent = 'Invalid admin credentials';
                        errorMsg.classList.add('show');
                    }
                } else {
                    errorMsg.textContent = data.message || 'Login failed';
                    errorMsg.classList.add('show');
                }
            } catch (error) {
                errorMsg.textContent = 'Connection error. Please try again: ' + error.message;
                errorMsg.classList.add('show');
                console.error('Login error:', error);
            }
        });
    } else {
        console.log('Admin form not found');
    }

    // User Login Form
    const userForm = document.getElementById('userLoginForm');
    if (userForm) {
        console.log('User form found, attaching submit handler');
        userForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('User form submitted');
            
            const username = document.getElementById('user-username').value;
            const password = document.getElementById('user-password').value;
            const errorMsg = document.getElementById('errorMessage');
            
            console.log('Attempting login with username:', username);
            
            try {
                const response = await fetch(`${API_BASE_URL}/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password })
                });
                
                console.log('Response status:', response.status);
                const data = await response.json();
                console.log('Response data:', data);
                
                if (data.success) {
                    if (data.user.userType === 'user') {
                        localStorage.setItem('token', data.token);
                        localStorage.setItem('userType', data.user.userType);
                        localStorage.setItem('username', data.user.username);
                        console.log('Login successful, redirecting to user-home');
                        window.location.href = 'pages/user-home.html';
                    } else {
                        errorMsg.textContent = 'Invalid user credentials';
                        errorMsg.classList.add('show');
                    }
                } else {
                    errorMsg.textContent = data.message || 'Login failed';
                    errorMsg.classList.add('show');
                }
            } catch (error) {
                errorMsg.textContent = 'Connection error. Please try again: ' + error.message;
                errorMsg.classList.add('show');
                console.error('Login error:', error);
            }
        });
    } else {
        console.log('User form not found');
    }
});

// Logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('username');
    window.location.href = '../index.html';
}

// Check authentication
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '../index.html';
        return false;
    }
    return true;
}

// Get authorization header
function getAuthHeader() {
    const token = localStorage.getItem('token');
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
}
