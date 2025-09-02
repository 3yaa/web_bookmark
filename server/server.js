import express from "express";
import { booksRouter } from "./routes/booksRoute.js";
import { authRouter } from "./routes/authRouter.js";

const app = express();
const PORT = process.env.PORT || 3000;

// body parser middleware
app.use(express.json());

// Routes
app.use("/", authRouter);
app.use("/books", booksRouter);

// render health check endpoint
// app.get("/healthz", (_, res) => {
// res.status(200).json({ status: "OK", message: "Server is running" });
// });

app.listen(PORT, () => {
  console.log(`server running on PORT: ${PORT}`);
});
