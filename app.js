const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const databasePath = path.join(__dirname, "userData.db");
const bcrypt = require("bcrypt");

const app = express();
app.use(express.json());

let database = null;

const intilazerDatabaseAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

intilazerDatabaseAndServer();

//API for REGISTER

app.post("/register", async (request, response) => {
  const { username, name, password, gender, location } = request.body;
  const hashedPassword = await bcrypt.hash(request.body.password, 10);
  const selectUserQuery = `SELECT * FROM user WHERE username = '${username}'`;
  const dbUser = await db.get(selectUserQuery);
  if (dbUser === undefined) {
    if (request.body.password.length <= 5) {
      response.status = 400;
      response.send("Password is too short");
    } else {
      const createUserQuery = `
                INSERT INTO 
                    user (username, name, password, gender, location)
                VALUES 
                (
                    '${username}',
                    '${name}',
                    '${hashedPassword}',
                    '${gender}',
                    '${location}'
                ) `;
      const dbResponse = await db.run(createUserQuery);
      const newUserId = dbResponse.lastID;
      response.send(`User created successfully`);
    }
  } else {
    response.status(400);
    response.send("User already exists");
  }
});

// API for LOGIN
app.post("/login", async (request, response) => {
  const { username, password } = request.body;
  const selectLoginQuery = `SELECT * FROM user WHERE username = '${username}'`;
  const dbUser = await db.get(selectLoginQuery);
  if (dbUser === undefined) {
    response.status(400);
    response.send("Invalid user");
  } else {
    const isPasswordMatched = await bcrypt.compare(password, dbUser.password);
    if (isPasswordMatched === true) {
      response.status(200);
      response.send("Login success!");
    } else {
      response.status(400);
      reponse.send("Invalid password");
    }
  }
});

//API for PASSWORD CHANGE

app.put("/change-password", async (request, response) => {
  const { username, oldPassword, newPassword } = request.body;
  const checkForUserQuery = `SELECT * FROM user WHERE username = '${username}'`;
  const dbUser = await db.get(checkForUserQuery);
  if (dbUser === undefined) {
    response.status(400);
    response.send("User not registered");
  } else {
    const isValidPassword = await bcrypt.compare(oldPassword, db.password);
    if (isValidPassword === true) {
      if (length.newPassword < 5) {
        response.status(400);
        response.send("Password is too short");
      } else {
        const encryptedPassword = await bcrypt.hash(newPassword, 10);
        const updateNewPassword = `
                UPDATE user
                SET password = '${encryptedPassword}'
                WHERE 
                username = '${username}'
                `;
        await db.run(updateNewPassword);
        response.send("Password updated");
      }
    } else {
      response.status(400);
      response.send("Invalid Password");
    }
  }
});

module.exports = app;
