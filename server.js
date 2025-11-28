
import app from './app.js';

const PORT = process.env.PORT || 5000;
// let PORT = 8080;

app.listen(PORT, () => {
    console.log(`app listening at http:localhost:${PORT}`);

});