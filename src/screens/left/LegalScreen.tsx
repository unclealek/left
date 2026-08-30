import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { T, styles } from "../../app/leftTheme";
import { LeftIcon } from "../../components/icons";
import {
  isLegalDocumentPublished,
  LEGAL_DOCUMENTS,
  type LegalDocumentId,
} from "../../features/legal/legal-content";

export function LegalScreen({
  documentId,
  onBack,
}: {
  documentId: LegalDocumentId;
  onBack: () => void;
}) {
  const insets = useSafeAreaInsets();
  const document = LEGAL_DOCUMENTS[documentId];
  const published = isLegalDocumentPublished(document);

  return (
    <View style={[styles.legalPage, { paddingTop: Math.max(18, insets.top + 8) }]}>
      <View style={styles.legalHeader}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={onBack}
          style={({ pressed }) => [styles.legalBackButton, pressed && styles.onboardingPressed]}
        >
          <LeftIcon name="arrow-left" size={21} color={T.textPrimary} />
        </Pressable>
        <Text style={styles.legalHeaderTitle}>{document.shortTitle}</Text>
        <View style={styles.legalHeaderSpacer} />
      </View>

      <View style={[styles.legalScrollContent, { paddingBottom: 28 + insets.bottom }]}>
        <Text style={styles.legalEyebrow}>LEFT LEGAL</Text>
        <Text accessibilityRole="header" style={styles.legalTitle}>
          {document.title}
        </Text>
        {document.version && document.publishedAt ? (
          <Text style={styles.legalMeta}>
            Version {document.version} · Effective {document.publishedAt} ·{" "}
            {published ? "Published" : "Draft"}
          </Text>
        ) : null}
        {published ? (
          <>
            {document.sections.map((section) => (
              <View key={section.heading} style={styles.legalSection}>
                <Text style={styles.legalSectionTitle}>{section.heading}</Text>
                <Text style={styles.legalBody}>{section.body}</Text>
              </View>
            ))}
          </>
        ) : (
          <>
            {document.sections.length > 0 ? (
              <View style={styles.legalDraftNotice}>
                <Text style={styles.legalDraftNoticeTitle}>Draft — not yet available for acceptance</Text>
                <Text style={styles.legalBody}>
                  This document is shown for review only. Replace the remaining placeholders and approve it before
                  publishing or asking users to accept it.
                </Text>
              </View>
            ) : null}
            <View accessibilityRole="alert" style={styles.legalPendingCard}>
              <View style={styles.legalPendingIcon}>
                <LeftIcon name="file-text" size={22} color={T.onboardingInk} />
              </View>
              <View style={styles.legalPendingCopy}>
                <Text style={styles.legalPendingTitle}>Approved content not published</Text>
                <Text style={styles.legalBody}>
                  {document.sections.length > 0
                    ? `The ${document.title.toLowerCase()} draft is available above, but it has not been approved.`
                    : `This build does not contain approved ${document.title.toLowerCase()} language yet.`}{" "}
                  Left will not ask you to accept a policy that has not been supplied.
                </Text>
              </View>
            </View>
            {document.sections.map((section) => (
              <View key={section.heading} style={styles.legalSection}>
                <Text style={styles.legalSectionTitle}>{section.heading}</Text>
                <Text style={styles.legalBody}>{section.body}</Text>
              </View>
            ))}
          </>
        )}
      </View>
    </View>
  );
}
