import { Platform } from "react-native";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { collectAccountData } from "./settings-service";

/** The system share sheet lets the user choose Files or another destination. */
export async function downloadAccountData() {
  const data = await collectAccountData();
  const content = JSON.stringify(data, null, 2);
  const name = `here-account-data-${new Date().toISOString().slice(0, 10)}.json`;
  if (Platform.OS === "web") {
    const url = URL.createObjectURL(new Blob([content], { type: "application/json" }));
    try {
      const link = document.createElement("a");
      link.href = url; link.download = name; link.click();
    } finally { setTimeout(() => URL.revokeObjectURL(url), 1000); }
    return;
  }
  if (!(await Sharing.isAvailableAsync())) throw new Error("File sharing unavailable");
  const file = new File(Paths.cache, name);
  try {
    file.create({ overwrite: true });
    file.write(content);
    await Sharing.shareAsync(file.uri, { mimeType: "application/json", UTI: "public.json" });
  } finally {
    if (file.exists) file.delete();
  }
}
