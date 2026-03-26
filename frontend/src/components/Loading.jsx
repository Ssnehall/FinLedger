export function Spinner({ size = 'md' }) {
    return (
        <div className={`spinner ${size === 'sm' ? 'spinner-sm' : ''}`}></div>
    );
}

export function LoadingPage() {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh'
        }}>
            <Spinner />
        </div>
    );
}
