import { useState } from "react"
import axios from "axios"
import Button from "./Button"
import Input from "./Input"

const questionTypes = ["single", "multiple", "drag-and-drop", "sorting"]

const TestForm = ({ onSave, onCancel }) => {
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [questions, setQuestions] = useState([])

    const handleAddQuestion = () => {
        setQuestions([
            ...questions,
            { type: "single", question: "", options: [], answer: "" },
        ])
    }

    const handleChangeQuestion = (index, field, value) => {
        const updatedQuestions = [...questions]
        updatedQuestions[index][field] = value
        setQuestions(updatedQuestions)
    }

    const handleSaveTest = async () => {
        const token = localStorage.getItem("token")
        if (!token) {
            alert("Ошибка: нет токена!")
            return
        }

        const newTest = {
            title,
            description,
            questions,
        }

        try {
            const response = await axios.post(
                "http://localhost:5003/api/tests",
                newTest,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            console.log("Тест создан:", response.data);
            onSave(response.data);
        } catch (error) {
            console.error("Ошибка при создании теста:", error);
        }
    };

    const questionTypeLabels = {
        single: "Один вариант",
        multiple: "Несколько вариантов",
        "drag-and-drop": "Перетаскивание",
        sorting: "Сортировка"
    }

    return (
        <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-lg font-bold mb-4">Создать новый тест</h2>

            <Input
                label="Название теста"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />
            <Input
                label="Описание"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
            />

            <h3 className="mt-4 text-md font-semibold">Вопросы</h3>
            {questions.map((q, index) => (
                <div key={index} className="border p-4 mt-2 rounded">
                    <select
                        value={q.type}
                        onChange={(e) =>
                            handleChangeQuestion(index, "type", e.target.value)
                        }
                        className="mb-2"
                    >
                        {questionTypes.map((type) => (
                            <option key={type} value={type}>
                                {/* {type} */}
                                {questionTypeLabels[type] || type}
                            </option>
                        ))}
                    </select>

                    <Input
                        label="Текст вопроса"
                        type="text"
                        value={q.question}
                        onChange={(e) =>
                            handleChangeQuestion(index, "question", e.target.value)
                        }
                    />

                    {q.type === "single" || q.type === "multiple" ? (
                        <>
                            <Input
                                label="Варианты ответов (через запятую)"
                                type="text"
                                onChange={(e) =>
                                    // handleChangeQuestion(
                                    //     index,
                                    //     "options",
                                    //     e.target.value.split(",")

                                        
                                    // )
                                    handleChangeQuestion(index, "options", e.target.value.split(",").map(opt => opt.trim()))
                                }
                            />
                            <Input
                                label="Правильный ответ"
                                type="text"
                                onChange={(e) =>
                                    handleChangeQuestion(index, "answer", q.type === "single" ? e.target.value.trim() : e.target.value.split(",").map(opt => opt.trim()))
                                }
                            />

                        </>
                    ) : q.type === "drag-and-drop" ? (
                        <>
                            <Input
                                label="Пары (например: Казахстан-Астана, Франция-Париж)"
                                type="text"
                                onChange={(e) => {
                                    const pairs = e.target.value.split(",").reduce((acc, pair) => {
                                        const [key, value] = pair.split("-");
                                        if (key && value) acc[key.trim()] = value.trim();
                                        return acc;
                                    }, {});
                                    handleChangeQuestion(index, "options", pairs);
                                    handleChangeQuestion(index, "answer", pairs);
                                    
                                    
                                }}
                            />
                        </>
                    ) : q.type === "sorting" ? (
                        <>
                            <Input
                                label="Числа для сортировки (через запятую)"
                                type="text"
                                value={q.options ? q.options.join(",") : ""}
                                onChange={(e) => {
                                    const sortedOptions = e.target.value
                                        .split(",")
                                        .map((num) => Number(num.trim()))
                                        .filter((num) => !isNaN(num)); // Исключаем нечисловые значения
                                    
                                    handleChangeQuestion(index, "options", sortedOptions);
                                }}
                            />
                            <Input
                                label="Правильный порядок"
                                type="text"
                                value={q.answer ? q.answer.join(",") : ""}
                                onChange={(e) => {
                                    const correctOrder = e.target.value
                                        .split(",")
                                        .map((num) => Number(num.trim()))
                                        .filter((num) => !isNaN(num));
                    
                                    handleChangeQuestion(index, "answer", correctOrder);
                                }}
                            />
                        </>
                    ) : null
                    }
                </div>
            ))}

            <Button onClick={handleAddQuestion} className="mt-4">
                Добавить вопрос
            </Button>

            <div className="flex gap-4 mt-4">
                <Button onClick={handleSaveTest}>Создать тест</Button>
                <Button onClick={onCancel} className="bg-gray-400">
                    Отмена
                </Button>
            </div>
        </div>
    );
};

export default TestForm;
