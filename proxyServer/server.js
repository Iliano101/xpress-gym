import chalk from "chalk";
// Importe le gestionaire de routes
import app from "./src/app.js";

const PORT = 5000;

app.listen(PORT, err => {
    // Erreur
    if (err) {
        console.log(chalk.red.bold.underline(err));
        process.exit(1);
    }

    // Success
    console.log(chalk.blue.bold(`Serveur en fonction sur ${chalk.underline(`http://localhost:5000`)}`));
});