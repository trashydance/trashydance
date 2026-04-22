import Button from "../components/button";

export default function Home() {
  return (
    <main
      // bg-[url('/sfondo.jpg')] carica l'immagine dalla cartella public
      // bg-cover fa in modo che copra tutto lo schermo senza deformarsi
      // bg-center centra l'immagine
      className="flex min-h-screen items-center justify-center bg-[url('/title.jpg')] bg-cover bg-center"
    >
      <div className="mt-48">
        <Button text="Get in" />
      </div>
    </main>
  );
}