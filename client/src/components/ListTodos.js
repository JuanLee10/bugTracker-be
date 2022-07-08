import React, { Fragment, useState, useEffect } from "react";
import axios from 'axios';
import EditTodo from "./EditTodo";

const ListTodos = () => {
  const [todos, setTodos] = useState([]);

  //delete todo function

  async function deleteTodo(id) {
    try {
      const res = await axios.delete(`/todos/${id}`);

      setTodos(todos.filter((todo) => todo.tid !== id));
    } catch (err) {
      console.error(err.message);
    }
  }

  async function getTodos() {
    const res = await axios.get("/todos");
    setTodos(res.data);
  }

  useEffect(() => {
    getTodos();
  }, []);

  return (
    <Fragment>
      {" "}
      <table class="table mt-5">
        <thead>
          <tr>
            <th>Description</th>
            <th>Edit</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {todos.map((todo) => (
            <tr key={todo.tid}>
              <td>{todo.description}</td>
              <td>
                <EditTodo todo={todo} />
              </td>
              <td>
                <button
                  className="btn btn-danger"
                  onClick={() => deleteTodo(todo.tid)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Fragment>
  );
};

export default ListTodos;
