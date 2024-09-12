// 1. Import utilities from `astro:content`
import { defineCollection, z } from 'astro:content';

// 2. Define a `type` and `schema` for each collection
const projects = defineCollection({
  type: 'content', // v2.5.0 and later
  schema: ({ image }) => 
    z.object({
        title: z.string(),
        description: z.string(),
        url: z.string().url(),
        thumbnail: image(),
  }),
});

// 3. Export a single `collections` object to register your collection(s)
export const collections = {
    projects,
};