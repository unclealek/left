import { useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { T, styles } from "../../app/leftTheme";
import { useTranslation } from "../preferences/use-translation";
import { HELP_TOPICS } from "./help-content";

export function HelpCenter({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState<string | null>(null);
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: T.surfaceCard, paddingTop: 24 }}>
        <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 20, gap: 12 }}>
          <Text accessibilityRole="header" style={[styles.settingsGroupTitle, { flex: 1 }]}>{t("Help Center")}</Text>
          <Pressable accessibilityRole="button" onPress={onClose} style={{ minHeight: 44, minWidth: 60, justifyContent: "center" }}>
            <Text style={styles.settingsMenuLabel}>{t("Done")}</Text>
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 48, gap: 18 }}>
          <Text style={styles.settingsInfoBody}>{t("A little guidance for your next moment HERE.")}</Text>
          {HELP_TOPICS.map(topic => {
            const open = expanded === topic.question;
            return <View key={topic.question} style={styles.settingsMenuCard}>
              <Pressable accessibilityRole="button" accessibilityState={{ expanded: open }} onPress={() => setExpanded(open ? null : topic.question)} style={styles.settingsMenuRow}>
                <View style={styles.settingsMenuTextBlock}>
                  <Text style={styles.settingsMenuHelper}>{t(topic.category)}</Text>
                  <Text style={styles.settingsMenuLabel}>{t(topic.question)}</Text>
                </View>
                <Text style={styles.settingsMenuValue}>{open ? "−" : "+"}</Text>
              </Pressable>
              {open ? <Text selectable style={[styles.settingsInfoBody, { padding: 18 }]}>{t(topic.answer)}</Text> : null}
            </View>;
          })}
        </ScrollView>
      </View>
    </Modal>
  );
}
