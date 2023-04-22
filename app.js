require("dotenv").config();
require("express-async-errors");

const express = require("express");
const notFoundMiddleware = require("./middleware/not-found");
const errorMiddleware = require("./middleware/error-handler");
const connectDB = require("./db/connect");
const productsRouter = require("./routes/products");

const app = express();
const PORT = process.env.PORT || 40000;

// Middleware
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.send('<h1>Stores API</h1><a href="/api/v1/products">products route</a>');
});

app.use("/api/v1/products", productsRouter);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(PORT, () => {
      console.log(`Server started on port ${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
