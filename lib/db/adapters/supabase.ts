import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/types";
import { SUPABASE_TABLES, SUPABASE_VIEWS } from "@/lib/supabase/tables";
import type {
  CoreDataRepositories,
  RestSessionRepository,
  TodayProgressRepository,
  UserPreferencesRepository,
  UserRepository,
} from "@/lib/db/repositories";
import type {
  RestSessionRow,
  TodayProgressRow,
  UserPreferencesRow,
  UserRow,
} from "@/lib/db/types";

export type AppSupabaseClient = SupabaseClient<Database>;

class SupabaseUserRepository implements UserRepository {
  constructor(private readonly client: AppSupabaseClient) {}

  async getCurrent(): Promise<UserRow | null> {
    const {
      data: { user },
      error,
    } = await this.client.auth.getUser();

    if (error || !user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email ?? null,
      display_name: user.user_metadata.display_name ?? user.user_metadata.name ?? null,
      provider: (user.app_metadata.provider ?? "local_only") as UserRow["provider"],
      created_at: user.created_at,
    };
  }
}

class SupabaseUserPreferencesRepository implements UserPreferencesRepository {
  constructor(private readonly client: AppSupabaseClient) {}

  async getByUserId(userId: string): Promise<UserPreferencesRow | null> {
    const { data, error } = await this.client
      .from(SUPABASE_TABLES.userPreferences)
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data as UserPreferencesRow | null;
  }

  async upsert(preferences: UserPreferencesRow): Promise<void> {
    const { notification_slot_config: _, ...remoteSafe } = preferences;
    const { error } = await this.client.from(SUPABASE_TABLES.userPreferences).upsert(remoteSafe);

    if (error) {
      throw error;
    }
  }
}

class SupabaseRestSessionRepository implements RestSessionRepository {
  constructor(private readonly client: AppSupabaseClient) {}

  async listByUser(userId: string, limit = 50): Promise<RestSessionRow[]> {
    const { data, error } = await this.client
      .from(SUPABASE_TABLES.restSessions)
      .select("*")
      .eq("user_id", userId)
      .order("started_at", { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return (data ?? []) as RestSessionRow[];
  }

  async upsert(session: RestSessionRow): Promise<void> {
    const { error } = await this.client.from(SUPABASE_TABLES.restSessions).upsert(session);

    if (error) {
      throw error;
    }
  }
}

class SupabaseTodayProgressRepository implements TodayProgressRepository {
  constructor(private readonly client: AppSupabaseClient) {}

  async getByUserAndDate(userId: string, date: string): Promise<TodayProgressRow | null> {
    const { data, error } = await this.client
      .from(SUPABASE_VIEWS.todayProgress)
      .select("*")
      .eq("user_id", userId)
      .eq("date", date)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data as TodayProgressRow | null;
  }
}

export function createSupabaseRepositories(client: AppSupabaseClient): CoreDataRepositories {
  return {
    users: new SupabaseUserRepository(client),
    preferences: new SupabaseUserPreferencesRepository(client),
    restSessions: new SupabaseRestSessionRepository(client),
    todayProgress: new SupabaseTodayProgressRepository(client),
  };
}
