import express from "express";
import redis from "../utils/redisClient.js";  
import { v4 as uuidv4 } from "uuid";
const router = express.Router();

router.get("/test", async (req, res) => {
  const taskId = uuidv4();

  const task = {
    id: taskId,
    input: "Build a portfolio website",
    status: "pending"
  };

  await redis.lpush("task_queue", JSON.stringify(task));

  res.json({ message: "Task sent", taskId });
});

export default router;