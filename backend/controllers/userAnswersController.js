import pool from '../config/db.js'



export const submitAnswers = async (req, res) => {
    const { userId = null, testId, answers } = req.body;

    try {
        // 🛑 Если гость, удаляем только его предыдущие анонимные ответы
        if (!userId) {
            await pool.query(`DELETE FROM user_answers WHERE test_id = $1 AND user_id IS NULL`, [testId]);
        } else {
            // 🛑 Если авторизован, удаляем его старые ответы
            await pool.query(`DELETE FROM user_answers WHERE test_id = $1 AND user_id = $2`, [testId, userId]);
        }

        // ✅ Сохраняем новые ответы
        for (const answer of answers) {
            await pool.query(
                `INSERT INTO user_answers (user_id, test_id, question_id, user_answer) VALUES ($1, $2, $3, $4)`,
                [userId, testId, answer.questionId, JSON.stringify(answer.userAnswer)]
            );
        }

        // ✅ Сразу считаем и отправляем результат (даже для гостя)
        const results = await getTestResults(testId, userId);
        return res.json(results);

    } catch (error) {
        console.error("Ошибка при сохранении ответов:", error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
};



// Функция для подсчёта результатов
export const getTestResults = async (testId, userId = null) => {
    let userAnswers;

    if (userId) {
        // 🔹 Если пользователь авторизован, берём его ответы
        userAnswers = await pool.query(
            `SELECT question_id, user_answer 
             FROM user_answers 
             WHERE test_id = $1 AND user_id = $2`,
            [testId, userId]
        );
    } else {
        // 🔹 Если гость, берём последние 10 отправленных ответов (убираем created_at)
        userAnswers = await pool.query(
            `SELECT question_id, user_answer 
             FROM user_answers 
             WHERE test_id = $1 AND user_id IS NULL 
             LIMIT 10`, 
            [testId]
        );
    }

    // 🔹 Получаем правильные ответы
    const correctAnswers = await pool.query(
        `SELECT id AS question_id, answer FROM questions WHERE test_id = $1`,
        [testId]
    );

    const userAnswersMap = Object.fromEntries(userAnswers.rows.map(a => [a.question_id, a.user_answer]));
    const correctAnswersMap = Object.fromEntries(correctAnswers.rows.map(q => [q.question_id, q.answer]));

    let correctCount = 0;
    let totalQuestions = correctAnswers.rows.length;

    const results = correctAnswers.rows.map(q => {
        const userAnswer = userAnswersMap[q.question_id] ?? null;
        const correctAnswer = correctAnswersMap[q.question_id];

        const isCorrect = JSON.stringify(userAnswer) === JSON.stringify(correctAnswer);
        if (isCorrect) correctCount++;

        return { questionId: q.question_id, userAnswer, correctAnswer, isCorrect };
    });

    return {
        userId, // Может быть NULL
        testId,
        totalQuestions,
        correctCount,
        scorePercentage: (correctCount / totalQuestions) * 100,
        results
    };
};



// Эндпоинт для запроса результатов (если нужно повторно)
export const getResults = async (req, res) => {
    const { userId, testId } = req.params;
    try {
        const results = await getTestResults(userId, testId);
        res.json(results);
    } catch (error) {
        console.error("Ошибка при получении результатов:", error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
};
