import { useEffect, useState } from "react"
import Button from "./Button"
import DragAndDropQuestion from "./DragAndDropQuestion.jsx";
import { HTML5Backend } from "react-dnd-html5-backend"
import { DndProvider } from "react-dnd";
import SortingQuestion from "./SortingQuestion.jsx";
import { getTestResults, submitAnswers } from "../api/testApi.js";

// 1
const TestComponent = ({ test, setSelectedTest, setIsTestStarted }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [answers, setAnswers] = useState({}) // Хранение выбранных ответов
    const [isFinished, setIsFinished] = useState(false)
    const [results, setResults] = useState(null)

    useEffect(() => {
        console.log("Обновленные ответы:", answers);
    }, [answers])

    const handleRestartTest = () => {
        setSelectedTest(null); // Убираем выбранный тест, возвращая пользователя на главный экран
        setIsTestStarted(false); // Сбрасываем флаг начала теста
        setCurrentQuestionIndex(0);
        setAnswers({});
        setIsFinished(false);
        setResults(null);
    };

    const totalQuestions = test.questions.length

    const handleNext = () => {
        if(currentQuestionIndex < totalQuestions - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1)
        }
    }

    const handlePrev = () => {
        if(currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1)
        }
    }

    const handleFinish = async () => {
        console.log("Тест завершён!");
        
        try {
            const testId = test.id;
            const userId = localStorage.getItem("userId") || null;
    
            const resultsData = await submitAnswers(testId, userId, answers);
            console.log("Ответы успешно отправлены!", resultsData);
    
            const resultsWithQuestions = resultsData.results.map((result) => {
                const question = test.questions.find(q => q.id === result.questionId);
                
                let correctAnswer = question?.answer;
                let userAnswer = result.userAnswer;
    
                // Если это multiple, преобразуем строки в массивы
                if (question?.type === "multiple") {
                    if (typeof correctAnswer === "string") {
                        correctAnswer = correctAnswer.split(",").map(opt => opt.trim());
                    }
                    if (typeof userAnswer === "string") {
                        userAnswer = userAnswer.split(",").map(opt => opt.trim());
                    }
                
                    // Упорядочиваем перед сравнением
                    userAnswer = Array.isArray(userAnswer) ? userAnswer.sort() : userAnswer;
                    correctAnswer = Array.isArray(correctAnswer) ? correctAnswer.sort() : correctAnswer;
                }
                
    
                // Проверяем корректность ответа
                const isCorrect = JSON.stringify(userAnswer) === JSON.stringify(correctAnswer);
    
                return { 
                    ...result, 
                    question: question?.question || "Вопрос не найден",
                    correctAnswer: correctAnswer, 
                    isCorrect
                };
            });
    
            setResults({ ...resultsData, results: resultsWithQuestions });
            setIsFinished(true);
        } catch (error) {
            console.error("Ошибка при завершении теста:", error);
        }
    }  
    
    const handleOptionChange = (questionId, selectedOption, type) => {
        setAnswers((prevAnswers) => {
            let updatedAnswers = { ...prevAnswers };
    
            if (type === "single") {
                updatedAnswers[questionId] = selectedOption; // Храним как строку, а не массив
            } else if (type === "multiple") {
                let currentAnswers = updatedAnswers[questionId] || [];
                if (currentAnswers.includes(selectedOption)) {
                    updatedAnswers[questionId] = currentAnswers.filter((opt) => opt !== selectedOption);
                } else {
                    updatedAnswers[questionId] = [...currentAnswers, selectedOption];
                }
            }
    
            return updatedAnswers;
        });
    };
    
    
   
    


    // Функция для корректного отображения ответов
    const renderAnswer = (answer) => {
        if (Array.isArray(answer)) {
            return answer.join(", ");
        } else if (typeof answer === "object" && answer !== null) {
            return Object.entries(answer)
                .map(([key, value]) => `${key}: ${value}`)
                .join(", ");
        } else {
            return answer;
        }
    };

    if (isFinished && results) {
        return (
            <div className="w-full p-6 flex flex-col justify-start">
                <h2 className="text-2xl font-bold mb-4">🎉 Тест завершён!</h2>
                <p className="text-lg font-semibold">
                    ✅ Правильных ответов: {results.correctCount} из {results.totalQuestions}
                </p>
                <p className="text-lg font-semibold mb-4">
                    📊 Процент выполнения: {results.scorePercentage.toFixed(2)}%
                </p>
    
                {/* Контейнер с фиксированной высотой и скроллом */}
                <div className="max-h-[400px] overflow-y-auto border p-2 rounded-lg">
                    {Array.isArray(results?.results) &&
                        results.results.map((result, index) => (
                            <div key={index} className="border rounded-lg p-4 my-2">
                                <p>
                                    &#x1F4AC; Вопрос: <span>{renderAnswer(result.question)}</span>
                                </p>
                                <p>
                                    📝 Твой ответ: <span>{renderAnswer(result.userAnswer)}</span>
                                </p>
                                <p>
                                    ✅ Правильный ответ: <span>{renderAnswer(result.correctAnswer)}</span>
                                </p>
                                <p>{result.isCorrect ? "🎉 Верно!" : "❌ Ошибка"}</p>
                            </div>
                    ))}
                </div>
    
                {/* Кнопка для возврата на главный экран */}
                <button 
                    className="mt-4 bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
                    onClick={handleRestartTest}
                >
                    🔄 Вернуться на главный экран
                </button>
            </div>  
        );
    }
    
    

    const currentQuestion = test.questions[currentQuestionIndex]
    
    return (
        <div className="w-full p-6 flex flex-col justify-start ">
            <div className="flex justify-between">
                <h2 className="text-2xl font-bold">&#x1F4CD;{test.title}</h2>
                <h3 className="text-md font-semibold">
                    &#x1F4CE; Вопрос {currentQuestionIndex + 1} из {totalQuestions}
                </h3>
            </div>
            <p className="mb-4 ml-[24px]">{test.description}</p>

            {/* Вопрос */}
            <div className="mb-6">
                <p className="text-[18px] mt-8">&#x1F4CC; {test.questions[currentQuestionIndex].question}</p>

                {/* Варианты ответов */}
                <div className="mt-4">
                    {currentQuestion.type === 'single' && (
                        currentQuestion.options.map((option, index) => (
                            <label key={index} className="mb-[10px] block p-2 border rounded-lg cursor-pointer hover:bg-gray-100">
                                <input 
                                    type="radio" 
                                    name={`answer-${currentQuestion.id}`} // Уникальное имя для каждого вопроса
                                    checked={answers[currentQuestion.id] === option} // Отмечаем, если выбрано
                                    // checked={answers[currentQuestion.id]?.[0] === option}
                                    className="mr-2" 
                                    onChange={() => handleOptionChange(currentQuestion.id, option, "single")}
                                />
                                {option}
                            </label>
                        )) 
                    )}

                    {currentQuestion.type === 'multiple' && (
                        currentQuestion.options.map((option, index) => (
                            <label key={index} className="mb-[10px] block p-2 border rounded-lg cursor-pointer hover:bg-gray-100">
                                <input 
                                    type="checkbox" 
                                    checked={(answers[currentQuestion.id]?.includes(option) || false)} // Проверяем, есть ли ответ в массиве
                                    className="mr-2" 
                                    onChange={() => handleOptionChange(currentQuestion.id, option, "multiple")}
                                />
                                {option}
                            </label>
                        )) 
                    )}

                    {currentQuestion.type === "drag-and-drop" && (
                        <DndProvider backend={HTML5Backend}>
                            <DragAndDropQuestion
                                options={currentQuestion.options}
                                setAnswers={setAnswers}
                                questionId={currentQuestion.id}
                                answers={answers}
                            />
                        </DndProvider>
                    )}

                    {currentQuestion.type === 'sorting' && (
                        <DndProvider backend={HTML5Backend}>
                            <SortingQuestion
                                options={currentQuestion.options}
                                setAnswers={setAnswers}
                                questionId={currentQuestion.id}
                                answers={answers}
                            />
                        </DndProvider>
                    )}


                    
                </div>

                {/* Кнопки "Назад", "Далее", "Завершить" */}
                <div className="flex justify-between mt-[20px]">
                    {currentQuestionIndex > 0 && (
                        <button className="bg-gray-400 text-white p-2 rounded" onClick={handlePrev}>
                            Назад
                        </button>
                    )}
                    {currentQuestionIndex < totalQuestions - 1 ? (
                        <Button className="text-[#fff] bg-[#1F09FF]" onClick={handleNext}>
                            Далее
                        </Button>
                    ) : (
                        <Button className="bg-[#50C878] border-[#50C878] hover:bg-[#50C878] text-[#fff] " onClick={handleFinish}>
                            Завершить тест
                        </Button>
                    )}
                </div>

                {/* Индикаторы номеров вопросов */}
                <div className="mt-4 flex justify-center space-x-2">
                    {/* {test.questions.map((_, index) => {
                        <div 
                            key={index} 
                            className={`w-3 h-3 rounded-full ${index === currentQuestionIndex ? "bg-blue-500" : "bg-gray-300"}`}
                        ></div>
                    })} */}
                    {test.questions.map((_, index) => (
                        <div 
                            key={index} 
                            className={`w-3 h-3 rounded-full ${index === currentQuestionIndex ? "bg-[#1F09FF]" : "bg-gray-300"}`}
                        ></div>
                    ))}
                </div>

                
            </div>
        </div>
    );
};

export default TestComponent;