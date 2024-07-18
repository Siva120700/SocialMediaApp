let client;

const User = {
    init: (pgClient) => {
        client = pgClient; // Set the client
    },
    create: async ({ username, password, age, email, followers = [], time_created = new Date() }) => {
        const query = `
            INSERT INTO users (username, password, age, email, followers, time_created) 
            VALUES ($1, $2, $3, $4, $5, $6) 
            RETURNING *`;
        const values = [username, password, age, email, followers, time_created];
        try {
            const res = await client.query(query, values);
            return res.rows[0];
        } catch (err) {
            console.error('Error creating user', err);
            throw err;
        }
    }
};

module.exports = User;
