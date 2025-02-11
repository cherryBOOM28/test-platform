import { useEffect, useState } from "react"
import { useDrag, useDrop } from 'react-dnd'


const DraggableItem = ({ text, index, moveItem }) => {
    const [, dragRef] = useDrag({
        type: 'number',
        item: { index },
    })

    const [, dropRef] = useDrop({
        accept: 'number',
        hover: (draggedItem) => {
            if(draggedItem.index !== index) {
                moveItem(draggedItem.index, index)
                draggedItem.index = index
            }
        }
    })

    return (
        <div
            ref={(node) => dragRef(dropRef(node))}
            className="border p-2 rounded-lg cursor-move bg-gray-100 flex justify-center items-center mb-2"
        >
            {text}
        </div>
    )
}

const SortingQuestion = ({ options, answers, setAnswers, questionId }) => {
    const [sortedOptions, setSortedOptions] = useState(options)

    useEffect(() => {
        if(answers[questionId]) {
            setSortedOptions(answers[questionId])
        }
    }, [answers, questionId])

    const moveItem = (fromIndex, toIndex) => {
        const updatedOptions = [...sortedOptions]
        const [movedItem] = updatedOptions.splice(fromIndex, 1)
        updatedOptions.splice(toIndex, 0, movedItem)

        setSortedOptions(updatedOptions)
        setAnswers((prev) => ({ ...prev, [questionId]: updatedOptions }))
    }

    return (
        <div>
            <h3 className="text-sm font-semibold mb-4">Перетащите числа в правильный порядок:</h3>
            <div className="flex flex-col">
                {sortedOptions.map((num, index) => (
                    <DraggableItem key={index} index={index} text={num} moveItem={moveItem} />
                ))}
            </div>
        </div>
    )
}

export default SortingQuestion