const fs = require('fs');

const foods = [];
let id = 1;

function food(name, brand, cat, cal, prot, carbs, fat, label, fiber, sugar, satfat, sodium) {
  foods.push({
    id: 'food_' + String(id++).padStart(3, '0'),
    name, brand: brand || null, category: cat,
    serving_size_g: 100, serving_label: label || '100g',
    calories: cal, protein_g: prot, carbs_g: carbs, fat_g: fat,
    fiber_g: fiber || null, sugar_g: sugar || null,
    saturated_fat_g: satfat || null, sodium_mg: sodium || null,
  });
}

// PROTEIN (30)
food('Chicken Breast', null, 'protein', 165, 31, 0, 3.6, '100g', 0, 0, 1, 74);
food('Ground Beef 80/20', null, 'protein', 254, 17, 0, 20, '100g', 0, 0, 8, 75);
food('Turkey Breast', null, 'protein', 135, 30, 0, 1, '100g', 0, 0, 0.3, 70);
food('Pork Tenderloin', null, 'protein', 143, 26, 0, 3.5, '100g', 0, 0, 1.2, 53);
food('Whole Egg', null, 'protein', 155, 13, 1.1, 11, '100g', 0, 1, 3.3, 124);
food('Egg White', null, 'protein', 52, 11, 0.7, 0.2, '100g', 0, 0.7, 0, 166);
food('Tofu Firm', null, 'protein', 76, 8, 1.9, 4.2, '100g', 0.3, 0.9, 0.6, 7);
food('Tempeh', null, 'protein', 193, 19, 9, 11, '100g', 5, 0, 2, 9);
food('Seitan', null, 'protein', 370, 75, 14, 2, '100g', 1, 0, 0, 760);
food('Chicken Thigh', null, 'protein', 209, 26, 0, 11, '100g', 0, 0, 3, 87);
food('Beef Steak Sirloin', null, 'protein', 207, 26, 0, 11, '100g', 0, 0, 4, 66);
food('Pork Chop', null, 'protein', 231, 25, 0, 14, '100g', 0, 0, 5, 68);
food('Beef Liver', null, 'protein', 175, 27, 5, 4.9, '100g', 0, 0, 1.9, 69);
food('Chicken Liver', null, 'protein', 172, 25, 1, 7.5, '100g', 0, 0, 2.5, 71);
food('Bacon', null, 'protein', 541, 37, 1.4, 42, '100g', 0, 0, 14, 1717);
food('Ham', null, 'protein', 145, 21, 1.5, 5.5, '100g', 0, 1, 1.8, 1203);
food('Salami', null, 'protein', 407, 22, 2, 34, '100g', 0, 0, 12, 1740);
food('Beef Jerky', null, 'protein', 410, 33, 7, 26, '100g', 1, 7, 11, 1760);
food('Lamb Leg', null, 'protein', 258, 26, 0, 17, '100g', 0, 0, 7, 72);
food('Duck Breast', null, 'protein', 201, 28, 0, 10, '100g', 0, 0, 3, 74);
food('Venison', null, 'protein', 158, 30, 0, 3.2, '100g', 0, 0, 1.2, 54);
food('Bison Ground', null, 'protein', 146, 26, 0, 4, '100g', 0, 0, 1.5, 70);
food('Pepperoni', null, 'protein', 494, 20, 2, 44, '100g', 0, 0, 16, 1870);
food('Chorizo', null, 'protein', 455, 24, 2, 38, '100g', 0, 0, 14, 1235);
food('Turkey Sausage', null, 'protein', 218, 21, 3, 14, '100g', 0, 2, 4, 880);
food('Canned Tuna in Water', null, 'protein', 116, 26, 0, 1, '100g', 0, 0, 0.3, 370);
food('Canned Chicken', null, 'protein', 140, 25, 2, 3, '100g', 0, 0, 1, 330);
food('Sardines in Oil', null, 'protein', 208, 25, 0, 11, '100g', 0, 0, 1.5, 505);
food('Anchovies', null, 'protein', 210, 29, 0, 10, '100g', 0, 0, 2.2, 3668);
food('Edamame', null, 'protein', 121, 11, 8.6, 5.2, '100g', 5, 2, 0.7, 6);

