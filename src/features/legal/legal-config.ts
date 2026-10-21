import type { LegalDocumentId } from "./legal-content";
import { getLegalUrl, isWebsiteDocumentReady } from "./legal-links";
export type { LegalDocumentId } from "./legal-content";

// User-supplied HERE pages verified on 2026-10-20; all are pre-launch drafts.
// Leave publication metadata unset until final content and registry versions are approved.
// Full document text belongs to the website, not this mobile manifest.
export const LEGAL_DOCUMENTS = {
  terms: {
    title: "Terms of Service",
    url: getLegalUrl(process.env.EXPO_PUBLIC_LEGAL_TERMS_URL || "https://here-web-azure.vercel.app/terms"),
    version: process.env.EXPO_PUBLIC_LEGAL_TERMS_VERSION?.trim() || null,
    publishedAt: process.env.EXPO_PUBLIC_LEGAL_TERMS_EFFECTIVE_DATE?.trim() || null,
  },
  privacy: {
    title: "Privacy Policy",
    url: getLegalUrl(process.env.EXPO_PUBLIC_LEGAL_PRIVACY_URL || "https://here-web-azure.vercel.app/privacy"),
    version: process.env.EXPO_PUBLIC_LEGAL_PRIVACY_VERSION?.trim() || null,
    publishedAt: process.env.EXPO_PUBLIC_LEGAL_PRIVACY_EFFECTIVE_DATE?.trim() || null,
  },
  community: {
    title: "Community Guidelines",
    url: getLegalUrl(process.env.EXPO_PUBLIC_LEGAL_COMMUNITY_URL || "https://here-web-azure.vercel.app/community-guidelines"),
    version: process.env.EXPO_PUBLIC_LEGAL_COMMUNITY_VERSION?.trim() || null,
    publishedAt: process.env.EXPO_PUBLIC_LEGAL_COMMUNITY_EFFECTIVE_DATE?.trim() || null,
  },
} satisfies Record<LegalDocumentId, { title: string; url: string | null; version: string | null; publishedAt: string | null }>;

export const legalContentReady = Object.values(LEGAL_DOCUMENTS).every(isWebsiteDocumentReady);
export const CURRENT_LEGAL_VERSIONS = {
  terms: LEGAL_DOCUMENTS.terms.version,
  privacy: LEGAL_DOCUMENTS.privacy.version,
  community: LEGAL_DOCUMENTS.community.version,
};
