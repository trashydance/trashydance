import Link from "next/link";

export default function Page() {
	return (
		<>
			<h1>Login</h1>
			<Link href="/register">Register</Link>
			<Link href="/rooms">Rooms</Link>
		</>
	);
}