// GRAIN (26)
food('White Rice Cooked', null, 'grain', 130, 2.7, 28, 0.3, '100g', 0.4, 0, 0.1, 1);
food('Brown Rice Cooked', null, 'grain', 112, 2.3, 23, 0.9, '100g', 1.8, 0, 0.2, 5);
food('Oats Rolled', null, 'grain', 389, 17, 66, 7, '100g', 10, 1, 1.2, 2);
food('Whole Wheat Bread', null, 'grain', 247, 13, 41, 3.4, '1 slice (30g)', 7, 6, 0.5, 400);
food('White Bread', null, 'grain', 265, 9, 49, 3.2, '1 slice (25g)', 3, 5, 0.7, 490);
food('Pasta Cooked', null, 'grain', 131, 5, 25, 1, '100g', 1.8, 0.5, 0.1, 1);
food('Quinoa Cooked', null, 'grain', 120, 4.4, 21, 1.9, '100g', 2.8, 0.9, 0.2, 7);
food('Barley Cooked', null, 'grain', 123, 2.3, 28, 0.4, '100g', 3.8, 0.3, 0.1, 3);
food('Bagel Plain', null, 'grain', 270, 10, 52, 1.6, '1 bagel (105g)', 2.3, 5, 0.3, 480);
food('Granola', null, 'grain', 471, 11, 64, 20, '100g', 6.5, 22, 3, 24);
food('Corn Flakes', 'Kellogg', 'grain', 357, 8, 84, 0.4, '100g', 2.5, 10, 0.1, 715);
food('Wild Rice Cooked', null, 'grain', 101, 4, 21, 0.3, '100g', 1.8, 1.2, 0, 3);
food('Millet Cooked', null, 'grain', 119, 3.5, 23, 1, '100g', 1.3, 0.1, 0.2, 2);
food('Buckwheat Cooked', null, 'grain', 92, 3.4, 20, 0.6, '100g', 2.7, 0.9, 0.1, 4);
food('Rye Bread', null, 'grain', 259, 9, 48, 3.3, '1 slice (32g)', 6, 4, 0.7, 600);
food('Sourdough Bread', null, 'grain', 289, 11, 55, 1.5, '1 slice (35g)', 2.5, 2, 0.3, 540);
food('Crackers Whole Wheat', null, 'grain', 422, 10, 69, 8, '100g', 8, 3, 1.5, 530);
food('Rice Cakes', null, 'grain', 387, 8, 80, 2.8, '100g', 1.5, 0, 0.5, 10);
food('Pita Bread', null, 'grain', 275, 9, 56, 1.2, '1 pita (60g)', 2.2, 1, 0.2, 536);
food('Corn Tortilla', null, 'grain', 218, 6, 46, 2.5, '1 tortilla (30g)', 5.5, 1, 0.3, 11);
food('Flour Tortilla', null, 'grain', 312, 8, 52, 7, '1 tortilla (45g)', 3, 2, 2, 680);
food('English Muffin', null, 'grain', 227, 8, 44, 1.7, '1 muffin (57g)', 2.5, 5, 0.3, 420);
food('Couscous Cooked', null, 'grain', 112, 3.8, 23, 0.2, '100g', 1.4, 0.1, 0, 5);
food('Bulgur Cooked', null, 'grain', 83, 3.1, 19, 0.2, '100g', 4.5, 0.1, 0, 5);
food('Polenta Cooked', null, 'grain', 70, 1.6, 15, 0.4, '100g', 1.4, 0, 0.1, 376);
food('Wheat Germ', null, 'grain', 382, 24, 52, 10, '100g', 13, 7, 1.9, 12);

