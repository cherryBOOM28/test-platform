const Input = ({ label, type, value, onChange }) => {
    return (
        <div className="mb-3">
            <label className="block text-gray-700">{label}</label>
            <input
                type={type}
                value={value}
                onChange={onChange}
                className="w-full p-2 border rounded-md"
            />
        </div>
    );
};

export default Input;
