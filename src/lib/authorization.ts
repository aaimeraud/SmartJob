import { auth } from "@/lib/auth";
import { roleSchema, type UserRole } from "@/lib/auth-schema";
import { NextResponse } from "next/server";

type AuthenticatedUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

type AuthorizationResult =
  | { user: AuthenticatedUser }
  | { response: NextResponse };

export function isRoleAllowed(role: UserRole, allowedRoles: UserRole[]) {
  return allowedRoles.includes(role);
}

export async function requireRole(
  request: Request,
  allowedRoles: UserRole[],
): Promise<AuthorizationResult> {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return {
      response: NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      ),
    };
  }

  const parsedRole = roleSchema.safeParse(session.user.role);

  if (!parsedRole.success) {
    throw new Error("Invalid user role stored in database");
  }

  if (!isRoleAllowed(parsedRole.data, allowedRoles)) {
    return {
      response: NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 },
      ),
    };
  }

  return {
    user: {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      role: parsedRole.data,
    },
  };
}
