import { useState } from 'react';
import Button from '../components/Button'
import { useAuth } from '../auth/AuthContext.jsx'
import Modal from '../components/Modal.jsx'
import Input from '../components/Input.jsx'

const Header = () => {
    const { user, login, register, logout } = useAuth()
    const [isLoginOpen, setIsLoginOpen] = useState(false)
    const [isRegisterOpen, setIsRegisterOpen] = useState(false)

    // Данные для логина
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("")

    // Данные для регистрации
    const [registerUsername, setRegisterUsername] = useState("")
    const [registerEmail, setRegisterEmail] = useState("")
    const [registerPassword, setRegisterPassword] = useState("")

     // Обработчик входа
     const handleLogin = async () => {
        await login(loginEmail, loginPassword);
        setIsLoginOpen(false);
    };

    // Обработчик регистрации
    const handleRegister = async () => {
        await register(registerUsername, registerEmail, registerPassword);
        setIsRegisterOpen(false);
    };

    return (
        <div className='w-full bg-white shadow-lg rounded-lg p-4 flex justify-between items-center'>
            <div className='text-[#1F09FF] font-semibold text-[20px]'>
            &#x1F680; test platform
            </div>

            <div className="flex items-center gap-4">
                {user ? (
                    <>
                        <span className="text-[#1F09FF] text-[16px]">{user.username}</span>
                        <Button onClick={logout} className="flex justify-center items-center h-[40px]">
                            Выйти
                        </Button>
                    </>
                ) : (
                    <>
                        <button onClick={() => setIsLoginOpen(true)} className="text-[#1F09FF] text-[16px]">
                            Вход
                        </button>
                        <Button onClick={() => setIsRegisterOpen(true)} className="flex justify-center items-center h-[40px]">
                            Нет аккаунта?
                        </Button>
                    </>
                )}
                
            </div>

                   
            {/* Модальное окно для входа */}
            {isLoginOpen && (
                <Modal onClose={() => setIsLoginOpen(false)} title="Вход">
                    <Input 
                        label="Email"
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                    />
                    <Input 
                        label="Пароль"
                        type="password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                    />
                    <Button onClick={handleLogin} className="w-full">
                        Войти
                    </Button>
                </Modal>
            )}

            {/* Модальное окно для регистрации */}
            {isRegisterOpen && (
                <Modal onClose={() => setIsRegisterOpen(false)} title="Регистрация">
                    <Input 
                        label="Имя пользователя"
                        type="text"
                        value={registerUsername}
                        onChange={(e) => setRegisterUsername(e.target.value)}
                    />
                    <Input 
                        label="Email"
                        type="email"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                    />
                    <Input 
                        label="Пароль"
                        type="password"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                    />
                    <Button onClick={handleRegister} className="w-full">
                        Зарегистрироваться
                    </Button>
                </Modal>
            )}
        </div>
    );
};

export default Header;