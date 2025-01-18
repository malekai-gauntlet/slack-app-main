import React from 'react'
import { Icons } from './icons'

export default function SearchResults({ 
  results, 
  isLoading, 
  visible,
  onResultClick,
  searchTerm
}) {
  if (!visible || (!isLoading && !results?.length)) return null;

  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-[70vh] overflow-y-auto z-50">
      {isLoading ? (
        <div className="p-4 text-center text-gray-500">
          <div className="animate-spin inline-block w-6 h-6 border-2 border-gray-300 border-t-purple-600 rounded-full mb-2"></div>
          <p>Searching messages...</p>
        </div>
      ) : results?.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          <p>No messages found matching "{searchTerm}"</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {results.map((message) => (
            <div
              key={message.id}
              onClick={() => onResultClick(message)}
              className="p-4 hover:bg-gray-100 cursor-pointer transition-colors duration-150"
            >
              <div className="flex items-start space-x-3">
                {message.profiles?.avatar_url ? (
                  <img
                    src={message.profiles.avatar_url}
                    alt={message.profiles.full_name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-purple-700 flex items-center justify-center text-white">
                    {message.profiles?.full_name?.[0]?.toUpperCase() || 'A'}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline space-x-2">
                    <span className="font-medium text-gray-900">
                      {message.profiles?.full_name || 'Anonymous'}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(message.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="mt-1 text-gray-600">
                    {message.content}
                  </p>
                  {message.channel_name && (
                    <div className="mt-1 flex items-center text-sm text-gray-500">
                      <Icons.Hash className="w-3 h-3 mr-1" />
                      {message.channel_name}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 