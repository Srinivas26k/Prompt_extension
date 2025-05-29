import { useState } from 'react'
import { ThemeProvider } from 'next-themes'
import Layout from '../components/Layout'
import Hero from '../components/Hero'
import EmailVerification from '../components/EmailVerification'
import { Button } from '../components/ui/button'
import { motion } from 'framer-motion'
import { ArrowDown, Sparkles, Zap, Shield, Chrome, Download } from 'lucide-react'

export default function Home() {
  const [showVerification, setShowVerification] = useState(false)

  const scrollToVerification = () => {
    setShowVerification(true)
    setTimeout(() => {
      document.getElementById('verification').scrollIntoView({ 
        behavior: 'smooth' 
      })
    }, 100)
  }

  const features = [
    {
      icon: Sparkles,
      title: 'AI-Powered Enhancement',
      description: 'Advanced algorithms analyze and improve your prompts for better AI responses.'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Get enhanced prompts in seconds with our optimized processing engine.'
    },
    {
      icon: Shield,
      title: 'Privacy First',
      description: 'Your data is encrypted and never stored permanently on our servers.'
    },
    {
      icon: Chrome,
      title: 'Browser Integration',
      description: 'Seamlessly works with your favorite AI platforms through our extension.'
    }
  ]

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <Layout title="AI Prompt Enhancer - Transform Your AI Prompts">
        <div className="min-h-screen">
          {/* Hero Section */}
          <section className="relative">
            <Hero />
            
            {/* Scroll indicator */}
            <motion.div 
              className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Button
                onClick={scrollToVerification}
                variant="ghost"
                size="lg"
                className="text-white hover:text-cyan-400 hover:bg-white/10"
              >
                <ArrowDown className="w-6 h-6" />
              </Button>
            </motion.div>
          </section>

          {/* Features Section */}
          <section className="py-20 bg-slate-900">
            <div className="container mx-auto px-6">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                  Why Choose Our Platform?
                </h2>
                <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                  Built for professionals who demand the best AI prompt optimization tools.
                </p>
              </motion.div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-cyan-400/50 transition-all duration-300"
                  >
                    <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-300">
                      {feature.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Extension Download Section */}
          <section className="py-20 bg-gradient-to-r from-purple-900 to-indigo-900">
            <div className="container mx-auto px-6 text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                  Get the Browser Extension
                </h2>
                <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                  Install our Firefox extension to start enhancing your prompts on any AI platform.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Button
                    size="lg"
                    variant="gradient"
                    className="text-lg px-8 py-4"
                    onClick={scrollToVerification}
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Get Access First
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-lg px-8 py-4 border-white/20 text-white hover:bg-white/10"
                  >
                    View on GitHub
                  </Button>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Email Verification Section */}
          {showVerification && (
            <motion.section
              id="verification"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.8 }}
            >
              <EmailVerification />
            </motion.section>
          )}
        </div>
      </Layout>
    </ThemeProvider>
  )
}
