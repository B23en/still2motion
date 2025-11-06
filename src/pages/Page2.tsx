import { useState } from 'react'
import { IoMdInformationCircle } from 'react-icons/io'
import { IoArrowBackCircle } from 'react-icons/io5'

interface Page2Props {
  onNext: (motionType: string) => void
  onBack: () => void
}

const recommendedMotions = [
  { id: 'idle', label: 'Idle Motion', icon: '🙂', prompt: 'The character is idling' },
  { id: 'smile', label: 'Sway Motion', icon: '😙', prompt: 'The character is swaying' }
]

function Page2({ onNext, onBack }: Page2Props) {
  const [selectedMotion, setSelectedMotion] = useState<string>('')
  const [customPrompt, setCustomPrompt] = useState<string>('')

  const handleMotionSelect = (motionId: string) => {
    setSelectedMotion(motionId)
    const motion = recommendedMotions.find(m => m.id === motionId)
    if (motion) {
      setCustomPrompt(motion.prompt)
    }
  }

  const handleNext = () => {
    const promptText = selectedMotion
      ? recommendedMotions.find(m => m.id === selectedMotion)?.prompt
      : customPrompt.trim()

    if (promptText) {
      const confirmed = window.confirm(
        `다음 프롬프트로 진행하시겠습니까?\n\n"${promptText}"`
      )

      if (confirmed) {
        onNext(selectedMotion || customPrompt)
      }
    }
  }

  const isDisabled = !selectedMotion && !customPrompt.trim()

  return (
    <>
      {/* 뒤로가기 버튼 - 화면 전체 기준 */}
      <button
        onClick={onBack}
        style={{
          position: 'fixed',
          left: '20px',
          top: '50%',
          transform: 'translateY(-50%)',
          padding: '0',
          background: 'transparent',
          border: 'none',
          color: '#53535dff',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10
        }}
      >
        <IoArrowBackCircle size={32} />
      </button>

      <div className="page">
        <h1>Select Motion Prompt</h1>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '1rem',
        width: '100%',
        maxWidth: '400px',
        marginTop: '24px',
        marginBottom: '48px'
      }}>
        {recommendedMotions.map((motion) => (
          <button
            key={motion.id}
            onClick={() => handleMotionSelect(motion.id)}
            style={{
              padding: '1.5rem',
              border: selectedMotion === motion.id ? '2px solid #000' : '2px solid #666',
              borderRadius: '8px',
              background: 'transparent',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s'
            }}
          >
            <span style={{ fontSize: '1.8rem' }}>{motion.icon}</span>
            <span style={{
              fontSize: '0.875rem',
              color: selectedMotion === motion.id ? '#000' : '#666'
            }}>
              {motion.label}
            </span>
          </button>
        ))}
      </div>

      {/* 커스텀 프롬프트 입력 */}
      <p style={{
        fontSize: '0.75rem',
        color: '#1f1f20ff',
        marginBottom: '8px',
        marginTop: '0',
        display: 'flex',
        alignItems: 'center',
        gap: '0.25rem'
      }}>
        <IoMdInformationCircle size={14} />
        프롬포트 직접 입력 또한 가능합니다. (영어 권장)
      </p>
      <input
        type="text"
        placeholder="Enter custom motion prompt..."
        value={customPrompt}
        onChange={(e) => {
          setCustomPrompt(e.target.value)
          setSelectedMotion('')
        }}
        style={{
          width: '120%',
          maxWidth: '500px',
          padding: '0.35rem',
          border: '2px solid #666',
          borderRadius: '8px',
          fontSize: '0.875rem',
          background: 'transparent',
          color: '#000',
          outline: 'none',
          fontFamily: '"Pretendard Variable", Pretendard, sans-serif',
          marginBottom: '36px',
          textAlign: 'center'
        }}
      />

      <button onClick={handleNext} disabled={isDisabled}>
        Next
      </button>
      </div>
    </>
  )
}

export default Page2
