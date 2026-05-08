import React, { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Paperclip } from 'lucide-react'

const FileUpload = ({ onFileSelect }) => {
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      
      // Validate file size (100MB max)
      if (file.size > 100 * 1024 * 1024) {
        toast.error('File size must be less than 100MB')
        return
      }
      
      onFileSelect(file)
    }
  }, [onFileSelect])
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
      'video/*': ['.mp4', '.mov', '.avi'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    maxFiles: 1,
  })
  
  return (
    <div {...getRootProps()} className="relative">
      <input {...getInputProps()} ref={inputRef} />
      <button
        type="button"
        className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
        title="Attach file"
      >
        <Paperclip className="w-5 h-5" />
      </button>
      
      {isDragActive && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 text-center">
            <div className="text-4xl mb-4">📎</div>
            <p className="text-lg font-medium text-gray-800">Drop your file here</p>
            <p className="text-sm text-gray-500 mt-2">Max file size: 100MB</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default FileUpload