const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Nithin03/1729',
  database: 'internshala',
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL');
});

// ... (previous imports and setup)

// ... (your existing imports)
app.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;

  // Check if the username already exists
  const checkUsernameSql = 'SELECT * FROM user_data WHERE username = ?';
  connection.query(checkUsernameSql, [username], async (err, usernameResults) => {
    if (err) {
      console.error('Error checking username:', err);
      return res.status(500).json({ error: 'Internal Server Error - Checking Username' });
    }

    if (usernameResults.length > 0) {
      // Username already exists
      return res.status(409).json({ error: 'Username already exists. Please choose a different username.' });
    }

    // Check if the email already exists
    const checkEmailSql = 'SELECT * FROM user_data WHERE email = ?';
    connection.query(checkEmailSql, [email], async (err, emailResults) => {
      if (err) {
        console.error('Error checking email:', err);
        return res.status(500).json({ error: 'Internal Server Error - Checking Email' });
      }

      if (emailResults.length > 0) {
        // Email already exists
        return res.status(409).json({ error: 'Email already exists. Please use a different email.' });
      }

      try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const insertUserSql = 'INSERT INTO user_data (username, email, password_hash) VALUES (?, ?, ?)';
        connection.query(insertUserSql, [username, email, hashedPassword], (err, results) => {
          if (err) {
            console.error('Error inserting user data:', err);
            return res.status(500).json({ error: 'Internal Server Error - Inserting User Data' });
          }

          console.log('User signed up successfully');
          return res.json({ success: true });
        });
      } catch (error) {
        console.error('Error hashing password:', error);
        return res.status(500).json({ error: 'Internal Server Error - Hashing Password' });
      }
    });
  });

});




// ... (other routes and server setup)


// ... (other routes and server setup)


app.post('/login', async (req, res) => {
  const { usernameOrEmail, password } = req.body;

  const sql = 'SELECT * FROM user_data WHERE username = ? OR email = ?';
  connection.query(sql, [usernameOrEmail, usernameOrEmail], async (err, results) => {
    if (err) {
      console.error('Error fetching user data:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      if (results.length > 0) {
        const user = results[0];

        const passwordMatch = await bcrypt.compare(password, user.password_hash);

        if (passwordMatch) {
          res.json({ success: true, user });
          console.log('Login successful');
        } else {
          res.status(401).json({ error: 'Incorrect password' });
        }
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    }
  });
});

// ... other routes

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
