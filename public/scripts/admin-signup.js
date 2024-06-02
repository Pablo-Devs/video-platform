
// User signup 
document.addEventListener("DOMContentLoaded", () => {

  // Alert modal elements
  const alertModal = document.getElementById('alertModal');
  const alertMessage = document.getElementById('alertMessage');
  const closeAlertButton = document.getElementById('closeAlertButton');

  function showModal(modal) {
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
  }

  function showAlert(message) {
    alertMessage.textContent = message;
    showModal(alertModal);
  }

  function hideModal(modal) {
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
  }

  // Event listeners for alert modal
  closeAlertButton.addEventListener('click', () => hideModal(alertModal));

  const form = document.getElementById("signupForm");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = form.username.value;
    const email = form.email.value;
    const password = form.password.value;

    try {
      const response = await fetch("/admin-signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message);
      }

      // If signup is successful, ask user to verify email and then redirect to login page
      showAlert("Please verify your email to complete the signup process. Check your email for the verification link.");
      setTimeout(() => {
        window.location.href = "/login";
      }, 7000);
      // window.location.href = "/login";
    } catch (error) {
      console.error(error);
      const usernameError = document.querySelector(".username.error");
      const emailError = document.querySelector(".email.error");
      const passwordError = document.querySelector(".password.error");
      usernameError.textContent = "";
      emailError.textContent = "";
      passwordError.textContent = "";
      if (error.message.includes("username")) {
        usernameError.textContent = error.message;
      } else if (error.message.includes("email")) {
        emailError.textContent = error.message;
      } else if (error.message.includes("password")) {
        passwordError.textContent = error.message;
      } else {
        showAlert("An error occurred. Please try again later.");
      }
    }
  });
});