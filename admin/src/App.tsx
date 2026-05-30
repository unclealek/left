import { useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import type { Venue, VenueSubmission } from "./types";

function getGeofenceCenter(geofence: Record<string, unknown>) {
  const center = geofence.center as { latitude?: unknown; longitude?: unknown } | undefined;
  const latitude = typeof center?.latitude === "number" ? center.latitude : null;
  const longitude = typeof center?.longitude === "number" ? center.longitude : null;
  return { latitude, longitude };
}

function distanceMeters(aLat: number, aLng: number, bLat: number, bLng: number) {
  const earthRadius = 6371000;
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const dLat = toRadians(bLat - aLat);
  const dLng = toRadians(bLng - aLng);
  const lat1 = toRadians(aLat);
  const lat2 = toRadians(bLat);
  const haversine =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * earthRadius * Math.asin(Math.sqrt(haversine));
}

function formatVenueType(value: string) {
  return value.replaceAll("_", " ");
}

export function App() {
  const [authInitialized, setAuthInitialized] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [isReviewer, setIsReviewer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submissions, setSubmissions] = useState<VenueSubmission[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);

  const configSummary = `${import.meta.env.VITE_SUPABASE_URL ? "URL set" : "URL missing"} · ${import.meta.env.VITE_SUPABASE_ANON_KEY ? "Anon key set" : "Anon key missing"}`;

  useEffect(() => {
    void bootstrap();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setAuthInitialized(true);
      setSession(nextSession);
      if (nextSession) {
        void loadReviewerData(nextSession);
      } else {
        setIsReviewer(false);
        setSubmissions([]);
        setVenues([]);
        setSelectedSubmissionId(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const selectedSubmission =
    submissions.find((submission) => submission.id === selectedSubmissionId) ?? submissions[0] ?? null;

  const nearbyCanonicalVenues = useMemo(() => {
    if (!selectedSubmission) return [];
    const center = getGeofenceCenter(selectedSubmission.proposed_geofence_json);
    if (center.latitude == null || center.longitude == null) return [];
    const submissionLatitude = center.latitude;
    const submissionLongitude = center.longitude;

    return venues
      .map((venue) => {
        const venueCenter = getGeofenceCenter(venue.geofence_json);
        if (venueCenter.latitude == null || venueCenter.longitude == null) return null;
        return {
          venue,
          distance: distanceMeters(
            submissionLatitude,
            submissionLongitude,
            venueCenter.latitude,
            venueCenter.longitude,
          ),
        };
      })
      .filter((entry): entry is { venue: Venue; distance: number } => !!entry)
      .filter((entry) => entry.distance <= 150)
      .sort((a, b) => a.distance - b.distance);
  }, [selectedSubmission, venues]);

  async function bootstrap() {
    try {
      const {
        data: { session: nextSession },
      } = await supabase.auth.getSession();
      setSession(nextSession);
      if (nextSession) {
        await loadReviewerData(nextSession);
        return;
      }
      setLoading(false);
    } finally {
      setAuthInitialized(true);
    }
  }

  async function loadReviewerData(activeSession: Session) {
    setLoading(true);
    setError(null);

    const { data: reviewerData, error: reviewerError } = await supabase.rpc("is_admin_reviewer", {
      check_user_id: activeSession.user.id,
    });
    if (reviewerError) {
      setLoading(false);
      setError("Could not verify reviewer access.");
      return;
    }

    const reviewer = !!reviewerData;
    setIsReviewer(reviewer);
    if (!reviewer) {
      setLoading(false);
      return;
    }

    const [{ data: submissionRows, error: submissionError }, { data: venueRows, error: venueError }] =
      await Promise.all([
        supabase
          .from("venue_submissions")
          .select(
            "id, submitted_by, name, type, address_text, notes, proposed_geofence_json, status, matched_venue_id, created_at, updated_at",
          )
          .eq("status", "pending")
          .order("created_at", { ascending: false }),
        supabase
          .from("venues")
          .select("id, name, type, city, geofence_json, is_active, created_at, updated_at")
          .eq("is_active", true)
          .order("created_at", { ascending: false })
          .limit(300),
      ]);

    if (submissionError || venueError) {
      setLoading(false);
      setError("Could not load venue moderation data.");
      return;
    }

    const nextSubmissions = (submissionRows ?? []) as VenueSubmission[];
    setSubmissions(nextSubmissions);
    setVenues((venueRows ?? []) as Venue[]);
    setSelectedSubmissionId((current) =>
      current && nextSubmissions.some((submission) => submission.id === current)
        ? current
        : (nextSubmissions[0]?.id ?? null),
    );
    setLoading(false);
  }

  async function signInWithPassword() {
    setError(null);
    setSaving(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setSaving(false);
    if (signInError) {
      const message = signInError.message.toLowerCase().includes("invalid api key")
        ? "Invalid API key. Check admin/.env and make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY match the same Supabase project as the admin user."
        : signInError.message;
      setError(message);
    }
  }

  function handleSignInSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void signInWithPassword();
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  async function refresh() {
    if (!session) return;
    await loadReviewerData(session);
  }

  async function approveAsNew(submissionId: string) {
    await moderate(submissionId, null, false);
  }

  async function markDuplicate(submissionId: string, venueId: string) {
    await moderate(submissionId, venueId, false);
  }

  async function reject(submissionId: string) {
    await moderate(submissionId, null, true);
  }

  async function moderate(submissionId: string, venueId: string | null, rejectSubmission: boolean) {
    setSaving(true);
    setError(null);

    const result = rejectSubmission
      ? await supabase.rpc("reject_venue_submission", { submission_id: submissionId })
      : await supabase.rpc("approve_venue_submission", {
          submission_id: submissionId,
          matched_venue_id: venueId,
        });

    if (result.error) {
      setSaving(false);
      setError(result.error.message);
      return;
    }

    setSaving(false);
    await refresh();
  }

  return (
    <div className="shell">
      <div className="hero">
        <div>
          <p className="eyebrow">Left Admin</p>
          <h1>Venue moderation console</h1>
          <p className="lede">
            Review pending venue submissions, merge duplicates, and promote approved venues into the canonical shared map.
          </p>
        </div>
        {session ? (
          <button className="ghost-button" onClick={signOut}>
            Sign out
          </button>
        ) : null}
      </div>

      {!authInitialized ? (
        <div className="panel">
          <p>Restoring admin session…</p>
        </div>
      ) : !session ? (
        <div className="panel auth-panel">
          <h2>Reviewer sign-in</h2>
          <p>Use your admin email and password to access venue moderation.</p>
          <form className="auth-form" onSubmit={handleSignInSubmit}>
            <label className="field">
              <span className="detail-label">Email</span>
              <input
                className="text-input"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@left.app"
                autoComplete="email"
              />
            </label>
            <label className="field">
              <span className="detail-label">Password</span>
              <div className="password-field">
                <input
                  className="text-input password-input"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "◉" : "◌"}
                </button>
              </div>
            </label>
            <button className="primary-button" type="submit" disabled={saving}>
              {saving ? "Signing in…" : "Sign in"}
            </button>
          </form>
          <p className="config-hint">Admin env: {configSummary}</p>
        </div>
      ) : loading ? (
        <div className="panel">
          <p>Loading venue moderation data…</p>
        </div>
      ) : !isReviewer ? (
        <div className="panel">
          <h2>Reviewer access required</h2>
          <p>Your account is signed in, but it is not listed in <code>public.admin_reviewers</code>.</p>
        </div>
      ) : (
        <div className="admin-grid">
          <section className="panel">
            <div className="section-header">
              <div>
                <p className="section-label">Pending submissions</p>
                <h2>{submissions.length} waiting</h2>
              </div>
              <button className="ghost-button" onClick={refresh} disabled={saving}>
                Refresh
              </button>
            </div>

            <div className="submission-list">
              {submissions.length === 0 ? <p>No pending venue submissions.</p> : null}
              {submissions.map((submission) => (
                <button
                  key={submission.id}
                  className={`submission-card ${selectedSubmission?.id === submission.id ? "selected" : ""}`}
                  onClick={() => setSelectedSubmissionId(submission.id)}
                >
                  <span className="submission-name">{submission.name}</span>
                  <span className="submission-meta">{formatVenueType(submission.type)}</span>
                  <span className="submission-meta">{new Date(submission.created_at).toLocaleString()}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="panel">
            {selectedSubmission ? (
              <>
                <p className="section-label">Submission detail</p>
                <h2>{selectedSubmission.name}</h2>
                <div className="detail-grid">
                  <div>
                    <span className="detail-label">Type</span>
                    <span>{formatVenueType(selectedSubmission.type)}</span>
                  </div>
                  <div>
                    <span className="detail-label">Address</span>
                    <span>{selectedSubmission.address_text}</span>
                  </div>
                  <div>
                    <span className="detail-label">Notes</span>
                    <span>{selectedSubmission.notes || "No notes provided."}</span>
                  </div>
                  <div>
                    <span className="detail-label">Submitted by</span>
                    <span>{selectedSubmission.submitted_by}</span>
                  </div>
                </div>
                <div className="button-row">
                  <button className="primary-button" onClick={() => approveAsNew(selectedSubmission.id)} disabled={saving}>
                    {saving ? "Saving…" : "Approve as new venue"}
                  </button>
                  <button className="ghost-button danger" onClick={() => reject(selectedSubmission.id)} disabled={saving}>
                    Reject
                  </button>
                </div>
              </>
            ) : (
              <p>Select a submission to review.</p>
            )}
          </section>

          <section className="panel">
            <p className="section-label">Nearby canonical venues</p>
            <h2>Duplicate review</h2>
            <div className="candidate-list">
              {nearbyCanonicalVenues.length === 0 ? <p>No nearby canonical venues found.</p> : null}
              {nearbyCanonicalVenues.map(({ venue, distance }) => (
                <div key={venue.id} className="candidate-card">
                  <div>
                    <strong>{venue.name}</strong>
                    <p>
                      {formatVenueType(venue.type)} · {Math.round(distance)}m
                    </p>
                  </div>
                  {selectedSubmission ? (
                    <button
                      className="ghost-button"
                      onClick={() => markDuplicate(selectedSubmission.id, venue.id)}
                      disabled={saving}
                    >
                      Mark duplicate
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {error ? <div className="error-banner">{error}</div> : null}
    </div>
  );
}
