import { LoaderArgs, Response } from "@remix-run/node";

/**
 * tailwind needs its colours in the rgb format to use alpha-channels
 * convert '#ffffff' to '255 255 255'
 */
function hexToRgb(hex: string) {
  if (hex[0] === '#') {
    hex = hex.replace('#', '')
  }
  if (hex.length !== 6) {
    return
  }

  const r = parseInt("0x" + hex.slice(0,2))
  const g = parseInt("0x" + hex.slice(2,4))
  const b = parseInt("0x" + hex.slice(4,6))

  return `${r} ${g} ${b}`
}

export async function loader({ request }: LoaderArgs) {
  // todo: load tenantBrand from the tenantSettings
  let tenantBrand = null
  let brand = tenantBrand ?? '#22d3ee'

  return new Response(`
  :root {
    --color-brand: ${hexToRgb(brand)};
  }
  `, {
    headers: {
      'content-type': "text/css"
    }
  })
}