import { useState } from 'react'
import './App.css'
import Page1 from './pages/Page1'
import Page2 from './pages/Page2'
import Page3 from './pages/Page3'
import Page4 from './pages/Page4'

type Step = 'page1' | 'page2' | 'page3' | 'page4'

function App() {
  const [currentStep, setCurrentStep] = useState<Step>('page1')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadedFilename, setUploadedFilename] = useState<string>('')
  const [selectedMotion, setSelectedMotion] = useState<string>('')
  const [taskId, setTaskId] = useState<string>('')

  const goToPage2 = (file: File, filename: string) => {
    setUploadedFile(file)
    setUploadedFilename(filename)
    setCurrentStep('page2')
  }

  const goToPage3 = async (prompt: string) => {
    setSelectedMotion(prompt)

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
  const goToPage4 = () => setCurrentStep('page4')
  const goBackToPage1 = () => setCurrentStep('page1')
  const resetToPage1 = () => {
    setUploadedFile(null)
    setSelectedMotion('')
    setCurrentStep('page1')
  }

  return (
    <div className="container">
      {currentStep === 'page1' && <Page1 onNext={goToPage2} />}
      {currentStep === 'page2' && <Page2 onNext={goToPage3} onBack={goBackToPage1} />}
      {currentStep === 'page3' && <Page3 onNext={goToPage4} taskId={taskId} />}
      {currentStep === 'page4' && <Page4 onReset={resetToPage1} />}
    </div>
  )
}

export default App
