const INPUT_LIST = [
    "Email",
    "FirstName",
    "LastName",
    "YearOfBirth",
    "Gender",
    "StreetAddress",
    "Appartment",
    "City",
    "StateProv",
    "PostalCode",
    "PhoneMobile",
    "PromoCode"
];

/**
 * Initializes the document by calling the autofill and retrieveForm functions.
 */
document.addEventListener("DOMContentLoaded", function () {
    registerSW();

    let formInfo = { ...localStorage };
    if (Object.keys(formInfo).length != INPUT_LIST.length) {
        const myModal = new bootstrap.Modal(document.getElementById('infoModal'), {});
        myModal.show();

        // TODO : Ask for the user's information and store it
        localStorage.setItem("Email", "iliandelagrange@gmail.com");
        localStorage.setItem("FirstName", "Ilian");
        localStorage.setItem("LastName", "Delagrange");
        localStorage.setItem("Gender", "M");


        formInfo = { ...localStorage };
    }

    autofill(formInfo);
    retrieveForm();
});

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

/**
 * Function to autofill form fields based on URL parameters.
 * 
 * @returns {void} This function does not return anything.
 */
function autofill(formInfo) {
    INPUT_LIST.forEach((input) => {
        const value = formInfo[input];
        if (value !== undefined) {
            if (input === "Gender") {
                document.getElementById("GenderF").checked = value.toLowerCase() === 'f';
                document.getElementById("GenderM").checked = value.toLowerCase() === 'm';
            }
            else {
                document.getElementById(input).value = value;
            }
        }
    });


}

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