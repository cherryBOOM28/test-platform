function Button({children, className, ...props}) {
    return (
        <button 
            {...props} 
            className={`text-[#1F09FF] transition-colors duration-300 hover:text-white hover:bg-[#1F09FF] px-4 py-2 rounded-md border-2 border-[#1F09FF] ${className}`}
        >
            {children}
        </button>
    );
}

export default Button;