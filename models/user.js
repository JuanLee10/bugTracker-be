"use strict";

const db = require("../db");
const bcrypt = require("bcrypt");
const { sqlForPartialUpdate } = require("../helpers/sql");
const {
    NotFoundError,
    BadRequestError,
    UnauthorizedError,
} = require("../expressError");

class User {
    /** Authenticates the user with username and passwords
     * 
     * @param {*} username 
     * @param {*} password 
     * @returns { username, first_name, last_name, email, is_admin}
     * 
     * Throws UnauthorizedError if user is not found or wrong password
     */
    static async authenticate(username, password) {
        // finding the user
        const result = await db.query(
            `SELECT username,
                    password,
                    first_name AS "firstName"
                    last_name AS "lastName"
                    email,
                    is_Admin as "isAdmin"
                FROM users
                WHERE username = $1`,
            [username],
        );

        const user = result.rows[0];

        if (user) {
            // Comparing hashed password with the password parameter
            const isValid = await bcrypt.compare(password, user.password);
            if (isValid) {
                delete user.password;
                return user;
            }
        }

        throw new UnauthorizedError("Invalid username/password");
    }


    static async register({ username, password, firstName, lastName, email, isAdmin }) {
        // checking for duplicates 
        const dupCheck = await db.query(
            `SELECT username
                FROM users
                WHERE username = $1`,
            [username],
        );
        if (dupCheck.rows[0]) {
            throw new BadRequestError(`Duplicate username: ${username}`);
        }
         
        const hashedPassword = bcrypt.hash(password, 15);

        const result = await db.query(
            `INSERT INTO users
                 (username,
                  password,
                  first_name,
                  last_name,
                  email,
                  is_admin)
                 VALUES ($1, $2, $3, $4, $5, $6)
                 RETURNING username, first_name AS "firstName", last_name AS "lastName", email, is_admin AS "isAdmin"`,
            [
              username,
              hashedPassword,
              firstName,
              lastName,
              email,
              isAdmin,
            ],
          );
      
        const user = result.rows[0];
      
        return user;
    }

    /** Find all users.
   *
   * Returns [{ username, first_name, last_name, email, is_admin}, ...]
   **/

  static async findAll() {
    const userResult = await db.query(
      `SELECT username,
              first_name AS "firstName",
              last_name AS "lastName",
              email,
              is_admin AS "isAdmin"
           FROM users
           ORDER BY username`,
    );

    let users = userResult.rows;

    return users;
  }

  /** Update user data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain
   * all the fields; this only changes provided ones.
   *
   * Data to change include:
   *   { firstName, lastName, email }
   *
   * Returns { username, firstName, lastName, email, isAdmin }
   *
   * Throws NotFoundError if not found.
   * Throws UnauthorizedError if 
   */

  static async update(username, data) {
    const {firstName, lastName, email, password} = data;

    try {
      await User.authenticate(username, password);
    } catch {
      throw new UnauthorizedError("Incorrect password");
    }

    const { setCols, values } = sqlForPartialUpdate(
      {firstName, lastName, email},
      {
        firstName: "first_name",
        lastName: "last_name",
        email: "email",
      });
    const usernameVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE users 
                      SET ${setCols} 
                      WHERE username = ${usernameVarIdx} 
                      RETURNING username,
                                first_name AS "firstName",
                                last_name AS "lastName",
                                email,
                                is_admin AS "isAdmin"`;
    const result = await db.query(querySql, [...values, username]);
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);

    return user;
  }

  /** Delete given user from database; returns undefined. */

  static async remove(username) {
    let result = await db.query(
      `DELETE
           FROM users
           WHERE username = $1
           RETURNING username`,
      [username],
    );
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);
  }
}

module.exports = User;