import Link from "next/link";

export default function Page() {
	return (
		<>
			<h1>Rooms list</h1>
			<Link href="/rooms/new">New Room</Link>
			<Link href="/rooms/test">Room &quot;test&quot;</Link>
			<Link href="/users/test">User &quot;test&quot;</Link>
			<Link href="/settings">Settings</Link>
		</>
	);
}
