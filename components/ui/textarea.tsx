import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({
	className,
	...props
}: React.ComponentProps<"textarea">) {
	const textareaRef = React.useRef<HTMLTextAreaElement>(null);

	const handleInput = React.useCallback(() => {
		const el = textareaRef.current;
		if (el) {
			el.style.height = "auto";
			el.style.height = `${el.scrollHeight}px`;
		}
	}, []);

	return (
		<textarea
			ref={textareaRef}
			data-slot="textarea"
			className={cn(
				"w-full min-w-0 resize-none rounded-base border-4 border-border bg-secondary-background px-3 py-2 text-base shadow-[4px_4px_0px_0px] shadow-border transition-all outline-none placeholder:text-muted-foreground focus-visible:shadow-[2px_2px_0px_0px] focus-visible:shadow-border focus-visible:translate-x-[2px] focus-visible:translate-y-[2px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
				className,
			)}
			onInput={handleInput}
			{...props}
		/>
	);
}

export { Textarea };
