"use client";

import Link from "next/link";
import { AppIcon } from "@/components/icons/app-icon";
import { Button } from "@/components/ui/button";
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel,
	FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function LoginForm({
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<form>
				<FieldGroup>
					<div className="flex flex-col items-center gap-2 text-center">
						<Link
							href="/"
							className="flex flex-col items-center gap-2 font-medium"
						>
							<div className="flex size-8 items-center justify-center rounded-md">
								<AppIcon className="size-6" />
							</div>
							<span className="sr-only">ChatSimulator</span>
						</Link>
						<h1 className="text-xl font-bold">Sign in to ChatSimulator</h1>
						<FieldDescription>
							Don&apos;t have an account? <Link href="/register">Sign up</Link>
						</FieldDescription>
					</div>
					<Field>
						<FieldLabel htmlFor="email">Email</FieldLabel>
						<Input
							id="email"
							type="email"
							placeholder="m@example.com"
							required
						/>
					</Field>
					<Field>
						<Button asChild>
							<Link href="/rooms">Login</Link>
						</Button>
					</Field>
					<FieldSeparator>Or</FieldSeparator>
					<OAuthButton />
				</FieldGroup>
			</form>
			<FieldDescription className="px-6 text-center">
				By clicking continue, you agree to our{" "}
				<Link href="/terms">Terms of Service</Link> and{" "}
				<Link href="/privacy">Privacy Policy</Link>.
			</FieldDescription>
		</div>
	);
}
