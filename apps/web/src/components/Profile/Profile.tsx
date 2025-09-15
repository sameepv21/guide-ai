import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Phone, Mail, Lock, Calendar, Save, X, Eye, EyeOff, ArrowLeft, Pencil } from 'lucide-react'; // For icons
import { useNavigate } from 'react-router-dom';
import { profileAPI } from '../../services/api';

export default function Profile() {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    dateJoined: ''
  });
  const [editMode, setEditMode] = useState(false);
  const [editedData, setEditedData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: ''
  });
  const [passwordMode, setPasswordMode] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = () => {
    profileAPI.getProfile()
      .then(response => {
        setProfileData(response.data);
        setEditedData({
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          phoneNumber: response.data.phoneNumber
        });
      })
      .catch(() => {
        setError('Failed to load profile');
      });
  };

  const handleSaveProfile = () => {
    const phoneDigits = editedData.phoneNumber.replace(/\D/g, '');
    if (phoneDigits && phoneDigits.length !== 10) {
      setError('Please enter a valid 10-digit US phone number');
      return;
    }

    profileAPI.updateProfile(editedData.firstName, editedData.lastName, phoneDigits)
      .then(response => {
        setProfileData({
          ...profileData,
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          phoneNumber: response.data.phoneNumber
        });
        setEditMode(false);
        setMessage('Profile updated successfully');
        setTimeout(() => setMessage(''), 3000);
      })
      .catch(() => {
        setError('Failed to update profile');
      });
  };

  const handleRequestPasswordChange = () => {
    profileAPI.requestPasswordChange()
      .then(() => {
        setVerificationSent(true);
        setMessage('Verification code sent to your email');
        setTimeout(() => setMessage(''), 3000);
      })
      .catch(() => {
        setError('Failed to send verification code');
      });
  };

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    profileAPI.changePassword(verificationCode, newPassword)
      .then(() => {
        setPasswordMode(false);
        setVerificationSent(false);
        setVerificationCode('');
        setNewPassword('');
        setConfirmPassword('');
        setMessage('Password changed successfully');
        setTimeout(() => setMessage(''), 3000);
      })
      .catch(err => {
        if (err.response?.data?.error) {
          setError(err.response.data.error);
        } else {
          setError('Failed to change password');
        }
      });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatPhoneDisplay = (phone: string) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 pt-20 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto"
      >
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-8 shadow-2xl">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/chat')}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 transition-all"
                title="Back to Chat"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                Profile Settings
              </h1>
            </div>
            {!editMode && !passwordMode && (
              <button
                onClick={() => setEditMode(true)}
                className="p-2 rounded-lg text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                title="Edit Profile"
              >
                <Pencil className="w-5 h-5" />
              </button>
            )}
          </div>

          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400"
            >
              {message}
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400"
            >
              {error}
            </motion.div>
          )}

          {!passwordMode ? (
            <div className="space-y-6">
              {/* Email (read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="email"
                    value={profileData.email}
                    disabled
                    className="w-full pl-10 pr-4 py-3 bg-gray-800/30 border border-gray-700 rounded-lg text-gray-400 cursor-not-allowed"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
              </div>

              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">First Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    value={editMode ? editedData.firstName : profileData.firstName}
                    onChange={(e) => setEditedData({...editedData, firstName: e.target.value})}
                    disabled={!editMode}
                    className={`w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg ${
                      editMode ? 'text-gray-200 focus:outline-none focus:border-blue-500' : 'text-gray-400 cursor-not-allowed'
                    }`}
                  />
                </div>
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Last Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    value={editMode ? editedData.lastName : profileData.lastName}
                    onChange={(e) => setEditedData({...editedData, lastName: e.target.value})}
                    disabled={!editMode}
                    className={`w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg ${
                      editMode ? 'text-gray-200 focus:outline-none focus:border-blue-500' : 'text-gray-400 cursor-not-allowed'
                    }`}
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="tel"
                    value={editMode ? editedData.phoneNumber : formatPhoneDisplay(profileData.phoneNumber)}
                    onChange={(e) => setEditedData({...editedData, phoneNumber: e.target.value})}
                    disabled={!editMode}
                    placeholder="(555) 123-4567"
                    className={`w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg ${
                      editMode ? 'text-gray-200 focus:outline-none focus:border-blue-500' : 'text-gray-400 cursor-not-allowed'
                    }`}
                  />
                </div>
              </div>

              {/* Date Joined (read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Member Since</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    value={formatDate(profileData.dateJoined)}
                    disabled
                    className="w-full pl-10 pr-4 py-3 bg-gray-800/30 border border-gray-700 rounded-lg text-gray-400 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              {editMode ? (
                <div className="flex gap-3">
                  <button
                    onClick={handleSaveProfile}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
                  >
                    <Save className="w-5 h-5" />
                    Save Changes
                  </button>
                  <button
                    onClick={() => {
                      setEditMode(false);
                      setEditedData({
                        firstName: profileData.firstName,
                        lastName: profileData.lastName,
                        phoneNumber: profileData.phoneNumber
                      });
                      setError('');
                    }}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-700/50 border border-gray-600 text-gray-400 rounded-lg hover:bg-gray-700 transition-all"
                  >
                    <X className="w-5 h-5" />
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setPasswordMode(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gray-800/50 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-800 transition-all"
                >
                  <Lock className="w-5 h-5" />
                  Change Password
                </button>
              )}
            </div>
          ) : (
            /* Password Change Section */
            <div className="space-y-6">
              {!verificationSent ? (
                <>
                  <p className="text-gray-400">
                    To change your password, we'll send a verification code to your email address.
                  </p>
                  <button
                    onClick={handleRequestPasswordChange}
                    className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
                  >
                    Send Verification Code
                  </button>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Verification Code
                    </label>
                    <input
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:border-blue-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">Code expires in 5 minutes</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-10 pr-12 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleChangePassword}
                      className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
                    >
                      Change Password
                    </button>
                    <button
                      onClick={handleRequestPasswordChange}
                      className="px-6 py-3 bg-gray-700/50 border border-gray-600 text-gray-400 rounded-lg hover:bg-gray-700 transition-all"
                    >
                      Resend Code
                    </button>
                  </div>
                </>
              )}

              <button
                onClick={() => {
                  setPasswordMode(false);
                  setVerificationSent(false);
                  setVerificationCode('');
                  setNewPassword('');
                  setConfirmPassword('');
                  setError('');
                }}
                className="w-full py-3 bg-gray-700/50 border border-gray-600 text-gray-400 rounded-lg hover:bg-gray-700 transition-all"
              >
                Back to Profile
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
