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



function fetchValidators(validators) {
    const validatorList = validators.inputs;

    for (let index = 0; index < validatorList.length; index++) {
        const v = validatorList[index];
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
    // const URL = 'http://localhost:5000';

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