$(document).ready(function () {
    autofill();
    fetchValidators();
});

function autofill() {
    const params = new URL(window.location.href).searchParams

    params.forEach((x, y) => {
        if (y === "Gender") {
            if (x === "M") {

                $(`#GenderM`).prop('checked', true);
                $(`#GenderF`).prop('checked', false);
            }
            else {
                $(`#GenderF`).prop('checked', true);
                $(`#GenderM`).prop('checked', false);

            }
        }
        else {
            $(`#${y}`).val(x);
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


    $("#load").hide();
    $("#message").html("Soumettre")
    $("#btnSubmit").attr("disabled", false)
    $("#btnSubmit").removeClass("btn-danger");
    $("#btnSubmit").addClass("btn-primary");
}