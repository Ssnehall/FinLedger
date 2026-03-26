import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { accountAPI } from '../services/api';
import { formatCurrency } from '../utils/helpers';
import { Spinner } from '../components/Loading';
import { showToast } from '../components/Toast';

export function Dashboard() {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [balances, setBalances] = useState({});

    useEffect(() => {
        loadAccounts();
    }, []);

    const loadAccounts = async () => {
        try {
            const data = await accountAPI.getAll();
            setAccounts(data);

            // Load balances for each account
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

    const getTotalBalance = () => {
        return Object.values(balances).reduce((sum, bal) => sum + (bal || 0), 0);
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
                    <h1 className="page-title">Dashboard</h1>
                    <p className="page-description">Welcome back! Here's your financial overview</p>
                </div>

                {/* Stats Section */}
                <div className="grid grid-2" style={{ marginBottom: 'var(--spacing-lg)' }}>
                    <div className="stat-card">
                        <div className="stat-icon stat-icon-primary">
                            💰
                        </div>
                        <p className="stat-label">Total Balance</p>
                        <p className="stat-value">{formatCurrency(getTotalBalance())}</p>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon stat-icon-success">
                            🏦
                        </div>
                        <p className="stat-label">Total Accounts</p>
                        <p className="stat-value">{accounts.length}</p>
                        <div style={{
                            display: 'flex',
                            gap: 'var(--spacing-md)',
                            marginTop: 'var(--spacing-sm)',
                            paddingTop: 'var(--spacing-sm)',
                            borderTop: '1px solid var(--border)'
                        }}>
                            <div style={{ flex: 1 }}>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Active</p>
                                <p style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--success)' }}>
                                    {accounts.filter(acc => acc.status === 'ACTIVE').length}
                                </p>
                            </div>
                            <div style={{ flex: 1 }}>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Closed</p>
                                <p style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-muted)' }}>
                                    {accounts.filter(acc => acc.status === 'CLOSED').length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Accounts Overview */}
                <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
                        <h2>Your Accounts</h2>
                        <Link to="/accounts" className="btn btn-primary">
                            Manage Accounts
                        </Link>
                    </div>

                    {accounts.length === 0 ? (
                        <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
                            <p style={{ fontSize: '3rem', marginBottom: 'var(--spacing-md)' }}>🏦</p>
                            <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>No Accounts Yet</h3>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>
                                Create your first account to get started
                            </p>
                            <Link to="/accounts" className="btn btn-primary">
                                Create Account
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-3">
                            {accounts.slice(0, 3).map((account) => (
                                <div key={account._id} className="card">
                                    <div style={{ marginBottom: 'var(--spacing-sm)' }}>
                                        <span className={`badge badge-${account.status.toLowerCase()}`}>
                                            {account.status}
                                        </span>
                                    </div>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 'var(--spacing-xs)' }}>
                                        Account ID
                                    </p>
                                    <p style={{ fontSize: '0.75rem', fontFamily: 'monospace', marginBottom: 'var(--spacing-md)', color: 'var(--text-muted)' }}>
                                        {account._id}
                                    </p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Balance</p>
                                            <p style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                                                {formatCurrency(balances[account._id] || 0, account.currency)}
                                            </p>
                                        </div>
                                        <p style={{ fontSize: '1.5rem' }}>{account.currency === 'INR' ? '₹' : '$'}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div>
                    <h2 style={{ marginBottom: 'var(--spacing-md)' }}>Quick Actions</h2>
                    <div className="grid grid-3">
                        <Link to="/transactions" className="card" style={{ textDecoration: 'none' }}>
                            <div style={{ fontSize: '2rem', marginBottom: 'var(--spacing-sm)' }}>💸</div>
                            <h3 style={{ marginBottom: 'var(--spacing-xs)' }}>Send Money</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                Transfer funds between accounts
                            </p>
                        </Link>

                        <Link to="/accounts" className="card" style={{ textDecoration: 'none' }}>
                            <div style={{ fontSize: '2rem', marginBottom: 'var(--spacing-sm)' }}>➕</div>
                            <h3 style={{ marginBottom: 'var(--spacing-xs)' }}>New Account</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                Create a new account
                            </p>
                        </Link>

                        <button
                            onClick={loadAccounts}
                            className="card"
                            style={{
                                textDecoration: 'none',
                                border: '1px solid var(--border)',
                                background: 'var(--bg-card)',
                                cursor: 'pointer',
                                textAlign: 'left',
                                padding: 'var(--spacing-md)'
                            }}
                        >
                            <div style={{ fontSize: '2rem', marginBottom: 'var(--spacing-sm)' }}>🔄</div>
                            <h3 style={{ marginBottom: 'var(--spacing-xs)' }}>Refresh</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                Update balances
                            </p>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
