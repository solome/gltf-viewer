import * as THREE from 'three'

export function coordsToDirection({ longitude, latitude }: { longitude: number; latitude: number }) {
  const distance = Math.abs(Math.cos(latitude))
  return new THREE.Vector3(
    /* x */ -Math.sin(longitude) * distance,
    /* y */ -Math.sin(latitude),
    /* z */ -Math.cos(longitude) * distance,
  )
}
