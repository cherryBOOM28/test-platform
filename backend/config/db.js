import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
})

const createTables = async () => {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username VARCHAR(50) UNIQUE NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          password TEXT NOT NULL
        );
  
        CREATE TABLE IF NOT EXISTS tests (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          created_by INTEGER REFERENCES users(id) ON DELETE CASCADE
        );
  
        CREATE TABLE IF NOT EXISTS questions (
          id SERIAL PRIMARY KEY,
          test_id INTEGER REFERENCES tests(id) ON DELETE CASCADE,
          type VARCHAR(50) NOT NULL,
          question TEXT NOT NULL,
          options JSONB NOT NULL,
          answer JSONB NOT NULL
        );

        CREATE TABLE IF NOT EXISTS user_answers (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            test_id INTEGER REFERENCES tests(id) ON DELETE CASCADE,
            question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
            user_answer JSONB NOT NULL
        );
      `);
      console.log("Таблицы успешно созданы!");
    } catch (err) {
      console.error("Ошибка при создании таблиц:", err);
    }
  };
  
  createTables();

pool.connect()
  .then(() => console.log('Connected to PostgreSQL'))
  .catch(err => console.error('Connection error', err));

export default pool;