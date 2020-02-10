import React, { useRef, useCallback, useEffect } from 'react'
import {
  WebGLRenderer,
  Scene, 
  PerspectiveCamera,
  BufferGeometry,
  Float32BufferAttribute,
  Uint8BufferAttribute,
  RawShaderMaterial,
  DoubleSide,
  Mesh
} from 'three'
import Stats from 'stats.js'

import useGetWindowSize from '../hooks/useGetWindowSize'

import './Canvas.scss'

const fragment = require('../shaders/frag.glsl')
const vertex = require('../shaders/vert.glsl')

// types
type RenderParams = {
  scene: Scene
  camera: PerspectiveCamera
  renderer: WebGLRenderer
}
type AnimateParams = {
  scene: Scene
  camera: PerspectiveCamera
  renderer: WebGLRenderer
}

const Canvas: React.FC = () => {
  const { width, height } = useGetWindowSize()

  // stats
  const mount = useRef<HTMLDivElement>(null)
  const stats = new Stats()
  stats.showPanel(0)
  mount.current?.appendChild(stats.dom)
  
  const onCanvasLoaded = (canvas: HTMLCanvasElement) => {
    if (!canvas) {
      return
    }

    // init scene
    const scene = new Scene()
    const camera = new PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000)
    camera.position.z = 1.5

    const vertexCount = 200 * 3;
    const geometry = new BufferGeometry()
    const positions = []
    const colors = []
    for (let i = 0; i < vertexCount; i++) {
      // adding x,y,z
      positions.push( Math.random() - 0.5 )
			positions.push( Math.random() - 0.5 )
			positions.push( Math.random() - 0.5 )
			// adding r,g,b,a
			colors.push( Math.random() * 255 % 200)
			colors.push( Math.random() * 255 % 100)
			colors.push( Math.random() * 255 )
			colors.push( Math.random() * 255)
    }
    const positionAttribute = new Float32BufferAttribute(positions, 3)
    const colorAttribute = new Uint8BufferAttribute(colors, 4)
    colorAttribute.normalized = true
    geometry.setAttribute('position', positionAttribute)
    geometry.setAttribute('color', colorAttribute)
    const material = new RawShaderMaterial({
      uniforms: {
        time: { value: 0.1 }
      },
      vertexShader: vertex.default,
      fragmentShader: fragment.default,
      side: DoubleSide,
      transparent: true
    })
    const mesh = new Mesh(geometry, material)
    scene.add(mesh)

    // render scene
    const renderer = new WebGLRenderer({ canvas: canvas, antialias: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setClearColor('#1d1d1d')
    renderer.setSize(width, height)
    renderer.render( scene, camera )

    // start animation
    requestRef.current = window.requestAnimationFrame(() => animate({ scene, camera, renderer }))
    const hoge = scene.children[0] as any
    hoge.geometry.attributes.position.array.map(pos => {
      console.log(pos)
    })
  }

  // animate
  const requestRef = useRef(0)
  const animate = useCallback(({ scene, camera, renderer }: AnimateParams) => {
    requestRef.current = window.requestAnimationFrame(() => animate({ scene, camera, renderer }))
    render({ scene, camera, renderer })
    stats.update()
  }, [])
  useEffect(() => {
    return () => window.cancelAnimationFrame(requestRef.current)
  }, [animate])

  // render
  const render = ({ scene, camera, renderer }: RenderParams) => {
    const time = performance.now()
    const object = scene.children[0] as any
    let positions = []
    object.geometry.attributes.position.array.map((pos, index) => {
      if (index % 3 === 1) {
        pos += Math.random() * 0.05 * Math.cos(time * 0.005 * Math.sin(time)) * Math.sin(time * Math.random() * Math.sin(time))
        pos %= 1
        positions.push(pos)
      }
      else if (index % 3 === 2) {
        pos += Math.random() * 0.04 * Math.cos(time * 0.005) * Math.sin(time * 0.005)
        pos %= 1
        positions.push(pos)
      }
      else {
        pos += Math.random() * 0.0024 * Math.cos(time * 0.005) * Math.sin(time * 0.005)
        pos %= 1
        positions.push(pos)
      }
    })
    const positionAttribute = new Float32BufferAttribute(positions, 3)
    object.geometry.setAttribute('position', positionAttribute)

    object.material.uniforms.time.value = Math.atan(time * 0.005)

		renderer.render( scene, camera )
  }
  return (
    <div className="CanvasWrap" ref={mount}>
      <canvas ref={onCanvasLoaded} />
    </div>
  )
}

export default Canvas