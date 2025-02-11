import { useState } from "react";

const NewQuestionForm = ({ onAddQuestion, onCancel, testId }) => {
    const [newQuestion, setNewQuestion] = useState({
        type: "single",
        question: "",
        options: [],
        answer: "",
    });

    const handleTypeChange = (e) => {
        const selectedType = e.target.value;
        setNewQuestion({
            type: selectedType,
            question: "",
            options: selectedType === "drag-and-drop" ? {} : [],
            answer: selectedType === "drag-and-drop" ? {} : selectedType === "multiple" || selectedType === "sorting" ? [] : "",
        });
    };

    const handleInputChange = (e) => {
        setNewQuestion({ ...newQuestion, question: e.target.value });
    };

    const handleAddOption = () => {
        if (Array.isArray(newQuestion.options)) {
            setNewQuestion((prev) => ({
                ...prev,
                options: [...prev.options, ""],
            }));
        } else {
            const newKey = `Задание ${Object.keys(newQuestion.options).length + 1}`;
            setNewQuestion((prev) => {
                const updatedOptions = { ...prev.options, [newKey]: "" };
                return { ...prev, options: updatedOptions, answer: { ...updatedOptions } };
            });
        }
    };

    const handleDragDropChange = (key, newKey, newValue) => {
        setNewQuestion((prev) => {
            const updatedOptions = { ...prev.options };
            delete updatedOptions[key];
            updatedOptions[newKey] = newValue;

            return { ...prev, options: updatedOptions, answer: { ...updatedOptions } };
        });
    };

    const handleSubmit = async () => {
        if (!newQuestion.question.trim()) return alert("Введите текст вопроса!");

        try {
            const response = await fetch("http://localhost:5003/api/questions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...newQuestion, test_id: testId }),
            });

            if (!response.ok) throw new Error("Ошибка при добавлении вопроса");

            const createdQuestion = await response.json();
            onAddQuestion(createdQuestion);
        } catch (error) {
            console.error("Ошибка:", error);
        }
    };

    const handleOptionsChange = (e) => {
        const numbers = e.target.value
            .split(",")
            .map((item) => item.trim()) // Убираем пробелы
            .map(Number) // Преобразуем в числа
            .filter((item) => !isNaN(item)); // Убираем NaN

        setNewQuestion((prev) => ({
            ...prev,
            options: numbers,
        }));
    };

    const handleAnswerChange = (e) => {
        const sortedNumbers = e.target.value
            .split(",")
            .map((item) => item.trim())
            .map(Number)
            .filter((item) => !isNaN(item));

        setNewQuestion((prev) => ({
            ...prev,
            answer: sortedNumbers,
        }));
    };

    return (
        <div className="p-4 border rounded-md mt-4 bg-gray-100">
            <h3 className="font-bold mb-2">Добавить новый вопрос</h3>

            <label className="block mb-2">
                Тип вопроса:
                <select value={newQuestion.type} onChange={handleTypeChange} className="border p-2 w-full">
                    <option value="single">Один вариант</option>
                    <option value="multiple">Несколько вариантов</option>
                    <option value="drag-and-drop">Перетаскивание</option>
                    <option value="sorting">Сортировка</option>
                </select>
            </label>

            <input
                type="text"
                placeholder="Текст вопроса"
                value={newQuestion.question}
                onChange={handleInputChange}
                className="border p-2 w-full mb-2"
            />

            {newQuestion.type === "single" || newQuestion.type === "multiple" ? (
                <>
                    {newQuestion.options.map((option, index) => (
                        <div key={index} className="flex gap-2 items-center">
                            <input
                                type="text"
                                value={option}
                                onChange={(e) =>
                                    setNewQuestion((prev) => ({
                                        ...prev,
                                        options: prev.options.map((opt, i) => (i === index ? e.target.value : opt)),
                                    }))
                                }
                                className="border p-1 w-full"
                            />
                            <button
                                className="text-red-500 hover:text-red-700"
                                onClick={() =>
                                    setNewQuestion((prev) => ({
                                        ...prev,
                                        options: prev.options.filter((_, i) => i !== index),
                                    }))
                                }
                            >
                                ❌
                            </button>
                        </div>
                    ))}
                    <button className="text-blue-500 hover:text-blue-700 mt-2" onClick={handleAddOption}>
                        ➕ Добавить вариант
                    </button>

                    <h4 className="mt-2 font-semibold">Правильный ответ:</h4>
                    <input
                        type="text"
                        placeholder="Введите правильный ответ"
                        value={newQuestion.answer}
                        onChange={(e) => setNewQuestion({ ...newQuestion, answer: e.target.value })}
                        className="border p-2 w-full"
                    />
                </>
            ) : newQuestion.type === "drag-and-drop" ? (
                <>
                    <h4 className="mt-2 font-semibold">Пары (например: "2 + 2" - "4"):</h4>
                    {Object.entries(newQuestion.options).map(([key, value], index) => (
                        <div key={index} className="flex gap-2 items-center">
                            <input
                                type="text"
                                placeholder="Задание"
                                value={key}
                                onChange={(e) => handleDragDropChange(key, e.target.value, value)}
                                className="border p-1 w-1/2"
                            />
                            <span className="text-gray-700"> → </span>
                            <input
                                type="text"
                                placeholder="Ответ"
                                value={value}
                                onChange={(e) => handleDragDropChange(key, key, e.target.value)}
                                className="border p-1 w-1/2"
                            />
                            <button
                                className="text-red-500 hover:text-red-700"
                                onClick={() => {
                                    const updatedOptions = { ...newQuestion.options };
                                    delete updatedOptions[key];

                                    setNewQuestion({ ...newQuestion, options: updatedOptions, answer: { ...updatedOptions } });
                                }}
                            >
                                ❌
                            </button>
                        </div>
                    ))}
                    <button className="text-blue-500 hover:text-blue-700 mt-2" onClick={handleAddOption}>
                        ➕ Добавить пару
                    </button>
                    <h4 className="mt-2 font-semibold">Правильный ответ:</h4>
                    <input
                        type="text"
                        placeholder='Введите пары через запятую (например: "Казахстан-Астана, Франция-Париж")'
                        value={Object.entries(newQuestion.answer)
                            .map(([key, value]) => `${key}-${value}`)
                            .join(", ")}
                        onChange={(e) => {
                            const newAnswer = e.target.value
                                .split(",") // Разделяем по запятой
                                .map((pair) => pair.trim().split("-")) // Разделяем "Казахстан-Астана" на ["Казахстан", "Астана"]
                                .reduce((acc, [key, value]) => {
                                    if (key && value) acc[key] = value; // Добавляем только если оба значения есть
                                    return acc;
                                }, {});

                            setNewQuestion((prev) => ({
                                ...prev,
                                answer: newAnswer, // Сохраняем ответ как объект
                            }));
                        }}
                        className="border p-2 w-full"
                    />
                    

                </>
            ) : newQuestion.type === "sorting" ? (
                <>
                    <h4 className="mt-2 font-semibold">Числа для сортировки (через запятую):</h4>
                    <input
                        type="text"
                        value={newQuestion.options.join(",")}
                        onChange={handleOptionsChange}
                        className="border p-2 w-full"
                    />

                    <h4 className="mt-2 font-semibold">Правильный порядок:</h4>
                    <input
                        type="text"
                        value={newQuestion.answer.join(",")}
                        onChange={handleAnswerChange}
                        className="border p-2 w-full"
                    />
                </>
            ) : null }

            <div className="flex justify-between mt-4">
                <button onClick={handleSubmit} className="bg-blue-500 text-white p-2 rounded">
                    ✅ Добавить вопрос
                </button>
                <button onClick={onCancel} className="bg-gray-300 text-black p-2 rounded">
                    ❌ Отмена
                </button>
            </div>
        </div>
    );
};

export default NewQuestionForm;
