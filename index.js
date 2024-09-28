const express = require('express');
const app = express();
const path = require('path')
const dotenv = require("dotenv");
const otherRoutes = require("./routes/otherRoutes")
const authRoutes = require("./routes/authRoutes")
require('./config/config');
dotenv.config();

const PORT  = process.env.PORT || 5000 ;

app.use(express.json());
app.use(express.urlencoded({extended: true}));


global.configDB()


app.get('/', (req, res) => {
    /* The line `res.sendFile(path.join(process.cwd(), 'README.md'));` is sending the file `README.md`
    as a response when a GET request is made to the root route `/`. */
    res.sendFile(path.join(process.cwd(), 'api-docs.html'));
})

app.use('/api/v1',otherRoutes);
app.use('/api/v1',authRoutes);

//listen to the port
app.listen(PORT, ()=> {
console.log(`listening to port ${PORT}`);
})