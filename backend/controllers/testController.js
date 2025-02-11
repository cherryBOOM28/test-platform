import pool from '../config/db.js'


// GET all tests
export const getTests = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM tests ORDER BY id ASC')
        res.status(200).json(result.rows)
    } catch (error) {
        console.error('Ошибка получения тестов:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    } 
}

// POST new test
export const createTest = async (req, res) => {
    try {
        const { title, description, created_by, questions } = req.body;

        // Создаём тест
        const testQuery = await pool.query(
            'INSERT INTO tests (title, description, created_by) VALUES ($1, $2, $3) RETURNING *',
            [title, description, created_by]
        );
        
        const test = testQuery.rows[0];
        const createdQuestions = [];

        if (questions && questions.length > 0) {
            for (let question of questions) {
                const questionQuery = await pool.query(
                    'INSERT INTO questions (test_id, type, question, options, answer) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                    [
                        test.id,
                        question.type,
                        question.question,
                        JSON.stringify(question.options), // Преобразуем в JSON
                        JSON.stringify(question.answer)   // Преобразуем в JSON
                    ]
                );
                createdQuestions.push(questionQuery.rows[0]);
            }
        }

        res.status(201).json({ ...test, questions: createdQuestions });
    } catch (err) {
        console.error("Ошибка при создании теста:", err);
        res.status(500).json({ error: "Ошибка при создании теста" });
    }
};


// GET test by id
export const getTestsById = async(req, res) => {
    const { id } = req.params

    try {
        const result = await pool.query('SELECT * FROM tests WHERE id = $1', [id])
        if(result.rows.length === 0) {
            return res.status(404).json({ error: 'Test not found' })
        }
        res.status(200).json(result.rows[0]) // Возвращаем тест по ID
    } catch (error) {
        console.error('Ошибка получения теста:', error)
        res.status(500).json({ error: 'Internal Server Error' }) 
    }
}

// UPDATE test
export const updateTest = async (req, res) => {
    const { id } = req.params
    const { title, description } = req.body

    try {
        const result = await pool.query(
            'UPDATE tests SET title = $1, description = $2 WHERE id = $3 RETURNING *',
            [title, description, id]
        )

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Test not found' })
        }

        res.status(200).json(result.rows[0])
    } catch (error) {
        console.error('Ошибка обновления теста:', error)
        res.status(500).json({ error: 'Internal Server Error' })
    }
}

// CREATE question
export const createQuestion = async (req, res) => {
    const { test_id, type, question, options, answer } = req.body

    try {
        const result = await pool.query(
            `INSERT INTO questions (test_id, type, question, options, answer)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [
                test_id,
                type,
                question,
                JSON.stringify(options),
                JSON.stringify(answer)
            ]
        )

        res.status(201).json(result.rows[0])
    } catch (error) {
        console.error('Ошибка добавления вопроса:', error)
        res.status(500).json({ error: 'Internal Server Error' })
    }
}


// UPDATE  only question
export const updateQuestion = async (req, res) => {
    const { id } = req.params
    const { type, question, options, answer } = req.body

    try {
        const result = await pool.query(
            `UPDATE questions 
             SET type = $1, question = $2, options = $3, answer = $4 
             WHERE id = $5 RETURNING *`,
            [
                type,
                question,
                JSON.stringify(options),
                JSON.stringify(answer),
                id
            ]
        )

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Question not found' })
        }

        res.status(200).json(result.rows[0])
    } catch (error) {
        console.error('Ошибка обновления вопроса:', error)
        res.status(500).json({ error: 'Internal Server Error' })
    }
}



// DELETE test
export const deleteTest = async (req, res) => {
    const { id } = req.params

    try {
        // Сначала удаляем вопросы, связанные с тестом
        await pool.query('DELETE FROM questions WHERE test_id = $1', [id])

        // Теперь удаляем сам тест
        const result = await pool.query('DELETE FROM tests WHERE id = $1 RETURNING *', [id])

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Test not found' })
        }

        res.status(200).json({ message: 'Test and its questions deleted successfully', test: result.rows[0] })
    } catch (error) {
        console.error('Ошибка удаления теста:', error)
        res.status(500).json({ error: 'Internal Server Error' })
    }
}

// DELETE question
export const deleteQuestion = async (req, res) => {
    const { id } = req.params

    try {
        // Удаляем вопрос по его ID
        const result = await pool.query('DELETE FROM questions WHERE id = $1 RETURNING *', [id])

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Question not found' })
        }

        res.status(200).json({ message: 'Question deleted successfully', question: result.rows[0] })
    } catch (error) {
        console.error('Ошибка удаления вопроса:', error)
        res.status(500).json({ error: 'Internal Server Error' })
    }
}

// GET tests with questions
export const getTestWithQuestions = async (req, res) => {
    try {
        const { id } = req.params;

        // Получаем тест
        const testQuery = await pool.query('SELECT * FROM tests WHERE id = $1', [id]);

        if (testQuery.rows.length === 0) {
            return res.status(404).json({ error: "Тест не найден" });
        }

        const test = testQuery.rows[0];

        // Получаем вопросы, связанные с тестом
        const questionsQuery = await pool.query('SELECT * FROM questions WHERE test_id = $1 ORDER BY id ASC', [id]);

        // const questions = questionsQuery.rows.map(q => {
        //     let options, answer;
        
        //     try {
        //         options = q.options ? JSON.parse(q.options) : null;
        //     } catch (err) {
        //         console.error("Ошибка парсинга options:", q.options);
        //         options = null;
        //     }
        
        //     try {
        //         answer = q.answer ? JSON.parse(q.answer) : null;
        //     } catch (err) {
        //         console.error("Ошибка парсинга answer:", q.answer);
        //         answer = null;
        //     }
        
        //     return {
        //         id: q.id,
        //         type: q.type,
        //         question: q.question,
        //         options,
        //         answer
        //     };
        // });

        const questions = questionsQuery.rows.map(q => ({
            id: q.id,
            type: q.type,
            question: q.question,
            options: (typeof q.options === 'string' && q.options.startsWith('[')) || (typeof q.options === 'string' && q.options.startsWith('{'))
                ? JSON.parse(q.options) 
                : q.options, // Парсим только если это JSON
        
            answer: (typeof q.answer === 'string' && q.answer.startsWith('[')) || (typeof q.answer === 'string' && q.answer.startsWith('{'))
                ? JSON.parse(q.answer)
                : q.answer // Парсим только JSON, иначе оставляем как есть
        }));
        
        
        

        res.json({ ...test, questions });
    } catch (err) {
        console.error("Ошибка при получении теста:", err);
        res.status(500).json({ error: "Ошибка при получении теста" });
    }
};
