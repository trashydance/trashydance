import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";

export default function Page() {
	return (
		<>
			<h1>Login</h1>
			<LoginForm />
			<Link href="/register">Register</Link>
			<Link href="/rooms">Rooms</Link>
		</>
	);
}
