/**
 * Planet surface texture maps (equirectangular 2:1).
 * CC BY 4.0 — https://www.solarsystemscope.com/textures/
 *
 * 1K loads at mount (fast first paint); 2K is lazily swapped in the moment a
 * planet is focused, toured, or landed on — close-ups stay crisp.
 */
export const PLANET_TEXTURE_1K: Record<string, string> = {
  Mercury: '/textures/1k_mercury.jpg',
  Venus: '/textures/1k_venus_atmosphere.jpg',
  Earth: '/textures/1k_earth_daymap.jpg',
  Mars: '/textures/1k_mars.jpg',
  Jupiter: '/textures/1k_jupiter.jpg',
  Saturn: '/textures/1k_saturn.jpg',
  Uranus: '/textures/1k_uranus.jpg',
  Neptune: '/textures/1k_neptune.jpg',
}

export const PLANET_TEXTURE_2K: Record<string, string> = {
  Mercury: '/textures/2k_mercury.jpg',
  Venus: '/textures/2k_venus_atmosphere.jpg',
  Earth: '/textures/2k_earth_daymap.jpg',
  Mars: '/textures/2k_mars.jpg',
  Jupiter: '/textures/2k_jupiter.jpg',
  Saturn: '/textures/2k_saturn.jpg',
  Uranus: '/textures/2k_uranus.jpg',
  Neptune: '/textures/2k_neptune.jpg',
}
