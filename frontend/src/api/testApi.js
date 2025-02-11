import axios from "axios"

const API_URL = "http://localhost:5003/api/tests"
const API_URL_ANSWERS = "http://localhost:5003/api"

// Получить все тесты
export const getTests = async () => {
    try {
        const response = await axios.get(API_URL)
        return response.data
    } catch (error) {
        console.error("Ошибка при загрузке тестов:", error)
        throw error
    }
}

// Получить тест по ID
export const getTestById = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/${id}`)
        return response.data
    } catch (error) {
        console.error(`Ошибка при загрузке теста ${id}:`, error)
        throw error
    }
}

// Создать тест (только для авторизованных пользователей)
export const createTest = async (testData, token) => {
    try {
        const response = await axios.get(API_URL, testData, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        return response.data
    } catch (error) {
        console.error("Ошибка при создании теста:", error)
        throw error
    }
}

// Обновить тест (редактирование) / (только для авторизованных пользователей)
export const updateTest = async (id, testData, token) => {
    try {
        const response = await axios.get(`${API_URL}/${id}`, testData, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        return response.data
    } catch (error) {
        console.error(`Ошибка при обновлении теста ${id}:`, error)
        throw error
    }
}

// Удалить тест (только для авторизованных пользователей)
export const deleteTest = async (id, token) => {
    try {
        const response = await axios.get(`${API_URL}/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        return response.data
    } catch (error) {
        console.error(`Ошибка при удалении теста ${id}:`, error)
        throw error
    }
}

// Отправить ответы пользователя
export const submitAnswers = async (testId, userId, answers) => {
    try {
        const response = await axios.post(`${API_URL_ANSWERS}/answers/submit`, {
            userId,
            testId,
            answers: Object.entries(answers).map(([questionId, userAnswer]) => ({
                questionId,
                userAnswer,
            })),
        });

        return response.data; // Теперь сразу возвращает результаты
    } catch (error) {
        console.error("Ошибка при отправке ответов:", error);
        throw error;
    }
};

// Получить результаты теста
export const getTestResults = async (testId, userId) => {
    if (!userId) return null; // Если userId нет (гость), не делаем запрос

    try {
        const response = await axios.get(`${API_URL_ANSWERS}/answers/results/${testId}/${userId}`)
        return response.data
    } catch (error) {
        console.error("Ошибка при получении результатов:", error)
        throw error
    }
}
