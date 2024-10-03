// Function to check if user is authenticated
function checkAuth() {
    return new Promise((resolve, reject) => {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                console.log("User authenticated:", user);
                resolve(user);
            } else {
                console.log("User not authenticated");
                reject('User not authenticated');
            }
        }, (error) => {
            console.error("Auth error:", error);
            reject(error);
        });
    });
}

// Function to handle logout
function logout() {
    firebase.auth().signOut().then(() => {
        console.log("User signed out successfully");
        window.location.href = 'login.html';
    }).catch((error) => {
        console.error('Error logging out:', error);
    });
}

// Function to display user info
function displayUserInfo() {
    const user = firebase.auth().currentUser;
    if (user) {
        const userInfoDiv = document.getElementById('user-info');
        if (userInfoDiv) {
            userInfoDiv.innerHTML = `
                <p>${user.email}</p>
            `;
            userInfoDiv.style.display = 'block';
        }
    }
}

// Call displayUserInfo when auth state changes
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        console.log("Auth state changed: User is signed in", user);
        displayUserInfo();
    } else {
        console.log("Auth state changed: User is signed out");
        const userInfoDiv = document.getElementById('user-info');
        if (userInfoDiv) {
            userInfoDiv.style.display = 'none';
        }
    }
}, (error) => {
    console.error("Auth state change error:", error);
});

// Function to handle login
function login(email, password) {
    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            console.log("User signed in successfully:", userCredential.user);
            window.location.href = 'index.html'; // Redirect to home page after successful login
        })
        .catch((error) => {
            console.error("Login error:", error.code, error.message);
            const messageDiv = document.getElementById('message');
            if (messageDiv) {
                messageDiv.textContent = `Login failed: ${error.message}`;
            }
        });
}

// Add event listener for login form if it exists
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            login(email, password);
        });
    }
});

console.log('auth.js loaded');