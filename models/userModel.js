const client = require("../config/config");
const emailValidator = require("../validators/emailValidator");
exports.create = async ({ username, email, role, auth_token }) => {
  if (!username || !email || !auth_token || role === undefined) {
    throw new Error("Invalid user data: Missing required fields");
  }
  if (!emailValidator.emailValidator(email)) {
    throw new Error("email validation failed");
  }

  try {
    let result = await client.query(
      `
            INSERT INTO users (username, email, auth_token, role) VALUES ($1, $2, $3, $4) RETURNING *;`,
      [username, email, auth_token, role]
    );
    return result.rows[0];
  } catch (error) {
    console.log("Error in creating user: UserModel", error);
    throw new Error("Error in creating user: UserModel");
  }
};

exports.createAdmin = async ({ auth_token }) => {
  if (!admin_token) {
    throw new Error("Invalid user data: Missing required fields");
  }
  if (!emailValidator.emailValidator(email)) {
    throw new Error("email validation failed");
  }

  try {
    let result = await client.query(
      `
                INSERT INTO admin (auth_token) VALUES ($1) RETURNING *;`,
      [auth_token]
    );
    return result.rows[0];
  } catch (error) {
    console.log("Error in creating admin : User/Admin Model", error);
    throw new Error("Error in creating admin: User/Admin Model");
  }
};
