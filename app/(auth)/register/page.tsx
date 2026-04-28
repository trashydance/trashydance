"use client";

import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";

export default function Page() {
	return (
		<>
			<h1>Register</h1>
			<RegisterForm />
			<Link href="/login">Login</Link>
			<Link href="/rooms">Rooms</Link>
		</>
	);
}
