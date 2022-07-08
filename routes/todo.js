const express = require("express");

const pool = require("../db");

const router = new express.Router();
//ROUTES//
// get all Todos
router.get("/", async (req, res) => {
  try {
    const { description } = req.body;
    const allTodos = await pool.query("SELECT * FROM todo");
    res.json(allTodos.rows);
  } catch (err) {
    console.error(err.message);
  }
});
// get a todo
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const todos = await pool.query("SELECT * FROM todo WHERE tid = $1", [id]);
    res.json(todos.rows);
  } catch (err) {
    console.error(err.message);
  }
});

// create a todo
router.post("/", async (req, res) => {
  try {
    const { description } = req.body;
    const newTodo = await pool.query(
      "INSERT INTO todo (description) VALUES ($1) RETURNING *",
      [description]
    );
    res.json(newTodo.rows[0]);
  } catch (err) {
    console.error(err.message);
  }
});
//update a todo
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { description } = req.body;
    const updateTodo = await pool.query(
      "UPDATE todo SET description = $1 WHERE tid = $2",
      [description, id]
    );

    res.json("todo was updated");
  } catch (err) {
    console.error(err.message);
  }
});
//delete a todo
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleteTodo = await pool.query("DELETE FROM todo WHERE tid = $1", [
      id,
    ]);
    res.json("todo was deleted");
  } catch (err) {
    console.error(err.message);
  }
});

module.exports = router;