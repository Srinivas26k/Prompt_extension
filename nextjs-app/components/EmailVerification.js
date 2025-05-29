import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Shield, Check, ArrowRight, Loader2, Clock, Users, Star, Download } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import toast, { Toaster } from 'react-hot-toast'

const EmailVerification = () => {
  const [email, setEmail] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [step, setStep] = useState('register') // 'register', 'verify', 'approved', 'waitlist'
  const [loading, setLoading] = useState(false)
  const [registrationData, setRegistrationData] = useState(null)

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setRegistrationData(data)
        
        if (data.status === 'approved') {
          toast.success('🎉 Congratulations! You have been approved for immediate access!')
          setStep('approved')
        } else if (data.status === 'waitlist') {
          toast.success('📋 You have been added to our waitlist!')
          setStep('waitlist')
        }
      } else {
        toast.error(data.error || 'Registration failed')
      }
    } catch (error) {
      toast.error('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code: verificationCode }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Email verified successfully! You can now use the browser extension.')
      } else {
        toast.error(data.error || 'Verification failed')
      }
    } catch (error) {
      toast.error('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
      <Toaster 
        position="top-center"
        toastOptions={{
          className: 'bg-white text-gray-900',
          duration: 4000,
        }}
      />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full flex items-center justify-center">
              {step === 'register' ? (
                <Mail className="w-6 h-6 text-white" />
              ) : step === 'verify' ? (
                <Shield className="w-6 h-6 text-white" />
              ) : step === 'approved' ? (
                <Star className="w-6 h-6 text-white" />
              ) : (
                <Clock className="w-6 h-6 text-white" />
              )}
            </div>
            <CardTitle className="text-2xl font-bold text-white">
              {step === 'register' ? 'Get Access' : 
               step === 'verify' ? 'Verify Email' :
               step === 'approved' ? 'Welcome Aboard!' :
               'You\'re on the Waitlist'}
            </CardTitle>
            <CardDescription className="text-gray-300">
              {step === 'register' 
                ? 'Enter your email to get started with AI Prompt Enhancer'
                : step === 'verify'
                ? `We sent a verification code to ${email}`
                : step === 'approved'
                ? 'You have been approved for immediate access!'
                : 'Don\'t worry, we\'ll notify you when it\'s your turn!'
              }
            </CardDescription>
          </CardHeader>

          <CardContent>
            <AnimatePresence mode="wait">
              {step === 'register' ? (
                <motion.form
                  key="register"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleRegister}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">
                      Email Address
                    </label>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full"
                    variant="gradient"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Join Waitlist / Get Access
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </motion.form>
              ) : step === 'verify' ? (
                <motion.form
                  key="verify"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleVerify}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">
                      Verification Code
                    </label>
                    <Input
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      required
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 text-center text-lg tracking-widest"
                      maxLength={6}
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full mb-2"
                    variant="gradient"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Verify Email
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    type="button" 
                    onClick={() => setStep('register')}
                    variant="ghost"
                    className="w-full text-gray-300 hover:text-white"
                  >
                    Back to Registration
                  </Button>
                </motion.form>
              ) : step === 'approved' ? (
                <motion.div
                  key="approved"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4 text-center"
                >
                  <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-green-400 mb-2">
                      🎉 Immediate Access Granted!
                    </h3>
                    <p className="text-sm text-gray-300">
                      You are user #{registrationData?.registration_number} and have been approved for immediate access.
                    </p>
                  </div>
                  
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <h4 className="text-sm font-medium text-white mb-2">Your Redemption Code:</h4>
                    <div className="bg-black/30 rounded border p-3 font-mono text-lg text-cyan-400 tracking-widest">
                      {registrationData?.redemption_code}
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      Also sent to your email: {email}
                    </p>
                  </div>

                  <Button 
                    onClick={() => window.open('/extension/download', '_blank')}
                    className="w-full"
                    variant="gradient"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Firefox Extension
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="waitlist"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4 text-center"
                >
                  <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-orange-400 mb-2">
                      📋 You're on the Waitlist
                    </h3>
                    <p className="text-sm text-gray-300">
                      You are registration #{registrationData?.registration_number}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                      <div className="flex items-center justify-center mb-1">
                        <Users className="w-4 h-4 text-cyan-400 mr-1" />
                        <span className="text-xs text-gray-400">Position</span>
                      </div>
                      <div className="text-xl font-bold text-white">
                        #{registrationData?.waitlist_position}
                      </div>
                    </div>
                    
                    <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                      <div className="flex items-center justify-center mb-1">
                        <Clock className="w-4 h-4 text-purple-400 mr-1" />
                        <span className="text-xs text-gray-400">Est. Wait</span>
                      </div>
                      <div className="text-sm font-medium text-white">
                        {registrationData?.estimated_wait}
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3">
                    <p className="text-xs text-gray-300">
                      💡 We approve 1 out of every 10 new registrations. 
                      You'll receive an email when it's your turn!
                    </p>
                  </div>

                  <Button 
                    onClick={() => {
                      setStep('register')
                      setRegistrationData(null)
                      setEmail('')
                    }}
                    variant="ghost"
                    className="w-full text-gray-300 hover:text-white"
                  >
                    Register Another Email
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Instructions */}
            {(step === 'register' || step === 'verify') && (
              <motion.div 
                className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <h4 className="text-sm font-medium text-white mb-2">How it works:</h4>
                <ol className="text-xs text-gray-300 space-y-1">
                  <li className="flex items-center">
                    <span className="w-4 h-4 bg-green-500 text-white rounded-full text-xs flex items-center justify-center mr-2">✓</span>
                    First 25 users get immediate access
                  </li>
                  <li className="flex items-center">
                    <span className="w-4 h-4 bg-orange-500 text-white rounded-full text-xs flex items-center justify-center mr-2">⏳</span>
                    After that, 1 out of 10 get approved
                  </li>
                  <li className="flex items-center">
                    <span className="w-4 h-4 bg-blue-500 text-white rounded-full text-xs flex items-center justify-center mr-2">📧</span>
                    Everyone gets email notifications
                  </li>
                </ol>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </section>
  )
}

export default EmailVerification
