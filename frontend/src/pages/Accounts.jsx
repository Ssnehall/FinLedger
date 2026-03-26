import { useState, useEffect } from 'react';
import { accountAPI } from '../services/api';
import { formatCurrency } from '../utils/helpers';
import { Spinner } from '../components/Loading';
import { showToast } from '../components/Toast';
import { AccountModal } from '../components/AccountModal';

export function Accounts() {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [balances, setBalances] = useState({});
    const [addingFunds, setAddingFunds] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        loadAccounts();
    }, []);

    const loadAccounts = async () => {
        setLoading(true);
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

    const handleCreateAccount = async (formData) => {
        setCreating(true);
        try {
            await accountAPI.create(formData);
            showToast('Account created successfully!', 'success');
            setShowModal(false);
            loadAccounts();
        } catch (error) {
            showToast(error.message || 'Failed to create account', 'error');
        } finally {
            setCreating(false);
        }
    };

    const handleAddFunds = async (accountId) => {
        const amount = prompt('Enter amount to add:');
        if (!amount || isNaN(amount) || amount <= 0) {
            showToast('Please enter a valid amount', 'error');
            return;
        }

        setAddingFunds(accountId);
        try {
            await accountAPI.addFunds(accountId, parseFloat(amount));
            showToast(`₹${amount} added successfully!`, 'success');
            loadAccounts();
        } catch (error) {
            showToast(error.message || 'Failed to add funds', 'error');
        } finally {
            setAddingFunds(null);
        }
    };

    const handleCloseAccount = async (account) => {
        const confirmed = window.confirm(
            `Are you sure you want to close "${account.name}"?\n\n` +
            `This will mark the account as CLOSED and prevent new transactions.\n` +
            `Transaction history will be preserved.\n\n` +
            `This action cannot be undone.`
        );

        if (!confirmed) return;

        try {
            await accountAPI.closeAccount(account._id);
            showToast(`Account "${account.name}" closed successfully`, 'success');
            loadAccounts();
        } catch (error) {
            showToast(error.message || 'Failed to close account', 'error');
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <Spinner />
            </div>
        );
    }

    return (
        <div className="page">
            <div className="container">
                <div className="page-header">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h1 className="page-title">Accounts</h1>
                            <p className="page-description">Manage your accounts</p>
                        </div>
                        <button
                            onClick={() => setShowModal(true)}
                            className="btn btn-primary"
                        >
                            + Create Account
                        </button>
                    </div>
                </div>

                {accounts.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
                        <p style={{ fontSize: '4rem', marginBottom: 'var(--spacing-md)' }}>🏦</p>
                        <h2 style={{ marginBottom: 'var(--spacing-sm)' }}>No Accounts Yet</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)', maxWidth: '400px', margin: '0 auto var(--spacing-md)' }}>
                            Get started by creating your first account. You'll be able to send and receive money once you have an account.
                        </p>
                        <button onClick={handleCreateAccount} className="btn btn-primary" disabled={creating}>
                            {creating ? <Spinner size="sm" /> : 'Create Your First Account'}
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Active Accounts Section */}
                        {accounts.filter(acc => acc.status === 'ACTIVE').length > 0 && (
                            <>
                                <h2 style={{ fontSize: '1.25rem', marginBottom: 'var(--spacing-md)', color: 'var(--text-primary)' }}>
                                    Active Accounts ({accounts.filter(acc => acc.status === 'ACTIVE').length})
                                </h2>
                                <div className="grid grid-3">
                                    {accounts
                                        .filter(account => account.status === 'ACTIVE')
                                        .map((account) => (
                                            <div
                                                key={account._id}
                                                className="card"
                                            >
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 'var(--spacing-md)' }}>
                                                    <div>
                                                        <h3 style={{ fontSize: '1.25rem', marginBottom: 'var(--spacing-xs)' }}>
                                                            {account.name || 'Unnamed Account'}
                                                        </h3>
                                                        <span className={`badge badge-${account.status.toLowerCase()}`}>
                                                            {account.type || 'SAVINGS'}
                                                        </span>
                                                    </div>
                                                    <p style={{ fontSize: '2rem' }}>
                                                        {account.currency === 'INR' ? '₹' : account.currency === 'USD' ? '$' : '€'}
                                                    </p>
                                                </div>

                                                {account.description && (
                                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 'var(--spacing-md)', fontStyle: 'italic' }}>
                                                        {account.description}
                                                    </p>
                                                )}

                                                <div style={{ marginBottom: 'var(--spacing-md)' }}>
                                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 'var(--spacing-xs)' }}>
                                                        Account ID
                                                    </p>
                                                    <p style={{
                                                        fontSize: '0.75rem',
                                                        fontFamily: 'monospace',
                                                        color: 'var(--text-muted)',
                                                        wordBreak: 'break-all'
                                                    }}>
                                                        {account._id}
                                                    </p>
                                                </div>

                                                <div>
                                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 'var(--spacing-xs)' }}>
                                                        Current Balance
                                                    </p>
                                                    <p style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                                                        {formatCurrency(balances[account._id] || 0, account.currency)}
                                                    </p>
                                                    <button
                                                        onClick={() => handleAddFunds(account._id)}
                                                        className="btn btn-sm"
                                                        style={{ marginTop: 'var(--spacing-sm)', width: '100%', background: 'var(--success)', fontSize: '0.875rem' }}
                                                        disabled={addingFunds === account._id}
                                                    >
                                                        {addingFunds === account._id ? <Spinner size="sm" /> : '+ Add Funds'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleCloseAccount(account)}
                                                        className="btn btn-sm"
                                                        style={{ marginTop: 'var(--spacing-xs)', width: '100%', background: 'var(--error)', fontSize: '0.875rem' }}
                                                    >
                                                        ✕ Close Account
                                                    </button>
                                                </div>

                                                <div style={{ marginTop: 'var(--spacing-md)', paddingTop: 'var(--spacing-md)', borderTop: '1px solid var(--border)' }}>
                                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                                                        Created: {new Date(account.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </>
                        )}

                        {/* Closed Accounts Section */}
                        {accounts.filter(acc => acc.status === 'CLOSED').length > 0 && (
                            <>
                                <h2 style={{ fontSize: '1.25rem', marginTop: 'var(--spacing-xl)', marginBottom: 'var(--spacing-md)', color: 'var(--text-secondary)' }}>
                                    Closed Accounts ({accounts.filter(acc => acc.status === 'CLOSED').length})
                                </h2>
                                <div className="grid grid-3">
                                    {accounts
                                        .filter(account => account.status === 'CLOSED')
                                        .map((account) => (
                                            <div
                                                key={account._id}
                                                className="card"
                                                style={{
                                                    opacity: 0.6,
                                                    filter: 'grayscale(50%)'
                                                }}
                                            >
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 'var(--spacing-md)' }}>
                                                    <div>
                                                        <h3 style={{ fontSize: '1.25rem', marginBottom: 'var(--spacing-xs)' }}>
                                                            {account.name || 'Unnamed Account'}
                                                        </h3>
                                                        <span className="badge" style={{ background: 'var(--bg-input)', color: 'var(--text-muted)' }}>
                                                            CLOSED
                                                        </span>
                                                    </div>
                                                    <p style={{ fontSize: '2rem' }}>
                                                        {account.currency === 'INR' ? '₹' : account.currency === 'USD' ? '$' : '€'}
                                                    </p>
                                                </div>

                                                {account.description && (
                                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 'var(--spacing-md)', fontStyle: 'italic' }}>
                                                        {account.description}
                                                    </p>
                                                )}

                                                <div style={{ marginBottom: 'var(--spacing-md)' }}>
                                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 'var(--spacing-xs)' }}>
                                                        Account ID
                                                    </p>
                                                    <p style={{
                                                        fontSize: '0.75rem',
                                                        fontFamily: 'monospace',
                                                        color: 'var(--text-muted)',
                                                        wordBreak: 'break-all'
                                                    }}>
                                                        {account._id}
                                                    </p>
                                                </div>

                                                <div>
                                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 'var(--spacing-xs)' }}>
                                                        Final Balance
                                                    </p>
                                                    <p style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-muted)' }}>
                                                        {formatCurrency(balances[account._id] || 0, account.currency)}
                                                    </p>
                                                </div>

                                                <div style={{ marginTop: 'var(--spacing-md)', paddingTop: 'var(--spacing-md)', borderTop: '1px solid var(--border)' }}>
                                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                                                        Created: {new Date(account.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </>
                        )}
                    </>
                )}

                <AccountModal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    onCreate={handleCreateAccount}
                    creating={creating}
                />
            </div>
        </div>
    );
}
