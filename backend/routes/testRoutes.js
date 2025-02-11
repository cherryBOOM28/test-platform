import express from 'express'
import { authenticateUser } from '../middlewares/authMiddleware.js'

import { 
    getTestWithQuestions, 
    updateQuestion, 
    createQuestion, 
    deleteQuestion, 

    getTests, 
    createTest, 
    updateTest, 
    deleteTest 
} from '../controllers/testController.js'


const router = express.Router();

// Получить все тесты - доступно всем
router.get('/tests', getTests)

// Создать новый тест — доступно только авторизованным пользователям
router.post('/tests', authenticateUser, createTest)

// Обновить тест — доступно только авторизованным пользователям
router.put('/tests/:id', authenticateUser, updateTest)

// Удалить тест — доступно только авторизованным пользователям
router.delete('/tests/:id', authenticateUser, deleteTest)

// Маршрут для получения теста с вопросами
router.get("/tests/:id", getTestWithQuestions)



// Удалить один вопрос
router.delete('/questions/:id', deleteQuestion)

// Обновить один вопрос
router.put('/questions/:id', updateQuestion)

// Добавить новый вопрос
router.post('/questions', createQuestion)


router.get("/:id/results/:userId", async (req, res) => {
    try {
      const { id, userId } = req.params;
  
      // Получаем вопросы теста (с правильными ответами)
      const testWithQuestions = await db("tests")
        .where({ id })
        .first()
        .select("id", "title")
        .join("questions", "tests.id", "questions.testId")
        .select(
          "questions.id as questionId",
          "questions.type",
          "questions.answer"
        );
  
      if (!testWithQuestions) {
        return res.status(404).json({ message: "Тест не найден" });
      }
  
      // Получаем ответы пользователя
      const userAnswers = await db("user_answers")
        .where({ testId: id, userId })
        .select("questionId", "userAnswer");
  
      if (!userAnswers.length) {
        return res.status(404).json({ message: "Ответы пользователя не найдены" });
      }
  
      let correctCount = 0;
      let results = [];
  
      // Проверяем каждый ответ пользователя
      userAnswers.forEach((userAnswer) => {
        const question = testWithQuestions.find(
          (q) => q.questionId === userAnswer.questionId
        );
  
        if (!question) return;
  
        let isCorrect = false;
  
        if (Array.isArray(question.answer)) {
          // Проверяем multiple-choice и сортировку
          isCorrect =
            Array.isArray(userAnswer.userAnswer) &&
            JSON.stringify(userAnswer.userAnswer.sort()) ===
              JSON.stringify(question.answer.sort());
        } else if (typeof question.answer === "object") {
          // Проверяем drag-and-drop (объект)
          isCorrect =
            JSON.stringify(userAnswer.userAnswer) ===
            JSON.stringify(question.answer);
        } else {
          // Проверяем single-choice
          isCorrect = userAnswer.userAnswer === question.answer;
        }
  
        if (isCorrect) correctCount++;
  
        results.push({
          questionId: userAnswer.questionId,
          userAnswer: userAnswer.userAnswer,
          correctAnswer: question.answer,
          isCorrect,
        });
      });
  
      // Подсчет процента правильных ответов
      const totalQuestions = testWithQuestions.length;
      const scorePercentage = Math.round((correctCount / totalQuestions) * 100);
  
      res.json({
        correctCount,
        totalQuestions,
        scorePercentage,
        results,
      });
    } catch (error) {
      console.error("Ошибка при получении результатов:", error);
      res.status(500).json({ message: "Ошибка сервера" });
    }
});

  
export default router