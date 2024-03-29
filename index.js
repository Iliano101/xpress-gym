// #region Constants
const SERVICEWORKER_CACHE_NAME = "express-gym-v1";
const INPUT_LIST = [
    { id: "Email", name: "Email", type: "email", autocomplete: "email" },
    {
        id: "FirstName",
        name: "Prénom",
        type: "text",
        autocomplete: "given-name",
    },
    { id: "LastName", name: "Nom", type: "text", autocomplete: "family-name" },
    {
        id: "YearOfBirth",
        name: "Année de naissance",
        type: "number",
        autocomplete: "bday-year",
    },
    { id: "Gender", name: "Sexe", type: "radio", autocomplete: "M:F" },
    {
        id: "StreetAddress",
        name: "Adresse",
        type: "text",
        autocomplete: "street-address",
    },
    {
        id: "Appartment",
        name: "Appartement",
        type: "text",
        autocomplete: "address-line2",
    },
    { id: "City", name: "Ville", type: "text", autocomplete: "address-level2" },
    {
        id: "StateProv",
        name: "Province",
        type: "text",
        autocomplete: "address-level1",
    },
    {
        id: "PostalCode",
        name: "Code postal",
        type: "text",
        autocomplete: "postal-code",
    },
    {
        id: "PhoneMobile",
        name: "Téléphone mobile",
        type: "tel",
        autocomplete: "tel",
    },
    { id: "PromoCode", name: "Code VIP", type: "text", autocomplete: "off" },
    {
        id: "IDimage",
        name: "Pièce d'identité",
        type: "file",
        autocomplete: "image/*",
    },
];

const STORED_VALIDATORS_NAMES = {
    htmlArray: "validatorsHtml",
    date: "validatorsDate",
};

const PROXY_URL = "https://http-agent.vercel.app/world-gym";
//const PROXY_URL = "http://localhost:5000/world-gym";
const GITHUB_API_URL =
    "https://api.github.com/repos/iliano101/xpress-gym/commits/vercel";
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

    autofill({ ...localStorage });
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
    if ("serviceWorker" in navigator) {
        try {
            await navigator.serviceWorker.register("./sw.js");
        } catch (err) {
            err;
            showUserError(err, `SW registration failed`);
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
        if (input.files !== 0) {
            const fr = new FileReader();
            fr.readAsDataURL(input.files[0]);

            fr.addEventListener("load", () => {
                localStorage.setItem("IDimageModal", fr.result);
            });
        }
    });
}

