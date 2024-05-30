document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');
    const loginButton = document.getElementById('loginButton');
    const spinner = document.getElementById('spinner');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = form.email.value;
        const password = form.password.value;
        
        // Disable button and show spinner
        loginButton.disabled = true;
        spinner.classList.remove('hidden');

        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message);
            }

            // If login is successful, redirect based on user role
            if (data.isAdmin) {
                window.location.href = '/dashboard';
            } else {
                window.location.href = '/home';
            }
        } catch (error) {
            console.error(error);
            const emailError = document.querySelector('.email.error');
            const passwordError = document.querySelector('.password.error');
            emailError.textContent = '';
            passwordError.textContent = '';
            if (error.message.includes('email')) {
                emailError.textContent = error.message;
            } else if (error.message.includes('password')) {
                passwordError.textContent = error.message;
            } else {
                alert('An error occurred. Please try again later.');
            }
        } finally {
            // Enable button and hide spinner
            loginButton.disabled = false;
            spinner.classList.add('hidden');
        }
    });
});