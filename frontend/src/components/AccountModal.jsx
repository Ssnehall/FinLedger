import { useState } from 'react';
import { Spinner } from './Loading';

export function AccountModal({ isOpen, onClose, onCreate, creating }) {
    const [formData, setFormData] = useState({
        name: '',
        type: 'SAVINGS',
        currency: 'INR',
        description: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onCreate(formData);
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Create New Account</h2>
                    <button onClick={onClose} className="modal-close">&times;</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Account Name *</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            className="form-input"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="e.g., Personal Savings"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="type">Account Type</label>
                        <select
                            id="type"
                            name="type"
                            className="form-input"
                            value={formData.type}
                            onChange={handleChange}
                        >
                            <option value="SAVINGS">Savings Account</option>
                            <option value="CHECKING">Checking Account</option>
                            <option value="BUSINESS">Business Account</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="currency">Currency</label>
                        <select
                            id="currency"
                            name="currency"
                            className="form-input"
                            value={formData.currency}
                            onChange={handleChange}
                        >
                            <option value="INR">Indian Rupee (₹)</option>
                            <option value="USD">US Dollar ($)</option>
                            <option value="EUR">Euro (€)</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Description (Optional)</label>
                        <textarea
                            id="description"
                            name="description"
                            className="form-input"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Add a note about this account..."
                            rows="3"
                        />
                    </div>

                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="btn btn-secondary">
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={creating}>
                            {creating ? <Spinner size="sm" /> : 'Create Account'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
