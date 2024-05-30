
// User signup 
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("signupForm");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const username = form.username.value;
      const email = form.email.value;
      const password = form.password.value;

      try {
        const response = await fetch("/signup", {
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

        // If signup is successful, redirect to login page or show success message
        window.location.href = "/login";
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
          alert("An error occurred. Please try again later.");
        }
      }
    });
  });