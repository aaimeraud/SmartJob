import { NextResponse } from "next/server";
import { requireRole } from "@/lib/authorization";

export async function GET(request: Request) {
  const result = await requireRole(request, ["candidate", "recruiter", "admin"]);

  if ("response" in result) {
    return result.response;
  }

  return NextResponse.json({ user: result.user });
}
