"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import {
  Flame,
  Target,
  TrendingUp,
  Sparkles,
  Calendar,
  Brain,
  Zap,
  Heart,
  Trophy,
  Star,
  CheckCircle2,
  ArrowRight,
  Apple,
  Smartphone,
} from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-lg border-b border-foreground/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 bg-gradient-purple rounded-full flex items-center justify-center">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <span className="font-[family-name:var(--font-display)] font-bold text-xl">HabitFlow</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4"
            >
              <Link
                href="#features"
                className="hidden sm:inline-block text-sm font-medium hover:text-[#8B5CF6] transition-colors"
              >
                Features
              </Link>
              <Link
                href="#blog"
                className="hidden sm:inline-block text-sm font-medium hover:text-[#8B5CF6] transition-colors"
              >
                Blog
              </Link>
              <Button size="sm">Get Started</Button>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-block mb-4">
                <span className="px-4 py-1.5 rounded-full bg-gradient-purple text-white text-sm font-medium shadow-lg">
                  🎉 Launch Special: Free Premium Trial
                </span>
              </div>
              <h1 className="font-[family-name:var(--font-display)] font-bold text-5xl sm:text-6xl lg:text-7xl leading-tight mb-6">
                Build habits
                <br />
                that{" "}
                <span className="text-gradient">actually stick</span>
              </h1>
              <p className="text-lg sm:text-xl text-[#525252] dark:text-[#A3A3A3] mb-8 leading-relaxed max-w-xl">
                Stop failing at New Year's resolutions. HabitFlow celebrates
                every win, builds your streaks, and helps you become the person
                you want to be—one day at a time.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="group">
                  Download Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button size="lg" variant="outline">
                  See How It Works
                </Button>
              </div>
              <div className="mt-8 flex items-center gap-6">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full bg-gradient-purple border-2 border-background"
                    />
                  ))}
                </div>
                <div className="text-sm">
                  <div className="font-semibold">50,000+ happy users</div>
                  <div className="text-[#525252] dark:text-[#A3A3A3]">
                    building better habits
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative">
                {/* Floating elements */}
                <motion.div
                  animate={{ y: [0, -20, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute -top-8 -right-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl p-4 border border-foreground/10"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-orange rounded-full flex items-center justify-center">
                      <Flame className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-sm text-[#525252] dark:text-[#A3A3A3]">
                        Current Streak
                      </div>
                      <div className="text-2xl font-bold">24 days</div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 20, 0] }}
                  transition={{ duration: 5, repeat: Infinity, delay: 1 }}
                  className="absolute -bottom-8 -left-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl p-4 border border-foreground/10"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-teal rounded-full flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-sm text-[#525252] dark:text-[#A3A3A3]">
                        This Week
                      </div>
                      <div className="text-2xl font-bold">18/21</div>
                    </div>
                  </div>
                </motion.div>

                {/* Main phone mockup placeholder */}
                <div className="relative mx-auto w-[300px] h-[600px] bg-gradient-purple rounded-[3rem] p-3 shadow-2xl">
                  <div className="w-full h-full bg-background rounded-[2.5rem] overflow-hidden flex flex-col items-center justify-center">
                    <div className="text-center space-y-4 p-8">
                      <div className="w-20 h-20 bg-gradient-purple rounded-full mx-auto flex items-center justify-center mb-4">
                        <Sparkles className="w-10 h-10 text-white" />
                      </div>
                      <h3 className="font-[family-name:var(--font-display)] font-bold text-xl">
                        Your Progress
                      </h3>
                      <div className="space-y-3">
                        {["Meditate", "Exercise", "Read"].map((habit, i) => (
                          <div
                            key={habit}
                            className="flex items-center gap-3 bg-[#F5F5F5] dark:bg-[#171717] rounded-xl p-3"
                          >
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.5 + i * 0.1 }}
                              className="w-6 h-6 bg-gradient-purple rounded-full flex items-center justify-center"
                            >
                              <CheckCircle2 className="w-4 h-4 text-white" />
                            </motion.div>
                            <span className="text-sm font-medium">{habit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#F5F5F5] dark:bg-[#171717]">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-[family-name:var(--font-display)] font-bold text-3xl sm:text-4xl lg:text-5xl mb-6">
              Why most habit trackers{" "}
              <span className="text-gradient-orange">fail you</span>
            </h2>
            <p className="text-lg text-[#525252] dark:text-[#A3A3A3] max-w-3xl mx-auto mb-12">
              You've tried before. You downloaded the app, set ambitious goals,
              and... gave up in a week. Not because you're lazy, but because
              those apps felt like homework.
            </p>
            <div className="grid sm:grid-cols-3 gap-6 mt-12">
              {[
                {
                  icon: Calendar,
                  title: "Too Complex",
                  description:
                    "15 fields to fill just to add one habit? No thanks.",
                },
                {
                  icon: Zap,
                  title: "No Motivation",
                  description:
                    "Plain checkboxes don't celebrate your wins or keep you going.",
                },
                {
                  icon: Brain,
                  title: "No Insights",
                  description:
                    "You track data but never understand why you succeed or fail.",
                },
              ].map((problem, i) => (
                <motion.div
                  key={problem.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="bg-background rounded-2xl p-6 border border-foreground/10"
                >
                  <div className="w-12 h-12 bg-gradient-orange rounded-xl flex items-center justify-center mb-4 mx-auto">
                    <problem.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-[family-name:var(--font-display)] font-semibold text-lg mb-2">
                    {problem.title}
                  </h3>
                  <p className="text-sm text-[#525252] dark:text-[#A3A3A3]">
                    {problem.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-[family-name:var(--font-display)] font-bold text-3xl sm:text-4xl lg:text-5xl mb-4">
              A habit tracker that{" "}
              <span className="text-gradient">gets you</span>
            </h2>
            <p className="text-lg text-[#525252] dark:text-[#A3A3A3] max-w-2xl mx-auto">
              HabitFlow isn't just another checkbox app. It's your personal
              cheerleader, data analyst, and accountability partner rolled into
              one.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            {[
              {
                icon: Flame,
                title: "Streaks That Motivate",
                description:
                  "Watch your fire grow with each day. Hit milestones and unlock celebrations that make you want to keep going.",
                color: "purple",
              },
              {
                icon: Brain,
                title: "AI-Powered Insights",
                description:
                  "Understand WHY you succeed. Our AI analyzes your patterns and gives you personalized coaching to improve.",
                color: "teal",
              },
              {
                icon: Target,
                title: "One-Tap Check-Ins",
                description:
                  "No forms, no friction. Just tap and done. Logging your habits takes 5 seconds, not 5 minutes.",
                color: "orange",
              },
              {
                icon: TrendingUp,
                title: "Beautiful Analytics",
                description:
                  "See your progress in gorgeous charts and heatmaps. Data that actually tells you something useful.",
                color: "purple",
              },
              {
                icon: Sparkles,
                title: "Celebration Mode",
                description:
                  "Hit a 7-day streak? 30 days? 100 days? We throw you a party with confetti, achievements, and shareable wins.",
                color: "orange",
              },
              {
                icon: Heart,
                title: "Zero Guilt Philosophy",
                description:
                  "Miss a day? That's okay. We help you get back on track without the shame spiral other apps create.",
                color: "teal",
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group relative bg-[#F5F5F5] dark:bg-[#171717] rounded-2xl p-8 border border-foreground/10 hover:border-[#8B5CF6]/30 transition-all hover:shadow-xl"
              >
                <div
                  className={`w-14 h-14 bg-gradient-${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-[family-name:var(--font-display)] font-semibold text-xl mb-3">
                  {feature.title}
                </h3>
                <p className="text-[#525252] dark:text-[#A3A3A3] leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#F5F5F5] dark:bg-[#171717]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-[family-name:var(--font-display)] font-bold text-3xl sm:text-4xl lg:text-5xl mb-4">
              Real people, real{" "}
              <span className="text-gradient">transformations</span>
            </h2>
            <p className="text-lg text-[#525252] dark:text-[#A3A3A3]">
              Don't just take our word for it
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Sarah Chen",
                role: "Product Designer",
                content:
                  "I've tried literally every habit tracker. HabitFlow is the only one I've stuck with for 6+ months. The celebrations keep me motivated!",
                streak: "187 days",
                avatar: "SC",
              },
              {
                name: "Marcus Rodriguez",
                role: "Software Engineer",
                content:
                  "The AI insights are incredible. It told me I'm 3x more likely to meditate after morning coffee. Now I stack my habits and never miss.",
                streak: "94 days",
                avatar: "MR",
              },
              {
                name: "Emma Thompson",
                role: "Freelance Writer",
                content:
                  "Finally, a habit tracker that doesn't make me feel guilty when I slip. The 'get back on track' feature is genuinely helpful, not preachy.",
                streak: "52 days",
                avatar: "ET",
              },
            ].map((testimonial, i) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-background rounded-2xl p-6 border border-foreground/10"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-purple rounded-full flex items-center justify-center font-bold text-white">
                    {testimonial.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-[#525252] dark:text-[#A3A3A3]">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="w-4 h-4 fill-[#F97316] text-[#F97316]"
                    />
                  ))}
                </div>
                <p className="text-[#525252] dark:text-[#A3A3A3] mb-4 leading-relaxed">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Flame className="w-4 h-4 text-[#F97316]" />
                  <span>{testimonial.streak} streak</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Preview */}
      <section id="blog" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-[family-name:var(--font-display)] font-bold text-3xl sm:text-4xl lg:text-5xl mb-4">
              Learn the science of{" "}
              <span className="text-gradient-teal">habit formation</span>
            </h2>
            <p className="text-lg text-[#525252] dark:text-[#A3A3A3] max-w-2xl mx-auto">
              Evidence-based insights on building habits that last
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Why the 21-Day Habit Myth Is Destroying Your Progress",
                excerpt:
                  "Spoiler: It takes way longer than 21 days. Here's the real science behind habit formation and why knowing this will actually help you.",
                category: "Science",
                readTime: "5 min read",
                date: "Nov 15, 2024",
              },
              {
                title: "Procrastination Isn't Laziness—It's Fear",
                excerpt:
                  "Stop beating yourself up. Procrastination is your brain protecting you from perceived threats. Here's how to work with it, not against it.",
                category: "Psychology",
                readTime: "7 min read",
                date: "Nov 12, 2024",
              },
              {
                title: "The 2-Minute Rule That Changed Everything",
                excerpt:
                  "Can't get started? Make it so easy you can't say no. This simple trick has helped thousands build consistent habits.",
                category: "Strategy",
                readTime: "4 min read",
                date: "Nov 8, 2024",
              },
            ].map((post, i) => (
              <motion.article
                key={post.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group bg-[#F5F5F5] dark:bg-[#171717] rounded-2xl overflow-hidden border border-foreground/10 hover:border-[#8B5CF6]/30 transition-all hover:shadow-xl cursor-pointer"
              >
                <div className="h-48 bg-gradient-purple"></div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3 text-xs">
                    <span className="px-3 py-1 rounded-full bg-[#8B5CF6]/10 text-[#8B5CF6] font-medium">
                      {post.category}
                    </span>
                    <span className="text-[#A3A3A3]">{post.readTime}</span>
                    <span className="text-[#A3A3A3]">•</span>
                    <span className="text-[#A3A3A3]">{post.date}</span>
                  </div>
                  <h3 className="font-[family-name:var(--font-display)] font-semibold text-xl mb-3 group-hover:text-[#8B5CF6] transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-[#525252] dark:text-[#A3A3A3] text-sm leading-relaxed mb-4">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center gap-2 text-sm font-medium text-[#8B5CF6]">
                    Read more
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              View All Articles
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-purple text-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-[family-name:var(--font-display)] font-bold text-3xl sm:text-4xl lg:text-5xl mb-6">
              Start building habits that stick
            </h2>
            <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
              Join 50,000+ people who are transforming their lives, one habit at
              a time. Free to start, no credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button
                size="lg"
                className="bg-white text-[#8B5CF6] hover:bg-white/90"
              >
                <Apple className="w-5 h-5" />
                Download on App Store
              </Button>
              <Button
                size="lg"
                className="bg-white/10 backdrop-blur-sm border-2 border-white/20 hover:bg-white/20"
              >
                <Smartphone className="w-5 h-5" />
                Get it on Google Play
              </Button>
            </div>
            <p className="text-sm text-white/60">
              Free forever • 5 habits included • Upgrade for unlimited
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-foreground/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-purple rounded-full flex items-center justify-center">
                  <Flame className="w-5 h-5 text-white" />
                </div>
                <span className="font-[family-name:var(--font-display)] font-bold text-xl">
                  HabitFlow
                </span>
              </div>
              <p className="text-sm text-[#525252] dark:text-[#A3A3A3]">
                Build better habits, one day at a time.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-[#525252] dark:text-[#A3A3A3]">
                <li>
                  <a href="#features" className="hover:text-foreground">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground">
                    Download
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Resources</h4>
              <ul className="space-y-2 text-sm text-[#525252] dark:text-[#A3A3A3]">
                <li>
                  <a href="#blog" className="hover:text-foreground">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground">
                    Community
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-[#525252] dark:text-[#A3A3A3]">
                <li>
                  <a href="#" className="hover:text-foreground">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-foreground/10 text-center text-sm text-[#525252] dark:text-[#A3A3A3]">
            <p>© 2024 HabitFlow. Built with ❤️ for habit builders.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
