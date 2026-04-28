import Link from "next/link";

export default function Page() {
	return (
		<>
			<h1>Room &quot;test&quot;</h1>
			<Link href="stats">Room stats</Link>
			<Link href="settings">Room settings</Link>
			<Link href="..">Rooms list</Link>
		</>
	);
}
