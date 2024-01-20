// #region Constants
const SERVICEWORKER_CACHE_NAME = "express-gym-v1";
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
    { id: "PromoCode", name: "Code VIP", type: "text", autocomplete: "off" },
    { id: "IDimage", name: "Pièce d'identité", type: "file", autocomplete: "image/*" }
];

const STORED_VALIDATORS_NAMES = {
    html: "gymHtml",
    date: "validatorsDate"
}

const GITHUB_API_URL = "https://api.github.com/repos/iliano101/xpress-gym/commits/vercel";
const CURRENT_VERSION_STORAGE_KEY = "currentVersion";

// #endregion

// #region Page Load
document.addEventListener("DOMContentLoaded", function () {
    checkForUpdates();
});

function executePageLoad() {
    registerServiceWorker();

    let formDataIsValid = true;
    for (let i = 0; i < INPUT_LIST.length; i++) {
        const input = INPUT_LIST[i];
        if (localStorage.getItem(`${input.id}Modal`) === null) {
            formDataIsValid = false;
        }
    }

    if (formDataIsValid) {
        autofill({ ...localStorage });
    }
    else {
        showDataModal();
    }

    retrieveForm();
}
// #endregion

// #region Service Worker
/**
 * Registers a service worker for the current page.
 * 
 * @returns {Promise} A promise that resolves when the service worker is successfully registered, or rejects with an error if registration fails.
 */
async function registerServiceWorker() {
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

// #region ID management

function addImageInputEventListener() {
    const input = document.getElementById("IDimageModal");
    if (input === undefined) {
        return;
    }

    input.addEventListener("change", (event) => {
        const fr = new FileReader();

        fr.readAsDataURL(input.files[0]);

        fr.addEventListener("load", () => {
            localStorage.setItem("IDimageModal", fr.result);
        });
    });
}

function showID() {
    const imageURL = localStorage.getItem("IDimageModal");
    if (imageURL === undefined) {
        return;
    }
    const container = document.getElementById("container");


    container.innerHTML = `
    <button onclick="location.reload()">Retour</button>
    <div id="image-content">
    <img src="${imageURL}" alt="Pièce d'indentité">
    </div>`;
}


// #endregion

// #region Automatic Updates
/**
 * Check for updates and update the application if a new version is available.
 *
 * @returns {Promise<void>} - A promise that resolves once the check for updates is complete.
 */
async function checkForUpdates() {
    const OK = 200;

    const currentVersion = localStorage.getItem(CURRENT_VERSION_STORAGE_KEY);

    try {
        const response = await axios.get(GITHUB_API_URL);
        if (response.status === OK && response.data !== null && response.data !== undefined) {
            const latestVersion = response.data.sha;
            if (currentVersion == null || currentVersion != latestVersion) {
                updateApplication(latestVersion);
                return;
            }
        }
    } catch (err) {
        console.error(err);
    }

    executePageLoad();
}

/**
 * Updates the application to a new version.
 * 
 * @param {string} newVersion - The new version of the application.
 * @returns {void}
 */
function updateApplication(newVersion) {
    unregisterServiceWorkers();
    caches.delete(SERVICEWORKER_CACHE_NAME);
    localStorage.setItem(CURRENT_VERSION_STORAGE_KEY, newVersion);
    location.reload();
}

/**
 * Unregisters all service workers.
 * 
 * This function checks if the browser supports service workers and then retrieves all active service worker registrations.
 * It iterates through each registration and unregisters the service worker.
 * 
 * @returns {void}
 */
function unregisterServiceWorkers() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(function (registrations) {
            for (const serviceWorker of registrations) {
                serviceWorker.unregister();
            }
        });
    }
}
// #endregion

// #region Autofill data management

/**
 * Displays a modal with input fields for showing data.
 * 
 * @returns {void}
 */
function showDataModal() {
    if (!confirm("L'information engegistrée est incomplète ou vide. Voulez-vous la compléter maintenant?")) {
        return;
    }

    const container = document.getElementById("container");
    container.innerHTML = ``;

    for (let i = 0; i < INPUT_LIST.length; i++) {
        const input = INPUT_LIST[i];

        if (input.type === "radio") {
            let html = `<tr><td>${input.name}</td><td>`;
            const options = input.autocomplete.split(":");

            for (let i = 0; i < options.length; i++) {
                const radioLabel = options[i];
                html += "<div>"
                html += `<input type="radio" class="user-input" id="${input.id}Modal${radioLabel}" name="${input.id}Modal" autocomplete="on" value="${radioLabel}" />`
                html += `<label  for="${input.id}Modal${radioLabel}">${radioLabel}</label>`
                html += "</div>"
            }
            html += "</td></tr>";
            container.innerHTML += html;
        }
        else if (input.type === "file") {
            container.innerHTML += `<tr><td><label for="${input.id}Modal">${input.name}</label></td><td><input type="${input.type}" class="user-input" id="${input.id}Modal" accept="${input.autocomplete}" change="saveID()" /></td></tr>`;
        }
        else {
            container.innerHTML += `<tr><td><label for="${input.id}Modal">${input.name}</label></td><td><input type="${input.type}" class="user-input"  id="${input.id}Modal" autocomplete="${input.autocomplete}" /></td></tr>`;
        }
    }
    container.innerHTML += `<button onclick="submitUserData()">Soumettre</button>`;

    addImageInputEventListener();
}

