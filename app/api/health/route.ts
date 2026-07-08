import { NextResponse } from "next/server";
import db from "@/lib/db";
import { user } from "@/schema";

export const dynamic = "force-dynamic";

export async function GET() {
	try {
		// Verify database connection is alive
		db.select({ id: user.id }).from(user).limit(1).get();
		return NextResponse.json({
			status: "healthy",
			database: "connected",
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		return NextResponse.json(
			{
				status: "unhealthy",
				database: "disconnected",
				error: error instanceof Error ? error.message : String(error),
				timestamp: new Date().toISOString(),
			},
			{ status: 500 },
		);
	}
}
