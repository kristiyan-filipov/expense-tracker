"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function updateExpense(formData: FormData) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const amountStr = formData.get("amount") as string;
  const amount = parseFloat(amountStr);

  if (!id || !name || isNaN(amount) || amount <= 0) {
    redirect(`/edit-expense/${id}?error=Invalid input. Please provide a valid name and amount.`);
  }

  const { error } = await supabase
    .from("expenses")
    .update({ name, amount })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error updating expense:", error);
    redirect(`/edit-expense/${id}?error=Failed to update expense. Please try again.`);
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
