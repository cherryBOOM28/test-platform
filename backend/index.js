import express from 'express'
import './config/db.js'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/authRoutes.js'
import testRoutes from './routes/testRoutes.js'
import userAnswersRoutes from './routes/userAnswersRoutes.js'

dotenv.config()

const app = express()
app.use(cors())
const PORT = process.env.PORT || 5003

app.use(express.json()) // allows us to accept JSON datain the req.body

// Подключаем маршруты для работы с тестами
app.use('/api', testRoutes) 
app.use("/api/answers", userAnswersRoutes)

// Подключаем маршруты
app.use("/api/auth", authRoutes)


app.listen(5003, () => {
    console.log("Server started at http://localhost:" + PORT)
})