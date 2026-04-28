import Link from "next/link";

export default function Page() {
	return (
		<>
			<h1>Rooms list</h1>
			<Link href="new">New Room</Link>
			<Link href="test">Room &quot;test&quot;</Link>
			<Link href="test">User &quot;test&quot;</Link>
			<Link href="/settings">Settings</Link>
		</>
	);
}