// FRUIT (28)
food('Apple', null, 'fruit', 52, 0.3, 14, 0.2, '1 medium (182g)', 2.4, 10, 0, 1);
food('Banana', null, 'fruit', 89, 1.1, 23, 0.3, '1 medium (118g)', 2.6, 12, 0.1, 1);
food('Orange', null, 'fruit', 47, 0.9, 12, 0.1, '1 medium (131g)', 2.4, 9, 0, 0);
food('Strawberries', null, 'fruit', 32, 0.7, 7.7, 0.3, '100g', 2, 4.9, 0, 1);
food('Blueberries', null, 'fruit', 57, 0.7, 14, 0.3, '100g', 2.4, 10, 0, 1);
food('Grapes', null, 'fruit', 69, 0.7, 18, 0.2, '100g', 0.9, 15, 0.1, 2);
food('Watermelon', null, 'fruit', 30, 0.6, 8, 0.2, '100g', 0.4, 6, 0, 1);
food('Mango', null, 'fruit', 60, 0.8, 15, 0.4, '100g', 1.6, 14, 0.1, 1);
food('Pineapple', null, 'fruit', 50, 0.5, 13, 0.1, '100g', 1.4, 10, 0, 1);
food('Kiwi', null, 'fruit', 61, 1.1, 15, 0.5, '100g', 3, 9, 0, 3);
food('Peach', null, 'fruit', 39, 0.9, 10, 0.3, '1 medium (150g)', 1.5, 8, 0, 0);
food('Pear', null, 'fruit', 57, 0.4, 15, 0.1, '1 medium (178g)', 3.1, 10, 0, 1);
food('Cherries', null, 'fruit', 63, 1.1, 16, 0.2, '100g', 2.1, 13, 0, 0);
food('Raspberries', null, 'fruit', 52, 1.2, 12, 0.7, '100g', 6.5, 4.4, 0, 1);
food('Blackberries', null, 'fruit', 43, 1.4, 10, 0.5, '100g', 5.3, 4.9, 0, 1);
food('Pomegranate', null, 'fruit', 83, 1.7, 19, 1.2, '100g', 4, 14, 0.1, 3);
food('Avocado', null, 'fruit', 160, 2, 9, 15, '100g', 7, 0.7, 2.1, 7);
food('Grapefruit', null, 'fruit', 42, 0.8, 11, 0.1, '100g', 1.6, 7, 0, 0);
food('Cantaloupe', null, 'fruit', 34, 0.8, 8, 0.2, '100g', 0.9, 8, 0.1, 16);
food('Papaya', null, 'fruit', 43, 0.5, 11, 0.3, '100g', 1.7, 8, 0.1, 8);
food('Plum', null, 'fruit', 46, 0.7, 11, 0.3, '1 medium (66g)', 1.4, 10, 0, 0);
food('Nectarine', null, 'fruit', 44, 1.1, 11, 0.3, '1 medium (136g)', 1.7, 8, 0, 0);
food('Dates', null, 'fruit', 277, 1.8, 75, 0.2, '100g', 6.7, 63, 0, 1);
food('Figs Fresh', null, 'fruit', 74, 0.8, 19, 0.3, '100g', 2.9, 16, 0.1, 1);
food('Apricot', null, 'fruit', 48, 1.4, 11, 0.4, '100g', 2, 9, 0, 1);
food('Coconut Meat', null, 'fruit', 354, 3.3, 15, 33, '100g', 9, 6, 29, 20);
food('Lemon', null, 'fruit', 29, 1.1, 9, 0.3, '1 medium (58g)', 2.8, 2.5, 0, 2);
food('Lime', null, 'fruit', 30, 0.7, 10, 0.2, '1 medium (67g)', 2.8, 1.7, 0, 2);

