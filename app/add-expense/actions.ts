"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function addExpense(formData: FormData) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const name = formData.get("name") as string;
  const amountStr = formData.get("amount") as string;
  const amount = parseFloat(amountStr);

  if (!name || isNaN(amount) || amount <= 0) {
    redirect("/add-expense?error=Invalid input. Please provide a valid name and amount.");
  }

  const { error } = await supabase.from("expenses").insert({
    user_id: user.id,
    name,
    amount,
  });

  if (error) {
    console.error("Error inserting expense:", error);
    redirect("/add-expense?error=Failed to add expense. Please try again.");
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
