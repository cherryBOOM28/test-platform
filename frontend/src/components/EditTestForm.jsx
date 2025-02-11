import { useState } from "react"
import NewQuestionForm from "./NewQuestionForm";



export const EditTestForm = ({ test, onSave, onCancel }) => {
    console.log("Полученный test в EditTestForm:", test);

    const [showNewQuestionForm, setShowNewQuestionForm] = useState(false); // Показывать ли форму создания



    const [updatedTest, setUpdatedTest] = useState({
        ...test,
        questions: test.questions || [],
    });

    const handleChange = (e) => {
        setUpdatedTest({ ...updatedTest, [e.target.name]: e.target.value });
    };

    const handleDeleteQuestion = async (questionId) => {
        try {
            const response = await fetch(`http://localhost:5003/api/questions/${questionId}`, {
                method: "DELETE",
            });
    
            if (!response.ok) throw new Error("Ошибка при удалении вопроса");
    
            console.log(`Вопрос с ID ${questionId} удален`);
    
            // Удаляем вопрос из списка
            setUpdatedTest((prev) => ({
                ...prev,
                questions: prev.questions.filter((q) => q.id !== questionId),
            }));
        } catch (error) {
            console.error("Ошибка:", error);
        }
    };
    
    const handleAddQuestion = (newQuestion) => {
        setUpdatedTest((prev) => ({
            ...prev,
            questions: [...prev.questions, newQuestion],
        }));
        setShowNewQuestionForm(false); // Скрыть форму после добавления
    };
    
    

    return (
        <div className="p-4 bg-white shadow-lg rounded-lg">
            <h2 className="text-lg font-bold mb-4">Редактирование теста</h2>
            <input
                type="text"
                name="title"
                value={updatedTest.title}
                onChange={handleChange}
                className="border p-2 w-full mb-2"
            />
            <textarea
                name="description"
                value={updatedTest.description}
                onChange={handleChange}
                className="border p-2 w-full mb-2"
            />

            <h3 className="font-bold mt-4">Вопросы:</h3>

            <div className="overflow-y-auto max-h-[340px] border p-2 rounded-lg">
                {updatedTest.questions.map((question, index) => (
                    <div key={index} className="border-gray-400 border p-2 rounded-md mb-8">
                        <input
                            type="text"
                            value={question.question}
                            onChange={(e) => {
                                setUpdatedTest((prev) => ({
                                    ...prev,
                                    questions: prev.questions.map((q, i) =>
                                        i === index ? { ...q, question: e.target.value } : q
                                    ),
                                }));
                            }}
                            className="border p-2 w-full"
                        />

                        <h4 className="mt-2 font-semibold">Варианты ответа:</h4>
                        {Array.isArray(question.options) ? (
                            question.options.map((option, optIndex) => (
                                <div key={optIndex} className="flex gap-2 items-center">
                                    <input
                                        type="text"
                                        value={option}
                                        onChange={(e) => {
                                            setUpdatedTest((prev) => ({
                                                ...prev,
                                                questions: prev.questions.map((q, i) =>
                                                    i === index
                                                        ? { ...q, options: q.options.map((opt, oi) => (oi === optIndex ? e.target.value : opt)) }
                                                        : q
                                                ),
                                            }));
                                        }}
                                        className="border p-1 w-full"
                                    />
                                    <button
                                        className="text-red-500 hover:text-red-700"
                                        onClick={() => {
                                            setUpdatedTest((prev) => ({
                                                ...prev,
                                                questions: prev.questions.map((q, i) =>
                                                    i === index
                                                        ? { ...q, options: q.options.filter((_, oi) => oi !== optIndex) }
                                                        : q
                                                ),
                                            }));
                                        }}
                                    >
                                        ❌
                                    </button>
                                </div>
                            ))
                        ) : typeof question.options === "object" ? (
                            Object.entries(question.options).map(([key, value], optIndex) => (
                                <div key={optIndex} className="flex gap-2 items-center">
                                    <input
                                        type="text"
                                        value={key}
                                        onChange={(e) => {
                                            setUpdatedTest((prev) => ({
                                                ...prev,
                                                questions: prev.questions.map((q, i) =>
                                                    i === index
                                                        ? {
                                                            ...q,
                                                            options: Object.fromEntries(
                                                                Object.entries(q.options).map(([k, v]) =>
                                                                    k === key ? [e.target.value, v] : [k, v]
                                                                )
                                                            ),
                                                        }
                                                        : q
                                                ),
                                            }));
                                        }}
                                        className="border p-1 w-1/2"
                                    />
                                    <span className="text-gray-700"> → </span>
                                    <input
                                        type="text"
                                        value={value}
                                        onChange={(e) => {
                                            setUpdatedTest((prev) => ({
                                                ...prev,
                                                questions: prev.questions.map((q, i) =>
                                                    i === index
                                                        ? {
                                                            ...q,
                                                            options: { ...q.options, [key]: e.target.value },
                                                        }
                                                        : q
                                                ),
                                            }));
                                        }}
                                        className="border p-1 w-1/2"
                                    />
                                    <button
                                        className="text-red-500 hover:text-red-700"
                                        onClick={() => {
                                            setUpdatedTest((prev) => ({
                                                ...prev,
                                                questions: prev.questions.map((q, i) =>
                                                    i === index
                                                        ? {
                                                            ...q,
                                                            options: Object.fromEntries(
                                                                Object.entries(q.options).filter(([k]) => k !== key)
                                                            ),
                                                        }
                                                        : q
                                                ),
                                            }));
                                        }}
                                    >
                                        ❌
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500">Неподдерживаемый формат ответа</p>
                        )}

                        <button
                            className="text-blue-500 hover:text-blue-700 mt-2"
                            onClick={() => {
                                if (Array.isArray(question.options)) {
                                    setUpdatedTest((prev) => ({
                                        ...prev,
                                        questions: prev.questions.map((q, i) =>
                                            i === index ? { ...q, options: [...q.options, ""] } : q
                                        ),
                                    }));
                                } else if (typeof question.options === "object") {
                                    setUpdatedTest((prev) => ({
                                        ...prev,
                                        questions: prev.questions.map((q, i) =>
                                            i === index
                                                ? {
                                                    ...q,
                                                    options: { ...q.options, "Новый вопрос": "Ответ" },
                                                }
                                                : q
                                        ),
                                    }));
                                }
                            }}
                        >
                            ➕ Добавить вариант
                        </button>


                        <h4 className="mt-2 font-semibold">Правильный ответ:</h4>
                        {typeof question.answer === "string" ? (
                            <input
                                type="text"
                                value={question.answer}
                                onChange={(e) => {
                                    setUpdatedTest((prev) => ({
                                        ...prev,
                                        questions: prev.questions.map((q, i) =>
                                            i === index ? { ...q, answer: e.target.value } : q
                                        ),
                                    }));
                                }}
                                className="border p-2 w-full"
                            />
                        ) : typeof question.answer === "object" ? (
                            Object.entries(question.answer).map(([key, value], ansIndex) => (
                                <div key={ansIndex} className="flex gap-2 items-center">
                                    <input
                                        type="text"
                                        value={key}
                                        onChange={(e) => {
                                            setUpdatedTest((prev) => ({
                                                ...prev,
                                                questions: prev.questions.map((q, i) =>
                                                    i === index
                                                        ? {
                                                            ...q,
                                                            answer: Object.fromEntries(
                                                                Object.entries(q.answer).map(([k, v]) =>
                                                                    k === key ? [e.target.value, v] : [k, v]
                                                                )
                                                            ),
                                                        }
                                                        : q
                                                ),
                                            }));
                                        }}
                                        className="border p-1 w-1/2"
                                    />
                                    <span className="text-gray-700"> → </span>
                                    <input
                                        type="text"
                                        value={value}
                                        onChange={(e) => {
                                            setUpdatedTest((prev) => ({
                                                ...prev,
                                                questions: prev.questions.map((q, i) =>
                                                    i === index
                                                        ? { ...q, answer: { ...q.answer, [key]: e.target.value } }
                                                        : q
                                                ),
                                            }));
                                        }}
                                        className="border p-1 w-1/2"
                                    />
                                    <button
                                        className="text-red-500 hover:text-red-700"
                                        onClick={() => {
                                            setUpdatedTest((prev) => ({
                                                ...prev,
                                                questions: prev.questions.map((q, i) =>
                                                    i === index
                                                        ? {
                                                            ...q,
                                                            answer: Object.fromEntries(
                                                                Object.entries(q.answer).filter(([k]) => k !== key)
                                                            ),
                                                        }
                                                        : q
                                                ),
                                            }));
                                        }}
                                    >
                                        ❌
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500">Неподдерживаемый формат ответа</p>
                        )}


                        <button
                            className="text-red-500 hover:text-red-700 mt-2"
                            // onClick={() => {
                            //     setUpdatedTest((prev) => ({
                            //         ...prev,
                            //         questions: prev.questions.filter((_, i) => i !== index),
                            //     }));
                            // }}
                            onClick={() => handleDeleteQuestion(question.id)}
                        >
                            ❌ Удалить вопрос
                        </button>
                        
                    </div>
                ))}

                {/* <button
                    onClick={handleAddQuestion}
                    className="bg-green-500 text-white p-2 rounded mt-4"
                >
                    ➕ Добавить вопрос
                </button> */}
                {showNewQuestionForm ? (
                    <NewQuestionForm testId={updatedTest.id} onAddQuestion={handleAddQuestion} />
                ) : (
                    <button
                        onClick={() => setShowNewQuestionForm(true)}
                        className="bg-green-500 text-white p-2 rounded mt-4"
                    >
                        ➕ Добавить вопрос
                    </button>
                )}

            </div>

            <div className="flex justify-between mt-4">
                <button onClick={() => onSave(updatedTest)} className="bg-[#1F09FF] text-white p-2 rounded">
                    💾 Сохранить
                </button>
                <button onClick={onCancel} className="text-gray-500 hover:text-black">
                    ❌ Отмена
                </button>
            </div>
        </div>
    );
};
