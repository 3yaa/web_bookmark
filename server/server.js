import express from "express";
import { booksRouter } from "./routes/booksRoute.js";

const app = express();
const PORT = process.env.DB_PORT;

// body parser middleware
app.use(express.json());

// Routes
app.use("/api/books", booksRouter);

app.listen(PORT, () => {
  console.log(`server running on PORT: ${PORT}`);
});
