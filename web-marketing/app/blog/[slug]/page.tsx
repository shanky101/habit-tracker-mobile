"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  Calendar,
  Clock,
  Share2,
  Twitter,
  Facebook,
  Linkedin,
  Flame,
} from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

const blogContent: Record<
  string,
  {
    title: string
    excerpt: string
    category: string
    readTime: string
    date: string
    author: string
    content: string[]
  }
> = {
  "21-day-habit-myth": {
    title: "Why the 21-Day Habit Myth Is Destroying Your Progress",
    excerpt:
      "Spoiler: It takes way longer than 21 days. Here's the real science behind habit formation and why knowing this will actually help you.",
    category: "Science",
    readTime: "5 min read",
    date: "Nov 15, 2024",
    author: "Dr. Sarah Johnson",
    content: [
      "You've probably heard it a thousand times: \"It takes 21 days to form a habit.\" This myth has been repeated so many times that most people accept it as scientific fact. But here's the truth: it's completely wrong.",
      "The 21-day myth originated from Dr. Maxwell Maltz's 1960 book \"Psycho-Cybernetics.\" Maltz noticed that amputees took about 21 days to adjust to the loss of a limb. Somehow, this observation morphed into the idea that all habits take 21 days to form.",
      "## The Real Science",
      "In 2009, University College London researcher Philippa Lally published a study that actually measured how long it takes to form a habit. The result? On average, it took 66 days for a behavior to become automatic—not 21.",
      "But here's what's more interesting: the range was huge. Some habits took as few as 18 days to form, while others took up to 254 days. The complexity of the habit mattered enormously.",
      "## Why This Matters for You",
      "Understanding the real timeline of habit formation changes everything about how you approach building new habits:",
      "1. **Stop Setting Unrealistic Expectations**: If you think a habit should be automatic after 21 days and it's not, you might give up. Knowing it could take 2-8 months helps you stay patient.",
      "2. **Plan for the Long Game**: Instead of trying to build 5 habits in a month, focus on one habit at a time for at least 2 months.",
      "3. **Celebrate Small Wins**: Every day you show up is progress, even if it doesn't feel automatic yet.",
      "## What HabitFlow Does Differently",
      "This is exactly why we built HabitFlow with long-term progress in mind:",
      "- **Streak tracking** shows you your cumulative effort, not just a countdown to day 21",
      "- **AI insights** help you understand your personal habit formation timeline",
      "- **Zero guilt philosophy** keeps you going when habits take longer than expected",
      "The truth is, building lasting habits isn't about hitting a magic number of days. It's about showing up consistently until the behavior becomes part of who you are. And that takes as long as it takes.",
      "## Your Next Steps",
      "Ready to start building habits with realistic expectations? Here's what to do:",
      "1. Choose ONE habit to focus on for the next 66 days",
      "2. Track it daily (we recommend HabitFlow, obviously)",
      "3. Review your progress weekly, not daily",
      "4. Be patient with yourself",
      "Remember: slow progress is still progress. The goal isn't to rush through habit formation—it's to build habits that actually stick for life.",
    ],
  },
  "procrastination-is-fear": {
    title: "Procrastination Isn't Laziness—It's Fear",
    excerpt:
      "Stop beating yourself up. Procrastination is your brain protecting you from perceived threats. Here's how to work with it, not against it.",
    category: "Psychology",
    readTime: "7 min read",
    date: "Nov 12, 2024",
    author: "Marcus Chen",
    content: [
      "Every productivity guru tells you to \"just do it\" and \"stop being lazy.\" But if it were that simple, you'd already be doing it. The truth is, procrastination has nothing to do with laziness and everything to do with fear.",
      "## The Science of Procrastination",
      "Dr. Tim Pychyl, a leading researcher on procrastination, has shown that procrastination is an emotion regulation problem, not a time management problem. When we procrastinate, we're avoiding negative feelings associated with a task—not the task itself.",
      "These negative feelings might include:",
      "- Fear of failure",
      "- Fear of success (yes, really)",
      "- Feeling overwhelmed",
      "- Perfectionism",
      "- Self-doubt",
      "Your brain sees these emotions as threats and triggers your fight-or-flight response. Procrastination is the \"flight\" option—you're literally running away from emotional discomfort.",
      "## Why Beating Yourself Up Makes It Worse",
      "Here's the cruel irony: when you procrastinate and then feel guilty about it, you create even more negative emotions. This makes the task even more threatening, which leads to more procrastination. It's a vicious cycle.",
      "Research by Dr. Fuschia Sirois shows that self-compassion is one of the most effective tools for reducing procrastination. People who are kind to themselves about procrastinating actually procrastinate less in the future.",
      "## How to Work With Your Brain, Not Against It",
      "Instead of fighting procrastination with willpower, try these evidence-based strategies:",
      "### 1. Identify the Fear",
      "Before starting a task, ask yourself: \"What am I afraid will happen if I do this?\" Once you name the fear, it loses power.",
      "### 2. Make the First Step Tiny",
      "The 2-minute rule: make your habit so small that you can't say no. Instead of \"write an essay,\" try \"write one sentence.\" This reduces the emotional threat.",
      "### 3. Use Habit Stacking",
      "Attach new habits to existing ones. For example: \"After I pour my morning coffee, I will write one sentence.\" This leverages existing neural pathways.",
      "### 4. Practice Self-Compassion",
      "When you procrastinate, instead of \"I'm so lazy,\" try \"I'm having a hard time with this. What do I need right now?\" Treat yourself like you'd treat a good friend.",
      "## How HabitFlow Helps",
      "We designed HabitFlow with the psychology of procrastination in mind:",
      "- **Tiny check-ins**: Just tap to mark complete. No overwhelming forms.",
      "- **Zero guilt philosophy**: Miss a day? We help you get back on track without shame.",
      "- **Celebration mode**: Positive reinforcement reduces the emotional threat of new habits.",
      "Remember: you're not lazy. You're human. And with the right approach, you can build habits that stick—without fighting your own brain every step of the way.",
    ],
  },
  "2-minute-rule": {
    title: "The 2-Minute Rule That Changed Everything",
    excerpt:
      "Can't get started? Make it so easy you can't say no. This simple trick has helped thousands build consistent habits.",
    category: "Strategy",
    readTime: "4 min read",
    date: "Nov 8, 2024",
    author: "Emma Rodriguez",
    content: [
      "The 2-minute rule is deceptively simple: when starting a new habit, it should take less than two minutes to do.",
      "## Why It Works",
      "The biggest obstacle to building habits isn't time or motivation—it's getting started. Once you start, continuing becomes much easier. This is called the Zeigarnik Effect: our brains hate leaving tasks unfinished.",
      "The 2-minute rule removes the barrier to starting. It's so easy that you can't say no.",
      "## Examples",
      "Here's how to apply it to common habits:",
      "- **Want to read more?** Read one page.",
      "- **Want to exercise?** Do one push-up.",
      "- **Want to meditate?** Take three deep breaths.",
      "- **Want to journal?** Write one sentence.",
      "The key is to make it genuinely easy. If you're thinking \"I should do more,\" you've made it too hard.",
      "## The Gateway Effect",
      "Here's the magic: once you start, you often continue. Reading one page often turns into reading a chapter. One push-up often turns into a full workout.",
      "But even if it doesn't—even if you really do just read one page—you've still built the habit. You've reinforced the identity of \"someone who reads daily.\"",
      "## Common Mistakes",
      "People often misunderstand the 2-minute rule in these ways:",
      "1. **Making it a placeholder**: Thinking \"I'll just do the 2-minute version until I have more time.\" No—commit to the 2-minute version as your actual habit.",
      "2. **Scaling up too fast**: After a week of one push-up, jumping to 50. This breaks the ease. Scale gradually over months, not days.",
      "3. **Skipping on busy days**: The 2-minute rule is specifically for busy days. On easy days, of course you can do more.",
      "## Your Challenge",
      "Pick one habit you've been struggling to start. Shrink it down to a 2-minute version. Do just that version for 30 days straight. Nothing more, nothing less.",
      "Track it in HabitFlow (shameless plug, but it really helps). Watch your streak grow. Notice how the habit starts to feel automatic.",
      "Remember: a habit that exists is infinitely better than a perfect habit that doesn't.",
    ],
  },
}

