import { useState } from 'react';
import {
    DndContext,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    DragOverEvent,
    useDroppable,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy
} from '@dnd-kit/sortable';

import styles from './PlansScreen.module.css';
import { PlanTask, PlanStatus } from '../../types';
import { SortableTask } from './SortableTask';

interface PlansProps {
    plans: PlanTask[];
    setPlans: React.Dispatch<React.SetStateAction<PlanTask[]>>;
}

/* --- SUB-COMPONENT: The Droppable Column --- */
function PlanColumn({
                        status,
                        labelClass,
                        tasks,
                        onAdd,
                        onEdit
                    }: {
    status: PlanStatus,
    labelClass: string,
    tasks: PlanTask[],
    onAdd: () => void,
    onEdit: (t: PlanTask) => void
}) {
    // This is the secret sauce: useDroppable makes empty columns work!
    const { setNodeRef, isOver } = useDroppable({ id: status });

    return (
        <div
            ref={setNodeRef}
            className={`${styles.column} ${isOver ? styles.columnActive : ''}`}
        >
            <div className={styles.columnHeader}>
                <div className={`${styles.statusLabel} ${labelClass}`}>
                    <span className={styles.dot}>●</span>
                    {status.replace('-', ' ')}
                </div>
                <span className={styles.count}>{tasks.length}</span>
            </div>

            <SortableContext
                id={status}
                items={tasks.map(t => t.id)}
                strategy={verticalListSortingStrategy}
            >
                <div className={styles.taskList}>
                    {tasks.map(task => (
                        <SortableTask
                            key={task.id}
                            task={task}
                            onEdit={() => onEdit(task)}
                        />
                    ))}
                </div>
            </SortableContext>

            <div className={styles.columnFooter}>
                <button className={styles.addBtnInline} onClick={onAdd}>
                    + Add Task
                </button>
            </div>
        </div>
    );
}

export default function PlansScreen({ plans, setPlans }: PlansProps) {
    const [editingTask, setEditingTask] = useState<PlanTask | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState<{ open: boolean, status: PlanStatus }>({ open: false, status: 'to-do' });
    const [newTaskText, setNewTaskText] = useState('');

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id as number;
        const overId = over.id as any;

        const activeTask = plans.find(p => p.id === activeId);
        if (!activeTask) return;

        const statuses: PlanStatus[] = ['to-do', 'in-progress', 'in-review', 'complete'];
        const isOverAColumn = statuses.includes(overId);
        const overTask = plans.find(p => p.id === overId);

        const newStatus = isOverAColumn ? (overId as PlanStatus) : overTask?.status;

        if (newStatus && activeTask.status !== newStatus) {
            setPlans(prev => prev.map(t => t.id === activeId ? { ...t, status: newStatus } : t));
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return;

        if (active.id !== over.id) {
            setPlans((items) => {
                const oldIndex = items.findIndex((t) => t.id === active.id);
                const newIndex = items.findIndex((t) => t.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const addTask = () => {
        if (!newTaskText.trim()) return;
        setPlans([...plans, { id: Date.now(), text: newTaskText, status: isAddModalOpen.status }]);
        setNewTaskText('');
        setIsAddModalOpen({ open: false, status: 'to-do' });
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div className={styles.board}>
                <PlanColumn
                    status="to-do"
                    labelClass={styles.todo}
                    tasks={plans.filter(p => p.status === 'to-do')}
                    onAdd={() => setIsAddModalOpen({ open: true, status: 'to-do' })}
                    onEdit={setEditingTask}
                />
                <PlanColumn
                    status="in-progress"
                    labelClass={styles.progress}
                    tasks={plans.filter(p => p.status === 'in-progress')}
                    onAdd={() => setIsAddModalOpen({ open: true, status: 'in-progress' })}
                    onEdit={setEditingTask}
                />
                <PlanColumn
                    status="in-review"
                    labelClass={styles.review}
                    tasks={plans.filter(p => p.status === 'in-review')}
                    onAdd={() => setIsAddModalOpen({ open: true, status: 'in-review' })}
                    onEdit={setEditingTask}
                />
                <PlanColumn
                    status="complete"
                    labelClass={styles.complete}
                    tasks={plans.filter(p => p.status === 'complete')}
                    onAdd={() => setIsAddModalOpen({ open: true, status: 'complete' })}
                    onEdit={setEditingTask}
                />
            </div>

            {/* Modals remain exactly the same */}
            {isAddModalOpen.open && (
                <div className="modal-overlay"><div className="modal-content">
                    <h3>New Task in {isAddModalOpen.status}</h3>
                    <input className="modal-input" value={newTaskText} onChange={(e) => setNewTaskText(e.target.value)} placeholder="What needs to be done?" autoFocus />
                    <div className="modal-actions">
                        <button className="btn-cancel" onClick={() => setIsAddModalOpen({ open: false, status: 'to-do' })}>Cancel</button>
                        <button className="btn-save" onClick={addTask}>Add Task</button>
                    </div>
                </div></div>
            )}

            {editingTask && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Edit Task</h3>
                        <input className="modal-input" value={editingTask.text} onChange={(e) => setEditingTask({ ...editingTask, text: e.target.value })} autoFocus />
                        <div className="modal-actions" style={{ justifyContent: 'space-between' }}>
                            <button className="btn-cancel" style={{ color: '#fb7185' }} onClick={() => { setPlans(plans.filter(p => p.id !== editingTask.id)); setEditingTask(null); }}>Delete</button>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button className="btn-cancel" onClick={() => setEditingTask(null)}>Cancel</button>
                                <button className="btn-save" onClick={() => { setPlans(plans.map(p => p.id === editingTask.id ? editingTask : p)); setEditingTask(null); }}>Save</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DndContext>
    );
}