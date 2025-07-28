"use client"

import { CarrierWaterfallsProps } from "./shared/types"

export default function CarrierWaterfalls(props: CarrierWaterfallsProps = {}) {
  console.log('CarrierWaterfalls rendering...', { props })
  
  return (
    <div className="p-8 space-y-4 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900">🚀 Carrier Waterfalls - Basic Test</h1>
      <div className="bg-green-100 p-4 rounded-lg border border-green-300">
        <p className="text-xl font-semibold text-green-800">✅ SUCCESS: Component is rendering!</p>
        <p className="text-green-700">If you see this, the component wrapper is working.</p>
        <p className="text-sm text-green-600 mt-2">Props received: <code>{JSON.stringify(props)}</code></p>
      </div>
      
      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-300">
        <p className="text-yellow-800">🔧 Next: Testing hooks...</p>
      </div>
    </div>
  )
}
