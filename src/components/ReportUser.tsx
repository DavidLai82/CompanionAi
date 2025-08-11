import React, { useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { AlertTriangle, Flag, X, Upload, FileText } from 'lucide-react'

interface ReportUserProps {
  reportedUserId: string
  reportedUserName?: string
  currentUser: User
  onClose: () => void
  onReported?: () => void
}

interface ReportData {
  report_type: string
  description: string
  evidence_urls: string[]
}

const REPORT_TYPES = [
  {
    id: 'inappropriate_content',
    label: 'Inappropriate Photos or Content',
    description: 'Nudity, sexual content, or inappropriate images'
  },
  {
    id: 'harassment',
    label: 'Harassment or Bullying',
    description: 'Threatening, abusive, or harassing messages'
  },
  {
    id: 'fake_profile',
    label: 'Fake Profile',
    description: 'Using someone else\'s photos or false information'
  },
  {
    id: 'spam',
    label: 'Spam or Scam',
    description: 'Promotional content, links, or suspicious activity'
  },
  {
    id: 'minor',
    label: 'Underage User',
    description: 'User appears to be under 18'
  },
  {
    id: 'violence',
    label: 'Violence or Harm',
    description: 'Threats of violence or self-harm'
  },
  {
    id: 'other',
    label: 'Other',
    description: 'Something else that violates our community guidelines'
  }
]

const ReportUser: React.FC<ReportUserProps> = ({
  reportedUserId,
  reportedUserName,
  currentUser,
  onClose,
  onReported
}) => {
  const [step, setStep] = useState<'type' | 'details' | 'evidence' | 'confirm'>('type')
  const [reportData, setReportData] = useState<ReportData>({
    report_type: '',
    description: '',
    evidence_urls: []
  })
  const [loading, setLoading] = useState(false)
  const [blockUser, setBlockUser] = useState(false)

  const handleTypeSelect = (type: string) => {
    setReportData({ ...reportData, report_type: type })
    setStep('details')
  }

  const handleDetailsSubmit = () => {
    if (reportData.description.trim().length < 10) {
      alert('Please provide more details about the issue.')
      return
    }
    setStep('evidence')
  }

  const handleEvidenceUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      // In a real app, you'd upload these files to storage
      console.log('Evidence files:', files)
      // For now, just add placeholder URLs
      const newUrls = Array.from(files).map(file => URL.createObjectURL(file))
      setReportData({
        ...reportData,
        evidence_urls: [...reportData.evidence_urls, ...newUrls]
      })
    }
  }

  const removeEvidence = (index: number) => {
    const newUrls = [...reportData.evidence_urls]
    newUrls.splice(index, 1)
    setReportData({ ...reportData, evidence_urls: newUrls })
  }

  const submitReport = async () => {
    setLoading(true)
    
    try {
      // Submit the report
      const { error: reportError } = await supabase
        .from('user_reports')
        .insert([{
          reporter_id: currentUser.id,
          reported_user_id: reportedUserId,
          report_type: reportData.report_type,
          description: reportData.description,
          evidence_urls: reportData.evidence_urls,
          status: 'pending'
        }])

      if (reportError) throw reportError

      // Block the user if requested
      if (blockUser) {
        const { error: blockError } = await supabase
          .from('user_blocks')
          .insert([{
            blocker_id: currentUser.id,
            blocked_id: reportedUserId
          }])

        if (blockError) throw blockError
      }

      // Remove any existing matches
      const { error: matchError } = await supabase
        .from('matches')
        .update({ match_status: 'unmatched' })
        .or(`and(user1_id.eq.${currentUser.id},user2_id.eq.${reportedUserId}),and(user1_id.eq.${reportedUserId},user2_id.eq.${currentUser.id})`)

      if (matchError) console.warn('Error removing match:', matchError)

      onReported?.()
      onClose()

    } catch (error) {
      console.error('Error submitting report:', error)
      alert('Failed to submit report. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getSelectedType = () => {
    return REPORT_TYPES.find(type => type.id === reportData.report_type)
  }

  const renderTypeSelection = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          Report {reportedUserName || 'User'}
        </h2>
        <p className="text-gray-600 text-sm">
          What would you like to report?
        </p>
      </div>

      <div className="space-y-3">
        {REPORT_TYPES.map((type) => (
          <button
            key={type.id}
            onClick={() => handleTypeSelect(type.id)}
            className="w-full text-left p-4 bg-white border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-colors duration-200"
          >
            <h3 className="font-medium text-gray-800 mb-1">{type.label}</h3>
            <p className="text-sm text-gray-600">{type.description}</p>
          </button>
        ))}
      </div>
    </div>
  )

  const renderDetails = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <FileText className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          Report Details
        </h2>
        <p className="text-gray-600 text-sm">
          Reporting: {getSelectedType()?.label}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Please describe what happened
        </label>
        <textarea
          value={reportData.description}
          onChange={(e) => setReportData({ ...reportData, description: e.target.value })}
          placeholder="Provide as much detail as possible about the issue..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none h-32"
          maxLength={1000}
        />
        <div className="text-right text-sm text-gray-500 mt-1">
          {reportData.description.length}/1000
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setStep('type')}
          className="flex-1 px-4 py-3 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors duration-200"
        >
          Back
        </button>
        <button
          onClick={handleDetailsSubmit}
          disabled={reportData.description.trim().length < 10}
          className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    </div>
  )

  const renderEvidence = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <Upload className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          Add Evidence (Optional)
        </h2>
        <p className="text-gray-600 text-sm">
          Screenshots or other evidence can help us investigate
        </p>
      </div>

      <div>
        <input
          type="file"
          id="evidence-upload"
          multiple
          accept="image/*"
          onChange={handleEvidenceUpload}
          className="hidden"
        />
        <label
          htmlFor="evidence-upload"
          className="block w-full p-6 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-red-400 hover:bg-red-50 transition-colors duration-200"
        >
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <span className="text-gray-600">Click to upload screenshots</span>
        </label>
      </div>

      {reportData.evidence_urls.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700">Uploaded Evidence:</h3>
          {reportData.evidence_urls.map((url, index) => (
            <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
              <span className="text-sm text-gray-600">Screenshot {index + 1}</span>
              <button
                onClick={() => removeEvidence(index)}
                className="p-1 text-red-500 hover:bg-red-100 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => setStep('details')}
          className="flex-1 px-4 py-3 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors duration-200"
        >
          Back
        </button>
        <button
          onClick={() => setStep('confirm')}
          className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
        >
          Continue
        </button>
      </div>
    </div>
  )

  const renderConfirm = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <Flag className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          Review & Submit
        </h2>
        <p className="text-gray-600 text-sm">
          Please review your report before submitting
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        <div>
          <h3 className="text-sm font-medium text-gray-700">Issue Type:</h3>
          <p className="text-gray-900">{getSelectedType()?.label}</p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-700">Description:</h3>
          <p className="text-gray-900 text-sm">{reportData.description}</p>
        </div>
        
        {reportData.evidence_urls.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700">Evidence:</h3>
            <p className="text-gray-900">{reportData.evidence_urls.length} file(s) attached</p>
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="block-user"
            checked={blockUser}
            onChange={(e) => setBlockUser(e.target.checked)}
            className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
          />
          <label htmlFor="block-user" className="text-sm text-gray-700">
            Also block this user so they can't contact me
          </label>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          <strong>What happens next:</strong> Our team will review your report within 24 hours. 
          If we find a violation, we'll take appropriate action which may include warnings, 
          restrictions, or account removal.
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setStep('evidence')}
          className="flex-1 px-4 py-3 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          disabled={loading}
        >
          Back
        </button>
        <button
          onClick={submitReport}
          disabled={loading}
          className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Submitting...' : 'Submit Report'}
        </button>
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span className="text-sm text-gray-600">Step {
              step === 'type' ? 1 : 
              step === 'details' ? 2 : 
              step === 'evidence' ? 3 : 4
            } of 4</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            disabled={loading}
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        {step === 'type' && renderTypeSelection()}
        {step === 'details' && renderDetails()}
        {step === 'evidence' && renderEvidence()}
        {step === 'confirm' && renderConfirm()}
      </div>
    </div>
  )
}

export default ReportUser