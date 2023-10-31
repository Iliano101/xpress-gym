$(document).ready(function () {
    autofill();
    fetchValidators();
});

function autofill() {
    const params = new URL(window.location.href).searchParams
    console.log(params);

    params.forEach((x, y) => {
        if (y === "Gender") {
            if (x === "M") {

                document.getElementById("GenderM").checked = true;
                document.getElementById("GenderF").checked = false;
            }
            else {
                document.getElementById("GenderF").checked = true;
                document.getElementById("GenderM").checked = false;

            }
        }
        else {
            document.getElementById(y).value = x
        }

    });

}


async function fetchValidators() {
    const url = 'https://gym-form-proxy.onrender.com';

    const response = await fetch(url);

    const gymHtml = await response.text();

    const validators = $(gymHtml).find("[type='hidden']");
    for (let index = 0; index < validators.length; index++) {
        const v = validators[index].outerHTML;
        $("#validations").append(v)
    }
}