function showID() {
    const imageURL = localStorage.getItem("IDimageModal");
    if (imageURL === undefined) {
        return;
    }
    const container = document.getElementById("container");

    container.innerHTML = `
    <div id="content" class="id-div">
    <button id="return-button" onclick="location.reload()">Retour</button>
    <img id="id-image" src="${imageURL}" alt="Pièce d'indentité">
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
        if (
            response.status === OK &&
            response.data !== null &&
            response.data !== undefined
        ) {
            const latestVersion = response.data.sha;
            if (currentVersion == null || currentVersion != latestVersion) {
                updateApplication(latestVersion);
                return;
            }
        }
    } catch (err) {
        showUserError(err, "Failed to check for updates on GitHub");
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
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker
            .getRegistrations()
            .then(function (registrations) {
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
function getUserData() {
    const container = document.getElementById("container");
    container.innerHTML = ``;

    let newHtml =
        '<div id="content-data-page"><h1 id="title-data">Entrez vos informations</h1><div id="input-container">';

    for (let i = 0; i < INPUT_LIST.length; i++) {
        const input = INPUT_LIST[i];
        let currentLocalStorageValue = localStorage.getItem(`${input.id}Modal`);
        if (currentLocalStorageValue === null) {
            currentLocalStorageValue = "";
        }
        if (input.type === "radio") {
            newHtml += `<div class="row-container"><span class="input-label">${input.name}</span>`;
            const options = input.autocomplete.split(":");

            newHtml += "<div class='radio-input-container'>";
            for (let i = 0; i < options.length; i++) {
                const radioLabel = options[i];
                newHtml += "<div class='single-choice-div'>";
                newHtml += `<input type="radio" class="user-input radio-input" id="${
                    input.id
                }Modal${radioLabel}" name="${
                    input.id
                }Modal" autocomplete="on" value="${radioLabel}" ${
                    radioLabel === currentLocalStorageValue ? "checked" : ""
                }>`;
                newHtml += `<label class="radio-label" for="${input.id}Modal${radioLabel}">${radioLabel}</label>`;
                newHtml += "</div>";
            }
            newHtml += "</div></div>";
        } else if (input.type === "file") {
            newHtml += `<div class="row-container"><label class="input-label" for="${input.id}Modal">${input.name}</label><label class="file-input">Choisir une photo<input type="${input.type}" class="user-input hidden" id="${input.id}Modal" accept="${input.autocomplete}" change="saveID()"/></label></div>`;
        } else {
            newHtml += `<div class="row-container"><label class="input-label" for="${input.id}Modal">${input.name}</label><input type="${input.type}" class="user-input data-input"  id="${input.id}Modal" value="${currentLocalStorageValue}" autocomplete="${input.autocomplete}"/></div>`;
        }
    }
    newHtml += `</div><button id="save-button" onclick="submitUserData()">Enregistrer</button></div>`;

    container.innerHTML = newHtml;
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
    const userInfo = Array.from(document.querySelectorAll(".user-input")).map(
        (input) => {
            if (input.type == "radio") {
                let checkedRadio = document.querySelector(
                    `input[name="${input.name}"]:checked`
                );
                return {
                    id: input.name,
                    value: checkedRadio ? checkedRadio.value : "",
                };
            } else if (input.type !== "file") {
                return { id: input.id, value: input.value };
            }
        }
    );

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
                document.getElementById("GenderF").checked =
                    value.toLowerCase() === "f";
                document.getElementById("GenderM").checked =
                    value.toLowerCase() === "m";
            } else if (input.type !== "file") {
                document.getElementById(input.id).value = value;
            }
        }
    }
}

// #endregion

// #region Validators

/**
 * Retrieves the validators from the provided HTML and appends them to the "validations" element.
 *
 * @param {string} gymHtml - The HTML containing the validators.
 * @returns {void}
 */
function appendValidators(validatorsArray) {
    const validatorDiv = document.getElementById("validations");

    for (let i = 0; i < validatorsArray.length; i++) {
        const validator = validatorsArray[i];
        validatorDiv.insertAdjacentHTML("beforeend", validator);
    }

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
    let cachedValidatorsArray;
    let cacheParsed = false;

    try {
        cachedValidatorsArray = JSON.parse(
            localStorage.getItem(STORED_VALIDATORS_NAMES.htmlArray)
        );
        cacheParsed = true;
    } catch (error) {
        showUserError(err, "Failed to parse cached validators");
    }

    cachedDateString = localStorage.getItem(STORED_VALIDATORS_NAMES.date);

    let now = new Date();

    if (
        !cacheParsed ||
        cachedValidatorsArray === null ||
        cachedDateString === null ||
        !areSameDay(new Date(cachedDateString), now)
    ) {
        try {
            const response = await axios.get(PROXY_URL);
            if (
                response.status === 200 &&
                response.data !== null &&
                response.data !== undefined
            ) {
                //OK
                localStorage.setItem(
                    STORED_VALIDATORS_NAMES.htmlArray,
                    JSON.stringify(response.data.data.inputs)
                );
                now = new Date();
                localStorage.setItem(
                    STORED_VALIDATORS_NAMES.date,
                    `${
                        now.getMonth() + 1
                    }-${now.getDate()}-${now.getFullYear()}`
                );
                appendValidators(response.data.data.inputs);
            }
        } catch (err) {
            showUserError(
                err,
                "Failed to retrieve data from the proxy server."
            );
        }
    } else {
        appendValidators(cachedValidatorsArray);
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
    return (
        date1.getDate() === date2.getDate() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getFullYear() === date2.getFullYear()
    );
}

// #endregion

// #region Utils

function showUserError(err, userMessage) {
    const errorObjet = {
        status: err.response.status ? err.response.status : "No status",
        errorMessage: err.response.data ? err.response.data : err.message,
        userMessage: userMessage,
    };
    console.error(errorObjet);
}
//#endregion
