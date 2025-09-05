import React from 'react'
import { LeaveHubLogo, LeaveHubIcon, LeaveHubInvertedLogo } from '../icons'

export function LogoDemo() {
  return (
    <div className="p-8 space-y-12">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">LeaveHub Logo Components</h1>
      </div>

      {/* Main Logo */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Main Logo</h2>
        <div className="bg-white p-8 border border-gray-200 rounded-lg">
          <LeaveHubLogo className="mx-auto" />
        </div>
        <p className="text-sm text-gray-600">Use for headers, main branding areas</p>
      </section>

      {/* Icon Only */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Icon Only</h2>
        <div className="bg-white p-8 border border-gray-200 rounded-lg">
          <LeaveHubIcon className="mx-auto" width={100} height={56} />
        </div>
        <p className="text-sm text-gray-600">Use for favicons, app icons, compact spaces</p>
      </section>

      {/* Inverted Logo */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Inverted Logo (for dark backgrounds)</h2>
        <div className="bg-gray-800 p-8 border border-gray-200 rounded-lg">
          <LeaveHubInvertedLogo className="mx-auto" />
        </div>
        <p className="text-sm text-gray-600">Use on dark backgrounds, navigation bars</p>
      </section>

      {/* Size Variations */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Size Variations</h2>
        <div className="bg-white p-8 border border-gray-200 rounded-lg space-y-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Small (100px)</p>
            <LeaveHubLogo width={100} height={56} className="mx-auto" />
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Medium (200px - default)</p>
            <LeaveHubLogo className="mx-auto" />
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Large (300px)</p>
            <LeaveHubLogo width={300} height={168} className="mx-auto" />
          </div>
        </div>
      </section>

      {/* Usage Examples */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Usage Examples</h2>
        <div className="bg-gray-50 p-6 border border-gray-200 rounded-lg">
          <pre className="text-sm text-gray-700 overflow-x-auto">
{`// Import the components
import { LeaveHubLogo, LeaveHubIcon, LeaveHubInvertedLogo } from '../icons'

// Use in your components
<LeaveHubLogo className="h-12" />
<LeaveHubIcon width={40} height={22} />
<LeaveHubInvertedLogo className="text-white" />

// Custom sizing
<LeaveHubLogo width={150} height={84} className="mx-auto" />`}
          </pre>
        </div>
      </section>
    </div>
  )
}