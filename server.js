// http requests
// res.sendStatus(200);
// equivalent to res.status(200).send('OK') res.sendStatus(403);
// equivalent to res.status(403).send('Forbidden') res.sendStatus(404);
// equivalent to res.status(404).send('Not Found') res.sendStatus(500);
// equivalent to res.status(500).send('Internal Server Error')

require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const cors = require('cors');
const corsOptions = require('./config/corsOptions')
const { logger } = require('./middleware/logEvents');
const errorHandler = require('./middleware/errorHandler');
const verifyJWT = require('./middleware/verifyJWT');
const cookieParser = require('cookie-parser');
const credentials = require('./middleware/credentials');
const mongoose = require('mongoose');
const connectDB = require('./config/dbConn');
const PORT = process.env.PORT || 3500;

// Connect to MongoDB
connectDB();

// custom middleware logger
app.use(logger);

// Handle options credentials check - before CORS!
// and fetch cookies credentials requirement
app.use(credentials);

// Cross Origin resource Sharing
app.use(cors(corsOptions));

// Built-in middleware to handle url encoded data
// in other words, form data:
// 'Content-type: application/x-www-form-urlencoded'
app.use(express.urlencoded({ extended: false }));


// Built-in middleware for json
app.use(express.json());


//middleware for cookies
app.use(cookieParser());


// Serve static files
app.use('/public', express.static(path.join(__dirname, 'public')));


// Routes
app.use('/', require('./routes/root'));
app.use('/register', require('./routes/register'));
app.use('/auth', require('./routes/api/auth'));
app.use('/refresh', require('./routes/api/refresh'));
app.use('/logout', require('./routes/api/logout'));

app.use(verifyJWT);
app.use('/employees', require('./routes/api/employees'));


// app.use('*/') does not accept regex and is used for middleware 
// And
// 'app.all('')' which is used for routing and it'll apply to all http methods at once
app.all('*', (req, res) => {
    res.status(404);
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'));
    } else if (req.accepts('json')) {
        res.json({error: '404 not found'});
    } else {
        res.type('txt').send('404 not found');
    }
});


app.use(errorHandler);

mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`server running on port: ${PORT}`));
});
