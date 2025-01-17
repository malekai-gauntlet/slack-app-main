import React from 'react'
import { Icons } from './icons'

const FilePreview = ({ file, onRemove }) => {
  // Format file size to human readable format
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md border border-gray-200 max-w-sm">
      <div className="flex-shrink-0">
        <Icons.File className="w-8 h-8 text-gray-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {file.name}
        </p>
        <p className="text-xs text-gray-500">
          {formatFileSize(file.size)}
        </p>
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="p-1 hover:bg-gray-200 rounded"
        title="Remove file"
      >
        <Icons.Close className="w-4 h-4 text-gray-500" />
      </button>
    </div>
  )
}

export default FilePreview 