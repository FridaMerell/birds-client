
import { PiBird, PiPlant, PiBugBeetle, PiButterfly,PiLeaf  } from "react-icons/pi"
import { RiFlowerLine } from "react-icons/ri"
import { GiDragonfly } from "react-icons/gi";

import { TbMushroomFilled } from "react-icons/tb"


const ClassIcon = ({ icon, size = 21, color = 'white' }: { icon: string, size?: number, color?: string }) => {
  let iconElement = null
  switch (icon) {
    case 'bird':
      iconElement = <PiBird size={size} color={color} />
      break
    case 'plant':
      iconElement = <PiPlant size={size} color={color} />
      break
    case 'insect':
      iconElement = <PiBugBeetle size={size} color={color} />
      break
    case 'butterfly':
      iconElement = <PiButterfly size={size} color={color} />
      break
    case 'fungi':
      iconElement = <TbMushroomFilled size={size} color={color} />
      break
    case 'flower':
      iconElement = <RiFlowerLine size={size} color={color} />
      break
    case 'dragonfly':
      iconElement = <GiDragonfly size={size} color={color} />
      break
    case 'leaf':
      iconElement = <PiLeaf size={size} color={color} />
      break
    default:
      iconElement = <PiBugBeetle size={size} color={color} />
  }

  return iconElement
}

export default ClassIcon