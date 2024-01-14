// List of input fields to autofill
const SW_CACHE_NAME = "express-gym-v1";
const INPUT_LIST = [

    { id: "Email", name: "Email", type: "email", autocomplete: "email" },
    { id: "FirstName", name: "Prénom", type: "text", autocomplete: "given-name" },
    { id: "LastName", name: "Nom", type: "text", autocomplete: "family-name" },
    { id: "YearOfBirth", name: "Année de naissance", type: "number", autocomplete: "bday-year" },
    { id: "Gender", name: "Sexe", type: "radio", autocomplete: "M:F" },
    { id: "StreetAddress", name: "Adresse", type: "text", autocomplete: "street-address" },
    { id: "Appartment", name: "Appartement", type: "number", autocomplete: "address-line2" },
    { id: "City", name: "Ville", type: "text", autocomplete: "address-level2" },
    { id: "StateProv", name: "Province", type: "text", autocomplete: "address-level1" },
    { id: "PostalCode", name: "Code postal", type: "text", autocomplete: "postal-code" },
    { id: "PhoneMobile", name: "Téléphone mobile", type: "tel", autocomplete: "tel" },
    { id: "PromoCode", name: "Code VIP", type: "text", autocomplete: "off" }

];

const STORED_VALIDATORS_NAMES = {
    html: "gymHtml",
    date: "validatorsDate"
}

const GITHUB_API_URL = "https://api.github.com/repos/iliano101/xpress-gym/commits/vercel";
const CURRENT_VERSION_STORAGE_KEY = "currentVersion";


/**
 * Initializes the document by calling the autofill and retrieveForm functions.
 */
document.addEventListener("DOMContentLoaded", function () {
    registerSW();

    let formDataIsValid = true;
    INPUT_LIST.forEach(input => {
        if (localStorage.getItem(`${input.id}Modal`) === null) {
            console.log(`${input.id}Modal is not valid`);
            formDataIsValid = false;
        }
    });

    if (formDataIsValid) {
        autofill({ ...localStorage });
    }
    else {
        showDataModal();
    }


    retrieveForm();
    checkForUpdates();
});

// #region Auto update

/**
 * Check for updates and reset cache if a new version is available.
 *
 * @returns {Promise<void>} - A promise that resolves once the cache is reset.
 */
async function checkForUpdates() {
    const currentVersion = localStorage.getItem(CURRENT_VERSION_STORAGE_KEY);

    try {
        const response = await axios.get(GITHUB_API_URL);
        if (response.status === 200 && response.data !== null && response.data !== undefined) {
            //OK
            const latestVersion = response.data.sha;
            if (currentVersion == null || currentVersion != latestVersion) {
                resetCache(latestVersion);
            }
        }
    } catch (err) {
        console.error(err);
    }


}

/**
 * Resets the cache by unregistering the service worker and deleting the cache.
 * 
 * @returns {void}
 */
function resetCache(newVersion) {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(function (registrations) {
            for (const registration of registrations) {
                // unregister service worker
                registration.unregister();
            }
        });
    }

    caches.delete(SW_CACHE_NAME);
    localStorage.setItem(CURRENT_VERSION_STORAGE_KEY, newVersion);
    location.reload();
}

//#endregion

// #region Autofill data management

/**
 * Displays a modal with a form for showing data.
 *
 * @function showDataModal
 * @returns {void}
 */
function showDataModal() {
    const myModal = new bootstrap.Modal(document.getElementById('infoModal'), {});

    INPUT_LIST.forEach((input) => {

        if (input.type === "radio") {
            let html = `<tr><td>${input.name}</td><td>`;
            input.autocomplete.split(":").forEach(radioLabel => {
                html += "<div class='d-flex align-items-center'>"
                html += `<input type="radio" id="${input.id}Modal${radioLabel}" name="${input.id}Modal" autocomplete="on" class="form-check-input large-text user-input" value="${radioLabel}" />`
                html += `<label class="form-check-label mx-2 mt-1" for="${input.id}Modal${radioLabel}">${radioLabel}</label>`
                html += "</div>"
            });
            html += "</td></tr>";
            document.getElementById("infoTable").innerHTML += html;
        }
        else {
            document.getElementById("infoTable").innerHTML += `<tr><td><label class="form-check-label" for="${input.id}Modal">${input.name}</label></td><td><input type="${input.type}" id="${input.id}Modal" autocomplete="${input.autocomplete}" class="form-control user-input" /></td></tr>`;
        }
    });

    myModal.show();
}

