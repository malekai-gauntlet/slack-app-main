import React from 'react'
import { Icons } from './icons'
import { supabase } from '../supabaseClient'

// Helper function to format file size
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

// Helper function to get file type icon
const getFileIcon = (type) => {
  if (type.startsWith('image/')) return <Icons.Image className="w-8 h-8 text-gray-400" />
  if (type.includes('pdf')) return <Icons.File className="w-8 h-8 text-gray-400" />
  if (type.includes('word') || type.includes('document')) return <Icons.File className="w-8 h-8 text-gray-400" />
  return <Icons.File className="w-8 h-8 text-gray-400" />
}

const FileAttachment = ({ file }) => {
  const isImage = file.type?.startsWith('image/')

  const handleDownload = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      // Get the file path from the URL
      const filePath = file.url.split('/').pop()
      
      // Download the file from Supabase storage
      const { data, error } = await supabase.storage
        .from('message-attachments')
        .download(filePath)

      if (error) {
        throw error
      }

      // Create a blob URL and trigger download
      const blob = new Blob([data], { type: file.type })
      const blobUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = file.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(blobUrl)
    } catch (error) {
      console.error('Error downloading file:', error)
    }
  }

  if (isImage) {
    return (
      <div className="mt-2 max-w-sm">
        <div className="relative group/attachment">
          <img 
            src={file.url} 
            alt={file.name}
            className="rounded-lg max-h-64 object-cover w-full"
          />
          {/* Download button overlay */}
          <div className="absolute top-2 right-2 opacity-0 group-hover/attachment:opacity-100 transition-opacity">
            <button
              onClick={handleDownload}
              className="inline-flex items-center justify-center w-8 h-8 bg-black/75 hover:bg-black/90 text-white rounded-md"
            >
              <Icons.Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-2 max-w-sm">
      <div className="bg-white rounded-lg border border-gray-200 p-3 relative group/attachment">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            {getFileIcon(file.type)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {file.name}
            </p>
            <p className="text-sm text-gray-500">
              {formatFileSize(file.size)}
            </p>
          </div>
        </div>
        {/* Download button overlay */}
        <div className="absolute top-2 right-2 opacity-0 group-hover/attachment:opacity-100 transition-opacity">
          <button
            onClick={handleDownload}
            className="inline-flex items-center justify-center w-8 h-8 bg-black/75 hover:bg-black/90 text-white rounded-md"
          >
            <Icons.Download className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default FileAttachment 