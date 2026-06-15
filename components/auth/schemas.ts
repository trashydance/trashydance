import { z } from "zod";
import {
	registerSchema as baseRegisterSchema,
	loginSchema,
} from "@/lib/validation/schemas";

export { loginSchema };

/** Registration form: base rules plus the confirm-password client field. */
export const registerSchema = baseRegisterSchema
	.extend({
		confirmPassword: z.string().min(1, "Please confirm your password"),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ["confirmPassword"],
	});

export type LoginFormInput = z.infer<typeof loginSchema>;
export type RegisterFormInput = z.infer<typeof registerSchema>;
