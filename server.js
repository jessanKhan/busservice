const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const app = express();
const port = 3000;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    secret: "kjnas87th2n3jybi2d32l", // Replace with your own secret key
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 3600000, // Cookie expiration time (in milliseconds)
      secure: false, // Set to true if using HTTPS
    },
  })
);
mongoose
  .connect("mongodb://localhost:27017/node-auth", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Failed to connect to MongoDB:", err));

app.use("/", require("./routes/index"));
app.use("/auth", require("./routes/auth"));

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
