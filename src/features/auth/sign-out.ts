export async function signOutSafely(steps: {
  endPresence: () => Promise<boolean>;
  signOut: () => Promise<{ error: unknown }>;
  clearLocal: () => void | Promise<void>;
}) {
  if (!await steps.endPresence()) throw new Error("Could not confirm visibility ended. Please retry while online.");
  const { error } = await steps.signOut();
  if (error) throw error;
  await steps.clearLocal();
}
