const express = require('express');
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const { Client } = require('pg');
const userRoute = require("./routes/users");
const authRoute = require("./routes/auth");
const User = require("./models/user")


const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'sm',
    password: 'Siva#1207',
    port: 5433,
});

client.connect()
    .then(() => {
        console.log('Connected to PostgreSQL database');
        User.init(client); // Initialize User with client
    })
    .catch(err => console.error('Connection error', err.stack));

const app = express();

// Middleware setup
app.use(express.json());
app.use(helmet());
app.use(morgan('common'));

// Use routes
app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);

// Start the server
app.listen(8800, () => {
    console.log('Backend is running on port 8800');
});