// VEGETABLE (30)
food('Broccoli', null, 'vegetable', 34, 2.8, 7, 0.4, '100g', 2.6, 1.7, 0.1, 33);
food('Spinach', null, 'vegetable', 23, 2.9, 3.6, 0.4, '100g', 2.2, 0.4, 0.1, 79);
food('Kale', null, 'vegetable', 49, 4.3, 9, 0.9, '100g', 3.6, 2.3, 0.1, 38);
food('Carrots', null, 'vegetable', 41, 0.9, 10, 0.2, '100g', 2.8, 4.7, 0, 69);
food('Sweet Potato', null, 'vegetable', 86, 1.6, 20, 0.1, '100g', 3, 4.2, 0, 55);
food('White Potato', null, 'vegetable', 77, 2, 17, 0.1, '100g', 2.2, 0.8, 0, 6);
food('Tomato', null, 'vegetable', 18, 0.9, 3.9, 0.2, '100g', 1.2, 2.6, 0, 5);
food('Cucumber', null, 'vegetable', 16, 0.7, 3.6, 0.1, '100g', 0.5, 1.7, 0, 2);
food('Bell Pepper Red', null, 'vegetable', 31, 1, 6, 0.3, '100g', 2.1, 4.2, 0, 4);
food('Bell Pepper Green', null, 'vegetable', 20, 0.9, 4.6, 0.2, '100g', 1.7, 2.4, 0, 3);
food('Cauliflower', null, 'vegetable', 25, 1.9, 5, 0.3, '100g', 2, 1.9, 0, 30);
food('Celery', null, 'vegetable', 16, 0.7, 3, 0.2, '100g', 1.6, 1.3, 0, 80);
food('Romaine Lettuce', null, 'vegetable', 17, 1.2, 3.3, 0.3, '100g', 2.1, 1.2, 0, 8);
food('Onion', null, 'vegetable', 40, 1.1, 9, 0.1, '100g', 1.7, 4.2, 0, 4);
food('Garlic', null, 'vegetable', 149, 6.4, 33, 0.5, '100g', 2.1, 1, 0.1, 17);
food('Mushrooms', null, 'vegetable', 22, 3.1, 3.3, 0.3, '100g', 1, 2, 0, 5);
food('Zucchini', null, 'vegetable', 17, 1.2, 3.1, 0.3, '100g', 1, 2.5, 0.1, 8);
food('Eggplant', null, 'vegetable', 25, 1, 5.9, 0.2, '100g', 3, 3.5, 0, 2);
food('Green Beans', null, 'vegetable', 31, 1.8, 7, 0.1, '100g', 3.4, 1.5, 0, 6);
food('Peas', null, 'vegetable', 81, 5.4, 14, 0.4, '100g', 5.7, 6, 0.1, 5);
food('Sweet Corn', null, 'vegetable', 86, 3.3, 19, 1.3, '100g', 2.7, 3.2, 0.2, 15);
food('Asparagus', null, 'vegetable', 20, 2.2, 3.9, 0.1, '100g', 2.1, 1.9, 0, 2);
food('Brussels Sprouts', null, 'vegetable', 43, 3.4, 9, 0.3, '100g', 3.8, 2.2, 0.1, 25);
food('Cabbage', null, 'vegetable', 25, 1.3, 6, 0.1, '100g', 2.5, 3.2, 0, 18);
food('Beet', null, 'vegetable', 43, 1.6, 10, 0.2, '100g', 2.8, 7, 0, 78);
food('Radish', null, 'vegetable', 16, 0.7, 3.4, 0.1, '100g', 1.6, 1.9, 0, 39);
food('Swiss Chard', null, 'vegetable', 19, 1.8, 3.7, 0.2, '100g', 1.6, 1, 0, 213);
food('Bok Choy', null, 'vegetable', 13, 1.5, 2.2, 0.2, '100g', 1, 1.2, 0, 65);
food('Artichoke', null, 'vegetable', 47, 3.3, 11, 0.2, '100g', 5.4, 1, 0, 94);
food('Leek', null, 'vegetable', 61, 1.5, 14, 0.3, '100g', 1.8, 3.9, 0, 20);

