import { defineCollection, z } from "astro:content"
import { glob } from "astro/loaders"

const projects = defineCollection({
    loader: glob({ pattern: "src/content/projects/**/*.md" }),
    schema: z.object ({
        slug: z.string(), 
        title: z.string(),
        description: z.string(), 
      }),
    });

export const collections = {
    projects,
}

