import { supabase } from "./supabase";

export async function generateUserId(
  uf: string,
  tipoConta: number,
): Promise<string> {
  const anoMes =
    new Date().toISOString().slice(2, 4) + new Date().toISOString().slice(5, 7);

  try {
    // Begin transaction
    const { data: existingRecord, error: selectError } = await supabase
      .from("user_id_control")
      .select("next_id")
      .eq("uf", uf)
      .eq("ano_mes", anoMes)
      .eq("tipo_conta", tipoConta)
      .single();

    if (selectError && selectError.code !== "PGRST116") {
      console.error("Error checking for existing ID record:", selectError);
      throw selectError;
    }

    let nextId: number;

    if (existingRecord) {
      nextId = existingRecord.next_id;

      // Update the next_id
      const { error: updateError } = await supabase
        .from("user_id_control")
        .update({ next_id: nextId + 1 })
        .eq("uf", uf)
        .eq("ano_mes", anoMes)
        .eq("tipo_conta", tipoConta);

      if (updateError) {
        console.error("Error updating next_id:", updateError);
        throw updateError;
      }
    } else {
      nextId = 1;

      // Insert new record
      const { error: insertError } = await supabase
        .from("user_id_control")
        .insert({
          uf,
          ano_mes: anoMes,
          tipo_conta: tipoConta,
          next_id: nextId + 1,
        });

      if (insertError) {
        console.error("Error inserting new ID record:", insertError);
        throw insertError;
      }
    }

    // Format the user ID
    const userId = `${uf}${anoMes}${tipoConta}${nextId.toString().padStart(6, "0")}`;
    return userId;
  } catch (error) {
    console.error("Error generating user ID:", error);
    throw error;
  }
}
