import * as z from "zod";

export const departmentSchema = z.object({
    name: z.string().min(1, "Department name is required"),
    code: z
        .string()
        .min(1, "Department code is required")
        .max(20, "Code must be at most 20 characters")
        .regex(/^[A-Za-z0-9_-]+$/, "Code must contain only letters, numbers, hyphens, or underscores"),
    description: z.string().optional(),
    status: z.enum(["ACTIVE", "IN_ACTIVE"]),
});

export type DepartmentSchema = z.infer<typeof departmentSchema>;
