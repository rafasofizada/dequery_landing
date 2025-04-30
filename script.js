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

  interestForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Prevent default form submission

    const originalButtonText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'Submitting...';

    // Base data
    let formData = {
      email: emailInput.value,
    };

    // Add feedback data only if the section is visible
    if (feedbackSection.style.display === 'block') {
      const selectedPaymentType = document.querySelector('input[name="payment-type"]:checked').value;
      const selectedDatabases = Array.from(document.querySelectorAll('input[name="db"]:checked')).map(cb => cb.value);
      const teamSizeSelect = document.getElementById('team-size');

      formData = {
        ...formData,
        paymentType: selectedPaymentType,
        fairValue: fairValueInput.value,
        databases: selectedDatabases,
        teamSize: teamSizeSelect.value
      };
    }

    fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'cors', // Required for cross-origin requests to Apps Script
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    })
      .then(response => response.json())
      .then(data => {
        if (data.result === 'success') {
          alert('Thank you! Your response has been recorded.');
          interestForm.reset(); // Optionally reset the form
          feedbackSection.style.display = 'none'; // Hide feedback again
          updateFairValueMin(); // Reset fair value min/val
        } else {
          console.error('Submission error:', data.error);
          alert('Oops! Something went wrong. Please try again.');
        }
      })
      .catch(error => {
        console.error('Fetch error:', error);
        alert('Oops! There was a network error. Please try again.');
      })
      .finally(() => {
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
      });
  });

  // Initial call to set the correct minimum based on the default checked radio
  updateFairValueMin();
}); 