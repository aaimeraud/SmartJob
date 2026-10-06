import { NextResponse } from "next/server";
import { requireRole } from "@/lib/authorization";

export async function GET(request: Request) {
  const result = await requireRole(request, ["recruiter", "admin"]);

  if ("response" in result) {
    return result.response;
  }

  return NextResponse.json({
    message: "Recruiter area available",
    user: result.user,
  });
}
