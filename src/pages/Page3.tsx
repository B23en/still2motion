import { useState, useEffect, useRef } from 'react'
import { IoChevronDown, IoChevronUp } from 'react-icons/io5'

interface Page3Props {
  onExit: () => void
  taskId: string
}

function Page3({ onExit, taskId }: Page3Props) {
  const [showLogs, setShowLogs] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const [isCompleted, setIsCompleted] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  const isCompletedRef = useRef(false)

  useEffect(() => {
    if (!taskId) return

    // WebSocket 연결
    const ws = new WebSocket(`ws://localhost:8000/ws/logs/${taskId}`)
    wsRef.current = ws

    ws.onopen = () => {
      console.log('WebSocket connected')
    }

    ws.onmessage = (event) => {
      const message = event.data
      setLogs(prev => [...prev, message])

      // [DONE] 메시지를 받으면 완료 처리
      if (message.includes('[DONE]')) {
        setIsCompleted(true)
        isCompletedRef.current = true
      }
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
      // onerror에서는 로그를 추가하지 않음 (연결 중 일시적 에러 방지)
    }

    ws.onclose = (event) => {
      console.log('WebSocket closed', event.code, event.reason)
      // 에러 로그를 사용자에게 표시하지 않음 (콘솔에만 기록)
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [taskId])

  return (
    <div className="page">
      <h1>{isCompleted ? 'Done' : 'Generating...'}</h1>

      {/* 로딩 애니메이션 - 완료되면 숨김 */}
      {!isCompleted && (
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
      )}

      {/* 로그 토글 버튼 */}
      <button
        onClick={() => setShowLogs(!showLogs)}
        style={{
          padding: '0',
          fontSize: '0.75rem',
          background: 'transparent',
          border: 'none',
          color: '#4a90e2',
          cursor: 'pointer',
          fontFamily: '"Pretendard Variable", Pretendard, sans-serif',
          marginBottom: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem'
        }}
      >
        {showLogs ? <IoChevronUp size={14} /> : <IoChevronDown size={14} />}
        {showLogs ? 'Hide Logs' : 'Show Logs'}
      </button>

      {/* 로그 영역 */}
      {showLogs && (
        <div style={{
          width: '100%',
          maxWidth: '500px',
          maxHeight: '200px',
          overflowY: 'auto',
          padding: '1rem',
          border: '1px solid #666',
          borderRadius: '4px',
          background: '#f9f9f9',
          marginBottom: '24px',
          fontFamily: 'monospace',
          fontSize: '0.75rem',
          color: '#333'
        }}>
          {logs.length === 0 ? (
            <div>Waiting for logs...</div>
          ) : (
            logs.map((log, index) => (
              <div key={index} style={{ marginBottom: '0.5rem' }}>
                {log}
              </div>
            ))
          )}
        </div>
      )}

      {/* 완료 후에만 Exit 버튼 표시 */}
      {isCompleted && <button onClick={onExit}>Exit</button>}

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
