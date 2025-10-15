/**
 * Sizing Widget JavaScript functionality
 * Handles the sizing widget modal, form validation, and size recommendations
 */

// TODO: In the future, consider persisting user data using localStorage for better UX
let currentStep = 1;
let userData = {};

// Size recommendation lookup table based on the product size guide
// This uses the measurements from the Bangladesh Knit Cricket Polo as reference
const sizeGuide = {
  S: { chest: 20, length: 25, sleeve: 8.5 },
  M: { chest: 21, length: 26, sleeve: 9 },
  L: { chest: 22, length: 27, sleeve: 9.5 },
  XL: { chest: 23, length: 28, sleeve: 10 }
};

// Body type multipliers for size adjustment
const bodyTypeMultipliers = {
  slim: 0.95,
  athletic: 1.0,
  rounder: 1.05
};

// Initialize the sizing widget when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  initializeSizingWidget();
});

function initializeSizingWidget() {
  // Add event listeners for unit toggle
  const unitInputs = document.querySelectorAll('input[name="units"]');
  unitInputs.forEach(input => {
    input.addEventListener('change', handleUnitChange);
  });

  // Add event listeners for form validation
  const form = document.getElementById('sizing-widget-form');
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
    });
  }

  // Add window resize listener to adjust modal height
  window.addEventListener('resize', function() {
    const modal = document.getElementById('sizing-widget-modal');
    if (modal && modal.style.display === 'flex') {
      adjustModalHeight();
    }
  });
}

function openSizingWidget() {
  const modal = document.getElementById('sizing-widget-modal');
  if (modal) {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    resetWidget();
    adjustModalHeight();
    
    // Set initial height for steps container
    const step1 = document.getElementById('step-1');
    const stepsContainer = document.querySelector('.sizing-widget-steps-container');
    if (step1 && stepsContainer) {
      setTimeout(() => {
        stepsContainer.style.height = step1.offsetHeight + 'px';
      }, 10);
    }
    
    // Trigger animation
    setTimeout(() => {
      modal.classList.add('show');
    }, 10);
  }
}

function adjustModalHeight() {
  const modalContent = document.querySelector('.sizing-widget-modal__content');
  if (modalContent) {
    // Reset height to auto first
    modalContent.style.height = 'auto';
    
    // Get the viewport height
    const viewportHeight = window.innerHeight;
    
    // Calculate available height (viewport - some padding)
    const availableHeight = viewportHeight - 40;
    
    // Set max height based on viewport
    modalContent.style.maxHeight = availableHeight + 'px';
    
    // If content is taller than available space, enable scrolling
    if (modalContent.scrollHeight > availableHeight) {
      modalContent.style.overflowY = 'auto';
    } else {
      modalContent.style.overflowY = 'hidden';
    }
  }
}

function closeSizingWidget() {
  const modal = document.getElementById('sizing-widget-modal');
  if (modal) {
    modal.classList.remove('show');
    
    // Hide modal after animation
    setTimeout(() => {
      modal.style.display = 'none';
      document.body.style.overflow = 'auto';
      resetWidget();
    }, 300);
  }
}

function resetWidget() {
  currentStep = 1;
  userData = {};
  
  // Reset all steps and remove animation classes
  document.querySelectorAll('.sizing-widget-step').forEach(step => {
    step.classList.remove(
      'sizing-widget-step--active',
      'sizing-widget-step--slide-out-left',
      'sizing-widget-step--slide-out-right',
      'sizing-widget-step--slide-in-left',
      'sizing-widget-step--slide-in-right'
    );
    step.style.position = 'absolute';
    step.style.pointerEvents = 'none';
  });
  
  // Reset steps container height
  const stepsContainer = document.querySelector('.sizing-widget-steps-container');
  if (stepsContainer) {
    stepsContainer.style.height = '';
  }
  
  // Show step 1
  const step1 = document.getElementById('step-1');
  if (step1) {
    step1.classList.add('sizing-widget-step--active');
    step1.style.position = 'relative';
    step1.style.pointerEvents = 'auto';
  }
  
  // Reset form
  const form = document.getElementById('sizing-widget-form');
  if (form) {
    form.reset();
  }
  
  // Reset to imperial units
  const imperialRadio = document.querySelector('input[name="units"][value="imperial"]');
  if (imperialRadio) {
    imperialRadio.checked = true;
    handleUnitChange();
  }
}

