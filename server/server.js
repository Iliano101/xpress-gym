import express from 'express';
import request from 'request';

const app = express();
const API_URL = 'https://www.ggpx.info/GuestReg.aspx?gymid=st-jerome' // Replace this URL with your own

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});

app.get('/', (req, res) => {
    request(
        { url: `${API_URL}` },
        (error, response, body) => {
            if (error || response.statusCode !== 200) {
                return res.status(500).contentType('html').end({ type: 'error', message: error.message });
            }

            res.contentType('html').status(200).end(body);
        }
    );
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`listening on ${PORT}`));