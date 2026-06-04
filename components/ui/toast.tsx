"use client";

import {
	type ReactNode,
	createContext,
	useCallback,
	useContext,
	useState,
} from "react";
import { cn } from "@/lib/utils";

type ToastVariant = "success" | "error" | "info";

interface Toast {
	id: string;
	message: string;
	variant: ToastVariant;
}

interface ToastContextValue {
	toast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
	const context = useContext(ToastContext);
	if (!context) {
		throw new Error("useToast must be used within a ToastProvider");
	}
	return context;
}

const variantClasses: Record<ToastVariant, string> = {
	success:
		"bg-primary text-primary-foreground border-border",
	error:
		"bg-destructive text-white border-border",
	info: "bg-primary text-primary-foreground border-border",
};

function ToastItem({
	toast: t,
	onDismiss,
}: {
	toast: Toast;
	onDismiss: (id: string) => void;
}) {
	return (
		<div
			role="alert"
			className={cn(
				"pointer-events-auto flex items-center gap-2 rounded-md border-4 px-4 py-3 text-sm font-medium shadow-[4px_4px_0px_0px] shadow-border animate-in slide-in-from-right-full fade-in duration-200",
				variantClasses[t.variant],
			)}
		>
			<span className="flex-1">{t.message}</span>
			<button
				type="button"
				onClick={() => onDismiss(t.id)}
				className="shrink-0 opacity-70 hover:opacity-100"
				aria-label="Dismiss"
			>
				x
			</button>
		</div>
	);
}

export function ToastProvider({ children }: { children: ReactNode }) {
	const [toasts, setToasts] = useState<Toast[]>([]);

	const dismiss = useCallback((id: string) => {
		setToasts((prev) => prev.filter((t) => t.id !== id));
	}, []);

	const toast = useCallback(
		(message: string, variant: ToastVariant = "info") => {
			const id = crypto.randomUUID();
			setToasts((prev) => [...prev, { id, message, variant }]);
			setTimeout(() => dismiss(id), 5000);
		},
		[dismiss],
	);

	return (
		<ToastContext value={{ toast }}>
			{children}
			<div className="fixed right-4 bottom-4 z-50 flex flex-col gap-2 pointer-events-none">
				{toasts.map((t) => (
					<ToastItem key={t.id} toast={t} onDismiss={dismiss} />
				))}
			</div>
		</ToastContext>
	);
}