// DAIRY (20)
food('Whole Milk', null, 'dairy', 61, 3.2, 4.8, 3.3, '100ml', 0, 5, 2, 43);
food('Skim Milk', null, 'dairy', 34, 3.4, 5, 0.1, '100ml', 0, 5, 0.1, 44);
food('Greek Yogurt Plain', null, 'dairy', 59, 10, 3.6, 0.4, '100g', 0, 3.2, 0.3, 36);
food('Yogurt Plain Low Fat', null, 'dairy', 63, 5.3, 7, 1.6, '100g', 0, 7, 1, 70);
food('Cheddar Cheese', null, 'dairy', 403, 25, 1.3, 33, '100g', 0, 0.5, 21, 621);
food('Mozzarella', null, 'dairy', 280, 28, 2.2, 17, '100g', 0, 1, 11, 627);
food('Parmesan', null, 'dairy', 431, 38, 4, 29, '100g', 0, 0.9, 19, 1529);
food('Cottage Cheese', null, 'dairy', 98, 11, 3.4, 4.3, '100g', 0, 2.7, 1.7, 364);
food('Cream Cheese', null, 'dairy', 342, 6, 4.1, 34, '100g', 0, 3.8, 21, 321);
food('Butter', null, 'dairy', 717, 0.9, 0.1, 81, '100g', 0, 0.1, 51, 714);
food('Heavy Cream', null, 'dairy', 340, 2.8, 2.7, 36, '100ml', 0, 2.7, 23, 38);
food('Sour Cream', null, 'dairy', 198, 2.4, 4.3, 19, '100g', 0, 4, 12, 53);
food('Brie', null, 'dairy', 334, 21, 0.5, 28, '100g', 0, 0.5, 17, 629);
food('Gouda', null, 'dairy', 356, 25, 2.2, 28, '100g', 0, 2.2, 18, 819);
food('Ricotta', null, 'dairy', 174, 11, 3, 13, '100g', 0, 0.3, 8, 84);
food('Whey Protein', null, 'dairy', 370, 74, 8, 3.5, '100g', 0, 8, 2, 200);
food('Ice Cream Vanilla', null, 'dairy', 207, 3.5, 24, 11, '100g', 0.7, 21, 7, 80);
food('Swiss Cheese', null, 'dairy', 380, 27, 5.4, 28, '100g', 0, 1.4, 18, 187);
food('Feta', null, 'dairy', 264, 14, 4, 21, '100g', 0, 4, 15, 1116);
food('Kefir Plain', null, 'dairy', 61, 3.8, 4.6, 3.3, '100ml', 0, 4.6, 2.1, 40);