export default function BlogPostPage() {
  const params = useParams()
  const slug = params.slug as string
  const post = blogContent[slug]

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Post not found</h1>
          <Link href="/blog">
            <Button>Back to Blog</Button>
          </Link>
        </div>
      </div>
    )
  }

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

      <article className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Back Button */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-[#4A3E2A] hover:text-[#8B5CF6] transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>

          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-6">
              <span className="px-3 py-1 rounded-full bg-[#8B5CF6]/10 text-[#8B5CF6] text-sm font-medium">
                {post.category}
              </span>
            </div>
            <h1 className="font-[family-name:var(--font-display)] font-bold text-4xl sm:text-5xl mb-6">
              {post.title}
            </h1>
            <div className="flex items-center gap-6 text-sm text-[#4A3E2A] mb-8">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {post.date}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {post.readTime}
              </div>
              <div>By {post.author}</div>
            </div>

            {/* Share */}
            <div className="flex items-center gap-4 mb-12 pb-8 border-b border-foreground/10">
              <span className="text-sm font-medium">Share:</span>
              <div className="flex gap-2">
                <button className="w-9 h-9 rounded-full bg-[#F5F5F5] dark:bg-[#171717] flex items-center justify-center hover:bg-[#8B5CF6] hover:text-white transition-colors">
                  <Twitter className="w-4 h-4" />
                </button>
                <button className="w-9 h-9 rounded-full bg-[#F5F5F5] dark:bg-[#171717] flex items-center justify-center hover:bg-[#8B5CF6] hover:text-white transition-colors">
                  <Facebook className="w-4 h-4" />
                </button>
                <button className="w-9 h-9 rounded-full bg-[#F5F5F5] dark:bg-[#171717] flex items-center justify-center hover:bg-[#8B5CF6] hover:text-white transition-colors">
                  <Linkedin className="w-4 h-4" />
                </button>
                <button className="w-9 h-9 rounded-full bg-[#F5F5F5] dark:bg-[#171717] flex items-center justify-center hover:bg-[#8B5CF6] hover:text-white transition-colors">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="prose prose-lg max-w-none">
              {post.content.map((paragraph, i) => (
                <div key={i}>
                  {paragraph.startsWith("## ") ? (
                    <h2 className="font-[family-name:var(--font-display)] font-bold text-2xl sm:text-3xl mt-12 mb-6">
                      {paragraph.replace("## ", "")}
                    </h2>
                  ) : paragraph.startsWith("### ") ? (
                    <h3 className="font-[family-name:var(--font-display)] font-semibold text-xl mt-8 mb-4">
                      {paragraph.replace("### ", "")}
                    </h3>
                  ) : (
                    <p className="text-lg leading-relaxed mb-6 text-[#1A1410]">
                      {paragraph}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="mt-16 p-8 bg-gradient-purple rounded-2xl text-white text-center">
              <h3 className="font-[family-name:var(--font-display)] font-bold text-2xl mb-4">
                Ready to build better habits?
              </h3>
              <p className="mb-6 text-white/80">
                Join thousands of people using HabitFlow to build lasting habits
              </p>
              <Button
                size="lg"
                className="bg-white text-[#8B5CF6] hover:bg-white/90"
              >
                Get Started Free
              </Button>
            </div>
          </motion.div>
        </div>
      </article>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-foreground/10">
        <div className="max-w-7xl mx-auto text-center text-sm text-[#525252]">
          <p>© 2024 HabitFlow. Built with ❤️ for habit builders.</p>
        </div>
      </footer>
    </div>
  )
}
