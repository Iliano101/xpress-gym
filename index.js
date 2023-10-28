const SERVICE_URL = "https://www.ggpx.info/GuestReg.aspx?gymid=st-jerome";
// Quand le document est prêt
$(document).ready(() => {
    getHiddenInputs();
});

async function getHiddenInputs() {
    try {
        const response = await axios.get(SERVICE_URL);
        if (response.status === 200) {
            //OK
            const html = response.data;
            const validators = $(html).find(".aspNetHidden");
            for (let index = 0; index < validators.length; index++) {
                const validator = validators[index];
                $("#validations").append(validator);
            }
        }
    } catch (err) {
        console.log(err);
    }
}