// SNACK (25)
food('Almonds', null, 'snack', 579, 21, 22, 50, '100g', 12.5, 4.4, 3.8, 1);
food('Walnuts', null, 'snack', 654, 15, 14, 65, '100g', 6.7, 2.6, 6.1, 2);
food('Cashews', null, 'snack', 553, 18, 30, 44, '100g', 3.3, 6, 7.8, 12);
food('Peanuts', null, 'snack', 567, 26, 16, 49, '100g', 8.5, 4, 6.8, 18);
food('Pecans', null, 'snack', 691, 9, 14, 72, '100g', 9.6, 3.9, 6.2, 0);
food('Pistachios', null, 'snack', 562, 20, 28, 45, '100g', 10.3, 7.7, 5.6, 1);
food('Sunflower Seeds', null, 'snack', 584, 21, 20, 51, '100g', 8.6, 2.6, 4.5, 9);
food('Pumpkin Seeds', null, 'snack', 559, 30, 11, 49, '100g', 6, 1.4, 8.7, 7);
food('Potato Chips', null, 'snack', 536, 7, 53, 35, '100g', 4.8, 0.4, 9.5, 525);
food('Popcorn Air Popped', null, 'snack', 375, 11, 74, 4.5, '100g', 14.5, 0.9, 0.5, 8);
food('Dark Chocolate 70%', null, 'snack', 598, 8, 46, 43, '100g', 10.9, 24, 25, 20);
food('Milk Chocolate', null, 'snack', 535, 8, 59, 30, '100g', 3.4, 52, 18, 79);
food('Granola Bar', null, 'snack', 388, 8, 65, 12, '100g', 4, 28, 2.4, 230);
food('Protein Bar', null, 'snack', 380, 30, 42, 10, '100g', 8, 20, 4, 200);
food('Pretzels', null, 'snack', 380, 9, 79, 3, '100g', 3, 3, 0.5, 1030);
food('Trail Mix', null, 'snack', 462, 12, 44, 28, '100g', 5.5, 26, 4, 100);
food('Raisins', null, 'snack', 299, 3.1, 79, 0.5, '100g', 3.7, 59, 0.2, 11);
food('Peanut Butter', null, 'snack', 588, 25, 20, 50, '100g', 6, 9, 10.3, 17);
food('Almond Butter', null, 'snack', 614, 21, 18, 56, '100g', 10.5, 4, 4.2, 8);
food('Nutella', 'Ferrero', 'snack', 539, 6, 58, 31, '100g', 3.4, 57, 10.9, 41);
food('Rice Crackers', null, 'snack', 387, 7, 83, 2, '100g', 1.5, 0, 0.4, 600);
food('Cheese Crackers', null, 'snack', 480, 9, 60, 23, '100g', 2.5, 8, 7, 880);
food('Hummus', null, 'snack', 177, 8, 14, 10, '100g', 6, 0.4, 1.4, 379);
food('Guacamole', null, 'snack', 150, 2, 9, 13, '100g', 6.7, 0.4, 1.9, 194);
food('Dried Mango', null, 'snack', 319, 2.5, 78, 1.2, '100g', 2.4, 66, 0.1, 162);

// BEVERAGE (20)
food('Orange Juice', null, 'beverage', 45, 0.7, 10, 0.2, '100ml', 0.2, 8.4, 0, 1);
food('Apple Juice', null, 'beverage', 46, 0.1, 11, 0.1, '100ml', 0.1, 10, 0, 3);
food('Coffee Black', null, 'beverage', 2, 0.3, 0, 0, '100ml', 0, 0, 0, 2);
food('Green Tea', null, 'beverage', 1, 0, 0.2, 0, '100ml', 0, 0, 0, 1);
food('Black Tea', null, 'beverage', 1, 0, 0.1, 0, '100ml', 0, 0, 0, 3);
food('Cola', null, 'beverage', 41, 0, 11, 0, '100ml', 0, 11, 0, 10);
food('Diet Cola', null, 'beverage', 0, 0, 0, 0, '100ml', 0, 0, 0, 12);
food('Sports Drink', null, 'beverage', 26, 0, 7, 0, '100ml', 0, 6, 0, 20);
food('Coconut Water', null, 'beverage', 19, 0.7, 3.7, 0.2, '100ml', 1.1, 2.6, 0.2, 105);
food('Energy Drink', null, 'beverage', 45, 0.5, 11, 0, '100ml', 0, 11, 0, 75);
food('Beer Regular', null, 'beverage', 43, 0.5, 3.6, 0, '100ml', 0, 0, 0, 4);
food('White Wine', null, 'beverage', 82, 0.1, 2.6, 0, '100ml', 0, 0.6, 0, 5);
food('Red Wine', null, 'beverage', 85, 0.1, 2.6, 0, '100ml', 0, 0.6, 0, 4);
food('Oat Milk', null, 'beverage', 45, 1.3, 6.5, 1.5, '100ml', 0.8, 4, 0.2, 57);
food('Almond Milk', null, 'beverage', 17, 0.6, 0.6, 1.1, '100ml', 0.3, 0.1, 0.1, 67);
food('Soy Milk', null, 'beverage', 54, 3.3, 6.3, 1.8, '100ml', 0.6, 4, 0.3, 51);
food('Lemonade', null, 'beverage', 42, 0.1, 11, 0, '100ml', 0, 11, 0, 3);
food('Protein Shake', null, 'beverage', 70, 14, 4, 1, '100ml', 0.5, 3, 0.5, 80);
food('Smoothie Fruit', null, 'beverage', 65, 1, 15, 0.5, '100ml', 1.5, 12, 0, 20);
food('Kombucha', null, 'beverage', 17, 0.1, 3.6, 0, '100ml', 0, 2.4, 0, 10);

