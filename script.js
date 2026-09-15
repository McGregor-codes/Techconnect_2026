/* =========================================================
   TECHCONNECT 2026 — REGISTRATION FORM LOGIC
   Sends registration data to the n8n TEST webhook.
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

  const form = document.getElementById("techconnectForm");
  const submitBtn = document.getElementById("submitBtn");
  const formMessage = document.getElementById("formMessage");
  const successPanel = document.getElementById("successPanel");
  const registerAnotherBtn = document.getElementById("registerAnotherBtn");

  const ORIGINAL_BUTTON_TEXT = submitBtn.textContent;

  // Fields the user must fill in before we accept the form.
  const requiredFieldIds = ["fullName", "email", "phone", "state", "interest"];

  form.addEventListener("submit", function (event) {

    // 1. Stop the browser from doing a real submission / page reload.
    event.preventDefault();

    hideMessage();

    // 2. Validate required text/select fields.
    const missingField = requiredFieldIds.find(function (id) {
      const field = document.getElementById(id);
      return field.value.trim() === "";
    });

    // 3. Validate the gender radio group separately.
    const genderSelected = form.querySelector(
      'input[name="gender"]:checked'
    );

    if (missingField || !genderSelected) {
      showMessage(
        "Please fill in all required fields before submitting.",
        "error"
      );

      const focusTarget = missingField
        ? document.getElementById(missingField)
        : null;

      if (focusTarget) {
        focusTarget.focus();
      }

      return;
    }

    // 4. Validate consent checkbox.
    const consentCheckbox = document.getElementById("consent");

    if (!consentCheckbox.checked) {
      showMessage(
        "Please agree to the terms and conditions before registering.",
        "error"
      );

      consentCheckbox.focus();
      return;
    }

    // 5. Extra sanity check on the email format.
    const emailField = document.getElementById("email");

    if (!isValidEmail(emailField.value.trim())) {
      showMessage(
        "Please enter a valid email address.",
        "error"
      );

      emailField.focus();
      return;
    }

    // Validation passed — prepare the registration data.
    submitBtn.disabled = true;
    submitBtn.textContent = "Processing Registration...";

    const payload = {
      fullName: document.getElementById("fullName").value.trim(),
      email: document.getElementById("email").value.trim(),
      phone: document.getElementById("phone").value.trim(),
      gender: genderSelected.value,
      state: document.getElementById("state").value.trim(),
      interest: document.getElementById("interest").value,
      consent: consentCheckbox.checked
    };

    // Send registration data to the n8n webhook.
    fetch(
      "https://techconnect-2026.app.n8n.cloud/webhook/techconnect-registration",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify(payload)
      }
    )

      // Check whether n8n accepted the request.
      .then(function (response) {

        if (!response.ok) {
          throw new Error(
            "Webhook request failed with status " + response.status
          );
        }

        // We don't require n8n to return JSON.
        // The important thing is that the request succeeded.
        return response.text();
      })

      // Registration was successfully sent to n8n.
      .then(function () {

        showSuccess();

        submitBtn.disabled = false;
        submitBtn.textContent = ORIGINAL_BUTTON_TEXT;
      })

      // Something went wrong while sending the request.
      .catch(function (error) {

        console.error(
          "Error sending registration:",
          error
        );

        showMessage(
          "Registration could not be submitted. Please try again.",
          "error"
        );

        submitBtn.disabled = false;
        submitBtn.textContent = ORIGINAL_BUTTON_TEXT;
      });
  });


  // Let the user register someone else after a successful submission.
  if (registerAnotherBtn) {

    registerAnotherBtn.addEventListener("click", function () {

      form.reset();

      hideMessage();

      successPanel.hidden = true;

      form.hidden = false;

      form.querySelector("#fullName").focus();
    });
  }


  // Display a form message.
  function showMessage(text, type) {

    formMessage.textContent = text;

    formMessage.className =
      "form-message show " + type;
  }


  // Hide the form message.
  function hideMessage() {

    formMessage.textContent = "";

    formMessage.className =
      "form-message";
  }


  // Display the successful registration panel.
  function showSuccess() {

    form.hidden = true;

    successPanel.hidden = false;

    successPanel.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  }


  // Simple email validation.
  function isValidEmail(value) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

});