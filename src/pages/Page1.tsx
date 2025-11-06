import { useState } from 'react'
import { IoMdInformationCircle } from 'react-icons/io'

interface Page1Props {
  onNext: (file: File, filename: string) => void
}

function Page1({ onNext }: Page1Props) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // 이미지 파일 타입 체크
      if (file.type.startsWith('image/')) {
        setSelectedFile(file)

        // 이미지 미리보기 URL 생성
        const reader = new FileReader()
        reader.onloadend = () => {
          setPreviewUrl(reader.result as string)
        }
        reader.readAsDataURL(file)
      } else {
        alert('이미지 파일만 업로드할 수 있습니다.')
      }
    }
  }

  const handleNext = async () => {
    if (selectedFile) {
      setUploading(true)

      try {
        // 서버로 파일 전송
        const formData = new FormData()
        formData.append('file', selectedFile)

        const response = await fetch('http://localhost:8000/api/upload', {
          method: 'POST',
          body: formData
        })

        const result = await response.json()

        if (result.success) {
          console.log('Upload successful:', result)
          onNext(selectedFile, result.filename)
        } else {
          alert('업로드 실패: ' + result.error)
        }
      } catch (error) {
        console.error('Upload error:', error)
        alert('서버 연결 실패. 서버가 실행 중인지 확인해주세요.')
      } finally {
        setUploading(false)
      }
    }
  }

  return (
    <div className="page">
      <h1>Upload Character Image</h1>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        id="file-upload"
        style={{ display: 'none' }}
      />
      <label htmlFor="file-upload" style={{ cursor: 'pointer', marginBottom: '12px' }}>
        <div style={{
          padding: '2rem 3rem',
          border: '1px dashed #666',
          borderRadius: '4px',
          fontSize: '0.875rem',
          color: '#666',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.5rem',
          transition: 'all 0.2s'
        }}>
          {!selectedFile && (
            <div style={{
              fontSize: '2rem',
              fontWeight: '300',
              color: '#999'
            }}>
              +
            </div>
          )}
          {previewUrl && (
            <img
              src={previewUrl}
              alt="Preview"
              style={{
                maxWidth: '120px',
                maxHeight: '120px',
                objectFit: 'contain',
                borderRadius: '4px'
              }}
            />
          )}
          <div style={{ fontSize: '0.875rem' }}>
            {selectedFile ? selectedFile.name : 'Choose File'}
          </div>
        </div>
      </label>
      <p style={{
        fontSize: '0.75rem',
        color: '#1f1f20ff',
        marginBottom: '32px',
        marginTop: '0',
        display: 'flex',
        alignItems: 'center',
        gap: '0.25rem'
      }}>
        <IoMdInformationCircle size={14} />
        1280x704 이상의 크기가 권장됩니다
      </p>
      <button onClick={handleNext} disabled={!selectedFile || uploading}>
        {uploading ? 'Uploading...' : 'Next'}
      </button>
    </div>
  )
}

export default Page1
