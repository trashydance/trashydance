import { LogOutIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function SignoutButton() {
	const router = useRouter();
	const [isSigningOut, setIsSigningOut] = useState(false);

	async function handleSignOut() {
		try {
			setIsSigningOut(true);
			await authClient.signOut({
				fetchOptions: {
					onSuccess: () => {
						router.push("/login");
					},
				},
			});
		} catch (error) {
			console.error("Sign out error:", error);
			setIsSigningOut(false);
		}
	}

	return (
		<button
			type="button"
			onClick={handleSignOut}
			disabled={isSigningOut}
			className="flex gap-4 items-center bg-rose-600 border-4 border-black px-8 py-4 font-black uppercase tracking-wider rounded-2xl shadow-[4px_4px_0_0_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none hover:bg-rose-700 transition-all text-xl mt-2"
		>
			<LogOutIcon />
			{isSigningOut ? "Signing out..." : "Log out"}
		</button>
	);
}
