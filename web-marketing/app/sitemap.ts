import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://habitflow.app',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: 'https://habitflow.app/blog',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: 'https://habitflow.app/blog/21-day-habit-myth',
      lastModified: new Date('2024-11-15'),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: 'https://habitflow.app/blog/procrastination-is-fear',
      lastModified: new Date('2024-11-12'),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: 'https://habitflow.app/blog/2-minute-rule',
      lastModified: new Date('2024-11-08'),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ]
}
