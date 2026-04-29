"use client";

import { IntraIcon } from "@/components/icons/42-intra";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";

export function OAuthButton() {
	return (
		<Field>
			<Button variant="outline" type="button" className="w-full">
				<IntraIcon />
				Continue with 42 Intra
			</Button>
		</Field>
	);
}
