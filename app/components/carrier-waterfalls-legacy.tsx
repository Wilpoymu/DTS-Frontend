// Legacy component - now using refactored version
import CarrierWaterfallsRefactored from "./carrier-waterfalls"
import { CarrierWaterfallsProps } from "./carrier-waterfalls/shared/types"

export default function CarrierWaterfalls(props: CarrierWaterfallsProps = {}) {
  return <CarrierWaterfallsRefactored {...props} />
}
