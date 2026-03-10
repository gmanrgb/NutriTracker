import { z } from 'zod';

export const RegisterSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_-]+$/, 'Username must be alphanumeric'),
  password: z.string().min(8),
});

export const LoginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const DiaryEntrySchema = z.object({
  food_id: z.string().min(1),
  food_source: z.enum(['catalog', 'custom']),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  meal_slot: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  serving_qty: z.number().positive().max(20),
});

export const DiaryEntryUpdateSchema = z.object({
  serving_qty: z.number().positive().max(20),
});

export const GoalsSchema = z.object({
  calories: z.number().positive(),
  protein_g: z.number().nonnegative(),
  carbs_g: z.number().nonnegative(),
  fat_g: z.number().nonnegative(),
});

export const CustomFoodSchema = z.object({
  name: z.string().min(1).max(200),
  brand: z.string().max(100).optional(),
  serving_size_g: z.number().positive(),
  serving_label: z.string().min(1).max(50),
  calories: z.number().nonnegative(),
  protein_g: z.number().nonnegative(),
  carbs_g: z.number().nonnegative(),
  fat_g: z.number().nonnegative(),
  fiber_g: z.number().nonnegative().optional(),
  sugar_g: z.number().nonnegative().optional(),
  saturated_fat_g: z.number().nonnegative().optional(),
  sodium_mg: z.number().nonnegative().optional(),
});

export const SettingSchema = z.object({
  key: z.string().min(1).max(50),
  value: z.string().max(1000),
});

export const PasswordChangeSchema = z.object({
  current_password: z.string().min(1),
  new_password: z.string().min(8),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type DiaryEntryInput = z.infer<typeof DiaryEntrySchema>;
export type DiaryEntryUpdateInput = z.infer<typeof DiaryEntryUpdateSchema>;
export type GoalsInput = z.infer<typeof GoalsSchema>;
export type CustomFoodInput = z.infer<typeof CustomFoodSchema>;
export type SettingInput = z.infer<typeof SettingSchema>;
export type PasswordChangeInput = z.infer<typeof PasswordChangeSchema>;
