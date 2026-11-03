import { z } from 'zod';

export const workingHoursSchema = z.object({
    enabled: z.boolean().optional(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    days: z.array(z.union([z.number(), z.string()])).optional(),
}).optional();

export const roleDetailSchema = z.object({
    name: z.string().min(1, "Role Name is required"),
    description: z.string().optional(),
    status: z.boolean().optional(),
    workingHours: workingHoursSchema,
});

export type RoleDetailFormValues = z.infer<typeof roleDetailSchema>;

// Keep roleSchema for compatibility if imported elsewhere
export const roleSchema = roleDetailSchema;
export type RoleFormValues = RoleDetailFormValues;

