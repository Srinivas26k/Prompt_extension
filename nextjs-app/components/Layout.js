import Head from 'next/head'
import { useState, useEffect } from 'react'

export default function Layout({ children, title = "AI Prompt Enhancer" }) {
  const [showDonation, setShowDonation] = useState(false)

  useEffect(() => {
    // Show donation notification every 5 minutes
    const interval = setInterval(() => {
      setShowDonation(true)
      setTimeout(() => setShowDonation(false), 10000) // Hide after 10 seconds
    }, 5 * 60 * 1000) // 5 minutes

    return () => clearInterval(interval)
  }, [])

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="Enhance your AI prompts with our browser extension" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      {/* Donation Notification */}
      {showDonation && (
        <div className="fixed top-4 right-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded shadow-lg z-50 max-w-sm">
          <div className="flex items-center justify-between">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">
                  Enjoying AI Prompt Enhancer? ☕
                </p>
                <p className="text-xs mt-1">
                  Support development with a coffee!
                </p>
                <a 
                  href="https://buymeacoffee.com/srinivaskiv" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-yellow-800 hover:text-yellow-900 underline mt-2 inline-block"
                >
                  Buy me a coffee →
                </a>
              </div>
            </div>
            <button 
              onClick={() => setShowDonation(false)}
              className="ml-3 text-yellow-400 hover:text-yellow-600"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="layout">
        {children}
      </div>
    </>
  )
}
