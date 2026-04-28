import Link from "next/link";

export default function Page() {
	return (
		<>
			<h1>User profile</h1>
			<Link href="/rooms">Rooms list</Link>
		</>
	);
}
