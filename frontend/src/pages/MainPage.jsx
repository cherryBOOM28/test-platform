import { useEffect, useState } from 'react'
import { getTestById, getTests } from '../api/testApi'
import TestComponent from '../components/TestComponent'
import correctPng  from '../assets/correct.png'
import Button from '../components/Button'
import { useAuth } from '../auth/AuthContext.jsx'
import Header from '../components/Header.jsx'
import TestForm from '../components/TestForm.jsx'
import { EditTestForm } from '../components/EditTestForm.jsx'
import axios from 'axios'

const MainPage = () => {
    const [tests, setTests] = useState([])
    const [selectedTest, setSelectedTest] = useState(null)
    const [isTestStarted, setIsTestStarted] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const { user, login, register, logout } = useAuth()

    const [isCreatingTest, setIsCreatingTest] = useState(false)

    const [editingTest, setEditingTest] = useState(null) //  состояние для редактирования теста


    useEffect(() => {
        const fetchTests = async () => {
            try {
                const data = await getTests()
                setTests(data)
            } catch (error) {
                console.error("Ошибка при загрузке тестов:", error);
            }
        }
        fetchTests()
    }, [])

    const handleSelectTest = async (test) => {
        console.log("Выбран тест:", test);
        setSelectedTest(null);  // Сбрасываем предыдущий тест, чтобы сразу показать загрузку
        setIsLoading(true);  // Включаем индикатор загрузки
    
        try {
            const data = await getTestById(test.id);
            console.log("Данные загружены:", data);
    
            // задержка перед отображением теста
            setTimeout(() => {
                setSelectedTest(data);
                setIsLoading(false);
            }, 1000);
        } catch (error) {
            console.error("Ошибка при загрузке теста:", error);
            setIsLoading(false);
        }
    };

    const handleSaveTest = (newTest) => {
        setTests((prevTests) => [...prevTests, newTest])
        setIsCreatingTest(false)
    }

    const handleEditTest = async (test) => {
        try {
            const response = await axios.get(`http://localhost:5003/api/tests/${test.id}`);
            const fullTest = response.data; // Теперь test содержит questions
            setEditingTest(fullTest);
            console.log("Загруженный тест с вопросами:", fullTest);
        } catch (error) {
            console.error("Ошибка загрузки теста:", error);
        }
    };
    
    
    // const handleUpdateTest = (updatedTest) => {
    //     setTests(tests.map((t) => (t.id === updatedTest.id ? updatedTest : t)));
    //     setEditingTest(null);
    // };

    const handleSave = async (updatedTest) => {
        try {
            const token = localStorage.getItem("token"); 
            if (!token) {
                alert("Ошибка: вы не авторизованы! ❌");
                return;
            }

            console.log("Токен перед отправкой запроса:", token);
            // 1️⃣ Обновляем сам тест
            await axios.put(
                `http://localhost:5003/api/tests/${updatedTest.id}`,
                {
                    id: updatedTest.id,
                    title: updatedTest.title,
                    description: updatedTest.description,
                    created_by: updatedTest.created_by || null,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`, // Передаём токен в заголовке
                    },
                }
            );

            // 2️⃣ Обновляем каждый вопрос отдельно
            await Promise.all(
                updatedTest.questions.map(async (question) => {
                    await axios.put(`http://localhost:5003/api/questions/${question.id}`, {
                        id: question.id,
                        type: question.type,
                        question: question.question,
                        options: question.options,
                        answer: question.answer,
                    });
                })
            );

            alert("Тест и вопросы успешно обновлены! ✅");
        } catch (error) {
            console.error("Ошибка при сохранении теста:", error);
            alert("Произошла ошибка при обновлении теста ❌");
        }
    };

    const handleDeleteTest = async (testId, onDelete) => {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Ошибка: нет токена!");
            return;
        }
    
        try {
            await axios.delete(`http://localhost:5003/api/tests/${testId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
    
            alert("Тест удалён успешно!");
            onDelete(testId); // Обновление состояния после удаления
        } catch (error) {
            console.error("Ошибка при удалении теста:", error);
            alert("Ошибка при удалении теста!");
        }
    };
    
    

    return (
        <div className='flex h-screen justify-start gap-4  bg-gray-100 p-6'>
            {/* Меню справа */}

            <div className='flex flex-col'>
                <div className='w-4/4 bg-white shadow-lg rounded-lg p-4 h-[80vh]'>
                    <h2 className="text-lg font-bold mb-4 text-center">Тесты</h2>
                    <ul className='space-y-2'>
                        {tests.map((test) => (
                           <li key={test.id} className="flex items-center justify-between border-2 rounded-md p-2 hover:bg-gray-50">
                                <div className="flex-1 overflow-hidden">
                                    <button
                                        className={`max-w-[200px] text-left text-[15px] truncate overflow-hidden whitespace-nowrap text-ellipsis ${selectedTest?.id === test.id ? 'border-[#1F09FF] text-[#1F09FF]' : ''}`}
                                        onClick={() => handleSelectTest(test)}
                                        title={test.title} // Полное название при наведении
                                    >
                                        {test.title}
                                    </button>
                                </div>
                            
                                {user && (
                                    <div className="flex gap-2 ml-2">
                                        <button
                                            className="text-red-500 hover:text-red-700"
                                            onClick={() => handleDeleteTest(test.id, (deletedId) => {
                                                setTests(tests.filter(t => t.id !== deletedId)); // Удаляем тест из состояния
                                            })}
                                        >
                                            ❌
                                        </button>
                                        <button
                                            className="text-blue-500 hover:text-blue-700"
                                            onClick={() => handleEditTest(test)}
                                        >
                                            ✏️
                                        </button>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
                {user && (
                    <Button onClick={() => setIsCreatingTest(true)}  className="shadow-md mt-[20px]">
                        Добавить тест
                    </Button>
                )}
            </div>
            

            <div className='w-full flex flex-col gap-4'>
                <Header user={user} login={login} register={register} logout={logout} />

               {/* Окно слева с тестом или формой */}
                {/* <main className="w-full h-screen bg-white shadow-lg rounded-lg relative">
                    {isCreatingTest ? (
                        <TestForm onSave={handleSaveTest} onCancel={() => setIsCreatingTest(false)} />
                    ) : isLoading ? (
                        <div className="w-full h-full flex flex-col items-center justify-center">
                            <p className="text-xl font-bold animate-pulse">⏳ Загрузка...</p>
                        </div>
                    ) : !selectedTest ? (
                        <div className="w-full h-full flex flex-col items-center justify-center">
                            <img src={correctPng} alt="" className="w-[40px] mb-4" />
                            <h1 className="text-xl font-bold">Welcome to the testing platform</h1>
                            <p>Select a test from the list on the right</p>
                        </div>
                    ) : !isTestStarted ? (
                        <div className="w-full h-full flex flex-col items-center justify-center">
                            <h2 className="text-2xl font-bold mb-4">{selectedTest.title}</h2>
                            <p className="mb-4">{selectedTest.description}</p>
                            <Button onClick={() => setIsTestStarted(true)}>Начать тест</Button>
                        </div>
                    ) : (
                        <TestComponent 
                            test={selectedTest} 
                            setSelectedTest={setSelectedTest} 
                            setIsTestStarted={setIsTestStarted} 
                        />
                    )}
                </main> */}

                <main className="w-full h-screen bg-white shadow-lg rounded-lg relative">
                    {isCreatingTest ? (
                        <TestForm onSave={handleSaveTest} onCancel={() => setIsCreatingTest(false)} />
                    ) : editingTest ? (
                        <EditTestForm 
                            test={editingTest} 
                            onSave={handleSave} 
                            onCancel={() => setEditingTest(null)} 
                        />
                    ) : isLoading ? (
                        <div className="w-full h-full flex flex-col items-center justify-center">
                            <p className="text-xl font-bold animate-pulse">⏳ Загрузка...</p>
                        </div>
                    ) : !selectedTest ? (
                        <div className="w-full h-full flex flex-col items-center justify-center">
                            <img src={correctPng} alt="" className="w-[40px] mb-4" />
                            <h1 className="text-xl font-bold">Welcome to the testing platform</h1>
                            <p>Select a test from the list on the right</p>
                        </div>
                    ) : !isTestStarted ? (
                        <div className="w-full h-full flex flex-col items-center justify-center">
                            <h2 className="text-2xl font-bold mb-4">{selectedTest.title}</h2>
                            <p className="mb-4">{selectedTest.description}</p>
                            <Button onClick={() => setIsTestStarted(true)}>Начать тест</Button>
                        </div>
                    ) : (
                        <TestComponent 
                            test={selectedTest} 
                            setSelectedTest={setSelectedTest} 
                            setIsTestStarted={setIsTestStarted} 
                        />
                    )}
                </main>


            </div>

        </div>
    )
}

export default MainPage