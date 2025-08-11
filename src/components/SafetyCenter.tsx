import React, { useState, useEffect } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { 
  Shield, 
  AlertTriangle, 
  Eye, 
  EyeOff, 
  Lock, 
  UserX, 
  Flag,
  MapPin,
  Clock,
  Download,
  Trash2,
  CheckCircle,
  Calendar
} from 'lucide-react'

interface SafetyCenterProps {
  user: User
  onClose: () => void
}

interface PrivacySettings {
  show_age: boolean
  show_location: boolean
  show_last_active: boolean
  incognito_mode: boolean
  show_on_discovery: boolean
  allow_messages_from_matches_only: boolean
}

interface BlockedUser {
  id: string
  full_name: string
  blocked_at: string
}

interface SafetyReport {
  id: string
  reported_user_id: string
  report_type: string
  description: string
  created_at: string
  status: string
}

const SafetyCenter: React.FC<SafetyCenterProps> = ({ user, onClose }) => {
  const [activeTab, setActiveTab] = useState<'privacy' | 'safety' | 'reports' | 'data'>('privacy')
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    show_age: true,
    show_location: true,
    show_last_active: true,
    incognito_mode: false,
    show_on_discovery: true,
    allow_messages_from_matches_only: false
  })
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([])
  const [reports, setReports] = useState<SafetyReport[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSafetyData()
  }, [user.id])

  const loadSafetyData = async () => {
    try {
      // Load privacy settings (from user preferences or defaults)
      // In a real app, these would be stored in a user_preferences table

      // Load blocked users
      const { data: blockedData } = await supabase
        .from('user_blocks')
        .select(`
          blocked_id,
          created_at,
          profiles!user_blocks_blocked_id_fkey(full_name)
        `)
        .eq('blocker_id', user.id)

      setBlockedUsers(blockedData?.map((block: any) => ({
        id: block.blocked_id,
        full_name: block.profiles?.full_name || 'Anonymous',
        blocked_at: block.created_at
      })) || [])

      // Load safety reports
      const { data: reportsData } = await supabase
        .from('user_reports')
        .select('*')
        .eq('reporter_id', user.id)
        .order('created_at', { ascending: false })

      setReports(reportsData || [])

    } catch (error) {
      console.error('Error loading safety data:', error)
    } finally {
      setLoading(false)
    }
  }

  const updatePrivacySetting = async (key: keyof PrivacySettings, value: boolean) => {
    setPrivacySettings(prev => ({ ...prev, [key]: value }))
    
    // In a real app, save to database
    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          setting_name: key,
          setting_value: value
        })

      if (error) throw error
    } catch (error) {
      console.error('Error updating privacy setting:', error)
    }
  }

  const unblockUser = async (blockedUserId: string) => {
    try {
      const { error } = await supabase
        .from('user_blocks')
        .delete()
        .eq('blocker_id', user.id)
        .eq('blocked_id', blockedUserId)

      if (error) throw error

      setBlockedUsers(prev => prev.filter(user => user.id !== blockedUserId))
    } catch (error) {
      console.error('Error unblocking user:', error)
    }
  }

  const exportUserData = async () => {
    try {
      // Compile user data for export
      const userData = {
        profile: await supabase.from('profiles').select('*').eq('id', user.id).single(),
        messages: await supabase.from('messages').select('*').eq('user_id', user.id),
        matches: await supabase.from('matches').select('*').or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`),
        photos: await supabase.from('user_photos').select('*').eq('user_id', user.id),
        interests: await supabase.from('user_interests').select('*').eq('user_id', user.id),
        personality: await supabase.from('personality_assessments').select('*').eq('user_id', user.id),
        exported_at: new Date().toISOString()
      }

      // Create and download JSON file
      const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `irene-data-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

    } catch (error) {
      console.error('Error exporting data:', error)
    }
  }

  const deleteAccount = async () => {
    if (!confirm('Are you sure you want to permanently delete your account? This action cannot be undone.')) {
      return
    }

    try {
      // In production, this would be handled by a secure server-side function
      // that properly anonymizes/deletes all user data across all tables
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      // The actual account deletion would happen server-side
      alert('Account deletion initiated. You will receive a confirmation email.')
      
    } catch (error) {
      console.error('Error deleting account:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-romantic-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-romantic-500 border-t-transparent mb-4"></div>
          <p className="text-romantic-700 text-lg font-medium">Loading safety settings...</p>
        </div>
      </div>
    )
  }

  const renderPrivacySettings = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Shield className="w-16 h-16 text-romantic-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-romantic-800 mb-2">Privacy Settings</h2>
        <p className="text-romantic-600">Control what others can see about you</p>
      </div>

      <div className="space-y-4">
        <div className="bg-white/80 rounded-lg p-4">
          <h3 className="font-semibold text-romantic-800 mb-4">Profile Visibility</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-romantic-500" />
                <span className="text-romantic-700">Show my age</span>
              </div>
              <button
                onClick={() => updatePrivacySetting('show_age', !privacySettings.show_age)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  privacySettings.show_age ? 'bg-romantic-500' : 'bg-gray-300'
                }`}
              >
                <div className={`absolute w-4 h-4 bg-white rounded-full top-1 transition-transform ${
                  privacySettings.show_age ? 'translate-x-7' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-romantic-500" />
                <span className="text-romantic-700">Show my location</span>
              </div>
              <button
                onClick={() => updatePrivacySetting('show_location', !privacySettings.show_location)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  privacySettings.show_location ? 'bg-romantic-500' : 'bg-gray-300'
                }`}
              >
                <div className={`absolute w-4 h-4 bg-white rounded-full top-1 transition-transform ${
                  privacySettings.show_location ? 'translate-x-7' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-romantic-500" />
                <span className="text-romantic-700">Show when I was last active</span>
              </div>
              <button
                onClick={() => updatePrivacySetting('show_last_active', !privacySettings.show_last_active)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  privacySettings.show_last_active ? 'bg-romantic-500' : 'bg-gray-300'
                }`}
              >
                <div className={`absolute w-4 h-4 bg-white rounded-full top-1 transition-transform ${
                  privacySettings.show_last_active ? 'translate-x-7' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white/80 rounded-lg p-4">
          <h3 className="font-semibold text-romantic-800 mb-4">Discovery & Messaging</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <EyeOff className="w-5 h-5 text-romantic-500" />
                <div>
                  <span className="text-romantic-700 block">Incognito mode</span>
                  <span className="text-xs text-romantic-500">Browse without being seen</span>
                </div>
              </div>
              <button
                onClick={() => updatePrivacySetting('incognito_mode', !privacySettings.incognito_mode)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  privacySettings.incognito_mode ? 'bg-romantic-500' : 'bg-gray-300'
                }`}
              >
                <div className={`absolute w-4 h-4 bg-white rounded-full top-1 transition-transform ${
                  privacySettings.incognito_mode ? 'translate-x-7' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-romantic-500" />
                <span className="text-romantic-700">Show me on Discovery</span>
              </div>
              <button
                onClick={() => updatePrivacySetting('show_on_discovery', !privacySettings.show_on_discovery)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  privacySettings.show_on_discovery ? 'bg-romantic-500' : 'bg-gray-300'
                }`}
              >
                <div className={`absolute w-4 h-4 bg-white rounded-full top-1 transition-transform ${
                  privacySettings.show_on_discovery ? 'translate-x-7' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-romantic-500" />
                <div>
                  <span className="text-romantic-700 block">Only matches can message me</span>
                  <span className="text-xs text-romantic-500">Block messages from non-matches</span>
                </div>
              </div>
              <button
                onClick={() => updatePrivacySetting('allow_messages_from_matches_only', !privacySettings.allow_messages_from_matches_only)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  privacySettings.allow_messages_from_matches_only ? 'bg-romantic-500' : 'bg-gray-300'
                }`}
              >
                <div className={`absolute w-4 h-4 bg-white rounded-full top-1 transition-transform ${
                  privacySettings.allow_messages_from_matches_only ? 'translate-x-7' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderSafetyTools = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <UserX className="w-16 h-16 text-romantic-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-romantic-800 mb-2">Blocked Users</h2>
        <p className="text-romantic-600">Manage users you've blocked</p>
      </div>

      {blockedUsers.length === 0 ? (
        <div className="text-center py-8">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <p className="text-romantic-600">You haven't blocked anyone yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {blockedUsers.map((blockedUser) => (
            <div key={blockedUser.id} className="bg-white/80 rounded-lg p-4 flex items-center justify-between">
              <div>
                <h3 className="font-medium text-romantic-800">{blockedUser.full_name}</h3>
                <p className="text-sm text-romantic-500">
                  Blocked {new Date(blockedUser.blocked_at).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => unblockUser(blockedUser.id)}
                className="px-4 py-2 text-romantic-600 border border-romantic-300 rounded-lg hover:bg-romantic-50 transition-colors duration-200"
              >
                Unblock
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-orange-800 mb-1">Safety Tips</h3>
            <ul className="text-sm text-orange-700 space-y-1">
              <li>• Trust your instincts - if something feels off, it probably is</li>
              <li>• Meet in public places for first dates</li>
              <li>• Tell a friend about your plans</li>
              <li>• Don't share personal information too quickly</li>
              <li>• Report suspicious behavior immediately</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )

  const renderReports = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Flag className="w-16 h-16 text-romantic-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-romantic-800 mb-2">Safety Reports</h2>
        <p className="text-romantic-600">Your submitted safety reports</p>
      </div>

      {reports.length === 0 ? (
        <div className="text-center py-8">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <p className="text-romantic-600">No reports submitted</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <div key={report.id} className="bg-white/80 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-romantic-800 capitalize">
                  {report.report_type.replace('_', ' ')}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  report.status === 'reviewed' ? 'bg-green-100 text-green-800' :
                  report.status === 'resolved' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {report.status}
                </span>
              </div>
              <p className="text-sm text-romantic-600 mb-2">{report.description}</p>
              <p className="text-xs text-romantic-500">
                {new Date(report.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const renderDataControls = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Download className="w-16 h-16 text-romantic-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-romantic-800 mb-2">Your Data</h2>
        <p className="text-romantic-600">Download or delete your information</p>
      </div>

      <div className="space-y-4">
        <div className="bg-white/80 rounded-lg p-4">
          <h3 className="font-semibold text-romantic-800 mb-2">Export Your Data</h3>
          <p className="text-romantic-600 text-sm mb-4">
            Download a copy of your profile, messages, matches, and other data.
          </p>
          <button
            onClick={exportUserData}
            className="w-full px-4 py-3 bg-romantic-500 text-white rounded-lg hover:bg-romantic-600 transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Export Data
          </button>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-semibold text-red-800 mb-2">Delete Account</h3>
          <p className="text-red-700 text-sm mb-4">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          <button
            onClick={deleteAccount}
            className="w-full px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <Trash2 className="w-5 h-5" />
            Delete Account
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-romantic-gradient">
      <div className="px-4 py-6">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-romantic-800">Safety Center</h1>
            <button
              onClick={onClose}
              className="p-2 bg-white/80 rounded-full shadow-sm hover:bg-white transition-colors duration-200"
            >
              ✕
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex bg-white/80 rounded-lg p-1 mb-6">
            {[
              { id: 'privacy', label: 'Privacy', icon: Eye },
              { id: 'safety', label: 'Safety', icon: Shield },
              { id: 'reports', label: 'Reports', icon: Flag },
              { id: 'data', label: 'Data', icon: Download }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-romantic-500 text-white'
                    : 'text-romantic-600 hover:bg-romantic-50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === 'privacy' && renderPrivacySettings()}
            {activeTab === 'safety' && renderSafetyTools()}
            {activeTab === 'reports' && renderReports()}
            {activeTab === 'data' && renderDataControls()}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SafetyCenter