function nextStep() {
  if (validateStep1()) {
    collectStep1Data();
    showStep(2);
  }
}

function prevStep() {
  if (currentStep > 1) {
    showStep(currentStep - 1);
  }
}

function showStep(stepNumber) {
  const oldStepElement = document.getElementById(`step-${currentStep}`);
  const newStepElement = document.getElementById(`step-${stepNumber}`);
  
  if (!newStepElement) return;
  
  // Determine animation direction
  const isMovingForward = stepNumber > currentStep;
  
  // Calculate and animate height change
  animateModalHeight(newStepElement);
  
  // Remove any existing animation classes from all steps
  document.querySelectorAll('.sizing-widget-step').forEach(step => {
    step.classList.remove(
      'sizing-widget-step--slide-out-left',
      'sizing-widget-step--slide-out-right',
      'sizing-widget-step--slide-in-left',
      'sizing-widget-step--slide-in-right'
    );
  });
  
  if (oldStepElement) {
    // Animate old step out
    if (isMovingForward) {
      oldStepElement.classList.add('sizing-widget-step--slide-out-left');
    } else {
      oldStepElement.classList.add('sizing-widget-step--slide-out-right');
    }
  }
  
  // Prepare new step for animation
  newStepElement.style.position = 'absolute';
  newStepElement.style.pointerEvents = 'auto';
  
  // Animate new step in
  if (isMovingForward) {
    newStepElement.classList.add('sizing-widget-step--slide-in-right');
  } else {
    newStepElement.classList.add('sizing-widget-step--slide-in-left');
  }
  
  // After animation completes, clean up
  setTimeout(() => {
    // Remove animation classes
    if (oldStepElement) {
      oldStepElement.classList.remove(
        'sizing-widget-step--active',
        'sizing-widget-step--slide-out-left',
        'sizing-widget-step--slide-out-right'
      );
      oldStepElement.style.position = 'absolute';
      oldStepElement.style.pointerEvents = 'none';
    }
    
    newStepElement.classList.remove(
      'sizing-widget-step--slide-in-left',
      'sizing-widget-step--slide-in-right'
    );
    newStepElement.classList.add('sizing-widget-step--active');
    newStepElement.style.position = 'relative';
    newStepElement.style.pointerEvents = 'auto';
    
    currentStep = stepNumber;
  }, 400); // Match the animation duration (0.4s)
}

function animateModalHeight(newStepElement) {
  const stepsContainer = document.querySelector('.sizing-widget-steps-container');
  const modalContent = document.querySelector('.sizing-widget-modal__content');
  
  if (!stepsContainer || !modalContent || !newStepElement) return;
  
  // Temporarily make the new step visible to measure its height
  const originalPosition = newStepElement.style.position;
  const originalVisibility = newStepElement.style.visibility;
  const originalOpacity = newStepElement.style.opacity;
  
  newStepElement.style.position = 'relative';
  newStepElement.style.visibility = 'hidden';
  newStepElement.style.opacity = '0';
  newStepElement.style.pointerEvents = 'auto';
  
  // Get the natural height of the new step
  const newHeight = newStepElement.offsetHeight;
  
  // Restore original styles
  newStepElement.style.position = originalPosition;
  newStepElement.style.visibility = originalVisibility;
  newStepElement.style.opacity = originalOpacity;
  
  // Set explicit height on steps container to enable transition
  const currentHeight = stepsContainer.offsetHeight;
  stepsContainer.style.height = currentHeight + 'px';
  
  // Force reflow to ensure the transition works
  stepsContainer.offsetHeight;
  
  // Set new height to trigger transition
  stepsContainer.style.height = newHeight + 'px';
}

