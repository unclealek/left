// @ts-nocheck

export async function getLeftPresenceCounts(supabaseAdmin: any, venueIds: string[]) {
  if (!venueIds.length) return new Map();

  const { data, error } = await supabaseAdmin.rpc("get_left_presence_counts", {
    p_venue_ids: venueIds,
  });

  if (error) throw error;

  return new Map(
    (data ?? []).map((row: any) => [
      row.venue_id,
      {
        total: row.total ?? 0,
        visible: row.visible ?? 0,
        openToMeet: row.open_to_meet ?? 0,
      },
    ]),
  );
}
