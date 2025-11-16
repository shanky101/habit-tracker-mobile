import { Button } from "@/components/ui/button"
import { ArrowRight, Calendar, Clock, Leaf } from "lucide-react"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Wisdom & Insights - HabitFlow Blog",
  description: "Evidence-based insights, practical strategies, and real stories about building better habits. Learn the science of habit formation, overcome procrastination, and cultivate lasting change.",
  keywords: ["habit formation", "procrastination tips", "productivity strategies", "mindfulness", "self improvement blog", "habit science", "behavior change", "morning routine", "habit stacking"],
}

const blogPosts = [
  {
    slug: "21-day-habit-myth",
    title: "Why the 21-Day Habit Myth Is Destroying Your Progress",
    excerpt:
      "Spoiler: It takes way longer than 21 days. Here's the real science behind habit formation and why knowing this will actually help you succeed.",
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
      "Can't get started? Make it so easy you can't say no. This simple trick has helped thousands build consistent habits without willpower.",
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
      "Learn how to leverage your existing routines to build new habits effortlessly. This simple framework has a 90% success rate among HabitFlow users.",
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
      "Streaks are powerful motivators, but they can also be harmful. Here's how to use them correctly to build lasting habits without burnout.",
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
      "Forget waking up at 5 AM. Here's what actually makes a morning routine effective, based on 20 years of behavioral research.",
    category: "Science",
    readTime: "10 min read",
    date: "Oct 28, 2024",
    author: "Emma Rodriguez",
    image: "/blog/morning-routine.jpg",
  },
]

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F3]">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#FAF8F3]/90 backdrop-blur-md border-b border-[#B85C38]/10" role="navigation" aria-label="Main navigation">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center gap-3" aria-label="HabitFlow home">
              <div className="w-10 h-10 bg-gradient-earth rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(62,39,35,0.08)]" aria-hidden="true">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <span className="font-[family-name:var(--font-display)] font-medium text-2xl text-[#1A1410]">
                HabitFlow
              </span>
            </Link>
            <div className="flex items-center gap-8">
              <Link
                href="/#features"
                className="hidden md:inline-block text-[#1A1410] hover:text-[#B85C38] transition-colors font-medium text-[15px]"
              >
                Features
              </Link>
              <Link
                href="/blog"
                className="hidden md:inline-block text-[#B85C38] font-medium text-[15px]"
              >
                Wisdom
              </Link>
              <Button size="sm" variant="earth" aria-label="Begin your habit tracking journey">Get Started</Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6 lg:px-8 bg-gradient-to-br from-[#F5F1E8] to-[#FAF8F3]" aria-labelledby="blog-hero-heading">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-fade-in-up">
            <span className="font-[family-name:var(--font-body)] text-[#4A7C59] text-xs font-semibold tracking-[0.15em] uppercase mb-4 block">
              The Wisdom Library
            </span>
            <h1 id="blog-hero-heading" className="font-[family-name:var(--font-display)] font-normal text-[#1A1410] text-4xl md:text-5xl lg:text-6xl mb-6">
              The Science of{" "}
              <span className="text-[#B85C38] italic font-light">Building Better Habits</span>
            </h1>
            <p className="text-[#1A1410] text-lg md:text-xl max-w-2xl mx-auto mb-8 leading-relaxed">
              Evidence-based insights, practical strategies, and real stories to
              help you build habits that actually stick—naturally and sustainably.
            </p>
          </div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="pb-24 px-6 lg:px-8" aria-label="Blog posts">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post, i) => (
              <article
                key={post.slug}
                className="group bg-white rounded-[32px] overflow-hidden border border-[#B85C38]/10 hover:border-[#B85C38]/30 transition-all hover:shadow-[0_8px_24px_rgba(26,20,16,0.08)] cursor-pointer animate-fade-in-up"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <Link href={`/blog/${post.slug}`}>
                  <div className="h-48 bg-gradient-earth relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('/texture-paper.png')] opacity-10" aria-hidden="true" />
                    <div className="absolute bottom-4 left-4">
                      <Leaf className="w-12 h-12 text-white/30" aria-hidden="true" />
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3 text-xs">
                      <span className="px-3 py-1 rounded-full bg-[#4A7C59]/10 text-[#4A7C59] font-medium">
                        {post.category}
                      </span>
                      <span className="text-[#1A1410] flex items-center gap-1">
                        <Clock className="w-3 h-3" aria-hidden="true" />
                        {post.readTime}
                      </span>
                    </div>
                    <h3 className="font-[family-name:var(--font-display)] font-medium text-[#1A1410] text-xl mb-3 group-hover:text-[#B85C38] transition-colors leading-tight">
                      {post.title}
                    </h3>
                    <p className="text-[#1A1410] text-[15px] leading-relaxed mb-4">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-xs text-[#4A3E2A]">
                      <span>{post.author}</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" aria-hidden="true" />
                        {post.date}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium text-[#B85C38] mt-4">
                      Read article
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 px-6 lg:px-8 bg-gradient-forest text-white" aria-labelledby="newsletter-heading">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-4">
            <Leaf className="w-12 h-12 mx-auto mb-4 text-white/80" aria-hidden="true" />
          </div>
          <h2 id="newsletter-heading" className="font-[family-name:var(--font-display)] font-light text-3xl md:text-4xl mb-6">
            Weekly wisdom delivered to your inbox
          </h2>
          <p className="text-white/95 text-lg mb-8">
            Join 15,000+ mindful readers who get evidence-based insights on habit formation, productivity, and intentional living every Sunday morning.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 px-6 py-3 rounded-full border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder:text-white/60 focus:outline-none focus:border-white focus:ring-2 focus:ring-white/20 font-medium"
              aria-label="Email address for newsletter"
            />
            <Button
              size="lg"
              className="bg-white text-[#1A1410] hover:bg-white/90 rounded-full font-medium"
              aria-label="Subscribe to newsletter"
            >
              Subscribe
            </Button>
          </div>
          <p className="text-sm text-white/80 mt-4">
            Unsubscribe anytime • No spam • Just thoughtful insights
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 lg:px-8 bg-[#F5F1E8]" aria-labelledby="cta-heading">
        <div className="max-w-4xl mx-auto text-center">
          <h2 id="cta-heading" className="font-[family-name:var(--font-display)] font-normal text-[#1A1410] text-3xl md:text-4xl mb-6">
            Ready to build better habits?
          </h2>
          <p className="text-[#1A1410] text-lg mb-8">
            Join 25,000+ people transforming their lives with HabitFlow
          </p>
          <Button
            size="lg"
            variant="earth"
            className="font-medium"
            aria-label="Get started with HabitFlow"
          >
            Get Started Free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 lg:px-8 border-t border-[#B85C38]/10 bg-white" role="contentinfo">
        <div className="max-w-7xl mx-auto text-center text-sm text-[#4A3E2A]">
          <p>
            © 2024 HabitFlow. Built with care for habit builders.
          </p>
        </div>
      </footer>
    </div>
  )
}
