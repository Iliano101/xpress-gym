$(document).ready(function () {
    autofill();
    retrieveForm();
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



function fetchValidators(gymHtml) {

    gymHtml = gymHtml.replace(/<img[^>]*>/g, "");
    gymHtml = gymHtml.replace(/<link rel="icon"[^>]*>/g, "");
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


async function retrieveForm() {
    const URL = 'https://gym-form-proxy.onrender.com';

    try {
        const response = await axios.get(URL);
        if (response.status === 200) {
            //OK
            fetchValidators(response.data);
        }
    } catch (err) {
        console.log(err);
    }
}