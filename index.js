const express = require("express");
const cors = require("cors");

const path = require("path");
const PORT = process.env.PORT || 5001;

const todoRoutes = require("./routes/todo");

const app = express();

//process.env.NODE_ENV => production or undefined

// middleware
app.use(cors());
app.use(express.json()); // => allows use to access the req.body

app.use("/todo", todoRoutes);

if (process.env.NODE_ENV === "production") {
  //server static content
  //npm run build
  app.use(express.static("client/build"));
}

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client/build/index.html"));
});

app.listen(PORT, () => {
  console.log(`Server is starting on port ${PORT}`);
});

module.exports = app;
