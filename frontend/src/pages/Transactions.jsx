import { useState, useEffect } from 'react';
import { accountAPI, transactionAPI } from '../services/api';
import { generateUUID, formatCurrency } from '../utils/helpers';
import { Spinner } from '../components/Loading';
import { showToast } from '../components/Toast';

export function Transactions() {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [balances, setBalances] = useState({});

    const [formData, setFormData] = useState({
        fromAccount: '',
        toAccount: '',
        amount: '',
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        loadAccounts();
    }, []);

    const loadAccounts = async () => {
        try {
            const data = await accountAPI.getAll();
            setAccounts(data);

            // Load balances
            const balanceData = {};
            for (const account of data) {
                try {
                    const result = await accountAPI.getBalance(account._id);
                    balanceData[account._id] = result.balance;
                } catch (error) {
                    balanceData[account._id] = 0;
                }
            }
            setBalances(balanceData);
        } catch (error) {
            showToast(error.message || 'Failed to load accounts', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.fromAccount) {
            newErrors.fromAccount = 'Please select an account';
        }

        if (!formData.toAccount) {
            newErrors.toAccount = 'Please enter recipient account ID';
        }

        if (!formData.amount) {
            newErrors.amount = 'Please enter amount';
        } else if (parseFloat(formData.amount) <= 0) {
            newErrors.amount = 'Amount must be greater than 0';
        } else if (parseFloat(formData.amount) > (balances[formData.fromAccount] || 0)) {
            newErrors.amount = 'Insufficient balance';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        setProcessing(true);
        const idempotencyKey = generateUUID();

        try {
            await transactionAPI.create({
                fromAccount: formData.fromAccount,
                toAccount: formData.toAccount,
                amount: parseFloat(formData.amount),
                idempotencyKey,
            });

            showToast('Transaction completed successfully!', 'success');

            // Reset form
            setFormData({
                fromAccount: '',
                toAccount: '',
                amount: '',
            });

            // Reload accounts
            loadAccounts();
        } catch (error) {
            showToast(error.message || 'Transaction failed', 'error');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <Spinner />
            </div>
        );
    }

    if (accounts.length === 0) {
        return (
            <div className="page">
                <div className="container">
                    <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
                        <p style={{ fontSize: '4rem', marginBottom: 'var(--spacing-md)' }}>🏦</p>
                        <h2 style={{ marginBottom: 'var(--spacing-sm)' }}>No Accounts Available</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>
                            You need at least one account to send money. Create an account first.
                        </p>
                        <a href="/accounts" className="btn btn-primary">
                            Create Account
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="container">
                <div className="page-header">
                    <h1 className="page-title">Send Money</h1>
                    <p className="page-description">Transfer funds between accounts</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-lg)' }}>
                    {/* Transaction Form */}
                    <div>
                        <div className="card">
                            <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Transaction Details</h3>

                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label className="form-label">From Account</label>
                                    <select
                                        name="fromAccount"
                                        className="form-select"
                                        value={formData.fromAccount}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select an account</option>
                                        {accounts.filter(acc => acc.status === 'ACTIVE').map((account) => (
                                            <option key={account._id} value={account._id}>
                                                {account._id.substring(0, 8)}... - {formatCurrency(balances[account._id] || 0, account.currency)}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.fromAccount && <p className="form-error">{errors.fromAccount}</p>}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">To Account ID</label>
                                    <input
                                        type="text"
                                        name="toAccount"
                                        className="form-input"
                                        placeholder="Enter recipient account ID"
                                        value={formData.toAccount}
                                        onChange={handleChange}
                                    />
                                    {errors.toAccount && <p className="form-error">{errors.toAccount}</p>}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Amount</label>
                                    <input
                                        type="number"
                                        name="amount"
                                        className="form-input"
                                        placeholder="0.00"
                                        step="0.01"
                                        value={formData.amount}
                                        onChange={handleChange}
                                    />
                                    {errors.amount && <p className="form-error">{errors.amount}</p>}
                                    {formData.fromAccount && (
                                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 'var(--spacing-xs)' }}>
                                            Available: {formatCurrency(balances[formData.fromAccount] || 0)}
                                        </p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-success"
                                    style={{ width: '100%' }}
                                    disabled={processing}
                                >
                                    {processing ? (
                                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                            <Spinner size="sm" />
                                            Processing... (this may take ~15 seconds)
                                        </span>
                                    ) : (
                                        'Send Money'
                                    )}
                                </button>
                            </form>

                            {processing && (
                                <div style={{
                                    marginTop: 'var(--spacing-md)',
                                    padding: 'var(--spacing-md)',
                                    background: 'rgba(245, 158, 11, 0.1)',
                                    border: '1px solid rgba(245, 158, 11, 0.3)',
                                    borderRadius: 'var(--radius-md)'
                                }}>
                                    <p style={{ color: 'var(--warning)', fontSize: '0.875rem' }}>
                                        ⏳ Transaction is being processed. Please do not refresh the page.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Your Accounts */}
                    <div>
                        <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Your Active Accounts</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                            {accounts.filter(acc => acc.status === 'ACTIVE').map((account) => (
                                <div key={account._id} className="card">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 'var(--spacing-sm)' }}>
                                        <span className={`badge badge-${account.status.toLowerCase()}`}>
                                            {account.type || account.status}
                                        </span>
                                        <p style={{ fontSize: '1.5rem' }}>
                                            {account.currency === 'INR' ? '₹' : account.currency === 'USD' ? '$' : '€'}
                                        </p>
                                    </div>
                                    <p style={{
                                        fontSize: '0.75rem',
                                        fontFamily: 'monospace',
                                        color: 'var(--text-muted)',
                                        marginBottom: 'var(--spacing-sm)',
                                        wordBreak: 'break-all'
                                    }}>
                                        {account._id}
                                    </p>
                                    <p style={{ fontSize: '1.25rem', fontWeight: '700' }}>
                                        {formatCurrency(balances[account._id] || 0, account.currency)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
