export type Task = {
  id?: number | null;
  user_id: number;
  status_id: number;
  title: string;
  description: string;
  worked_hours?: string;
  started_at?: Date | null;
  finished_at?: Date | null;
  created_at?: Date | null;
  status?: TaskStatus | null;
  user?: User | null;
  isStarted: boolean;
  isFinished: boolean;
}

export type Credentials = {
  email: string;
  password: string;
}

export type User = {
  id: number;
  name: string;
  email: string;
}

export type TaskStatus = {
  id: number;
  name: string;
  slug_name: string;
}

export type ResponseContext = {
  status: 'success' | 'failure' | null;
  setStatus: React.Dispatch<React.SetStateAction<"success" | "failure" | null>>;
}

