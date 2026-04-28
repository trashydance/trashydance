import Link from "next/link";

export default function Page() {
	return (
		<>
			<h1>Room &quot;test&quot;</h1>
			<Link href="/rooms/test/stats">Room stats</Link>
			<Link href="/rooms/test/settings">Room settings</Link>
			<Link href="/rooms">Rooms list</Link>
		</>
	);
}
