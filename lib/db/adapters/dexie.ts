import Dexie, { type Table } from "dexie";

import { DB_TABLES, PLACEHOLDER_RESOURCES } from "@/lib/db/table-names";
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

const DEXIE_DB_NAME = "mongcount";
const DEXIE_DB_VERSION = 1;

export class MongCountDexie extends Dexie {
  user_preferences!: Table<UserPreferencesRow, string>;
  rest_sessions!: Table<RestSessionRow, string>;
  today_progress!: Table<TodayProgressRow, [string, string]>;

  constructor() {
    super(DEXIE_DB_NAME);

    this.version(DEXIE_DB_VERSION).stores({
      [DB_TABLES.userPreferences]: "user_id, theme, updated_at",
      [DB_TABLES.restSessions]: "id, user_id, started_at, completed, [user_id+started_at]",
      [DB_TABLES.todayProgress]: "[user_id+date], user_id, date",
    });
  }
}

class DexieUserRepository implements UserRepository {
  async getCurrent(): Promise<UserRow | null> {
    return null;
  }
}

class DexieUserPreferencesRepository implements UserPreferencesRepository {
  constructor(private readonly db: MongCountDexie) {}

  async getByUserId(userId: string): Promise<UserPreferencesRow | null> {
    const row = await this.db.user_preferences.get(userId);
    return row ?? null;
  }

  async upsert(preferences: UserPreferencesRow): Promise<void> {
    await this.db.user_preferences.put(preferences);
  }
}

class DexieRestSessionRepository implements RestSessionRepository {
  constructor(private readonly db: MongCountDexie) {}

  async listByUser(userId: string, limit = 50): Promise<RestSessionRow[]> {
    const rows = await this.db.rest_sessions.where("user_id").equals(userId).sortBy("started_at");
    return rows.reverse().slice(0, limit);
  }

  async upsert(session: RestSessionRow): Promise<void> {
    await this.db.rest_sessions.put(session);
  }
}

class DexieTodayProgressRepository implements TodayProgressRepository {
  constructor(private readonly db: MongCountDexie) {}

  async getByUserAndDate(userId: string, date: string): Promise<TodayProgressRow | null> {
    const row = await this.db.today_progress.get([userId, date]);
    return row ?? null;
  }
}

export function createDexieRepositories(db = new MongCountDexie()): CoreDataRepositories {
  void PLACEHOLDER_RESOURCES;

  return {
    users: new DexieUserRepository(),
    preferences: new DexieUserPreferencesRepository(db),
    restSessions: new DexieRestSessionRepository(db),
    todayProgress: new DexieTodayProgressRepository(db),
  };
}
