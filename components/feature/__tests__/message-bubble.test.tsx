import { fireEvent, render, screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";
import { MessageBubble } from "@/components/feature/message-bubble";

// next/image richiede l'ottimizzatore di Next: in test basta un <img> semplice.
vi.mock("next/image", () => ({
	default: (props: ComponentProps<"img">) => {
		// biome-ignore lint/performance/noImgElement: mock di next/image nei test
		// biome-ignore lint/a11y/useAltText: l'alt arriva dalle props del componente
		return <img {...props} />;
	},
}));

const baseProps = {
	body: "Ciao!",
	createdAt: "2026-06-04T10:00:00.000Z",
	isSelf: false,
};

describe("MessageBubble", () => {
	it("renderizza il testo del messaggio", () => {
		render(<MessageBubble {...baseProps} />);
		expect(screen.getByText("Ciao!")).toBeInTheDocument();
	});

	it("mostra le iniziali del partner quando non è un proprio messaggio", () => {
		render(<MessageBubble {...baseProps} partnerName="Marco" />);
		expect(screen.getByText("MA")).toBeInTheDocument();
	});

	it("mostra l'immagine del partner quando disponibile", () => {
		render(
			<MessageBubble
				{...baseProps}
				partnerName="Marco"
				partnerImage="/avatar.png"
			/>,
		);
		expect(screen.getByAltText("Marco")).toBeInTheDocument();
		expect(screen.queryByText("MA")).not.toBeInTheDocument();
	});

	it("non mostra l'avatar per i propri messaggi", () => {
		render(<MessageBubble {...baseProps} isSelf partnerName="Marco" />);
		expect(screen.queryByText("MA")).not.toBeInTheDocument();
	});

	it("mostra lo stato 'Sent' per i propri messaggi inviati", () => {
		render(<MessageBubble {...baseProps} isSelf status="sent" />);
		expect(screen.getByText("Sent")).toBeInTheDocument();
	});

	it("non mostra lo stato per i messaggi del partner", () => {
		render(<MessageBubble {...baseProps} status="sent" />);
		expect(screen.queryByText("Sent")).not.toBeInTheDocument();
	});

	it("in caso di errore mostra Retry e invoca onRetry al click", () => {
		const onRetry = vi.fn();
		render(
			<MessageBubble {...baseProps} isSelf status="error" onRetry={onRetry} />,
		);

		const retryButton = screen.getByRole("button", {
			name: "Retry sending message",
		});
		fireEvent.click(retryButton);
		expect(onRetry).toHaveBeenCalledTimes(1);
	});

	it("renderizza l'anteprima per gli allegati immagine", () => {
		render(
			<MessageBubble
				{...baseProps}
				fileName="foto.png"
				fileUrl="/api/uploads/conv-1/foto.png"
				fileType="image/png"
				fileSize={2048}
			/>,
		);
		expect(screen.getByAltText("foto.png")).toBeInTheDocument();
	});

	it("renderizza un player per gli allegati video", () => {
		const { container } = render(
			<MessageBubble
				{...baseProps}
				fileName="clip.mp4"
				fileUrl="/api/uploads/conv-1/clip.mp4"
				fileType="video/mp4"
				fileSize={4096}
			/>,
		);
		expect(container.querySelector("video")).not.toBeNull();
	});

	it("renderizza un link di download con nome e dimensione per i documenti", () => {
		render(
			<MessageBubble
				{...baseProps}
				fileName="report.pdf"
				fileUrl="/api/uploads/conv-1/report.pdf"
				fileType="application/pdf"
				fileSize={2048}
			/>,
		);

		const link = screen.getByRole("link");
		expect(link).toHaveAttribute("href", "/api/uploads/conv-1/report.pdf");
		expect(link).toHaveAttribute("download", "report.pdf");
		expect(screen.getByText("report.pdf")).toBeInTheDocument();
		expect(screen.getByText("2.0 KB")).toBeInTheDocument();
	});
});
