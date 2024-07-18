const express = require("express");
const router = express.Router();
const User = require('../models/user');
const {Client} = require('pg')
const bcrypt = require('bcrypt')

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'sm',
    password: 'Siva#1207',
    port: 5433,
});

client.connect()


router.get('/', (req, res) => {
    res.send("Hey, it's auth");
});

router.post("/register", async (req, res) => {

    const { username, email, password, age } = req.body;

    if (!username || !email || !password || age === undefined) {
        return res.status(400).send("Missing required fields");
    }
    const hashedPassword = await bcrypt.hash(password, 10);

     const newUser = {
        username,
        email,
        password : hashedPassword,
        age: parseInt(age),
        followers: [], // Default value
        time_created: new Date() // Current timestamp
    };

    try {
        const createdUser = await User.create(newUser);
        res.status(201).send("Data saved");
    } catch (err) {
        console.error('Error saving data', err.message);
        res.status(500).send("Error saving data");
    }
});

//Login

router.post("/login", async(req,res)=>{
    const { email, password } = req.body;

    try{
        const query = 'SELECT * FROM users WHERE email = $1';
        const values = [email];

        // Execute the query
        const result = await client.query(query, values);

        // Check if user exists
        if (result.rows.length === 0) {
            return res.status(404).send("User not found");
        }

        const user = result.rows[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).send("Invalid password");
        }

        res.send("Login successful");
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).send("Internal Server Error");
    }
});



module.exports = router;
