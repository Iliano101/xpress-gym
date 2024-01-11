// List of input fields to autofill
const INPUT_LIST = [

    { id: "Email", name: "Email", type: "email", autocomplete: "email" },
    { id: "FirstName", name: "Prénom", type: "text", autocomplete: "given-name" },
    { id: "LastName", name: "Nom", type: "text", autocomplete: "family-name" },
    { id: "YearOfBirth", name: "Année de naissance", type: "number", autocomplete: "bday-year" },
    { id: "Gender", name: "Sexe", type: "text", autocomplete: "sex" },
    { id: "StreetAddress", name: "Adresse", type: "text", autocomplete: "street-address" },
    { id: "Appartment", name: "Appartement", type: "number", autocomplete: "address-line2" },
    { id: "City", name: "Ville", type: "text", autocomplete: "address-level2" },
    { id: "StateProv", name: "Province", type: "text", autocomplete: "address-level1" },
    { id: "PostalCode", name: "Code postal", type: "text", autocomplete: "postal-code" },
    { id: "PhoneMobile", name: "Téléphone mobile", type: "tel", autocomplete: "tel" },
    { id: "PromoCode", name: "Code VIP", type: "text", autocomplete: "off" }

];

/**
 * Initializes the document by calling the autofill and retrieveForm functions.
 */
document.addEventListener("DOMContentLoaded", function () {
    registerSW();

    let formInfo = { ...localStorage };
    if (Object.keys(formInfo).length != INPUT_LIST.length) {
        const myModal = new bootstrap.Modal(document.getElementById('infoModal'), {});

        INPUT_LIST.forEach((input) => {
            document.getElementById("infoTable").innerHTML += `<tr><td>${input.name}</td><td><input type="${input.type}" id="${input.id}" autocomplete="${input.autocomplete}" class="form-control user-input" /></td></tr>`;
        });
        myModal.show();
    }

    autofill(formInfo);
    retrieveForm();
});

// #region Autofill data management
function submitUserData() {
    const userInfo = Array.from(document.querySelectorAll('.user-input'))
        .map(input => ({ id: input.id, value: input.value }));

    userInfo.forEach((input) => {
        // write to local storage
        localStorage.setItem(input.id, input.value);
    });

    formInfo = { ...localStorage };
    autofill(formInfo);
}



/**
 * Function to autofill form fields based on URL parameters.
 * 
 * @returns {void} This function does not return anything.
 */
function autofill(formInfo) {
    INPUT_LIST.forEach((input) => {
        const value = formInfo[input.id];
        if (value !== undefined) {
            if (input.id === "Gender") {
                document.getElementById("GenderF").checked = value.toLowerCase() === 'f';
                document.getElementById("GenderM").checked = value.toLowerCase() === 'm';
            }
            else {
                document.getElementById(input.id).value = value;
            }
        }
    });


}

function resetUserData() {
    if (!confirm("Attention, vous allez perdre toutes les données enregistrées.")) {
        return;
    }

    localStorage.clear();
    location.reload();
}

// #endregion

// #region Service Worker
async function registerSW() {
    if ('serviceWorker' in navigator) {
        try {
            await navigator.serviceWorker.register('./sw.js');
        }
        catch (err) {
            console.log(`SW registration failed`);
        }
    }
}
// #endregion

// #region Validators


/**
 * Submits user data and stores it in local storage.
 * 
 * This function retrieves the values from the input fields with the class 'user-input' and maps them to an array of objects containing the id and value of each input field. 
 * It then iterates over each input object and stores the id-value pair in the local storage using the localStorage.setItem() method.
 * 
 * @returns {void}
 */
function fetchValidators(gymHtml) {
    // Remove images and favicon to avoid 404 errors
    gymHtml = gymHtml.replace(/<img[^>]*>/g, "");
    gymHtml = gymHtml.replace(/<link rel="icon"[^>]*>/g, "");

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
 * Retrieves the form data from a specified URL and calls the fetchValidators function.
 * 
 * @returns {Promise} A promise that resolves when the form data is successfully retrieved and the fetchValidators function is called.
 * @throws {Error} If there is an error retrieving the form data.
 */
async function retrieveForm() {
    const URL = 'https://api.scraperapi.com/?api_key=a96e06b1a1dac98df481e1fa570fd17a&url=https%3A%2F%2Fwww.ggpx.info%2FGuestReg.aspx%3Fgymid%3Dst-jerome';

    try {
        const response = await axios.get(URL);
        if (response.status === 200 && response.data !== null && response.data !== undefined) {
            //OK
            fetchValidators(response.data);
        }
    } catch (err) {
        console.log(err);
    }
}

// #endregion