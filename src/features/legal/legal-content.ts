export type LegalDocumentId = "terms" | "privacy" | "community";

export type LegalDocument = {
  id: LegalDocumentId;
  title: string;
  shortTitle: string;
  summary: string;
  version: string | null;
  publishedAt: string | null;
  status: "draft" | "published";
  sections: Array<{ heading: string; body: string }>;
};

/**
 * Legal language is product-owned content. Keep a document unpublished until
 * approved copy and a real version are supplied.
 */
export const LEGAL_DOCUMENTS: Record<LegalDocumentId, LegalDocument> = {
  terms: {
    id: "terms",
    title: "Terms of Service",
    shortTitle: "Terms",
    summary: "The rules for using Left and participating in the community.",
    version: null,
    publishedAt: null,
    status: "draft",
    sections: [],
  },
  privacy: {
    id: "privacy",
    title: "Privacy Policy",
    shortTitle: "Privacy",
    summary: "How Left uses account, location, venue, presence, and notification data.",
    version: "2026-08-28",
    publishedAt: "28 August 2026",
    status: "draft",
    sections: [
      {
        heading: "Overview",
        body:
          "This draft explains how Left collects, uses, discloses, retains, and deletes personal data. Left currently operates in Finland and is intended only for people aged 18 or older. The controller and contact details still need to be completed before publication.",
      },
      {
        heading: "Location and presence",
        body:
          "With permission, Left may access precise location, approximate location, background location, and—where supported—significant location changes or Bluetooth/beacon signals. This supports nearby venue detection, temporary venue presence, approximate distance, safety zones, visibility controls, and ending stale presence. Precise coordinates are not ordinarily shown to other users and are not used for third-party behavioural advertising.",
      },
      {
        heading: "Account and product data",
        body:
          "Left may receive account information from Google, including name, email address, authentication identifiers, and technical authentication information. Left may also process venue associations, visibility settings, notification preferences, saved venues, safety-zone configuration, venue interactions, and other settings you intentionally select.",
      },
      {
        heading: "How Left uses data",
        body:
          "Left uses data to provide authentication, venue discovery, social discovery, temporary presence, privacy controls, safety features, security and fraud prevention, legal compliance, and reliability improvements. Left is not designed to provide a permanent user-facing history of another person’s movements.",
      },
      {
        heading: "Legal bases",
        body:
          "Where the GDPR applies, the draft identifies contract, consent, legitimate interests, legal obligation, and—rarely—vital interests as possible legal bases. Operating-system permission and GDPR consent requirements may be related but are not necessarily identical. Consent may be withdrawn where consent is the applicable basis.",
      },
      {
        heading: "Who may receive information",
        body:
          "Depending on settings and current features, other users may see limited identity information, a venue, approximate area or distance, presence status, or visibility-related information. Left may use Google for sign-in and venue content, BestTime for venue activity information, and infrastructure, database, networking, and mobile-platform providers as needed to operate the service.",
      },
      {
        heading: "Retention and deletion",
        body:
          "Presence sessions are generally retained for up to 24 hours. Raw precise location should be retained only for the minimum period reasonably necessary for the relevant functionality. You may request account deletion from Settings. Some information may remain where required by law, security, fraud prevention, abuse prevention, legal claims, or protected backups.",
      },
      {
        heading: "Your rights",
        body:
          "Subject to applicable requirements and exceptions, you may have rights to access, rectify, erase, restrict, port, or object to certain processing, and to withdraw consent where applicable. The draft identifies the Office of the Data Protection Ombudsman as the relevant Finnish supervisory authority.",
      },
      {
        heading: "Adults, security, and changes",
        body:
          "Left is intended only for adults aged 18 or older. Left describes technical and organisational security measures but cannot guarantee absolute security. The policy should be updated when functionality, processing, providers, law, or platform requirements materially change.",
      },
    ],
  },
  community: {
    id: "community",
    title: "Community Guidelines",
    shortTitle: "Guidelines",
    summary: "The standards for respectful, safe participation in Left.",
    version: null,
    publishedAt: null,
    status: "draft",
    sections: [],
  },
};

export function isLegalDocumentPublished(document: LegalDocument) {
  return (
    document.status === "published" &&
    !!document.version &&
    !!document.publishedAt &&
    document.sections.length > 0
  );
}

export const legalContentReady = Object.values(LEGAL_DOCUMENTS).every(isLegalDocumentPublished);

export const CURRENT_LEGAL_VERSIONS = {
  terms: LEGAL_DOCUMENTS.terms.version,
  privacy: LEGAL_DOCUMENTS.privacy.version,
  community: LEGAL_DOCUMENTS.community.version,
} as const;
