"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel,
	FieldSeparator,
} from "@/components/ui/field";
import { AppIcon } from "@/components/icons/app-icon";
import { Input } from "@/components/ui/input";
import Link from "next/link";

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
					<Field>
						<Button variant="outline" type="button" className="w-full">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 42 42">
								<path
									d="M4 28.69h12.593V35h6.284V23.597h-12.57L22.876 11h-6.284L4 23.597v5.093zm21.589-11.384L31.876 11h-6.287v6.306zm6.287 0l-6.287 6.291v6.287h6.287v-6.287l6.306-6.29V11h-6.306v6.306zM38.182 23.597l-6.306 6.287h6.306v-6.287z"
									fill="currentColor"
								/>
							</svg>
							Continue with 42 Intra
						</Button>
					</Field>
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
