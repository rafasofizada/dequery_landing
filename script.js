document.addEventListener('DOMContentLoaded', () => {
  const paymentTypeCheckboxes = document.querySelectorAll('input[name="payment-type"]');
  const fairValueInput = document.getElementById('fair-value');
  const feedbackSection = document.getElementById('feedback-section');
  const interestForm = document.getElementById('interest-form');
  const emailInput = document.getElementById('email');
  const submitButton = interestForm.querySelector('button[type="submit"]');
  const dbOtherText = document.getElementById('db-other-text');
  const feedbackInputs = feedbackSection.querySelectorAll('input, select');

  let feedbackInteracted = false;

  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzPIuoTyu8gG7mNBRIS4AB7mkk5IeumNJzdvPDRRHI3rXVhdW9lUBDtIF7T_ZjDb0Xsdw/exec';

  const minValues = {
    monthly: 20,
    lifetime: 100,
    free: 0
  };
  const defaultMinFairValue = 20;

  function updateFairValueMin() {
    const selectedTypes = Array.from(paymentTypeCheckboxes)
      .filter(cb => cb.checked)
      .map(cb => cb.value);

    let newMin = defaultMinFairValue;
    if (selectedTypes.length > 0) {
      newMin = Math.max(defaultMinFairValue, ...selectedTypes.map(type => minValues[type] || 0));
    }

    fairValueInput.min = newMin;
    if (parseInt(fairValueInput.value, 10) < newMin) {
      fairValueInput.value = newMin;
    }
  }

  function handleFeedbackInteraction() {
    feedbackInteracted = true;
    if (submitButton.textContent === 'Notify me on release') {
      submitButton.textContent = 'Submit feedback';
    }
  }

  paymentTypeCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', updateFairValueMin);
  });

  feedbackInputs.forEach(input => {
    if (input.id !== 'email') {
      input.addEventListener('change', handleFeedbackInteraction);
      if (input.type === 'text' || input.type === 'number') {
        input.addEventListener('input', handleFeedbackInteraction);
      }
    }
  });

  window.handleResponse = function (response) {
    const originalButtonText = "Notify me on release";

    if (response.result === 'success') {
      alert('Thank you! Your response has been recorded.');
      interestForm.reset();
      feedbackInteracted = false;
      updateFairValueMin();
      submitButton.textContent = originalButtonText;
    } else {
      console.error('Submission error:', response.error);
      alert('Oops! Something went wrong. Please try again.');
      submitButton.textContent = feedbackInteracted ? 'Submit feedback' : originalButtonText;
    }

    submitButton.disabled = false;

    const scriptTag = document.getElementById('jsonp-script');
    if (scriptTag) {
      document.body.removeChild(scriptTag);
    }
  }

  interestForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const originalButtonText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'Submitting...';

    let queryString = "?callback=handleResponse";
    queryString += "&email=" + encodeURIComponent(emailInput.value);

    if (feedbackInteracted) {
      const selectedPaymentTypes = Array.from(paymentTypeCheckboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value);
      const teamSizeSelect = document.getElementById('team-size');

      selectedPaymentTypes.forEach(type => {
        queryString += "&paymentType=" + encodeURIComponent(type);
      });

      queryString += "&fairValue=" + encodeURIComponent(fairValueInput.value);

      const allDbValues = [];
      // Add values from checked checkboxes
      const selectedDatabases = Array.from(document.querySelectorAll('input[name="db"]:checked'));
      selectedDatabases.forEach(cb => {
        allDbValues.push(cb.value);
      });

      // Add values from the 'other' text input
      const otherDbText = dbOtherText.value.trim();
      if (otherDbText) {
        // Split by comma, trim whitespace, filter empty strings
        const otherDbs = otherDbText.split(',')
          .map(db => db.trim())
          .filter(db => db); // Filter out empty strings after trimming
        allDbValues.push(...otherDbs);
      }

      // Append each database value as a separate 'db' parameter
      allDbValues.forEach(dbValue => {
        queryString += "&db=" + encodeURIComponent(dbValue);
      });

      queryString += "&teamSize=" + encodeURIComponent(teamSizeSelect.value);
    }

    const existingScriptTag = document.getElementById('jsonp-script');
    if (existingScriptTag) {
      document.body.removeChild(existingScriptTag);
    }

    console.log(queryString.split('&'));

    const script = document.createElement('script');
    script.id = 'jsonp-script';
    script.src = SCRIPT_URL + queryString;
    script.onerror = function () {
      alert('Oops! There was a network error submitting your request. Please try again.');
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;
      const scriptTag = document.getElementById('jsonp-script');
      if (scriptTag) {
        document.body.removeChild(scriptTag);
      }
    };
    document.body.appendChild(script);
  });

  updateFairValueMin();
}); 