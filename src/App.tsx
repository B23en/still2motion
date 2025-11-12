import { useState } from 'react'
import './App.css'
import Page1 from './pages/Page1'
import Page2 from './pages/Page2'
import Page3 from './pages/Page3'

type Step = 'page1' | 'page2' | 'page3'

function App() {
  const [currentStep, setCurrentStep] = useState<Step>('page1')
  const [uploadedFilename, setUploadedFilename] = useState<string>('')
  const [taskId, setTaskId] = useState<string>('')

  const goToPage2 = (_file: File, filename: string) => {
    setUploadedFilename(filename)
    setCurrentStep('page2')
  }

  const goToPage3 = async (prompt: string) => {

    // 서버에 generate 요청
    try {
      const response = await fetch('http://localhost:8000/api/generate-motion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: uploadedFilename,
          prompt: prompt
        })
      })

      const result = await response.json()

      if (result.success) {
        setTaskId(result.task_id)
        setCurrentStep('page3')
      } else {
        alert('Generation 요청 실패: ' + result.error)
      }
    } catch (error) {
      console.error('Generate error:', error)
      alert('서버 연결 실패. 서버가 실행 중인지 확인해주세요.')
    }
  }

  const goBackToPage1 = () => setCurrentStep('page1')

  const handleExit = () => {
    // Electron 환경에서 window 닫기
    if (window.electron) {
      window.electron.closeWindow()
    } else {
      // 브라우저 환경에서는 창 닫기 시도
      window.close()
    }
  }

  return (
    <div className="container">
      {currentStep === 'page1' && <Page1 onNext={goToPage2} />}
      {currentStep === 'page2' && <Page2 onNext={goToPage3} onBack={goBackToPage1} />}
      {currentStep === 'page3' && <Page3 onExit={handleExit} taskId={taskId} />}
    </div>
  )
}

export default App
