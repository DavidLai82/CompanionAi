import React, { useState, useEffect } from 'react'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import { 
  Brain, 
  MessageCircle, 
  Shield, 
  Smartphone, 
  Users, 
  Sparkles,
  ArrowRight,
  Heart,
  Zap,
  Star,
  Github,
  Twitter,
  Mail
} from 'lucide-react'

interface LandingPageProps {
  onGetStarted: () => void
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const [isVisible, setIsVisible] = useState(false)
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 300], [0, -50])
  const opacity = useTransform(scrollY, [0, 300], [1, 0.8])

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const floatingAnimation = {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0]
          }}
          transition={{ 
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-teal-500/20 to-purple-500/20 rounded-full blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            rotate: [0, -90, 0]
          }}
          transition={{ 
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      {/* Navigation */}
      <motion.nav 
        className="relative z-50 px-6 py-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <motion.div 
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-teal-500 rounded-lg flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-teal-400 bg-clip-text text-transparent">
              Irene AI
            </span>
          </motion.div>
          
          <motion.button
            onClick={onGetStarted}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-teal-500 rounded-full font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Launch App
          </motion.button>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <motion.section 
        className="relative px-6 py-20"
        style={{ y, opacity }}
      >
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
            variants={staggerContainer}
            className="space-y-8"
          >
            <motion.h1 
              variants={fadeInUp}
              className="text-5xl md:text-7xl font-bold leading-tight"
            >
              <span className="bg-gradient-to-r from-white via-purple-200 to-teal-200 bg-clip-text text-transparent">
                Discover, Chat, &
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-teal-400 bg-clip-text text-transparent">
                Find Your Connection
              </span>
            </motion.h1>

            <motion.p 
              variants={fadeInUp}
              className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed"
            >
              Unveil Your Personality, Interests, And Adventures. Let's Match, Chat, 
              And Explore The Vibrant Community Of People Waiting To Meet You!
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-12"
            >
              <motion.button
                onClick={onGetStarted}
                className="group px-8 py-4 bg-gradient-to-r from-purple-500 to-teal-500 rounded-full text-lg font-semibold hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>Get Started</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </motion.button>

              <motion.div
                className="flex items-center space-x-2 text-gray-400"
                whileHover={{ scale: 1.05 }}
              >
                <div className="flex -space-x-2">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-teal-400 border-2 border-slate-800 flex items-center justify-center text-sm font-semibold"
                    >
                      {String.fromCharCode(65 + i)}
                    </div>
                  ))}
                </div>
                <span className="text-sm">Join 10,000+ users</span>
              </motion.div>
            </motion.div>

            {/* Floating Connection Visual */}
            <motion.div
              variants={fadeInUp}
              className="relative mt-20"
            >
              <div className="flex justify-center items-center space-x-8 md:space-x-16">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="relative"
                    animate={floatingAnimation}
                    transition={{ delay: i * 0.5 }}
                  >
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-purple-500 to-teal-500 p-1">
                      <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center">
                        <Users className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    {i < 2 && (
                      <div className="absolute top-1/2 left-full w-8 md:w-16 h-0.5 bg-gradient-to-r from-purple-500 to-teal-500 opacity-60 -translate-y-1/2">
                        <motion.div
                          className="w-2 h-2 rounded-full bg-white absolute right-0 top-1/2 -translate-y-1/2"
                          animate={{ x: [0, 8, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <FeatureSection />

      {/* How It Works Section */}
      <HowItWorksSection />

      {/* Stats Section */}
      <StatsSection />

      {/* Footer */}
      <Footer />
    </div>
  )
}

const FeatureSection: React.FC = () => {
  const ref = React.useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Matching",
      description: "Advanced personality analysis and compatibility scoring using cutting-edge AI technology.",
      gradient: "from-purple-500 to-blue-500"
    },
    {
      icon: MessageCircle,
      title: "Intelligent Conversations",
      description: "Real-time chat with AI-powered conversation suggestions and mood analysis.",
      gradient: "from-teal-500 to-green-500"
    },
    {
      icon: Shield,
      title: "Safe & Secure",
      description: "Advanced safety features with content moderation and privacy protection.",
      gradient: "from-orange-500 to-red-500"
    },
    {
      icon: Smartphone,
      title: "Cross-Platform",
      description: "Available on web, iOS, and Android with seamless synchronization.",
      gradient: "from-indigo-500 to-purple-500"
    }
  ]

  return (
    <motion.section 
      ref={ref}
      className="relative px-6 py-20 bg-slate-800/50"
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
      }}
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          variants={{
            hidden: { opacity: 0, y: 40 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
          }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-400 to-teal-400 bg-clip-text text-transparent">
              Powered by Advanced AI
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Experience the future of social connection with our intelligent matching system
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="group"
              variants={{
                hidden: { opacity: 0, y: 40 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
              }}
              whileHover={{ y: -5 }}
            >
              <div className="h-full p-8 bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 hover:border-purple-500/50 transition-all duration-300">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} p-4 mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-full h-full text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-white">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  )
}

const HowItWorksSection: React.FC = () => {
  const ref = React.useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const steps = [
    {
      number: "01",
      title: "Complete Your Profile",
      description: "Take our personality assessment and showcase your interests",
      icon: Users
    },
    {
      number: "02", 
      title: "Discover Matches",
      description: "Our AI finds compatible people based on your personality and preferences",
      icon: Sparkles
    },
    {
      number: "03",
      title: "Start Conversations",
      description: "Connect with matches through intelligent chat features and voice messages",
      icon: MessageCircle
    },
    {
      number: "04",
      title: "Build Connections",
      description: "Form meaningful relationships in a safe and supportive environment",
      icon: Heart
    }
  ]

  return (
    <motion.section 
      ref={ref}
      className="relative px-6 py-20"
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
      }}
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          variants={{
            hidden: { opacity: 0, y: 40 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
          }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              How It Works
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Four simple steps to find your perfect connection
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className="relative group"
              variants={{
                hidden: { opacity: 0, y: 40 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
              }}
            >
              <div className="text-center">
                <div className="relative mb-8">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-500 to-teal-500 rounded-2xl p-4 group-hover:scale-110 transition-transform duration-300">
                    <step.icon className="w-full h-full text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-purple-600 to-teal-600 rounded-full flex items-center justify-center text-sm font-bold text-white">
                    {step.number}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-4 text-white">{step.title}</h3>
                <p className="text-gray-400 leading-relaxed">{step.description}</p>
              </div>
              
              {index < 3 && (
                <div className="hidden lg:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-purple-500/50 to-transparent -translate-x-4">
                  <motion.div
                    className="w-2 h-2 rounded-full bg-purple-500 absolute right-0 top-1/2 -translate-y-1/2"
                    animate={{ x: [0, 16, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                  />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  )
}

const StatsSection: React.FC = () => {
  const ref = React.useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const stats = [
    { number: "10K+", label: "Active Users", icon: Users },
    { number: "50K+", label: "Matches Made", icon: Heart },
    { number: "95%", label: "Satisfaction Rate", icon: Star },
    { number: "24/7", label: "AI Support", icon: Zap }
  ]

  return (
    <motion.section 
      ref={ref}
      className="relative px-6 py-20 bg-gradient-to-r from-purple-900/20 to-teal-900/20"
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
      }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className="text-center group"
              variants={{
                hidden: { opacity: 0, scale: 0.8 },
                visible: { opacity: 1, scale: 1, transition: { duration: 0.6 } }
              }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="mb-4">
                <stat.icon className="w-8 h-8 mx-auto text-purple-400 group-hover:text-teal-400 transition-colors duration-300" />
              </div>
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-teal-400 bg-clip-text text-transparent mb-2">
                {stat.number}
              </div>
              <div className="text-gray-400">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  )
}

const Footer: React.FC = () => {
  return (
    <footer className="relative px-6 py-16 bg-slate-900/50 border-t border-slate-700/50">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-teal-500 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-teal-400 bg-clip-text text-transparent">
                Irene AI
              </span>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              The future of social connection, powered by advanced AI technology. 
              Find meaningful relationships in a safe and intelligent environment.
            </p>
            <div className="flex space-x-4">
              <motion.a
                href="#"
                className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-purple-600 transition-colors duration-300"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Twitter className="w-5 h-5 text-gray-400" />
              </motion.a>
              <motion.a
                href="#"
                className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-purple-600 transition-colors duration-300"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Github className="w-5 h-5 text-gray-400" />
              </motion.a>
              <motion.a
                href="#"
                className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-purple-600 transition-colors duration-300"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Mail className="w-5 h-5 text-gray-400" />
              </motion.a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Product</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">Features</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">Pricing</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">API</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">Updates</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Legal</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">Terms of Service</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">Cookie Policy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-700/50 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2024 Irene AI. All rights reserved.
            </p>
            <div className="flex items-center space-x-6">
              <span className="text-sm text-gray-400">Made with</span>
              <Heart className="w-4 h-4 text-red-500" />
              <span className="text-sm text-gray-400">by the Irene Team</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default LandingPage