const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');

app.use(cookieParser());
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded());
app.set('view engine', 'ejs');

app.use(require('./app/routes/router'))

const PORT=8000;
app.listen(PORT, ()=>{
    console.log(`Listening on PORT = ${PORT}`);
})
