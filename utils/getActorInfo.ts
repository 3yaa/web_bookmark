export type CastMember = {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
};

export type ActorWork = {
  id: number;
  title: string;
  poster_path: string | null;
  media_type: string;
  popularity: number;
  date: string;
};

import type { AuthFetch } from "@/app/auth/hooks/useAuthFetch";

export async function fetchShowCast(
  tmdbId: number,
  authFetch: AuthFetch,
): Promise<CastMember[]> {
  const res = await authFetch(`/api/show-cast?tmdbId=${tmdbId}`);
  const data = await res.json();
  return data.cast;
}

export async function fetchMovieCast(
  tmdbId: number,
  authFetch: AuthFetch,
): Promise<CastMember[]> {
  const res = await authFetch(`/api/movie-cast?tmdbId=${tmdbId}`);
  const data = await res.json();
  return data.cast;
}

export async function fetchActorWorks(
  actorId: number,
  authFetch: AuthFetch,
): Promise<ActorWork[]> {
  const res = await authFetch(`/api/actor-works?actorId=${actorId}`);
  const data = await res.json();
  return data.works;
}
