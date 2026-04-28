import Link from "next/link";

export default function Page() {
	return (
		<>
			<h1>Register</h1>
			<Link href="/login">Login</Link>
			<Link href="/rooms">Rooms</Link>
		</>
	);
}
