// Importation du plugin principal
import express from "express";
import axios from "axios";
import { JSDOM } from "jsdom";

// Création de la variable principale
const app = express();
app.use(express.json());

const API_URL = 'https://www.ggpx.info/GuestReg.aspx?gymid=st-jerome';

// Middleware pour CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});

// Routes dans le fichier
app.get("/", (req, res) => {
    getGym(req, res);
});

async function getGym(req, res) {
    try {
        const response = await axios.get(API_URL);
        if (response.status === 200) {
            res.status(200).json(filterValidators(response.data));
        }
    }
    catch (err) {
        console.log(err);
    }
}

function filterValidators(gymHtml) {
    const dom = new JSDOM(gymHtml);

    const validators = {
        inputs: []
    };

    const validatorsHTML = dom.window.document.querySelectorAll('input[type="hidden"]');
    validatorsHTML.forEach(input => {
        validators.inputs.push(input.outerHTML);
    });

    return validators;
}

// Pour utilisation dans serveur.js
export default app;