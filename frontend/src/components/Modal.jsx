const Modal = ({ onClose, title, children }) => {
    return (
        <div 
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
            onClick={onClose} // Закрытие при клике на фон
        >
            <div 
                className="bg-white p-8 w-[550px] rounded-lg shadow-lg relative"
                onClick={(e) => e.stopPropagation()} // Остановить всплытие, чтобы не закрывать при клике внутри
            >
                <button 
                    onClick={onClose} 
                    className="absolute top-3 right-3 text-gray-500 hover:text-black text-xl"
                >
                    ✖
                </button>

                {/* Заголовок */}
                <h2 className="text-lg font-bold mb-4 text-center">{title}</h2>

                {/* Контент */}
                {children}
            </div>
        </div>
    );
};




export default Modal;
