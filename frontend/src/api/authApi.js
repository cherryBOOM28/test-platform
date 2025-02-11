import axios from "axios"

// login
const API_URL = "http://localhost:5003/api/auth"

export const loginUser = async(email, password) => {
    try {
        const response = await axios.post(`${API_URL}/login`, { email, password })
        return response.data; // Возвращаем токен и пользователя
    } catch (error) {
        console.error("Ошибка авторизации:", error.response?.data || error.message)
        throw new Error(error.response?.data?.message || "Ошибка входа")
    }
}

// Функция для регистрации пользователя
export const registerUser = async(username, email, password) => {
    try {
        const response = await axios.post(`${API_URL}/register`, { username, email, password })
        return response.status === 201
    } catch (error) {
        console.error("Ошибка регистрации:", error.response?.data || error.message)
        return false
    }
}

// Функция для выхода (очищает localStorage)
export const logoutUser = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
}