/**
 * Submits user data to local storage and autofills form fields.
 *
 * This function retrieves user input from form fields with the class 'user-input'. It maps each input element to an object with the input's id as the key and the input's value as the value. If the input is a radio button, it checks for the selected radio button and includes its value in the object. The user data is then stored in local storage using the input id as the key and the input value as the value.
 *
 * @returns {void}
 */
function submitUserData() {
    const userInfo = Array.from(document.querySelectorAll('.user-input')).map(input => {
        console.log(input);
        if (input.type == 'radio') {
            let checkedRadio = document.querySelector(`input[name="${input.name}"]:checked`);
            return { id: input.name, value: checkedRadio ? checkedRadio.value : "" };
        }
        else if (input.type !== 'file') {
            return { id: input.id, value: input.value };
        }
    });

    for (let i = 0; i < userInfo.length; i++) {
        const input = userInfo[i];
        if (input !== undefined) {
            localStorage.setItem(input.id, input.value);
        }
    }

    formInfo = { ...localStorage };
    location.reload();
}



/**
 * Autofills form fields with values from the provided formInfo object.
 * 
 * @param {Object} formInfo - The formInfo object containing the values to autofill.
 * @returns {void}
 */
function autofill(formInfo) {
    for (let i = 0; i < INPUT_LIST.length; i++) {
        const input = INPUT_LIST[i];
        const value = formInfo[`${input.id}Modal`];
        if (value !== undefined) {
            if (input.id === "Gender") {
                document.getElementById("GenderF").checked = value.toLowerCase() === 'f';
                document.getElementById("GenderM").checked = value.toLowerCase() === 'm';
            }
            else if (input.type !== "file") {
                document.getElementById(input.id).value = value;
            }
        }
    }
}

/**
 * Resets the user data by clearing the local storage and updating the application version to "UNDEFINED".
 * 
 * This function prompts the user with a confirmation message before proceeding with the data reset. If the user confirms,
 * the function clears the local storage using the `localStorage.clear()` method. It then calls the `updateApplication` function
 * with the argument "UNDEFINED" to update the application version. Finally, the function reloads the page using `location.reload()`.
 * 
 * @returns {void} This function does not return any value.
 */
function resetUserData() {
    if (!confirm("Attention, vous allez perdre toutes les données enregistrées.")) {
        return;
    }
    localStorage.clear();
    updateApplication("UNDEFINED");
}

// #endregion

// #region Validators

/**
 * Fetches validators from the given gym HTML and appends them to the "validations" element.
 * 
 * @param {string} gymHtml - The HTML content of the gym.
 * @param {string} bootstrapBackgroundColor - The background color class from Bootstrap framework (default: "bg-primary").
 * @param {string} bootstrapTextColor - The text color class from Bootstrap framework (default: "text-white").
 * @returns {void}
 */
function fetchValidators(gymHtml) {
    gymHtml = gymHtml.replace(/<img[^>]*>/g, "");
    gymHtml = gymHtml.replace(/<link rel="icon"[^>]*>/g, "");

    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(gymHtml, 'text/html');
    const validators = [...htmlDoc.querySelectorAll("[type='hidden']")];

    const fragment = document.createDocumentFragment();

    for (let i = 0; i < validators.length; i++) {
        fragment.appendChild(validators[i].cloneNode(true));
    }

    document.getElementById("validations").appendChild(fragment);

    const btnSubmit = document.getElementById("submit-button");

    btnSubmit.disabled = false;
    btnSubmit.innerText = "Soumettre";
}

/**
 * Retrieves the form data from the specified URL and updates the validators if necessary.
 * 
 * @returns {Promise} A promise that resolves when the form data is retrieved and the validators are updated.
 */
async function retrieveForm() {
    const URL = 'https://api.scraperapi.com/?api_key=a96e06b1a1dac98df481e1fa570fd17a&url=https%3A%2F%2Fwww.ggpx.info%2FGuestReg.aspx%3Fgymid%3Dst-jerome';

    cachedHTML = localStorage.getItem(STORED_VALIDATORS_NAMES.html);
    cachedDateString = localStorage.getItem(STORED_VALIDATORS_NAMES.date);

    let now = new Date();

    if (cachedHTML === null || cachedDateString === null || !areSameDay(new Date(cachedDateString), now)) {
        try {
            const response = await axios.get(URL);
            if (response.status === 200 && response.data !== null && response.data !== undefined) {
                //OK
                localStorage.setItem(STORED_VALIDATORS_NAMES.html, response.data);
                now = new Date();
                localStorage.setItem(STORED_VALIDATORS_NAMES.date, `${now.getMonth() + 1}-${now.getDate()}-${now.getFullYear()}`);
                fetchValidators(response.data);
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