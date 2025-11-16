"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import {
  Calendar,
  TrendingUp,
  Heart,
  Leaf,
  Sunrise,
  Target,
  Users,
  Sparkles,
  ArrowRight,
  Apple,
  Smartphone,
  CheckCircle,
} from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Floating leaf decorations */}
      <div className="fixed top-[10%] left-[8%] text-4xl opacity-10 animate-float pointer-events-none z-10">
        🍃
      </div>
      <div className="fixed top-[30%] right-[12%] text-4xl opacity-10 animate-float pointer-events-none z-10" style={{ animationDelay: '2s' }}>
        🌿
      </div>
      <div className="fixed top-[60%] left-[18%] text-4xl opacity-10 animate-float pointer-events-none z-10" style={{ animationDelay: '4s' }}>
        🍂
      </div>
      <div className="fixed top-[80%] right-[25%] text-4xl opacity-10 animate-float pointer-events-none z-10" style={{ animationDelay: '6s' }}>
        🌱
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#FAF8F3]/90 backdrop-blur-md border-b border-[#B85C38]/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-earth rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(62,39,35,0.08)]">
                <Leaf className="w-6 h-6 text-[#FAF8F3]" />
              </div>
              <span className="font-[family-name:var(--font-display)] font-semibold text-2xl text-[#3E2723]">
                HabitFlow
              </span>
            </Link>
            <div className="flex items-center gap-8">
              <Link
                href="#features"
                className="hidden md:inline-block text-[#4A4A42] hover:text-[#B85C38] transition-colors font-medium"
              >
                Features
              </Link>
              <Link
                href="#testimonials"
                className="hidden md:inline-block text-[#4A4A42] hover:text-[#B85C38] transition-colors font-medium"
              >
                Stories
              </Link>
              <Link
                href="/blog"
                className="hidden md:inline-block text-[#4A4A42] hover:text-[#B85C38] transition-colors font-medium"
              >
                Wisdom
              </Link>
              <Button size="sm" variant="earth">Begin Your Journey</Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 lg:pt-40 lg:pb-32 px-6 lg:px-8 overflow-hidden bg-gradient-earth min-h-[85vh] flex items-center justify-center">
        {/* Organic shapes background */}
        <div className="absolute top-[-10%] left-[-5%] w-[60%] h-[60%] bg-[#FAF8F3]/30 rounded-[40%_60%_70%_30%/40%_50%_60%_50%] animate-breathe" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-[#2C5F2D]/20 rounded-[40%_60%_70%_30%/40%_50%_60%_50%] animate-breathe" style={{ animationDuration: '10s', animationDirection: 'reverse' }} />

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-block mb-6">
              <span className="px-6 py-2 rounded-full bg-white/25 backdrop-blur-sm text-[#FAF8F3] text-sm font-medium border border-white/40 tracking-wide">
                🌱 Grow Naturally, Live Intentionally
              </span>
            </div>
            
            <h1 className="font-[family-name:var(--font-display)] font-semibold text-[#FAF8F3] text-5xl md:text-6xl lg:text-7xl leading-[1.1] mb-8 tracking-tight" style={{ textShadow: '0 4px 20px rgba(62, 39, 35, 0.3)' }}>
              Cultivate habits that{" "}
              <br className="hidden md:block" />
              root deep and{" "}
              <span className="italic">bloom forever</span>
            </h1>

            <p className="font-[family-name:var(--font-accent)] text-[#F5F1E8] text-xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed font-normal italic">
              Like seeds planted in fertile soil, your habits grow strong with patience and care. 
              Track your daily rituals, celebrate progress, and transform—one mindful step at a time.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" className="bg-white text-[#B85C38] hover:bg-white/90 shadow-[0_10px_30px_rgba(44,95,45,0.15)]">
                <Apple className="w-5 h-5" />
                Download for iOS
              </Button>
              <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/20 hover:border-white">
                <Smartphone className="w-5 h-5" />
                Get on Android
              </Button>
            </div>

            <div className="mt-12 flex items-center justify-center gap-6 text-[#F5F1E8]">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-white/20 border-2 border-white/40 backdrop-blur-sm"
                  />
                ))}
              </div>
              <div className="text-sm">
                <div className="font-semibold">Join 25,000+ mindful people</div>
                <div className="opacity-90">building lasting habits</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-24 lg:py-32 px-6 lg:px-8 bg-[#FAF8F3]">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="font-[family-name:var(--font-accent)] text-[#4A7C59] text-sm font-semibold italic tracking-wide uppercase mb-4 block">
              Chapter One
            </span>
            <h2 className="font-[family-name:var(--font-display)] font-semibold text-[#B85C38] text-4xl md:text-5xl lg:text-6xl mb-8 leading-tight">
              Why force never works
            </h2>
            <p className="text-[#4A4A42] text-lg md:text-xl leading-relaxed mb-6">
              You've tried willpower. You've tried discipline. You've tried punishing yourself into change.
              And none of it lasted—because that's not how nature works.
            </p>
            <p className="font-[family-name:var(--font-accent)] text-[#795548] text-lg md:text-xl leading-relaxed italic">
              "A tree doesn't force its growth. It simply creates the right conditions, 
              then allows nature to take its course. Your habits are no different."
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 lg:py-32 px-6 lg:px-8 bg-[#F5F1E8]">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <span className="font-[family-name:var(--font-accent)] text-[#4A7C59] text-sm font-semibold italic tracking-wide uppercase mb-4 block">
              Chapter Two
            </span>
            <h2 className="font-[family-name:var(--font-display)] font-semibold text-[#B85C38] text-4xl md:text-5xl mb-6">
              How HabitFlow works with your nature
            </h2>
            <p className="text-[#4A4A42] text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
              Not another productivity app trying to turn you into a machine. 
              HabitFlow honors your humanity—the rhythms, the seasons, the natural pace of growth.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Target,
                title: "Mindful Check-Ins",
                description: "No overwhelming forms. Just a gentle tap to acknowledge today's progress. Like watering a plant—simple, intentional, nurturing.",
              },
              {
                icon: TrendingUp,
                title: "Growth Patterns",
                description: "See your habits bloom over time. Beautiful visualizations that reveal your unique rhythm, not someone else's rigid schedule.",
              },
              {
                icon: Heart,
                title: "Grace for Imperfection",
                description: "Missed a day? Life happens. HabitFlow helps you return without guilt—because consistency matters more than perfection.",
              },
              {
                icon: Calendar,
                title: "Seasonal Wisdom",
                description: "Your energy ebbs and flows like seasons. Track patterns across weeks and months to understand your natural cycles.",
              },
              {
                icon: Sparkles,
                title: "Celebrations that Matter",
                description: "Milestones feel meaningful, not manufactured. Unlock moments of reflection and appreciation for how far you've come.",
              },
              {
                icon: Sunrise,
                title: "Morning Rituals",
                description: "Start each day with intention. Review yesterday, set today's focus, and plant seeds for tomorrow—all in moments.",
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-[#FAF8F3] rounded-[32px] p-8 shadow-[0_4px_12px_rgba(62,39,35,0.08)] border-l-[5px] border-[#4A7C59] hover:shadow-[0_16px_48px_rgba(62,39,35,0.16)] transition-all duration-400 hover:translate-x-3"
              >
                <div className="w-16 h-16 bg-gradient-forest rounded-full flex items-center justify-center mb-6 shadow-[0_10px_30px_rgba(44,95,45,0.15)]">
                  <feature.icon className="w-8 h-8 text-[#FAF8F3]" />
                </div>
                <h3 className="font-[family-name:var(--font-display)] font-semibold text-[#3E2723] text-xl mb-3">
                  {feature.title}
                </h3>
                <p className="text-[#4A4A42] leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 lg:py-32 px-6 lg:px-8 bg-[#FAF8F3]">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <span className="font-[family-name:var(--font-accent)] text-[#4A7C59] text-sm font-semibold italic tracking-wide uppercase mb-4 block">
              Chapter Three
            </span>
            <h2 className="font-[family-name:var(--font-display)] font-semibold text-[#B85C38] text-4xl md:text-5xl mb-6">
              Stories of transformation
            </h2>
            <p className="text-[#4A4A42] text-lg md:text-xl max-w-3xl mx-auto">
              Real people. Real change. Real habits that took root and grew.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Maria Santos",
                role: "Teacher & Mother",
                content: "For the first time in years, I'm not beating myself up for missing a day. HabitFlow taught me that growth isn't linear—and that's okay. My morning meditation practice is now as natural as breathing.",
                streak: "127 days of mindfulness",
                avatar: "MS",
              },
              {
                name: "James Chen",
                role: "Software Developer",
                content: "I've tried every productivity system out there. This is different—it actually honors how humans work. The seasonal view helped me see I'm naturally more active in summer. Game changer.",
                streak: "89 days of movement",
                avatar: "JC",
              },
              {
                name: "Aisha Patel",
                role: "Wellness Coach",
                content: "I recommend HabitFlow to all my clients now. It's the only tool that matches my philosophy: sustainable change comes from compassion, not discipline. The interface is pure poetry.",
                streak: "156 days of journaling",
                avatar: "AP",
              },
            ].map((testimonial, i) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-[#F5F1E8] rounded-[32px] p-8 shadow-[0_4px_12px_rgba(62,39,35,0.08)]"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-gradient-earth rounded-full flex items-center justify-center font-[family-name:var(--font-display)] font-bold text-[#FAF8F3] text-lg">
                    {testimonial.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-[#3E2723]">{testimonial.name}</div>
                    <div className="text-sm text-[#4A4A42]">{testimonial.role}</div>
                  </div>
                </div>
                <p className="text-[#4A4A42] leading-relaxed mb-6 font-[family-name:var(--font-accent)] italic">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center gap-2 text-sm font-medium text-[#4A7C59]">
                  <Leaf className="w-4 h-4" />
                  <span>{testimonial.streak}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 lg:py-32 px-6 lg:px-8 bg-gradient-forest text-[#FAF8F3] relative overflow-hidden">
        <div className="absolute top-[-30%] left-[-10%] w-[400px] h-[400px] bg-[#B5C99A]/15 rounded-full" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="font-[family-name:var(--font-display)] font-semibold text-4xl md:text-5xl lg:text-6xl mb-8">
            Ready to grow?
          </h2>
          <p className="text-[#F5F1E8] text-lg md:text-xl mb-12 max-w-2xl mx-auto font-[family-name:var(--font-accent)] italic">
            Join thousands who've discovered that lasting change doesn't come from force—
            it comes from nurturing the conditions where good habits naturally take root.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button
              size="lg"
              className="bg-white text-[#2C5F2D] hover:bg-white/90"
            >
              <Apple className="w-5 h-5" />
              Download on App Store
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/40 text-white hover:bg-white/20 hover:border-white"
            >
              <Smartphone className="w-5 h-5" />
              Get it on Google Play
            </Button>
          </div>
          <p className="text-sm text-[#F5F1E8]/80">
            Free to start • No credit card • Premium features available
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 lg:px-8 bg-[#3E2723] text-[#E8DCC7]">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-earth rounded-full flex items-center justify-center">
                  <Leaf className="w-6 h-6 text-[#FAF8F3]" />
                </div>
                <span className="font-[family-name:var(--font-display)] font-semibold text-2xl text-[#FAF8F3]">
                  HabitFlow
                </span>
              </div>
              <p className="text-sm text-[#B4AFA4] font-[family-name:var(--font-accent)] italic">
                Grow naturally. Live intentionally.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-[#FAF8F3] mb-4">Product</h4>
              <ul className="space-y-3 text-sm text-[#B4AFA4]">
                <li><a href="#features" className="hover:text-[#D4A574] transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-[#D4A574] transition-colors">Premium</a></li>
                <li><a href="#" className="hover:text-[#D4A574] transition-colors">Download</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-[#FAF8F3] mb-4">Wisdom</h4>
              <ul className="space-y-3 text-sm text-[#B4AFA4]">
                <li><a href="/blog" className="hover:text-[#D4A574] transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-[#D4A574] transition-colors">Guides</a></li>
                <li><a href="#" className="hover:text-[#D4A574] transition-colors">Community</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-[#FAF8F3] mb-4">Company</h4>
              <ul className="space-y-3 text-sm text-[#B4AFA4]">
                <li><a href="#" className="hover:text-[#D4A574] transition-colors">About</a></li>
                <li><a href="#" className="hover:text-[#D4A574] transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-[#D4A574] transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-[#795548] text-center text-sm text-[#B4AFA4]">
            <p className="font-[family-name:var(--font-accent)] italic">
              © 2024 HabitFlow. Built with care for those who choose to grow.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
