import { useState, useRef, useEffect } from 'react';
import styles from './NotesScreen.module.css';
import { Note } from '../../types';

interface NotesProps {
    notes: Note[];
    setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
}

export default function NotesScreen({ notes, setNotes }: NotesProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [editingNote, setEditingNote] = useState<Note | null>(null);

    const containerRef = useRef<HTMLDivElement>(null);

    // Click outside logic to "Auto-Save"
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                if (title.trim() || content.trim()) {
                    saveNote();
                } else {
                    setIsExpanded(false);
                }
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [title, content]);

    const saveNote = () => {
        const newNote: Note = {
            id: Date.now(),
            title: title || 'Untitled',
            content: content,
            color: '#2d2d2d', // Default dark gray
            date: new Date().toLocaleDateString()
        };
        setNotes([newNote, ...notes]);
        setTitle('');
        setContent('');
        setIsExpanded(false);
    };

    const deleteNote = (id: number) => {
        setNotes(notes.filter(n => n.id !== id));
        setEditingNote(null);
    };

    const updateNote = () => {
        if (!editingNote) return;
        setNotes(notes.map(n => n.id === editingNote.id ? editingNote : n));
        setEditingNote(null);
    };

    return (
        <div className={styles.container}>
            {/* --- TOP INPUT SECTION --- */}
            <div className={styles.inputWrapper} ref={containerRef}>
                <div className={`${styles.inputCard} ${isExpanded ? styles.expanded : ''}`}>
                    {isExpanded && (
                        <input
                            className={styles.titleInput}
                            placeholder="Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    )}
                    <textarea
                        className={styles.contentInput}
                        placeholder="Take a note..."
                        value={content}
                        onClick={() => setIsExpanded(true)}
                        onChange={(e) => setContent(e.target.value)}
                        rows={isExpanded ? 3 : 1}
                    />
                    {isExpanded && (
                        <div className={styles.inputActions}>
                            <button className={styles.doneBtn} onClick={saveNote}>Close</button>
                        </div>
                    )}
                </div>
            </div>

            {/* --- NOTES GRID --- */}
            <div className={styles.notesGrid}>
                {notes.map(note => (
                    <div
                        key={note.id}
                        className={styles.noteCard}
                        style={{ backgroundColor: note.color }}
                        onClick={() => setEditingNote(note)}
                    >
                        {note.title && <h4 className={styles.noteTitle}>{note.title}</h4>}
                        <p className={styles.noteContent}>{note.content}</p>
                        <span className={styles.noteDate}>{note.date}</span>
                    </div>
                ))}
            </div>

            {/* --- EDIT MODAL --- */}
            {editingNote && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ backgroundColor: editingNote.color }}>
                        <input
                            className="modal-input"
                            value={editingNote.title}
                            onChange={(e) => setEditingNote({...editingNote, title: e.target.value})}
                        />
                        <textarea
                            className={styles.modalTextarea}
                            value={editingNote.content}
                            onChange={(e) => setEditingNote({...editingNote, content: e.target.value})}
                        />
                        <div className="modal-actions" style={{ justifyContent: 'space-between' }}>
                            <button className="btn-cancel" style={{ color: '#fb7185' }} onClick={() => deleteNote(editingNote.id)}>Delete</button>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button className="btn-cancel" onClick={() => setEditingNote(null)}>Cancel</button>
                                <button className="btn-save" onClick={updateNote}>Save</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}