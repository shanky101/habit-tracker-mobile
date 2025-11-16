"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { ArrowRight, Calendar, Clock, Flame } from "lucide-react"
import Link from "next/link"

const blogPosts = [
  {
    slug: "21-day-habit-myth",
    title: "Why the 21-Day Habit Myth Is Destroying Your Progress",
    excerpt:
      "Spoiler: It takes way longer than 21 days. Here's the real science behind habit formation and why knowing this will actually help you.",
    category: "Science",
    readTime: "5 min read",
    date: "Nov 15, 2024",
    author: "Dr. Sarah Johnson",
    image: "/blog/habit-myth.jpg",
  },
  {
    slug: "procrastination-is-fear",
    title: "Procrastination Isn't Laziness—It's Fear",
    excerpt:
      "Stop beating yourself up. Procrastination is your brain protecting you from perceived threats. Here's how to work with it, not against it.",
    category: "Psychology",
    readTime: "7 min read",
    date: "Nov 12, 2024",
    author: "Marcus Chen",
    image: "/blog/procrastination.jpg",
  },
  {
    slug: "2-minute-rule",
    title: "The 2-Minute Rule That Changed Everything",
    excerpt:
      "Can't get started? Make it so easy you can't say no. This simple trick has helped thousands build consistent habits.",
    category: "Strategy",
    readTime: "4 min read",
    date: "Nov 8, 2024",
    author: "Emma Rodriguez",
    image: "/blog/2-minute-rule.jpg",
  },
  {
    slug: "habit-stacking",
    title: "Habit Stacking: The Secret to Building Multiple Habits at Once",
    excerpt:
      "Learn how to leverage your existing routines to build new habits effortlessly. This simple framework has a 90% success rate.",
    category: "Strategy",
    readTime: "6 min read",
    date: "Nov 5, 2024",
    author: "Dr. Sarah Johnson",
    image: "/blog/habit-stacking.jpg",
  },
  {
    slug: "streaks-psychology",
    title: "The Psychology of Streaks: Why They Work (And When They Don't)",
    excerpt:
      "Streaks are powerful motivators, but they can also be harmful. Here's how to use them correctly to build lasting habits.",
    category: "Psychology",
    readTime: "8 min read",
    date: "Nov 1, 2024",
    author: "Marcus Chen",
    image: "/blog/streaks.jpg",
  },
  {
    slug: "morning-routine",
    title: "The Perfect Morning Routine (According to Science)",
    excerpt:
      "Forget waking up at 5 AM. Here's what actually makes a morning routine effective, based on 20 years of research.",
    category: "Science",
    readTime: "10 min read",
    date: "Oct 28, 2024",
    author: "Emma Rodriguez",
    image: "/blog/morning-routine.jpg",
  },
]

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-lg border-b border-foreground/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-purple rounded-full flex items-center justify-center">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <span className="font-[family-name:var(--font-display)] font-bold text-xl">
                HabitFlow
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/#features"
                className="hidden sm:inline-block text-sm font-medium hover:text-[#8B5CF6] transition-colors"
              >
                Features
              </Link>
              <Link
                href="/blog"
                className="hidden sm:inline-block text-sm font-medium text-[#8B5CF6]"
              >
                Blog
              </Link>
              <Button size="sm">Get Started</Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="font-[family-name:var(--font-display)] font-bold text-4xl sm:text-5xl lg:text-6xl mb-6">
              The Science of{" "}
              <span className="text-gradient">Building Better Habits</span>
            </h1>
            <p className="text-lg text-[#525252] dark:text-[#A3A3A3] max-w-2xl mx-auto mb-8">
              Evidence-based insights, practical strategies, and real stories to
              help you build habits that actually stick.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post, i) => (
              <motion.article
                key={post.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group bg-[#F5F5F5] dark:bg-[#171717] rounded-2xl overflow-hidden border border-foreground/10 hover:border-[#8B5CF6]/30 transition-all hover:shadow-xl cursor-pointer"
              >
                <Link href={`/blog/${post.slug}`}>
                  <div className="h-48 bg-gradient-purple"></div>
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3 text-xs">
                      <span className="px-3 py-1 rounded-full bg-[#8B5CF6]/10 text-[#8B5CF6] font-medium">
                        {post.category}
                      </span>
                      <span className="text-[#A3A3A3] flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.readTime}
                      </span>
                    </div>
                    <h3 className="font-[family-name:var(--font-display)] font-semibold text-xl mb-3 group-hover:text-[#8B5CF6] transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-[#525252] dark:text-[#A3A3A3] text-sm leading-relaxed mb-4">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-xs text-[#A3A3A3]">
                      <span>{post.author}</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {post.date}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium text-[#8B5CF6] mt-4">
                      Read more
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-purple text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-[family-name:var(--font-display)] font-bold text-3xl sm:text-4xl mb-6">
            Ready to build better habits?
          </h2>
          <p className="text-lg text-white/80 mb-8">
            Join 50,000+ people transforming their lives with HabitFlow
          </p>
          <Button
            size="lg"
            className="bg-white text-[#8B5CF6] hover:bg-white/90"
          >
            Get Started Free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-foreground/10">
        <div className="max-w-7xl mx-auto text-center text-sm text-[#525252] dark:text-[#A3A3A3]">
          <p>© 2024 HabitFlow. Built with ❤️ for habit builders.</p>
        </div>
      </footer>
    </div>
  )
}
