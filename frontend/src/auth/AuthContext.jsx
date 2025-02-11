import { createContext, useContext, useState, useEffect } from "react"
import { loginUser, logoutUser, registerUser } from "../api/authApi"

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(null)

    // Проверяем, есть ли сохранённые данные в localStorage при загрузке
    useEffect(() => {
        const storedToken = localStorage.getItem('token')
        const storedUser = localStorage.getItem('user')

        if(storedToken && storedUser) {
            setToken(storedToken)
            setUser(JSON.parse(storedUser))
        }
    }, [])

    const login = async(email, password ) => {
        try {
            const data = await loginUser(email, password)
            setToken(data.token)
            setUser(data.user)
            localStorage.setItem('token', data.token)
            localStorage.setItem('user', JSON.stringify(data.user))


        } catch (error) {
            console.error("Ошибка входа:", error.message);
        }
    }

    const register = async(username, email, password) => {
        return await registerUser(username, email, password)
    }

    const logout = () => {
        logoutUser()
        setUser(null)
        setToken(null)
    }

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)