/**
 * Submits user data to local storage and autofills the form with the stored data.
 *
 * @returns {void}
 */
function submitUserData() {
    const userInfo = Array.from(document.querySelectorAll('.user-input'))
        .map(input => {
            if (input.type == 'radio') {
                // If the input is a radio button, get the value of the checked radio button
                console.log("Its a radio button");
                console.log(input.name);
                let checkedRadio = document.querySelector(`input[name="${input.name}"]:checked`);
                return { id: input.name, value: checkedRadio ? checkedRadio.value : "" };
            } else {
                // Otherwise, get the id and value of the input
                return { id: input.id, value: input.value };
            }
        });

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
        const value = formInfo[`${input.id}Modal`];
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

/**
 * Displays a modal with a form for showing data.
 * 
 * This function creates a Bootstrap modal and populates it with a form. The form contains input fields based on the INPUT_LIST array. For each input in the array, a table row is created in the modal form. If the input type is "radio", multiple radio buttons are created for the input. Otherwise, a single input field is created.
 * 
 * @returns {void}
 */
function resetUserData() {
    if (!confirm("Attention, vous allez perdre toutes les données enregistrées.")) {
        return;
    }

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(function (registrations) {
            for (const registration of registrations) {
                // unregister service worker
                registration.unregister();
            }
        });
    }

    caches.delete(SW_CACHE_NAME);
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
            console.error(`SW registration failed`);
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
function fetchValidators(gymHtml, bootstrapBackgroundColor = "bg-primary", bootstrapTextColor = "text-white") {
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
    btnSubmit.classList.replace("btn-danger", bootstrapBackgroundColor);
    btnSubmit.classList.replace("text-light", bootstrapTextColor);
}

/**
 * Retrieves the form data from a specified URL and calls the fetchValidators function.
 * 
 * @returns {Promise} A promise that resolves when the form data is successfully retrieved and the fetchValidators function is called.
 * @throws {Error} If there is an error retrieving the form data.
 */
async function retrieveForm() {
    const URL = 'https://api.scraperapi.com/?api_key=a96e06b1a1dac98df481e1fa570fd17a&url=https%3A%2F%2Fwww.ggpx.info%2FGuestReg.aspx%3Fgymid%3Dst-jerome';

    cachedHTML = localStorage.getItem(STORED_VALIDATORS_NAMES.html);
    cachedDate = localStorage.getItem(STORED_VALIDATORS_NAMES.date);

    if (cachedHTML === null || cachedDate === null || !areSameDay(new Date(cachedDate), new Date())) {
        try {
            const response = await axios.get(URL);
            if (response.status === 200 && response.data !== null && response.data !== undefined) {
                //OK
                localStorage.setItem(STORED_VALIDATORS_NAMES.html, response.data);
                const dateNow = new Date();
                localStorage.setItem(STORED_VALIDATORS_NAMES.date, `${dateNow.getMonth() + 1}-${dateNow.getDate()}-${dateNow.getFullYear()}`);
                fetchValidators(response.data, "bg-success", "text-light");
            }
        } catch (err) {
            console.error(err);
        }
    }
    else {
        fetchValidators(cachedHTML);
    }

}

/**
 * Determines if two dates are the same day.
 *
 * @param {Date} date1 - The first date.
 * @param {Date} date2 - The second date.
 * @returns {boolean} - True if the dates are the same day, false otherwise.
 */
function areSameDay(date1, date2) {
    return date1.getDate() === date2.getDate() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getFullYear() === date2.getFullYear();
}

// #endregion