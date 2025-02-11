import { useDrag, useDrop } from "react-dnd"

// Компонент перетаскиваемого элемента
const DraggableItem = ({ text, index }) => {
    const [{ isDragging }, dragRef] = useDrag({
        type: "option",
        item: { text, index },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    })

    return (
        <div
            ref={dragRef}
            className={`border rounded-lg cursor-move w-[200px] h-[90px] flex justify-center items-center bg-gray-100 ${
                isDragging ? "opacity-50" : ""
            }`}
        >
            {text}
        </div>
    )
}

// Компонент зоны для сброса (универсальный)
const DropZone = ({ label, answer, onDrop }) => {
    const [{ isOver }, dropRef] = useDrop({
        accept: "option",
        drop: (item) => onDrop(label, item.text),
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    })

    return (
        <div className="flex mb-4">
            <div className="flex flex-col items-center">
                <span className="font-semibold mb-2">{label}</span>
                <div
                    ref={dropRef}
                    className={`border rounded-lg cursor-move w-[200px] h-[90px] flex justify-center items-center bg-gray-100 ${
                        isOver ? "bg-gray-200" : "bg-white"
                    }`}
                >
                    {answer || "Перетащите сюда"}
                </div>
            </div>
        </div>
    )
}

// Главный компонент Drag & Drop вопроса (универсальный)
const DragAndDropQuestion = ({ options, setAnswers, questionId, answers }) => {
    const labels = Object.keys(options); // "Япония", "Франция" и т. д.
    const values = Object.values(options); // "Токио", "Париж" и т. д.

    // Функция обработки перетаскивания
    const handleDrop = (label, value) => {
        setAnswers((prev) => ({
            ...prev,
            [questionId]: { ...prev[questionId], [label]: value },
        }))
    }

    return (
        <div className="">
            <h3 className="text-sm font-semibold mb-6">
                Перетащите соответствия:
            </h3>

            {/* Отображаем зоны для сброса */}
            <div className="flex flex-wrap gap-x-4 mb-4">
                {labels.map((label) => (
                    <DropZone
                        key={label}
                        label={label}
                        answer={answers?.[questionId]?.[label] || ""}
                        onDrop={handleDrop}
                    />
                ))}
            </div>

            {/* Отображаем перетаскиваемые элементы */}
            <div className="flex gap-x-4  mt-4">
                {values.map((value, index) => (
                    <DraggableItem key={index} text={value} index={index} />
                ))}
            </div>
        </div>
    )
}

export default DragAndDropQuestion
