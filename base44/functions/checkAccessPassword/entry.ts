import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const password = body?.password;

    if (!password || typeof password !== "string") {
      return Response.json({ valid: false }, { status: 400 });
    }

    const accessPassword = Deno.env.get("ACCESS_PASSWORD");
    if (!accessPassword) {
      return Response.json({ valid: false, error: "ACCESS_PASSWORD env var is not set" });
    }
    const valid = password.trim() === accessPassword.trim();

    return Response.json({ valid });
  } catch (error) {
    return Response.json({ valid: false, error: error.message }, { status: 500 });
  }
});