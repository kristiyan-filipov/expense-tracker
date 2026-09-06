import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: expense, error } = await supabase
    .from("expenses")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !expense) {
    return NextResponse.json({ error: "Expense not found" }, { status: 404 });
  }

  return NextResponse.json(expense, { status: 200 });
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const { name, amount } = body || {};

  const updates: Record<string, unknown> = {};

  if (name !== undefined) {
    if (typeof name !== "string" || name.trim() === "") {
      return NextResponse.json(
        { error: "Invalid payload: name must be a non-empty string." },
        { status: 400 }
      );
    }
    updates.name = name.trim();
  }

  if (amount !== undefined) {
    const numericAmount = typeof amount === "number" ? amount : parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return NextResponse.json(
        { error: "Invalid payload: amount must be a positive number." },
        { status: 400 }
      );
    }
    updates.amount = numericAmount;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { error: "Invalid payload: at least one field (name or amount) must be provided." },
      { status: 400 }
    );
  }

  const { data: expense, error } = await supabase
    .from("expenses")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error || !expense) {
    return NextResponse.json({ error: "Expense not found or update failed" }, { status: 404 });
  }

  return NextResponse.json(expense, { status: 200 });
}

export async function PATCH(request: Request, context: RouteParams) {
  return PUT(request, context);
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("expenses")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)
    .select();

  if (error || !data || data.length === 0) {
    return NextResponse.json({ error: "Expense not found or delete failed" }, { status: 404 });
  }

  return NextResponse.json({ success: true, deleted: data[0] }, { status: 200 });
}
