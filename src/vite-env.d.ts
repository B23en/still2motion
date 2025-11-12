/// <reference types="vite/client" />

interface Window {
  electron?: {
    closeWindow: () => void
  }
}
