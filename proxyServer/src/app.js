// Importation du plugin principal
import express from "express";
import axios from "axios";

// Création de la variable principale
const app = express();

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
            res.contentType('html').status(200).end(response.data);
        }
    }
    catch (err) {
        console.log(err);
    }
}

// Pour utilisation dans serveur.js
export default app;