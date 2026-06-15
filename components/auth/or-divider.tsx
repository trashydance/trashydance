export function OrDivider() {
	return (
		<div className="flex items-center gap-3">
			<div className="h-0.5 flex-1 bg-foreground" />
			<span className="text-xs font-bold uppercase tracking-wide">Or</span>
			<div className="h-0.5 flex-1 bg-foreground" />
		</div>
	);
}