function validateStep1() {
  const heightFeet = document.getElementById('height-feet');
  const heightInches = document.getElementById('height-inches');
  const weight = document.getElementById('weight');
  const age = document.getElementById('age');
  
  if (!heightFeet.value || !heightInches.value || !weight.value || !age.value) {
    alert('Please fill in all fields');
    return false;
  }
  
  // Validate height range
  const totalInches = parseInt(heightFeet.value) * 12 + parseInt(heightInches.value);
  if (totalInches < 48 || totalInches > 84) {
    alert('Please enter a valid height');
    return false;
  }
  
  // Validate weight range
  const weightValue = parseInt(weight.value);
  if (weightValue < 50 || weightValue > 500) {
    alert('Please enter a valid weight');
    return false;
  }
  
  // Validate age range
  const ageValue = parseInt(age.value);
  if (ageValue < 13 || ageValue > 100) {
    alert('Please enter a valid age');
    return false;
  }
  
  return true;
}

function collectStep1Data() {
  const isImperial = document.querySelector('input[name="units"]:checked').value === 'imperial';
  
  let heightInches, weightLbs;
  
  if (isImperial) {
    const heightFeet = parseInt(document.getElementById('height-feet').value);
    const heightInchesValue = parseInt(document.getElementById('height-inches').value);
    heightInches = heightFeet * 12 + heightInchesValue;
    weightLbs = parseInt(document.getElementById('weight').value);
  } else {
    // Convert from metric to imperial for calculations
    const heightCm = parseInt(document.getElementById('height').value);
    const weightKg = parseInt(document.getElementById('weight').value);
    heightInches = Math.round(heightCm / 2.54);
    weightLbs = Math.round(weightKg * 2.205);
  }
  
  userData = {
    heightInches: heightInches,
    weightLbs: weightLbs,
    age: parseInt(document.getElementById('age').value),
    units: isImperial ? 'imperial' : 'metric'
  };
}

function getSizeRecommendation() {
  const bodyType = document.querySelector('input[name="body-type"]:checked');
  if (!bodyType) {
    alert('Please select your body type');
    return;
  }
  
  userData.bodyType = bodyType.value;
  
  // Calculate recommended size
  const recommendedSize = calculateSizeRecommendation(userData);
  
  // Display recommendation
  document.getElementById('recommended-size').textContent = recommendedSize;
  document.getElementById('recommended-size-text').textContent = recommendedSize;
  
  // Show results step
  showStep(3);
}

function calculateSizeRecommendation(data) {
  // Enhanced size calculation using multiple factors
  // This algorithm considers height, weight, BMI, and body type for better accuracy
  
  const { heightInches, weightLbs, bodyType } = data;
  
  // Calculate BMI for body composition assessment
  const bmi = (weightLbs / (heightInches * heightInches)) * 703;
  
  // Estimate chest size using multiple formulas for better accuracy
  // Formula 1: Based on height and body frame
  let estimatedChest1 = (heightInches * 0.65) + (bmi * 0.4);
  
  // Formula 2: Based on weight and height ratio
  let estimatedChest2 = (weightLbs * 0.45) + (heightInches * 0.3);
  
  // Formula 3: Based on height alone (baseline)
  let estimatedChest3 = heightInches * 0.6;
  
  // Average the estimates for better accuracy
  let estimatedChest = (estimatedChest1 + estimatedChest2 + estimatedChest3) / 3;
  
  // Apply body type multiplier for fine-tuning
  const multiplier = bodyTypeMultipliers[bodyType];
  estimatedChest *= multiplier;
  
  // Additional adjustments based on BMI ranges
  if (bmi < 18.5) {
    // Underweight - go down one size
    estimatedChest *= 0.95;
  } else if (bmi > 30) {
    // Overweight - go up one size
    estimatedChest *= 1.05;
  }
  
  // Find closest size based on chest measurement
  let recommendedSize = 'M'; // Default fallback
  let closestDifference = Infinity;
  
  // Check available sizes in the current product
  const availableSizes = getAvailableSizes();
  
  for (const [size, measurements] of Object.entries(sizeGuide)) {
    // Only consider sizes that are available for this product
    if (availableSizes.length > 0 && !availableSizes.includes(size)) {
      continue;
    }
    
    const difference = Math.abs(measurements.chest - estimatedChest);
    if (difference < closestDifference) {
      closestDifference = difference;
      recommendedSize = size;
    }
  }
  
  return recommendedSize;
}

