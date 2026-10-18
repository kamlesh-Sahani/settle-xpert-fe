import { z } from 'zod';

export const roleDetailSchema = z.object({
    name: z.string().min(1, "Role Name is required"),
    description: z.string().optional(),
    status: z.boolean().optional(),
});

export type RoleDetailFormValues = z.infer<typeof roleDetailSchema>;

// Keep roleSchema for compatibility if imported elsewhere
export const roleSchema = roleDetailSchema;
export type RoleFormValues = RoleDetailFormValues;

