import { NextResponse } from "next/server";
import { runEndpointCheck } from "@/lib/runner";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await runEndpointCheck(id);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in check route:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
