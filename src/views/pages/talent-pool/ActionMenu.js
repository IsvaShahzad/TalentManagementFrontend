import React, { useState, useRef, useEffect } from 'react'

const ActionMenu = ({ onEdit, onDelete }) => {
    const [open, setOpen] = useState(false)
    const menuRef = useRef()

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <div ref={menuRef} style={{ position: 'absolute', top: '8px', right: '8px' }}>
            {/* Three dots button */}
            <button
                onClick={() => setOpen(!open)}
                style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '1.2rem',
                    padding: '0',
                }}
            >
                ⋮
            </button>

            {/* Floating menu */}
            {open && (
                <div
                    style={{
                        position: 'absolute',
                        top: '24px', // below the dots
                        right: 0,
                        background: '#fff',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        zIndex: 100,
                        minWidth: '120px',
                    }}
                >
                    <button
                        onClick={() => { setOpen(false); onEdit() }}
                        style={{
                            display: 'block',
                            width: '100%',
                            padding: '8px 12px',
                            background: 'transparent',
                            border: 'none',
                            textAlign: 'left',
                            cursor: 'pointer',
                        }}
                    >
                        Edit
                    </button>
                    <button
                        onClick={() => { setOpen(false); onDelete() }}
                        style={{
                            display: 'block',
                            width: '100%',
                            padding: '8px 12px',
                            background: 'transparent',
                            border: 'none',
                            textAlign: 'left',
                            cursor: 'pointer',
                            color: '#ef4444',
                        }}
                    >
                        Delete
                    </button>
                </div>
            )}
        </div>
    )
}

export default ActionMenu
