const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
let todos = require("./todos.json");
const app = express();
app.use(express.json());
app.use(cors());
const port = 5000;

app.get("/todos", (req, res) => {
  res.status(200).json(todos);
});

app.post("/todos/createTodo", (req, res) => {
  console.log(req.body);
  const newTodo = { ...req.body, id: uuidv4(), completed: false };
  if (!newTodo) res.status(404).json({ error: "todo is missing" });
  todos.push(newTodo);
  res.status(200).json(newTodo);
});

app.put("/todos/updateStatus", (req, res) => {
  console.log(todos);
  const { id } = req.body;
  if (!id) res.status(400).json({ error: "request is missing id" });
  let todo = todos.find((todo) => todo.id === id);
  if (!todo) res.status(404).json({ error: "todo does not exist" });
  todo.completed = !todo.completed;
  res.status(200).json(todo);
});

app.patch("/todos/editTodo", (req, res) => {
  const { id, editedTodo } = req.body;
  if (!id) res.status(400).json({ error: "request is missing id" });
  let todo = todos.find((todo) => todo.id === id);
  if (!todo)
    res.status(404).json({ error: "todo with such id does not exist" });
  todos.forEach((t, index) => {
    if (t.id === id) {
      todos[index] = { ...t, ...editedTodo };
    }
  });
  res.status(200).json({
    message: "Todo updated successfully",
    editedTodo,
  });
});

app.delete("/todos/deleteTodo", (req, res) => {
  const { id } = req.body;

  console.log(id);
  if (!id) res.status(400).json({ error: "request is missing id" });
  const todo = todos.find((todo) => todo.id === id);

  if (!todo)
    res.status(404).json({ error: "todo with such id does not exist" });
  todos = todos.filter((todo) => todo.id !== id);
  res.status(200).json({
    message: "Todo deleted",
    deletedTodo: todo,
  });
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
