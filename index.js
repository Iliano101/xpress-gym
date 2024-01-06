document.addEventListener("DOMContentLoaded", function () {
    autofill();
    retrieveForm();
});

document.querySelector('#file-input').addEventListener('change', function () {
    let file = this.files[0];

    if (file) {
        let imgUrl = URL.createObjectURL(file);
        getImageText(imgUrl);
    }
});

/**
 * Function to autofill form fields based on URL parameters.
 * 
 * @returns {void} This function does not return anything.
 */
function autofill() {
    const params = new URLSearchParams(window.location.search);
    for (const [name, value] of params) {
        switch (name.toLowerCase()) {
            case "gender":
                document.getElementById("GenderF").checked = value.toLowerCase() === 'f';
                document.getElementById("GenderM").checked = value.toLowerCase() === 'm';
                break;
            default:
                const inputField = document.getElementById(name);
                if (inputField) {
                    inputField.value = value;
                }
                break;
        }
    }
}

/**
 * Fetches validators from the provided HTML string and appends them to the form.
 * 
 * @param {string} gymHtml - The HTML string containing the validators.
 * @returns {void}
 */
function fetchValidators(gymHtml) {
    // Remove images and favicon to avoid 404 errors
    gymHtml = gymHtml.replace(/<img[^>]*>|<link rel="icon"[^>]*>/g, "");

    // Convert HTML string to DOM object to be able to query it
    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(gymHtml, 'text/html');
    // Get all the validators
    const validators = [...htmlDoc.querySelectorAll("[type='hidden']")];

    // Create a document fragment to hold the validators
    const fragment = document.createDocumentFragment();
    // Add validators to the fragment
    validators.forEach((element) => {
        fragment.appendChild(element.cloneNode(true));
    });

    // Append the fragment to the form
    document.getElementById("validations").appendChild(fragment);

    // Enable submit button
    const btnSubmit = document.getElementById("btnSubmit");

    btnSubmit.disabled = false;

    document.getElementById("load").style.display = 'none';
    document.getElementById("message").textContent = "Soumettre";
    btnSubmit.classList.replace("btn-danger", "btn-primary");
}


/**
 * Append the fragment to the form
 * Enable the submit button
 * Hide the loading element
 * Update the message text
 * Replace the CSS class of the submit button
 */
async function retrieveForm() {
    const URL = 'https://api.scraperapi.com/?api_key=a96e06b1a1dac98df481e1fa570fd17a&url=https%3A%2F%2Fwww.ggpx.info%2FGuestReg.aspx%3Fgymid%3Dst-jerome';

    try {
        const response = await axios.get(URL);
        if (response.status === 200 && response.data) {
            fetchValidators(response.data);
        }
    } catch (err) {
        console.log(err);
    }
}

/** 
 * WIP
 * Retrieves the text from an image and sets it as the value of the "RegCode" element.
 * 
 * @param {string} imageLink - The link to the image.
 * @returns {void}
 */
function getImageText(imageLink) {
    Tesseract.recognize(
        imageLink,
        'eng').then(({ data: { text } }) => {
            // Removes all spaces from the text and converts it to uppercase and gets the first 6 characters

            text = text.replace(/\s/g, '').toUpperCase().substring(0, 6);
            // Sets the "RegCode" to the text from the image
            document.getElementById("RegCode").value = text;
        });
}
