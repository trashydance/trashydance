import Link from "next/link";

export default function Page() {
	return (
		<>
			<h1>New room</h1>
			<Link href="/rooms/test">Rooms list</Link>
		</>
	);
}
