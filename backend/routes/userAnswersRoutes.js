import express from "express";
import { submitAnswers, getResults } from "../controllers/userAnswersController.js";

const router = express.Router();

router.post("/submit", submitAnswers); // Отправка ответов (можно сразу получить результаты)
router.get("/results/:testId/:userId", getResults); // Получение результатов

export default router;
