import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { UserAvatar } from "@/components/feature/user-avatar";

describe("UserAvatar", () => {
	it("mostra le iniziali del nome come fallback", () => {
		render(<UserAvatar name="Alice" />);
		expect(screen.getByText("AL")).toBeInTheDocument();
	});

	it("usa lo username quando il nome manca", () => {
		render(<UserAvatar name={null} username="bobby" />);
		expect(screen.getByText("BO")).toBeInTheDocument();
	});

	it("usa '??' quando nome e username mancano", () => {
		render(<UserAvatar name={null} />);
		expect(screen.getByText("??")).toBeInTheDocument();
	});

	it("applica un colore di sfondo deterministico per lo stesso seed", () => {
		const first = render(<UserAvatar name="Alice" />);
		const firstColor = first.getByText("AL").style.backgroundColor;
		first.unmount();

		const second = render(<UserAvatar name="Alice" />);
		const secondColor = second.getByText("AL").style.backgroundColor;

		expect(firstColor).not.toBe("");
		expect(secondColor).toBe(firstColor);
	});

	it("inoltra le classi personalizzate al fallback", () => {
		render(<UserAvatar name="Alice" fallbackClassName="custom-fallback" />);
		expect(screen.getByText("AL")).toHaveClass("custom-fallback");
	});
});
