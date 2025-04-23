
const plusButton = document.getElementById('plus-button');
const minusButton = document.getElementById('minus-button');
const pinNumberDisplay = document.getElementById('pin-number');

var prevDisplayValue = pinNumberDisplay.value;

plusButton.addEventListener('click', function() {
    if (parseInt(pinNumberDisplay.value) < parseInt(pinNumberDisplay.max)) {
        pinNumberDisplay.value++;
        prevDisplayValue = pinNumberDisplay.value;
    }
});

minusButton.addEventListener('click', function() {
    if (parseInt(pinNumberDisplay.value) > parseInt(pinNumberDisplay.min)) {
        pinNumberDisplay.value--;
        prevDisplayValue = pinNumberDisplay.value;
    }
});

pinNumberDisplay.addEventListener('blur', function() {
    if (pinNumberDisplay.checkValidity()) {
        prevDisplayValue = pinNumberDisplay.value;
    }
    else {
        pinNumberDisplay.value = prevDisplayValue;
    }
});