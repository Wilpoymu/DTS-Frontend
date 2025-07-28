// Legacy component - now using refactored version
import CarrierWaterfallsRefactored from "./carrier-waterfalls/index"
import { CarrierWaterfallsProps } from "./carrier-waterfalls/shared/types"

export default function CarrierWaterfalls(props: CarrierWaterfallsProps = {}) {
  console.log('Legacy wrapper rendering...', { props })
  return <CarrierWaterfallsRefactored {...props} />
}
