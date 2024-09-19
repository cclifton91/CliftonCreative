
import { defineCollection, z } from 'astro:content';


const projects = defineCollection({
  type: 'content',
  schema: ({ image }) => 
    z.object({
        title: z.string(),
        description: z.string().max(165, {
        message: "Description cannot be longer than 165 characters",
        }),
        thumbnail: image().refine((img) => img.width >= 1000, {
        message: "Image must be 1000px wide or more",
        }),
        isDraft: z.boolean().optional(),
  }),
});


export const collections = {
    projects,
};