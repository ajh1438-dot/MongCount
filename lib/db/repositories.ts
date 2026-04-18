import type {
  RestSessionRow,
  TodayProgressRow,
  UserPreferencesRow,
  UserRow,
} from "@/lib/db/types";

export interface UserRepository {
  getCurrent(): Promise<UserRow | null>;
}

export interface UserPreferencesRepository {
  getByUserId(userId: string): Promise<UserPreferencesRow | null>;
  upsert(preferences: UserPreferencesRow): Promise<void>;
}

export interface RestSessionRepository {
  listByUser(userId: string, limit?: number): Promise<RestSessionRow[]>;
  upsert(session: RestSessionRow): Promise<void>;
}

export interface TodayProgressRepository {
  getByUserAndDate(userId: string, date: string): Promise<TodayProgressRow | null>;
}

export interface CoreDataRepositories {
  users: UserRepository;
  preferences: UserPreferencesRepository;
  restSessions: RestSessionRepository;
  todayProgress: TodayProgressRepository;
}
