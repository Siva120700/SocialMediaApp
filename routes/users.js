
const {Client} = require('pg')
const bcrypt = require('bcrypt')
const express = require("express");
const router = express.Router();


router.get('/',(req,res)=>{
    res.send("Hey");
})

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'sm',
    password: 'Siva#1207',
    port: 5433,
});

client.connect()
.then(() => console.log("Connected to PostgreSQL database user"))
.catch(err =>console.error("error",err.stack))
router.put("/update", async (req, res) => {
    const { email, username, password, age } = req.body;

    try {
        // Check if user exists
        const query = 'SELECT * FROM users WHERE email = $1';
        const values = [email];
        const result = await client.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).send("User not found");
        }

        const user = result.rows[0];
        const updatedUser = {
            ...user,
            username: username || user.username,
            age: age !== undefined ? parseInt(age) : user.age,
            password: password ? await bcrypt.hash(password, 10) : user.password
        };

        const updateQuery = `
            UPDATE users 
            SET username = $1, age = $2, password = $3
            WHERE email = $4
            RETURNING *`;
        const updateValues = [updatedUser.username, updatedUser.age, updatedUser.password, email];

        const updateResult = await client.query(updateQuery, updateValues);

        res.send("User updated successfully");
    } catch (err) {
        console.error('Error updating user', err.message);
        res.status(500).send("Error updating user");
    }
});

// delete 

router.delete("/delete", async (req, res) => {
    const { email } = req.body;

    try {
        const query = 'DELETE FROM users WHERE email = $1 RETURNING *';
        const values = [email];

        const result = await client.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).send("User not found");
        }

        res.send("User deleted successfully");
    } catch (err) {
        console.error('Error deleting user', err.message);
        res.status(500).send("Error deleting user");
    }
});


// getting user details 

router.get("/getUser", async (req, res) => {
    const { email, password } = req.body;

    try {
        const query = 'SELECT * FROM users WHERE email = $1';
        const values = [email];

        const result = await client.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).send("User not found");
        }

        const user = result.rows[0];

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).send("Invalid password");
        }

        res.send(user);
    } catch (err) {
        console.error('Error fetching user:', err);
        res.status(500).send("Internal Server Error");
    }
});

module.exports =router