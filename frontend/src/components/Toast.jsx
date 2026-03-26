import { useState, useEffect } from 'react';

let toastId = 0;

export function Toast({ message, type = 'success', onClose }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 5000);

        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`toast toast-${type}`}>
            <p>{message}</p>
        </div>
    );
}

export function ToastContainer() {
    const [toasts, setToasts] = useState([]);

    // Make addToast globally available
    useEffect(() => {
        window.addToast = (message, type = 'success') => {
            const id = toastId++;
            setToasts(prev => [...prev, { id, message, type }]);
        };

        return () => {
            delete window.addToast;
        };
    }, []);

    const removeToast = (id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    return (
        <div className="toast-container">
            {toasts.map(toast => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    onClose={() => removeToast(toast.id)}
                />
            ))}
        </div>
    );
}

// Helper function to show toasts
export function showToast(message, type = 'success') {
    if (window.addToast) {
        window.addToast(message, type);
    }
}
