interface Page3Props {
  onNext: () => void
}

function Page3({ onNext }: Page3Props) {
  return (
    <div className="page">
      <h1>Generating...</h1>

      {/* 로딩 애니메이션 */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '52px',
        marginTop: '24px'
      }}>
        <div style={{
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          backgroundColor: '#666',
          animation: 'bounce 1.4s infinite ease-in-out both',
          animationDelay: '0s'
        }} />
        <div style={{
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          backgroundColor: '#666',
          animation: 'bounce 1.4s infinite ease-in-out both',
          animationDelay: '0.16s'
        }} />
        <div style={{
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          backgroundColor: '#666',
          animation: 'bounce 1.4s infinite ease-in-out both',
          animationDelay: '0.32s'
        }} />
      </div>

      <button onClick={onNext}>Next</button>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}

export default Page3