// SEAFOOD (20)
food('Atlantic Salmon', null, 'seafood', 208, 20, 0, 13, '100g', 0, 0, 2, 59);
food('Tuna Yellowfin', null, 'seafood', 109, 24, 0, 1, '100g', 0, 0, 0.2, 45);
food('Shrimp', null, 'seafood', 99, 24, 0.2, 0.3, '100g', 0, 0, 0.1, 111);
food('Tilapia', null, 'seafood', 96, 20, 0, 2, '100g', 0, 0, 0.7, 56);
food('Cod', null, 'seafood', 82, 18, 0, 0.7, '100g', 0, 0, 0.1, 68);
food('Halibut', null, 'seafood', 111, 23, 0, 2.3, '100g', 0, 0, 0.3, 68);
food('Sea Bass', null, 'seafood', 97, 18, 0, 2, '100g', 0, 0, 0.5, 68);
food('Rainbow Trout', null, 'seafood', 150, 22, 0, 6.6, '100g', 0, 0, 1.3, 53);
food('Crab Meat', null, 'seafood', 97, 19, 0, 1.5, '100g', 0, 0, 0.2, 911);
food('Lobster', null, 'seafood', 89, 19, 0.5, 0.9, '100g', 0, 0, 0.2, 296);
food('Scallops', null, 'seafood', 111, 23, 5.4, 0.8, '100g', 0, 0, 0.1, 392);
food('Oysters', null, 'seafood', 68, 7, 3.9, 2.5, '100g', 0, 0, 0.6, 239);
food('Clams', null, 'seafood', 148, 26, 5, 2, '100g', 0, 0, 0.2, 95);
food('Squid', null, 'seafood', 92, 16, 3.1, 1.4, '100g', 0, 0, 0.4, 260);
food('Octopus', null, 'seafood', 164, 30, 4.4, 2.1, '100g', 0, 0, 0.5, 311);
food('Mackerel', null, 'seafood', 205, 19, 0, 14, '100g', 0, 0, 3.3, 90);
food('Herring', null, 'seafood', 217, 20, 0, 15, '100g', 0, 0, 3.4, 90);
food('Swordfish', null, 'seafood', 121, 20, 0, 4, '100g', 0, 0, 1.1, 90);
food('Catfish', null, 'seafood', 95, 16, 0, 2.8, '100g', 0, 0, 0.6, 68);
food('Mahi Mahi', null, 'seafood', 85, 18, 0, 0.7, '100g', 0, 0, 0.2, 88);

