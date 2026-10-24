import { z } from 'zod';

export const getEmployeeSchema = (isEditing: boolean) =>
    z.object({
        empId: z.string().optional(),
        name: z.string().min(1, "Name is required"),
        email: z.string().email("Please enter a valid email address"),
        password: z
            .string()
            .optional()
            .refine(
                (val) => {
                    if (isEditing) {
                        return !val || val.length >= 6;
                    }
                    return !!val && val.length >= 6;
                },
                {
                    message: isEditing
                        ? "Password must be at least 6 characters"
                        : "Password is required (min 6 characters)",
                }
            ),
        roleId: z.string().min(1, "Role is required"),
        departmentId: z.string().min(1, "Department is required"),
        status: z.string().default("ACTIVE"),
        logo: z.any().optional(),
        dob: z.preprocess(
            (val) => (val === null || val === undefined ? "" : String(val)),
            z.string().min(1, "Date of Birth is required")
        ),
        gender: z.string().min(1, "Gender is required"),
        fatherName: z.string().optional(),
        motherName: z.string().optional(),
        panCard: z.string().optional(),
        dateOfJoining: z.preprocess(
            (val) => (val === null || val === undefined ? "" : String(val)),
            z.string().min(1, "Date of Joining is required")
        ),
        aadharNumber: z.string().optional(),
        aadharFront: z.any().optional(),
        aadharBack: z.any().optional(),
        address: z
            .object({
                line1: z.string().optional(),
                country: z.string().optional(),
                state: z.string().optional(),
                city: z.string().optional(),
                zip: z.string().optional(),
            })
            .optional(),
    });

export const employeeSchema = getEmployeeSchema(false);
export type EmployeeSchema = z.infer<typeof employeeSchema>;
