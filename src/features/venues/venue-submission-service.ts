import { supabase } from "../../lib/supabase";
import type { VenueType } from "../../types/left-domain";
import * as ImageManipulator from "expo-image-manipulator";

const COMMUNITY_PHOTO_BUCKET = "community-venue-photos";

export async function createCommunityVenue(input: {
  submittedBy: string;
  name: string;
  type: VenueType;
  addressText: string;
  notes: string | null;
  latitude: number;
  longitude: number;
  showContributor: boolean;
  photoUri?: string | null;
}) {
  let photoPath: string | null = null;
  let completed = false;
  try {
    if (input.photoUri) {
      // Re-encoding also removes original camera metadata before this public upload.
      const preparedPhoto = await ImageManipulator.manipulateAsync(input.photoUri, [], {
        compress: 0.8,
        format: ImageManipulator.SaveFormat.JPEG,
      });
      photoPath = `${input.submittedBy}/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
      const photoResponse = await fetch(preparedPhoto.uri);
      const photoData = await photoResponse.arrayBuffer();
      const { error: uploadError } = await supabase.storage
        .from(COMMUNITY_PHOTO_BUCKET)
        .upload(photoPath, photoData, {
          contentType: "image/jpeg",
          upsert: false,
        });
      if (uploadError) return null;
    }

    const { data, error } = await supabase.rpc("create_community_venue", {
      p_name: input.name,
      p_type: input.type,
      p_address_text: input.addressText,
      p_notes: input.notes,
      p_latitude: input.latitude,
      p_longitude: input.longitude,
      p_show_contributor: input.showContributor,
      p_photo_path: photoPath,
    });
    const venue = Array.isArray(data) ? data[0] : data;
    if (error || !venue) return null;

    completed = Boolean(venue.created) || !photoPath;

    return {
      id: venue.venue_id as string,
      name: venue.venue_name as string,
      created: Boolean(venue.created),
      photoPath,
    };
  } catch {
    return null;
  } finally {
    if (photoPath && !completed) {
      await supabase.storage.from(COMMUNITY_PHOTO_BUCKET).remove([photoPath]);
    }
  }
}
