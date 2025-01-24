const express = require('express');

const app = express();
app.use(express.json());
app.use('/', require('./Routes/userRoutes'));

module.exports = app;