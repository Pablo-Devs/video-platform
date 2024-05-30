// Get modal elements
const alertModal = document.getElementById('alertModal');
const alertMessage = document.getElementById('alertMessage');
const closeAlertButton = document.getElementById('closeAlertButton');

// Function to show alert modal
function showAlert(message) {
    alertMessage.textContent = message;
    alertModal.classList.remove('hidden');
}

// Function to hide alert modal
closeAlertButton.addEventListener('click', () => {
    alertModal.classList.add('hidden');
});

document.addEventListener('DOMContentLoaded', function () {
    const otpRequestForm = document.getElementById('otp-request-form');
    const passwordResetForm = document.getElementById('password-reset-form');

    otpRequestForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const email = event.target.email.value;
        try {
            const response = await fetch('/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });
            const data = await response.json();
            if (response.ok && data.message === 'Password reset OTP sent to your email') {
                otpRequestForm.classList.add('hidden');
                passwordResetForm.classList.remove('hidden');
            } else {
                showAlert(data.message || 'Failed to send OTP');
            }
        } catch (error) {
            showAlert('Error requesting OTP');
        }
    });

    passwordResetForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const email = otpRequestForm.email.value;
        const otp = event.target.otp.value;
        const newPassword = event.target['new-password'].value;
        try {
            const response = await fetch('/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, otp, newPassword })
            });
            const data = await response.json();
            if (response.ok) {
                showAlert('Password reset successfully');
                otpRequestForm.reset();
                passwordResetForm.reset();
                otpRequestForm.classList.remove('hidden');
                passwordResetForm.classList.add('hidden');
            } else {
                showAlert(data.message || 'Failed to reset password');
            }
        } catch (error) {
            showAlert('Error resetting password');
        }
    });
});