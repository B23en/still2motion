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
  const [selectedMotion, setSelectedMotion] = useState<string>('')

  const goToPage2 = (file: File) => {
    setUploadedFile(file)
    setCurrentStep('page2')
  }
  const goToPage3 = (motionType: string) => {
    setSelectedMotion(motionType)
    setCurrentStep('page3')
  }
  const goToPage4 = () => setCurrentStep('page4')
  const resetToPage1 = () => {
    setUploadedFile(null)
    setSelectedMotion('')
    setCurrentStep('page1')
  }

  return (
    <div className="container">
      {currentStep === 'page1' && <Page1 onNext={goToPage2} />}
      {currentStep === 'page2' && <Page2 onNext={goToPage3} />}
      {currentStep === 'page3' && <Page3 onNext={goToPage4} />}
      {currentStep === 'page4' && <Page4 onReset={resetToPage1} />}
    </div>
  )
}

export default App
