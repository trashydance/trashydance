import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
	title: "Log In",
};

export default function Page() {
	return (
		<div className="w-full max-w-md">
			<LoginForm />
		</div>
	);
}
