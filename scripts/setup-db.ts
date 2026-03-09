import seedFoods from '../server/seed-foods.json';
import { assertSupabaseConfigured, supabaseAdmin } from '../src/lib/supabase-server';

async function main() {
  assertSupabaseConfigured();

  console.log('Checking foods table...');
  const { count, error: countError } = await supabaseAdmin
    .from('foods')
    .select('id', { count: 'exact', head: true });

  if (countError) {
    console.error('Failed to query foods table.');
    console.error(
      'Ensure schema has been applied from supabase/schema.sql before running this script.'
    );
    console.error(countError.message);
    process.exit(1);
  }

  if ((count ?? 0) > 0) {
    console.log(`Foods already seeded (${count}). Skipping.`);
    return;
  }

  console.log(`Seeding ${seedFoods.length} foods...`);

  const chunkSize = 500;
  for (let i = 0; i < seedFoods.length; i += chunkSize) {
    const chunk = seedFoods.slice(i, i + chunkSize);
    const foodsTable = (supabaseAdmin as any).from('foods');
    const { error } = await foodsTable.upsert(chunk, {
      onConflict: 'id',
      ignoreDuplicates: false,
    });
    if (error) {
      console.error('Failed while seeding foods chunk:', error.message);
      process.exit(1);
    }
  }

  console.log('Foods seeded.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
