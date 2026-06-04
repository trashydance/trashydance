import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAvatarColor, getInitials } from "@/lib/utils";

interface UserAvatarProps {
	name: string | null;
	username?: string | null;
	image?: string | null;
	className?: string;
	fallbackClassName?: string;
}

/**
 * Avatar utente con fallback colorato deterministico e iniziali.
 * Il seed di colore/iniziali/alt è il displayName = name || username || "?".
 * I call site che vogliono un seed specifico (es. solo username) lo passano
 * direttamente nella prop `name`.
 */
export function UserAvatar({
	name,
	username,
	image,
	className,
	fallbackClassName,
}: UserAvatarProps) {
	const displayName = name || username || "?";

	return (
		<Avatar className={className}>
			{image && <AvatarImage src={image} alt={displayName} />}
			<AvatarFallback
				className={fallbackClassName}
				style={{ backgroundColor: getAvatarColor(displayName) }}
			>
				{getInitials(displayName)}
			</AvatarFallback>
		</Avatar>
	);
}
