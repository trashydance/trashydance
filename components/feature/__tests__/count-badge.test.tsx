import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CountBadge } from "@/components/feature/count-badge";

describe("CountBadge", () => {
	it("renderizza il contenuto", () => {
		render(<CountBadge>42</CountBadge>);
		expect(screen.getByText("42")).toBeInTheDocument();
	});

	it("usa la variante neutral di default", () => {
		render(<CountBadge>7</CountBadge>);
		expect(screen.getByText("7")).toHaveClass("bg-foreground");
	});

	it("applica la variante accent quando richiesta", () => {
		render(<CountBadge variant="accent">9</CountBadge>);
		expect(screen.getByText("9")).toHaveClass("bg-accent");
	});

	it("unisce le classi personalizzate", () => {
		render(<CountBadge className="extra-class">3</CountBadge>);
		expect(screen.getByText("3")).toHaveClass("extra-class");
	});
});
