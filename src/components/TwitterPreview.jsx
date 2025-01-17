import React from 'react'
import { Icons } from './icons'

const TwitterPreview = ({ url }) => {
  // Extract username and tweet ID from URL
  const tweetMatch = url.match(/twitter\.com\/(\w+)\/status\/(\d+)/) || 
                    url.match(/x\.com\/(\w+)\/status\/(\d+)/)
  
  if (!tweetMatch) return null
  
  const [, username, tweetId] = tweetMatch

  return (
    <div className="mt-2 border rounded-lg overflow-hidden bg-gray-50">
      <div className="p-4">
        <div className="flex items-center space-x-2 mb-2">
          <div className="w-5 h-5 text-[#1DA1F2]">
            <Icons.Twitter />
          </div>
          <span className="text-gray-600">Post from @{username}</span>
        </div>
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline text-sm"
        >
          View on Twitter/X
        </a>
      </div>
    </div>
  )
}

export default TwitterPreview 