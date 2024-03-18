require('dotenv').config();
const serverless = require('serverless-http');
const connectToDtabase = require("./db");
const express = require('express');
const cors = require('cors');
const port = process.env.PORT;

connectToDtabase();
const app = express();


// middle-Ware
app.use(express.json());
app.use(cors());

//Available Routes
app.use('/.netlify/functions/server/api/auth/user', require('./routes/auth'));
app.use('/.netlify/functions/server/api/tweet', require('./routes/tweet'));
app.use('/.netlify/functions/server/api/user', require('./routes/users'));
app.use('/.netlify/functions/server/api/retweet', require('./routes/retweet'));




// Connect to the server
app.listen(port, () => {
    console.log(`Server is running at port ${port}`);
});

module.exports.handler = serverless(app);