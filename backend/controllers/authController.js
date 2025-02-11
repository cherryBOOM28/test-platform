// import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import pool from '../config/db.js'
import dotenv from 'dotenv'

dotenv.config()

// Регистрация пользователя
export const register = async (req, res) => {
    const { username, email, password } = req.body

    try {
        // Проверяем, существует ли пользователь
        const existingUser = await pool.query(
            'SELECT * FROM users WHERE username = $1 OR email = $2',
            [username, email]
        )
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: "Этот username или email уже занят" })
        }

        // Хешируем пароль
        // const hashedPassword = await bcrypt.hash(password, 10)

        // Создаем нового пользователя
        const newUser = await pool.query(
            "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *",
            [username, email, password]
        )

        res.status(201).json({ message: "Регистрация успешна", user: newUser.rows[0] });
    } catch (error) {
        console.error("Ошибка регистрации:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

// Логин пользователя
export const login = async (req, res) => {
    const { email, password } = req.body

    try {
        // Проверяем пользователя в БД
        const user = await pool.query("SELECT * FROM users WHERE email = $1", [email])
        if(user.rows.length === 0) {
            return res.status(400).json({ error: "Неверный email или пароль !" });
        }

        // Проверяем пароль
        // const isMatch = await bcrypt.compare(password, user.rows[0].password)
        // if(!isMatch) {
        //     return res.status(400).json({ error: "Неверный email или пароль" });
        // }
        if (password !== user.rows[0].password) {
            return res.status(400).json({ error: "Неверный email или пароль" })
        }

        // Создаем JWT токен
        const token = jwt.sign(
            {id: user.rows[0].id, username: user.rows[0].username },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        )

        res.status(200).json({ token, user: { id: user.rows[0].id, username: user.rows[0].username } })
    } catch (error) {
        console.error("Ошибка входа:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}