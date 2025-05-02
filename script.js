document.addEventListener('DOMContentLoaded', () => {
  const paymentTypeCheckboxes = document.querySelectorAll('input[name="payment-type"]');
  const paymentMonthlyCheckbox = document.getElementById('payment-monthly');
  const paymentLifetimeCheckbox = document.getElementById('payment-lifetime');
  const fairValueMonthlyInput = document.getElementById('fair-value-monthly');
  const fairValueLifetimeInput = document.getElementById('fair-value-lifetime');
  const feedbackSection = document.getElementById('feedback-section');
  const interestForm = document.getElementById('interest-form');
  const emailInput = document.getElementById('email');
  const submitButton = interestForm.querySelector('button[type="submit"]');
  const dbOtherText = document.getElementById('db-other-text');
  const feedbackInputs = feedbackSection.querySelectorAll('input, select');

  let feedbackInteracted = false;

  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw1LkUZZjdOCZfUUQZSZYP658OPQ9FHeDJP8rVVuJ72fq0Pjg_BZzstyHHs8pJCSR4IfA/exec';

  function handleFeedbackInteraction() {
    feedbackInteracted = true;
    if (submitButton.classList.contains('success') || submitButton.classList.contains('error')) {
      resetButtonState();
    }
    if (submitButton.textContent === 'Notify me on release') {
      submitButton.textContent = 'Submit feedback';
    }
  }

  function resetButtonState() {
    submitButton.classList.remove('success', 'error', 'submitting');
    submitButton.disabled = false;
    submitButton.textContent = feedbackInteracted ? 'Submit feedback' : 'Notify me on release';
  }

  function toggleValueInput(checkbox, valueInput) {
    if (checkbox.checked) {
      valueInput.style.display = 'inline-block';
      valueInput.required = true;
    } else {
      valueInput.style.display = 'none';
      valueInput.required = false;
      valueInput.value = '';
    }
  }

  if (paymentMonthlyCheckbox && fairValueMonthlyInput) {
    paymentMonthlyCheckbox.addEventListener('change', () => {
      toggleValueInput(paymentMonthlyCheckbox, fairValueMonthlyInput);
    });
  }
  if (paymentLifetimeCheckbox && fairValueLifetimeInput) {
    paymentLifetimeCheckbox.addEventListener('change', () => {
      toggleValueInput(paymentLifetimeCheckbox, fairValueLifetimeInput);
    });
  }

  feedbackInputs.forEach(input => {
    if (input.id !== 'email') {
      input.addEventListener('change', handleFeedbackInteraction);
      if (input.type === 'text' || input.type === 'number') {
        input.addEventListener('input', handleFeedbackInteraction);
      }
    }
  });

  window.handleResponse = function (response) {
    submitButton.classList.remove('submitting');

    if (response.result === 'success') {
      interestForm.reset();
      setTimeout(() => {
        submitButton.classList.add('success');
        submitButton.textContent = 'Success! To update your response, reload the page & resubmit';
        submitButton.disabled = false;
      }, 0);
    } else {
      console.error('Submission error:', response.error);
      submitButton.classList.add('error');
      submitButton.textContent = 'Error. Try Again?';
      submitButton.disabled = false;
    }
  };

  interestForm.addEventListener('submit', (e) => {
    e.preventDefault();

    if (paymentMonthlyCheckbox.checked && !fairValueMonthlyInput.value) {
      alert('Please enter a fair value for the Monthly subscription.');
      fairValueMonthlyInput.focus();
      return;
    }
    if (paymentLifetimeCheckbox.checked && !fairValueLifetimeInput.value) {
      alert('Please enter a fair value for the Lifetime option.');
      fairValueLifetimeInput.focus();
      return;
    }
    if (paymentMonthlyCheckbox.checked && parseInt(fairValueMonthlyInput.value) < parseInt(fairValueMonthlyInput.min)) {
      alert(`Monthly value must be at least $${fairValueMonthlyInput.min}.`);
      fairValueMonthlyInput.focus();
      return;
    }
    if (paymentLifetimeCheckbox.checked && parseInt(fairValueLifetimeInput.value) < parseInt(fairValueLifetimeInput.min)) {
      alert(`Lifetime value must be at least $${fairValueLifetimeInput.min}.`);
      fairValueLifetimeInput.focus();
      return;
    }

    const originalButtonText = submitButton.textContent;
    submitButton.classList.remove('success', 'error');
    submitButton.disabled = true;
    submitButton.textContent = 'Submitting...';
    submitButton.classList.add('submitting');

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

      if (paymentMonthlyCheckbox.checked) {
        queryString += "&fairValueMonthly=" + encodeURIComponent(fairValueMonthlyInput.value);
      }
      if (paymentLifetimeCheckbox.checked) {
        queryString += "&fairValueLifetime=" + encodeURIComponent(fairValueLifetimeInput.value);
      }

      const allDbValues = [];
      const selectedDatabases = Array.from(document.querySelectorAll('input[name="db"]:checked'));
      selectedDatabases.forEach(cb => {
        allDbValues.push(cb.value);
      });

      const otherDbText = dbOtherText.value.trim();
      if (otherDbText) {
        const otherDbs = otherDbText.split(',')
          .map(db => db.trim())
          .filter(db => db);
        allDbValues.push(...otherDbs);
      }

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
      submitButton.classList.remove('submitting');
      submitButton.classList.add('error');
      submitButton.textContent = 'Network Error. Try Again?';
      submitButton.disabled = false;

      const scriptTag = document.getElementById('jsonp-script');
      if (scriptTag) {
        document.body.removeChild(scriptTag);
      }
    };
    document.body.appendChild(script);
  });

  interestForm.addEventListener('reset', () => {
    setTimeout(() => {
      feedbackInteracted = false;
      if (fairValueMonthlyInput) fairValueMonthlyInput.style.display = 'none';
      if (fairValueLifetimeInput) fairValueLifetimeInput.style.display = 'none';
      resetButtonState();
    }, 0);
  });
}); 