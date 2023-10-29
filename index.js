$(document).ready(function () {
    fetchValidators();
});

async function fetchValidators() {
    const url = 'http://localhost:5000';

    const response = await fetch(url);

    const gymHtml = await response.text();

    const validators = $(gymHtml).find("[type='hidden']");
    for (let index = 0; index < validators.length; index++) {
        const v = validators[index].outerHTML;
        $("#validations").append(v)
    }
}