"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Plus, User, Users, Settings, Key, X } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogFooter,
	DialogDescription,
} from "@/components/ui/dialog";

// TODO Backend: Sostituire con una fetch reale per prendere la lista delle stanze attive dal server.
const INITIAL_ROOMS = [
	{
		id: "1",
		name: "dummyroom",
		color: "#ffd1dc",
		players: 3,
		participants: [
			{ id: "p1", name: "Player 1", wins: 12 },
			{ id: "p2", name: "Player 2", wins: 25 },
			{ id: "p3", name: "Player 3", wins: 5 }
		]
	},
];

export default function RoomsPage() {
	const router = useRouter();
	const [isCreating, setIsCreating] = useState(false);
	const [roomToDelete, setRoomToDelete] = useState<string | null>(null);
	const [rooms, setRooms] = useState<typeof INITIAL_ROOMS>([]);
	const [userProfile, setUserProfile] = useState({ username: "Username", avatarColor: "#ffffff" });

	// Carica stanze da LocalStorage (Mock Backend)
	useEffect(() => {
		const saved = localStorage.getItem('trashydance_rooms');
		if (saved) {
			setRooms(JSON.parse(saved));
		} else {
			setRooms(INITIAL_ROOMS);
			localStorage.setItem('trashydance_rooms', JSON.stringify(INITIAL_ROOMS));
		}

		// Carica profilo utente
		const savedProfile = localStorage.getItem('trashydance_user_profile');
		if (savedProfile) {
			setUserProfile(JSON.parse(savedProfile));
		}
	}, []);

	// Animazione ed entrata in nuova stanza
	const handleCreateRoom = (e: React.MouseEvent) => {
		e.preventDefault();
		setIsCreating(true);
		// Aspetta la fine della transizione prima di reindirizzare alla pagina di creazione stanza
		setTimeout(() => {
			router.push("/rooms/new");
		}, 700);
	};

	return (
		<div className="relative min-h-screen bg-[#b5c7f2] overflow-hidden p-4 sm:p-8 font-sans">
			{/*
        TODO Backend: Rimuovere o far dipendere l'animazione di transizione di pagina.
        Questo cerchio bianco si espande dal bottone per fare la transizione fluida verso la pagina nuova stanza.
      */}
			<div
				className={`fixed bottom-6 right-6 sm:bottom-12 sm:right-12 z-50 w-20 h-20 bg-white rounded-full pointer-events-none transition-transform duration-700 ease-in-out origin-center ${isCreating ? 'scale-[150] opacity-100' : 'scale-0 opacity-0'
					}`}
			/>

			{/*
        TODO Backend: L'avatar e il nome utente devono essere presi dall'attuale sessione utente (Auth)
      */}
			<div className="absolute top-4 left-4 sm:top-8 sm:left-8 z-10">
				<Link href="/settings">
					<div className="flex items-center gap-3 bg-white border-2 border-black text-black rounded-full px-4 py-2 shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-all cursor-pointer group">
						<Avatar className="h-10 w-10 border-2 border-black" style={{ backgroundColor: userProfile.avatarColor }}>
							<AvatarImage src="/avatars/shadcn.jpg" />
							<AvatarFallback className="text-black font-bold" style={{ backgroundColor: userProfile.avatarColor }}>
								{userProfile.username.substring(0, 2).toUpperCase()}
							</AvatarFallback>
						</Avatar>
						<span className="font-bold text-lg tracking-wider uppercase group-hover:text-pink-600 transition-colors">
							{userProfile.username}
						</span>
					</div>
				</Link>
			</div>

			{

			}
			<div className="absolute top-4 right-4 sm:top-8 sm:right-8 z-10">
				<Link href="/settings">
					<button className="flex items-center justify-center w-12 h-12 bg-white border-2 border-black rounded-full shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-all cursor-pointer group">
						<Settings className="w-6 h-6 text-black group-hover:rotate-90 transition-transform duration-300" strokeWidth={2.5} />
					</button>
				</Link>
			</div>

			{/*
        TODO Backend: Iterare sull'array reale restituito dall'API e inserire i Dialog in ciclo
      */}
			<div className="flex flex-col items-center justify-center min-h-[80vh] pt-20">
				<div className="mb-8 bg-white border-4 border-black px-6 py-3 rounded-2xl shadow-[6px_6px_0_0_rgba(0,0,0,1)] relative z-10 font-black text-2xl uppercase tracking-wider text-black">
					Active Clouds: {rooms.length}/6
				</div>
				<div className="flex flex-wrap justify-center gap-8 max-w-4xl relative z-10">
					{rooms.slice(0, 6).map((room) => (
						<div key={room.id} className="relative">
							<button
								onClick={(e) => {
									e.stopPropagation();
									setRoomToDelete(room.id);
								}}
								className="absolute -top-3 -right-3 z-30 w-8 h-8 bg-red-500 border-2 border-black rounded-full flex items-center justify-center shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:bg-red-600 transition-transform hover:scale-110 cursor-pointer"
							>
								<X className="w-5 h-5 text-black" strokeWidth={4} />
							</button>
							<Dialog>
								<DialogTrigger asChild>
									<div
										className="relative border-[3px] border-black rounded-[40px] px-8 py-6 shadow-[8px_8px_0_0_rgba(0,0,0,0.1)] hover:scale-105 transition-transform cursor-pointer flex flex-col items-center justify-center min-w-[200px] group"
										style={{ backgroundColor: room.color || "#ffd1dc" }}
									>
										<h3 className="font-black text-2xl uppercase tracking-widest text-black mb-2">{room.name}</h3>
										<div className="flex gap-2">
											{[...Array(4)].map((_, i) => (
												<div
													key={i}
													className={`w-4 h-4 rounded-full border-2 border-black ${i < room.players ? "bg-black" : "bg-transparent"
														}`}
												/>
											))}
										</div>
									</div>
								</DialogTrigger>

								{/*
                TODO Backend: Gestire le statistiche in tempo reale e mostrare i vari giocatori effettivi.
              */}
								<DialogContent aria-describedby={undefined} className="sm:max-w-2xl bg-[#fdfbf7] p-0 overflow-hidden outline-none" style={{ borderRadius: "1.5rem", border: "4px solid black", boxShadow: "12px 12px 0px 0px rgba(0,0,0,1)" }}>
									<DialogDescription className="sr-only">Room details.</DialogDescription>
									<div className="flex flex-col md:flex-row h-full text-black">

										{/* Sezione SX: Azioni Stanza */}
										<div className="flex-1 p-8 flex flex-col justify-between border-b-4 md:border-b-0 md:border-r-4 border-black">
											<DialogHeader>
												<DialogTitle className="text-4xl font-black uppercase tracking-wider text-black">{room.name}</DialogTitle>
											</DialogHeader>

											<div className="flex-1 flex flex-col justify-center items-center py-8">
												<div className="text-6xl font-black text-pink-500 mb-4 drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">
													{room.players}/4
												</div>
												<p className="text-xl font-bold uppercase text-black">Players</p>
											</div>

											<DialogFooter className="flex gap-4 sm:justify-start">
												{/* TODO Backend: Passare l'ID reale all'href per entrare nella pagina della specifica stanza */}
												<Link href={`/rooms/${room.id}`} className="w-full">
													<Button className="w-full bg-pink-500 text-white border-2 border-black font-bold uppercase py-6 rounded-xl hover:bg-pink-600 shadow-[4px_4px_0_0_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all">
														Enter
													</Button>
												</Link>
											</DialogFooter>
										</div>

										{/* Sezione DX: Statistiche e Partecipanti */}
										<div className="w-full md:w-1/3 bg-[#e8f0fe] p-6 flex flex-col gap-6 border-black">
											<div>
												<h4 className="font-bold uppercase text-lg mb-4 flex items-center gap-2 text-black">
													<Users className="w-5 h-5 text-black" />
													Participants
												</h4>
												<ul className="space-y-3">
													{/*
                          TODO Backend: Iterare la lista "partecipanti" invece del dummy loop
                        */}
													{[...room.participants]
														.sort((a, b) => b.wins - a.wins) // Ordina per vittorie (decrescente)
														.map((participant) => (
															<li key={participant.id} className="flex items-center gap-3 bg-white p-2 rounded-lg border-2 border-black">
																<div className="w-8 h-8 rounded-full bg-yellow-300 border-2 border-black flex items-center justify-center shrink-0">
																	<User className="w-4 h-4 text-black" />
																</div>
																<div className="flex flex-col overflow-hidden">
																	<span className="font-bold text-sm text-black truncate">{participant.name}</span>
																	<span className="text-xs text-black font-semibold text-gray-600">{participant.wins} wins</span>
																</div>
															</li>
														))}
												</ul>
											</div>
										</div>

									</div>
								</DialogContent>
							</Dialog>
						</div>
					))}
				</div>
			</div>
			<div className="absolute bottom-6 right-6 sm:bottom-12 sm:right-12 z-20 flex flex-col items-end gap-4">

				{/* Bottone "Join by Code" tramite Modale */}
				<Dialog>
					<DialogTrigger asChild>
						<button
							className="flex items-center justify-center gap-3 px-6 py-4 bg-[#ffd1dc] border-4 border-black rounded-[2rem] shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-all group cursor-pointer"
						>
							<span className="font-black text-xl text-black uppercase tracking-wider">Join by Code</span>
							<Key className="w-8 h-8 text-black group-hover:scale-110 transition-transform" strokeWidth={3} />
						</button>
					</DialogTrigger>

					{/* Modale Inserimento Codice */}
					<DialogContent aria-describedby={undefined} className="sm:max-w-md bg-[#fdfbf7] p-8 outline-none" style={{ borderRadius: "1.5rem", border: "4px solid black", boxShadow: "12px 12px 0px 0px rgba(0,0,0,1)" }}>
						<DialogDescription className="sr-only">Enter specific room code to join.</DialogDescription>
						<DialogHeader>
							<DialogTitle className="text-3xl font-black uppercase tracking-wider text-black">Join a Cloud</DialogTitle>
						</DialogHeader>
						<div className="flex flex-col gap-4 py-4">
							<p className="text-black font-bold text-lg uppercase">Enter secret code:</p>
							<input
								type="text"
								placeholder="E.g. TRASH-123"
								className="w-full text-2xl font-bold p-4 border-4 border-black rounded-xl outline-none focus:bg-pink-100 transition-colors uppercase text-black placeholder:text-gray-400 text-center tracking-widest"
							// TODO Backend: Salvare il valore nell'input per usarlo nella submit
							/>
						</div>
						<DialogFooter className="flex gap-4">
							<DialogTrigger asChild>
								<Button variant="outline" className="flex-1 border-2 border-black text-black font-bold uppercase py-6 rounded-xl hover:bg-gray-100 text-lg">
									Cancel
								</Button>
							</DialogTrigger>
							{/* TODO Backend: Aggiungere l'evento onClick per verificare il codice via API */}
							<Button className="flex-1 bg-pink-500 text-white border-2 border-black font-bold uppercase py-6 rounded-xl hover:bg-pink-600 shadow-[4px_4px_0_0_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all text-lg">
								Enter
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>

				{/* Bottone "Create New Cloud" */}
				<button
					onClick={handleCreateRoom}
					className="flex items-center justify-center gap-3 px-6 py-4 bg-white border-4 border-black rounded-[2rem] shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-all group cursor-pointer"
				>
					<span className="font-black text-xl text-black uppercase tracking-wider">Create New Cloud</span>
					<Plus className="w-8 h-8 text-black group-hover:scale-110 transition-transform" strokeWidth={3} />
				</button>
			</div>

			{/* Modal di Conferma Eliminazione */}
			<Dialog open={!!roomToDelete} onOpenChange={(open) => !open && setRoomToDelete(null)}>
				<DialogContent aria-describedby={undefined} className="sm:max-w-sm bg-[#fdfbf7] p-8 outline-none" style={{ borderRadius: "1.5rem", border: "4px solid black", boxShadow: "12px 12px 0px 0px rgba(0,0,0,1)" }}>
					<DialogDescription className="sr-only">Confirm deletion.</DialogDescription>
					<DialogHeader>
						<DialogTitle className="text-3xl font-black uppercase tracking-wider text-black">Delete Cloud?</DialogTitle>
					</DialogHeader>
					<div className="py-4">
						<p className="text-black font-bold text-lg uppercase text-center">Are you sure you want to delete this room?</p>
					</div>
					<DialogFooter className="flex gap-4">
						<Button variant="outline" onClick={() => setRoomToDelete(null)} className="flex-1 border-2 border-black text-black font-bold uppercase py-6 rounded-xl hover:bg-gray-100 text-lg">
							Cancel
						</Button>
						<Button onClick={() => {
							// TODO Backend: Implementare l'eliminazione reale tramite API
							if (roomToDelete) {
								const updatedRooms = rooms.filter(r => r.id !== roomToDelete);
								setRooms(updatedRooms);
								localStorage.setItem('trashydance_rooms', JSON.stringify(updatedRooms));
							}
							setRoomToDelete(null);
						}} className="flex-1 bg-red-500 text-white border-2 border-black font-bold uppercase py-6 rounded-xl hover:bg-red-600 shadow-[4px_4px_0_0_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all text-lg">
							Delete
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
