import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PlanTask } from '../../types';
import styles from './PlansScreen.module.css';

interface SortableTaskProps {
    task: PlanTask;
    onEdit: () => void;
}

export function SortableTask({ task, onEdit }: SortableTaskProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
        // CRITICAL for professional dragging feel
        touchAction: 'none',
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={styles.card}
            {...attributes}
            {...listeners}
            onClick={onEdit}
        >
            {task.text}
        </div>
    );
}