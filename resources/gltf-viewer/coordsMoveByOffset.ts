import { formatRad } from './formatRad'

export function coordsMoveByOffset(
  coords: { longitude: number; latitude: number },
  offset: { x: number; y: number },
  layout: { height: number; width: number },
) {
  let { longitude, latitude } = coords
  longitude = longitude - (offset.x / layout.width) * 3
  latitude = latitude - (offset.y / layout.height) * 3
  longitude = formatRad(longitude)
  return { longitude, latitude }
}
