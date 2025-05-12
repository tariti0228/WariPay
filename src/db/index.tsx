import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';
import { DATABASE_NAME } from '@/app/_layout';

const expo = openDatabaseSync(DATABASE_NAME, { enableChangeListener: true });
const db = drizzle(expo);

export default db;