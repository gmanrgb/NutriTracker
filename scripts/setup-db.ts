import { db } from '../src/lib/db';
import { runMigrations } from '../src/lib/migrate';
import seedFoods from '../server/seed-foods.json';

async function main() {
  console.log('Running migrations...');
  await runMigrations();
  console.log('Tables created.');

  const existing = await db.execute('SELECT COUNT(*) as c FROM foods');
  const count = existing.rows[0]?.c as number;

  if (count > 0) {
    console.log(`Foods already seeded (${count} rows). Skipping.`);
  } else {
    console.log(`Seeding ${seedFoods.length} foods...`);
    for (const food of seedFoods) {
      await db.execute({
        sql: `INSERT OR IGNORE INTO foods
                (id, name, brand, category, serving_size_g, serving_label,
                 calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g,
                 saturated_fat_g, sodium_mg)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          food.id, food.name, food.brand ?? null, food.category,
          food.serving_size_g, food.serving_label,
          food.calories, food.protein_g, food.carbs_g, food.fat_g,
          food.fiber_g ?? null, food.sugar_g ?? null,
          food.saturated_fat_g ?? null, food.sodium_mg ?? null,
        ],
      });
    }

    await db.execute("INSERT INTO foods_fts(foods_fts) VALUES('rebuild')");
    console.log(`Seeded ${seedFoods.length} foods. FTS5 rebuilt.`);
  }

  await db.close();
  console.log('Done!');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
