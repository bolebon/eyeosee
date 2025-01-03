import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { initContainer } from './eyeosee-container.gen.ts'

initContainer().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App minAge={17} __deps={{ '@hooks/useAgeControl': () => {
        console.log('useAgeControl')
      }}}/>
    </StrictMode>,
  )
})

