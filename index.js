document.addEventListener("DOMContentLoaded", function () {
    autofill();
    retrieveForm();
});


function autofill() {
    const params = new URLSearchParams(window.location.search);
    for (const [name, value] of params) {
        if (name.toLowerCase() === "gender") {
            const genderM = document.getElementById("GenderM");
            const genderF = document.getElementById("GenderF");
            genderF.checked = value.toLowerCase() === 'f';
            genderM.checked = !genderF.checked;
        } else {
            const inputField = document.getElementById(name);
            if (inputField) {
                inputField.value = value;
            }
        }
    }
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

    // Add validators to the form
    const validationContainer = document.getElementById("validations");
    validators.forEach((element) => {
        validationContainer.appendChild(element.cloneNode(true));
    });

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