function getAvailableSizes() {
  // Get available sizes from the current product's variant picker
  const variantPicker = document.querySelector('variant-picker');
  if (!variantPicker) return [];
  
  const availableSizes = [];
  const sizeInputs = variantPicker.querySelectorAll('input[type="radio"]');
  
  sizeInputs.forEach(input => {
    const value = input.value.toUpperCase();
    if (['S', 'M', 'L', 'XL', 'XXL', 'XXXL'].includes(value)) {
      availableSizes.push(value);
    }
  });
  
  return availableSizes;
}

function applySizeRecommendation() {
  const recommendedSize = document.getElementById('recommended-size').textContent;
  
  // Find the variant picker and select the recommended size
  const variantPicker = document.querySelector('variant-picker');
  if (variantPicker) {
    let sizeSelected = false;
    
    // Method 1: Look for exact match in all radio inputs
    const sizeInputs = variantPicker.querySelectorAll('input[type="radio"]');
    for (const input of sizeInputs) {
      if (input.value.toUpperCase() === recommendedSize.toUpperCase()) {
        input.checked = true;
        input.dispatchEvent(new Event('change', { bubbles: true }));
        sizeSelected = true;
        break;
      }
    }
    
    // Method 2: If no exact match, try to find the closest available size
    if (!sizeSelected) {
      const availableSizes = getAvailableSizes();
      if (availableSizes.length > 0) {
        // Find the closest size to recommendation
        const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
        const recIndex = sizeOrder.indexOf(recommendedSize);
        
        let closestSize = availableSizes[0];
        let closestDistance = Infinity;
        
        availableSizes.forEach(size => {
          const sizeIndex = sizeOrder.indexOf(size);
          const distance = Math.abs(sizeIndex - recIndex);
          if (distance < closestDistance) {
            closestDistance = distance;
            closestSize = size;
          }
        });
        
        // Select the closest available size
        for (const input of sizeInputs) {
          if (input.value.toUpperCase() === closestSize.toUpperCase()) {
            input.checked = true;
            input.dispatchEvent(new Event('change', { bubbles: true }));
            sizeSelected = true;
            break;
          }
        }
      }
    }
    
    // Method 3: Try using the variant picker's form submission
    if (!sizeSelected) {
      const form = variantPicker.querySelector('form');
      if (form) {
        // Try to trigger form change events
        const event = new Event('change', { bubbles: true });
        form.dispatchEvent(event);
      }
    }
  }
  
  // Close the modal
  closeSizingWidget();
  
  // Show success message
  if (sizeSelected) {
    showNotification(`Size ${recommendedSize} has been selected!`);
  } else {
    showNotification(`Size ${recommendedSize} recommended, but couldn't auto-select. Please select manually.`);
  }
}

function handleUnitChange() {
  const isImperial = document.querySelector('input[name="units"]:checked').value === 'imperial';
  const heightContainer = document.getElementById('height-input-container');
  const weightUnit = document.getElementById('weight-unit');
  
  if (isImperial) {
    // Show imperial inputs
    heightContainer.innerHTML = `
      <input type="number" id="height-feet" name="height-feet" placeholder="5" min="3" max="8" required>
      <span>ft</span>
      <input type="number" id="height-inches" name="height-inches" placeholder="10" min="0" max="11" required>
      <span>in</span>
    `;
    weightUnit.textContent = 'lbs';
    document.getElementById('weight').placeholder = '150';
  } else {
    // Show metric inputs
    heightContainer.innerHTML = `
      <input type="number" id="height" name="height" placeholder="175" min="120" max="220" required>
      <span>cm</span>
    `;
    weightUnit.textContent = 'kg';
    document.getElementById('weight').placeholder = '70';
  }
}

function showNotification(message) {
  // Create a simple notification
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #28a745;
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 4px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    z-index: 1001;
    font-size: 0.9rem;
  `;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  // Remove after 3 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 3000);
}

// Make functions globally available
window.openSizingWidget = openSizingWidget;
window.closeSizingWidget = closeSizingWidget;
window.nextStep = nextStep;
window.prevStep = prevStep;
window.getSizeRecommendation = getSizeRecommendation;
window.applySizeRecommendation = applySizeRecommendation;
