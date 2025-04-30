document.addEventListener('DOMContentLoaded', () => {
  const paymentTypeRadios = document.querySelectorAll('input[name="payment-type"]');
  const fairValueInput = document.getElementById('fair-value');
  const feedbackButton = document.getElementById('feedback-button');
  const feedbackSection = document.getElementById('feedback-section');
  const interestForm = document.getElementById('interest-form');
  const emailInput = document.getElementById('email');
  const submitButton = interestForm.querySelector('button[type="submit"]');

  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzPIuoTyu8gG7mNBRIS4AB7mkk5IeumNJzdvPDRRHI3rXVhdW9lUBDtIF7T_ZjDb0Xsdw/exec';

  const minValues = {
    monthly: 20,
    lifetime: 100
  };

  function updateFairValueMin() {
    const selectedType = document.querySelector('input[name="payment-type"]:checked').value;
    const newMin = minValues[selectedType];
    fairValueInput.min = newMin;
    // Also update the value if it's currently below the new minimum
    if (parseInt(fairValueInput.value, 10) < newMin) {
      fairValueInput.value = newMin;
    }
  }

  paymentTypeRadios.forEach(radio => {
    radio.addEventListener('change', updateFairValueMin);
  });

  feedbackButton.addEventListener('click', () => {
    const isHidden = feedbackSection.style.display === 'none';
    feedbackSection.style.display = isHidden ? 'block' : 'none';
  });

  // Define the callback function in the global scope
  window.handleResponse = function (response) {
    const originalButtonText = "Notify me on release"; // Assuming this is the original text

    if (response.result === 'success') {
      alert('Thank you! Your response has been recorded.');
      interestForm.reset(); // Optionally reset the form
      feedbackSection.style.display = 'none'; // Hide feedback again
      updateFairValueMin(); // Reset fair value min/val
    } else {
      console.error('Submission error:', response.error);
      alert('Oops! Something went wrong. Please try again.');
    }

    // Re-enable button
    submitButton.disabled = false;
    submitButton.textContent = originalButtonText;

    // Cleanup the script tag
    const scriptTag = document.getElementById('jsonp-script');
    if (scriptTag) {
      document.body.removeChild(scriptTag);
    }
  }

  interestForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Prevent default form submission

    const originalButtonText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'Submitting...';

    // --- Build Query String ---
    let queryString = "?callback=handleResponse"; // Start with callback
    queryString += "&email=" + encodeURIComponent(emailInput.value);

    // Add feedback data only if the section is visible
    if (feedbackSection.style.display === 'block') {
      const selectedPaymentType = document.querySelector('input[name="payment-type"]:checked').value;
      const selectedDatabases = Array.from(document.querySelectorAll('input[name="db"]:checked'));
      const teamSizeSelect = document.getElementById('team-size');

      queryString += "&paymentType=" + encodeURIComponent(selectedPaymentType);
      queryString += "&fairValue=" + encodeURIComponent(fairValueInput.value);
      selectedDatabases.forEach(cb => {
        queryString += "&db=" + encodeURIComponent(cb.value); // Add each selected db
      });
      queryString += "&teamSize=" + encodeURIComponent(teamSizeSelect.value);
    }

    // --- Create and append script tag ---
    // Remove any previous script tag first
    const existingScriptTag = document.getElementById('jsonp-script');
    if (existingScriptTag) {
      document.body.removeChild(existingScriptTag);
    }

    const script = document.createElement('script');
    script.id = 'jsonp-script'; // Add an ID for easy removal
    script.src = SCRIPT_URL + queryString;
    script.onerror = function () {
      // Handle script loading errors (network issues, etc.)
      alert('Oops! There was a network error submitting your request. Please try again.');
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;
      // Clean up potentially failed script tag and global function
      const scriptTag = document.getElementById('jsonp-script');
      if (scriptTag) {
        document.body.removeChild(scriptTag);
      }
      delete window.handleResponse;
    };
    document.body.appendChild(script);
  });

  // Initial call to set the correct minimum based on the default checked radio
  updateFairValueMin();
}); 