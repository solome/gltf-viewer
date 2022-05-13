import * as React from 'react'
import { GLTFViewer } from './gltf-viewer'

import TWEEN from '@tweenjs/tween.js'

import './App.css'

function animate(time: number) {
  requestAnimationFrame(animate)
  TWEEN.update(time)
}

requestAnimationFrame(animate)

function App() {
  const ref = React.useRef(null)
  const glTFViewerRef = React.useRef<GLTFViewer>()
  React.useEffect(() => {
    const glTFViewer = new GLTFViewer({
      antialias: true,
    })

    glTFViewerRef.current = glTFViewer

    Object.assign(window, { $glTFViewer: glTFViewer })
    if (ref.current) glTFViewer.appendTo(ref.current)

    const callback = async () => {
      await glTFViewer.load('//vrlab-static.ljcdn.com/release/web/data/Astronaut.f3152ab1.glb')
    }

    callback()
  })

  return (
    <div className="App">
      <div className="gltf-viewer" ref={ref}></div>
      <button
        className="pure-button pure-button-primary button"
        onClick={() => {
          if (!glTFViewerRef.current) return
          const glTFViewer = glTFViewerRef.current
          const tween = new TWEEN.Tween({
            fov: glTFViewer.state.fov,
            longitude: glTFViewer.state.longitude,
            latitude: glTFViewer.state.latitude,
          })
            .to({ fov: 28, latitude: -0.11135812454770577, longitude: 3.078424998939365 }, 2000)
            .easing(TWEEN.Easing.Quadratic.Out)
            .onUpdate((newState) => (glTFViewerRef.current!.state = newState))
            .start()
        }}
      >
        转场动画
      </button>
    </div>
  )
}

export default App
