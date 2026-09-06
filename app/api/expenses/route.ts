import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: expenses, error } = await supabase
    .from("expenses")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(expenses || [], { status: 200 });
}

export async function POST(request: Request) {
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

  const numericAmount = typeof amount === "number" ? amount : parseFloat(amount);

  if (
    !name ||
    typeof name !== "string" ||
    name.trim() === "" ||
    isNaN(numericAmount) ||
    numericAmount <= 0
  ) {
    return NextResponse.json(
      { error: "Invalid payload: name and a positive numeric amount are required." },
      { status: 400 }
    );
  }

  const { data: expense, error } = await supabase
    .from("expenses")
    .insert({
      user_id: user.id,
      name: name.trim(),
      amount: numericAmount,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(expense, { status: 201 });
}
