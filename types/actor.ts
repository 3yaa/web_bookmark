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
