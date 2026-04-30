import express from "express";
import testTaskRouter from "./routes/testTask.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use("/api", testTaskRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});