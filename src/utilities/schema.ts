import { z } from 'zod';

export const meta = z.object({
	index: z.boolean().optional(),
	route: z.string().optional(),
	slug: z.string().optional(),

	meta: z
		.object({
			title: z.string().optional(),
			description: z.string().optional(),
			layout: z.boolean().optional().default(true),
		})
		.optional(),

	head: z
		.object({
			meta: z.record(z.string(), z.string()).optional().default({}),
			links: z.record(z.string(), z.string()).optional().default({}),
		})
		.optional()
		.default({ meta: {}, links: {} }),

	props: z.record(z.string(), z.string()).optional().default({}),
});

export type MetaSchematic = z.infer<typeof meta>;
