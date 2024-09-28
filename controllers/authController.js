const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const client = require("../config/config");
exports.createUser = async (req, res) => {
  try {
    //(password,rounds):salt rounds
    const { username, email, role, password } = req.body;
    const auth_token = await bcrypt.hash(password, 10);
    const newUser = await userModel.create({
      username,
      email,
      role,
      auth_token,
    });

    if (role === 1) {
      await userModel.createAdmin({
        auth_token,
      });
    }
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.loginUser = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    let options = {
      maxAge: 60 * 60 * 1000,
      httpOnly: true,
      secure: true,
      sameSite: "None",
    };

    const result = await client.query(
      `SELECT * FROM users WHERE username = $1;`,
      [username]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Username not exists" });
    }
    const passwordMatch = await bcrypt.compare(
      password,
      result.rows[0].auth_token
    );
    if (!passwordMatch) {
      return res.status(401).json({ error: "Authentication failed" });
    }

    let token;
    if (result.rows[0].role === 0) {
      token = jwt.sign(
        {
          username: result.rows[0].username,
          user_id: result.rows[0].user_id,
          email: result.rows[0].email,
          role: result.rows[0].role,
        },
        process.env.JWT_SECRET_KEY,
        {
          expiresIn: "1h",
        }
      );
    } else {
      token = jwt.sign(
        {
          username: result.rows[0].username,
          user_id: result.rows[0].user_id,
          email: result.rows[0].email,
          role: result.rows[0].role,
        },
        process.env.JWT_ADMIN_SECRET_KEY,
        {
          expiresIn: "1h",
        }
      );
    }

    await client.query("DELETE FROM blacklist WHERE token = $1;", [token]); // Optional blacklist logic

    res.cookie("SessionID", token);
    res.status(200).json({
      success: true,
      data: {
        username: result.rows[0].username,
        user_id: result.rows[0].userid,
        email: result.rows[0].email,
        role: result.rows[0].role,
        token: token,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message, error: "Login failed" });
    next(error);
  }
};

exports.logoutUser = async (req, res) => {
  try {
    const authHeader = req.headers["cookie"];
    if (!authHeader) return res.sendStatus(204);

    const cookies = authHeader.split("; ");

    const sessionCookie = cookies.find((cookie) =>
      cookie.startsWith("SessionID=")
    );

    if (!sessionCookie) return res.sendStatus(204);

    const accessToken = sessionCookie.split("=")[1];
    console.log(accessToken);
    const result = await client.query(
      "SELECT * FROM blacklist WHERE token = $1;",
      [accessToken]
    );
    if (result.rows.length === 1) {
      return res.sendStatus(204);
    }

    await client.query("INSERT INTO blacklist (token) VALUES ($1);", [
      accessToken,
    ]);

    res.clearCookie("SessionID", {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });
    res.status(200).json({ message: "You are logged out!" });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
};
