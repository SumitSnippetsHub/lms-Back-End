
import app from './app.js';
import connectionToDB from './config/dbConnection.js';

const PORT = process.env.PORT || 5000;
// let PORT = 8080;

app.listen(PORT, async () => {
    await connectionToDB();
    console.log(`app listening at http:localhost:${PORT}`);

});