// LEGUME (15)
food('Black Beans Cooked', null, 'legume', 132, 8.9, 24, 0.5, '100g', 8.7, 0.3, 0.1, 1);
food('Chickpeas Cooked', null, 'legume', 164, 8.9, 27, 2.6, '100g', 7.6, 4.8, 0.3, 7);
food('Lentils Cooked', null, 'legume', 116, 9, 20, 0.4, '100g', 7.9, 1.8, 0.1, 2);
food('Kidney Beans Cooked', null, 'legume', 127, 8.7, 23, 0.5, '100g', 6.4, 0.3, 0.1, 2);
food('Pinto Beans Cooked', null, 'legume', 143, 9, 26, 0.6, '100g', 9, 0.4, 0.1, 1);
food('Soybeans Cooked', null, 'legume', 173, 17, 10, 9, '100g', 6, 3, 1.3, 1);
food('Green Lentils Cooked', null, 'legume', 116, 9, 20, 0.4, '100g', 7.9, 1.8, 0.1, 2);
food('Split Peas Cooked', null, 'legume', 118, 8.3, 21, 0.4, '100g', 8.1, 2.9, 0.1, 2);
food('Navy Beans Cooked', null, 'legume', 140, 8.2, 25, 0.6, '100g', 10.5, 0.4, 0.1, 0);
food('Lima Beans Cooked', null, 'legume', 115, 7.8, 21, 0.4, '100g', 7, 0.5, 0.1, 3);
food('Cannellini Beans', null, 'legume', 139, 9.7, 25, 0.4, '100g', 6.3, 0.4, 0.1, 0);
food('Mung Beans Cooked', null, 'legume', 105, 7, 19, 0.4, '100g', 7.6, 2, 0.1, 2);
food('Adzuki Beans Cooked', null, 'legume', 128, 7.5, 25, 0.1, '100g', 7.3, 0, 0, 8);
food('Fava Beans Cooked', null, 'legume', 110, 7.6, 20, 0.4, '100g', 5.4, 2.1, 0.1, 5);
food('Lentil Soup Canned', null, 'legume', 71, 4.4, 11, 0.4, '100g', 3.7, 1.9, 0, 394);

// FAT (20)
food('Olive Oil', null, 'fat', 884, 0, 0, 100, '100ml', 0, 0, 13.8, 2);
food('Coconut Oil', null, 'fat', 862, 0, 0, 100, '100ml', 0, 0, 86.5, 0);
food('Canola Oil', null, 'fat', 884, 0, 0, 100, '100ml', 0, 0, 7.4, 0);
food('Avocado Oil', null, 'fat', 884, 0, 0, 100, '100ml', 0, 0, 11.6, 0);
food('Sesame Oil', null, 'fat', 884, 0, 0, 100, '100ml', 0, 0, 14.2, 0);
food('Ghee', null, 'fat', 900, 0, 0, 99, '100g', 0, 0, 61.9, 2);
food('Mayonnaise', null, 'fat', 680, 1, 0.6, 75, '100g', 0, 0.4, 11.8, 635);
food('Ranch Dressing', null, 'fat', 485, 1.5, 5, 50, '100g', 0.2, 2, 7.5, 600);
food('Caesar Dressing', null, 'fat', 470, 4, 4, 50, '100g', 0, 1, 7.5, 800);
food('Ketchup', null, 'fat', 112, 1.6, 27, 0.2, '100g', 0.3, 22, 0, 907);
food('Mustard Yellow', null, 'fat', 60, 4, 6, 3, '100g', 3.3, 0.9, 0.2, 1124);
food('Soy Sauce', null, 'fat', 53, 8.1, 4.9, 0.6, '100ml', 0.3, 0.6, 0.1, 5493);
food('Balsamic Vinegar', null, 'fat', 88, 0.5, 17, 0, '100ml', 0, 14, 0, 23);
food('Tahini', null, 'fat', 595, 17, 21, 54, '100g', 9.3, 0.5, 7.5, 115);
food('Flaxseeds', null, 'fat', 534, 18, 29, 42, '100g', 27, 1.6, 3.7, 30);
food('Chia Seeds', null, 'fat', 486, 17, 42, 31, '100g', 34.4, 0, 3.3, 16);
food('Hemp Seeds', null, 'fat', 553, 32, 9, 49, '100g', 3.9, 1.7, 4.6, 5);
food('Salsa', null, 'fat', 36, 1.5, 8, 0.1, '100g', 1.3, 4.6, 0, 440);
food('Hot Sauce', null, 'fat', 18, 0.9, 3.4, 0.2, '100g', 0.3, 1.1, 0, 2310);
food('Lard', null, 'fat', 902, 0, 0, 100, '100g', 0, 0, 39.2, 0);

fs.mkdirSync('./server', {recursive:true});
fs.writeFileSync('./server/seed-foods.json', JSON.stringify(foods, null, 2));
console.log('Written', foods.length, 'foods');
