import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
	title: "Sign Up",
};

export default function Page() {
	return (
		<div className="w-full max-w-md">
			<RegisterForm />
		</div>
	);
}
