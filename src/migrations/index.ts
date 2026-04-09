import * as migration_20260408_081548_init_db from './20260408_081548_init_db';
import * as migration_20260409_172905_add_global_settings from './20260409_172905_add_global_settings';

export const migrations = [
  {
    up: migration_20260408_081548_init_db.up,
    down: migration_20260408_081548_init_db.down,
    name: '20260408_081548_init_db',
  },
  {
    up: migration_20260409_172905_add_global_settings.up,
    down: migration_20260409_172905_add_global_settings.down,
    name: '20260409_172905_add_global_settings'
  },
];
