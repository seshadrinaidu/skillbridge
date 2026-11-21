import React from 'react'
import { motion } from 'framer-motion'
import { Brain, Zap } from 'lucide-react'

export default function LoadingScreen({ message = 'Loading...' }) {
  return (
    <div className="fixed inset-0 bg-bg-primary flex flex-col items-center justify-center z-[9999]">
      {/* Background mesh */}
      <div className="absolute inset-0 bg-hero-mesh opacity-50 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative flex flex-col items-center gap-6"
      >
        {/* Animated logo */}
        <div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            className="w-14 h-14 rounded-2xl border-2 border-transparent flex items-center justify-center"
            style={{
              background: 'linear-gradient(#080B12, #080B12) padding-box, linear-gradient(135deg, #6248FF, #00D4D4) border-box'
            }}
          >
            <Brain className="text-brand-400" size={26} />
          </motion.div>
          <motion.div
            animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 rounded-2xl"
            style={{ background: 'radial-gradient(circle, rgba(98,72,255,0.3), transparent 70%)' }}
          />
        </div>

        <div className="text-center">
          <div className="flex items-center gap-2 justify-center mb-2">
            <span className="font-bold text-lg text-text-primary">SkillBridge</span>
            <span className="badge-ai text-2xs">AI</span>
          </div>
          <div className="flex items-center gap-1.5 text-text-secondary text-sm">
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Zap size={13} className="text-ai-500" />
            </motion.div>
            {message}
          </div>
        </div>

        {/* Loading dots */}
        <div className="flex gap-1.5">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
              className="w-1.5 h-1.5 rounded-full bg-brand-500"
            />
          ))}
        </div>
      </motion.div>
    </div>
  )
}
