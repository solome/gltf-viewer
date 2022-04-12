import * as React from 'react'
import { GLTFViewer } from './gltf-viewer'

import './App.css'

function App() {
  const ref = React.useRef(null)
  React.useEffect(() => {
    const glTFViewer = new GLTFViewer({})

    Object.assign(window, { $glTFViewer: glTFViewer })
    if (ref.current) glTFViewer.appendTo(ref.current)

    const callback = async () => {
      await glTFViewer.load('//cdn.glitch.me/36cb8393-65c6-408d-a538-055ada20431b/Astronaut.glb')
    }

    callback()
  })

  return (
    <div className="App">
      <div className="gltf-viewer" ref={ref}></div>
    </div>
  )
}

export default App
