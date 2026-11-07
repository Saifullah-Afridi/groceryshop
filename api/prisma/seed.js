import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// The six Rakan categories. Run with: npm run db:seed (safe to run again).
const categories = [
  { id: "vegetables", name: "Vegetables", description: "Daily harvest from Houran plains and Jordan Valley", icon: "Carrot", color: "#6f7d1f", tint: "#d9ecd9" },
  { id: "fruits", name: "Fruits", description: "Seasonal orchard fruit from Ajloun and Irbid groves", icon: "Apple", color: "#157a66", tint: "#f6dfd3" },
  { id: "meats", name: "Meats", description: "Baladi Naemi lamb, fresh veal, and farm-chilled poultry", icon: "Beef", color: "#7f1717", tint: "#f2d6da" },
  { id: "dairy-cheeses", name: "Dairy & Cheeses", description: "Nabulsi cheese, Jerash labneh, Karak jameed, fresh milk", icon: "Milk", color: "#6b1f6e", tint: "#d8e6f2" },
  { id: "fresh-juices", name: "Fresh Juices", description: "100% cold-pressed daily, zero added sugar", icon: "CupSoda", color: "#10337a", tint: "#f7e6c4" },
  { id: "supermarket", name: "Supermarket", description: "Kafarat olive oil, aged basmati rice, grains, pantry", icon: "Wheat", color: "#6b3d10", tint: "#e6e2cf" },
];

for (const category of categories) {
  await prisma.category.upsert({ where: { id: category.id }, update: {}, create: category });
}
console.log(`Seeded ${categories.length} categories.`);

// The two delivery cities. Change the names and fees any time from the admin dashboard.
const cities = [
  { name: "Irbid", fee: 1.5 },
  { name: "Ramtha", fee: 2 },
];
for (const city of cities) {
  await prisma.city.upsert({ where: { name: city.name }, update: {}, create: city });
}
console.log(`Seeded ${cities.length} delivery cities.`);
// 10 products for each category. Prices are in JOD for 0.25 kg, or for one piece when the unit is "bottle" or "pack".
// Photos are not included. Add them from the admin dashboard. Running the seed again will not create duplicates.
const products = [
  // [category, name, description, price, unit, farm]
  ["vegetables", "Fresh Jordan Valley Tomatoes", "Daily harvested ripe tomatoes, juicy and rich in flavor.", 0.16, "kg", "Northern Jordan Valley Farms"],
  ["vegetables", "Crisp Greenhouse Cucumbers", "First-grade small cucumbers, crunchy and refreshing.", 0.14, "kg", "Houran Plains Greenhouses"],
  ["vegetables", "Cooking & Frying Potatoes", "Clean golden potatoes for crispy fries and hearty cooking.", 0.15, "kg", "Ramtha & Irbid Farms"],
  ["vegetables", "Small Zucchini (Kousa)", "Tender baby zucchini, ideal for classic stuffed dishes.", 0.18, "kg", "Jordan Valley Farms"],
  ["vegetables", "Dark Eggplant for Maqluba", "Firm glossy eggplant that holds its shape when fried.", 0.15, "kg", "Jordan Valley Farms"],
  ["vegetables", "Local Red Dry Onions", "Strong-flavored dry onions for everyday cooking.", 0.1, "kg", "Houran Plains"],
  ["vegetables", "Sweet Crunchy Carrots", "Bright orange carrots, sweet and crisp.", 0.13, "kg", "Houran Farms"],
  ["vegetables", "White Cauliflower", "Dense white heads, wonderful fried or baked with tahini.", 0.19, "kg", "Irbid Farms"],
  ["vegetables", "Colorful Sweet Bell Peppers", "Thick, sweet and juicy peppers in vibrant colors.", 0.28, "kg", "Jordan Valley Greenhouses"],
  ["vegetables", "Local Garlic", "Fragrant local garlic with a strong, fresh flavor.", 0.45, "kg", "Houran Plains"],

  ["fruits", "Sweet Mountain Apples", "Crisp, juicy apples from the Ajloun mountains.", 0.24, "kg", "Ajloun Orchards"],
  ["fruits", "Jordan Valley Bananas", "Naturally sweet bananas from the Jordan Valley.", 0.2, "kg", "Jordan Valley Farms"],
  ["fruits", "Local Strawberries", "Ripe, fragrant strawberries picked this week.", 0.4, "kg", "Irbid Farms"],
  ["fruits", "Shamouti & Navel Oranges", "Sweet, juicy oranges loaded with vitamin C.", 0.21, "kg", "Wadi Al-Arab Citrus"],
  ["fruits", "Sweet Clementines", "Seedless, easy-peel clementines packed with citrus sweetness.", 0.19, "kg", "Northern Valley Orchards"],
  ["fruits", "Baladi Lemons", "Thin-skinned aromatic lemons with plenty of juice.", 0.18, "kg", "Wadi Al-Arab Orchards"],
  ["fruits", "Seedless Grapes", "Sweet seedless grapes, perfect for snacking.", 0.35, "kg", "Jerash Vineyards"],
  ["fruits", "Sweet Watermelon", "Red, sweet and refreshing watermelon.", 0.09, "kg", "Jordan Valley Farms"],
  ["fruits", "Local Pomegranates", "Deep red pomegranates with sweet-tart seeds.", 0.38, "kg", "Northern Orchards"],
  ["fruits", "Fresh Figs", "Soft, honey-sweet figs in season.", 0.55, "kg", "Ajloun Orchards"],

  ["meats", "Baladi Naemi Lamb", "Tender local lamb, cut fresh to order.", 2.38, "kg", "Local Baladi Farms"],
  ["meats", "Fresh Local Veal", "Lean, tender veal for stews and grills.", 2.13, "kg", "Local Baladi Farms"],
  ["meats", "Farm-Chilled Whole Chicken", "Whole chicken, chilled and cleaned.", 0.8, "kg", "Irbid Poultry Farms"],
  ["meats", "Fresh Chicken Breast", "Skinless, boneless chicken breast.", 1.2, "kg", "Irbid Poultry Farms"],
  ["meats", "Baladi Lamb Chops", "Juicy chops, great on the grill.", 2.75, "kg", "Local Baladi Farms"],
  ["meats", "Fresh Minced Beef", "Freshly minced beef for kofta and burgers.", 1.88, "kg", "Local Baladi Farms"],
  ["meats", "Chicken Thighs", "Juicy bone-in chicken thighs.", 0.95, "kg", "Irbid Poultry Farms"],
  ["meats", "Beef Steak Cuts", "Tender steak cuts for the pan or grill.", 3, "kg", "Local Baladi Farms"],
  ["meats", "Chicken Wings", "Fresh chicken wings, ready to marinate.", 0.88, "kg", "Irbid Poultry Farms"],
  ["meats", "Fresh Lamb Liver", "Fresh lamb liver, cleaned and trimmed.", 1.5, "kg", "Local Baladi Farms"],

  ["dairy-cheeses", "Authentic Nabulsi Cheese", "Salty white Nabulsi cheese, perfect for knafeh.", 1.63, "kg", "Baladi Dairy"],
  ["dairy-cheeses", "Jerash Labneh", "Thick, tangy strained yogurt.", 0.7, "kg", "Jerash Dairy"],
  ["dairy-cheeses", "Karak Jameed", "Traditional dried yogurt for mansaf.", 1.38, "kg", "Karak Dairy"],
  ["dairy-cheeses", "Akkawi Cheese", "Mild, soft white cheese.", 1.5, "kg", "Baladi Dairy"],
  ["dairy-cheeses", "Halloumi Cheese", "Firm cheese that grills beautifully.", 1.38, "kg", "Baladi Dairy"],
  ["dairy-cheeses", "Baladi Plain Yogurt", "Creamy plain yogurt with no additives.", 0.4, "kg", "Jerash Dairy"],
  ["dairy-cheeses", "White Cheese (Jibneh Baida)", "Everyday white cheese for breakfast.", 1.13, "kg", "Baladi Dairy"],
  ["dairy-cheeses", "Fresh Baladi Butter", "Rich, creamy farm butter.", 1.75, "kg", "Karak Dairy"],
  ["dairy-cheeses", "Fresh Mozzarella", "Soft mozzarella that melts well.", 1.55, "kg", "Baladi Dairy"],
  ["dairy-cheeses", "Shanklish", "Aged, spiced cheese balls.", 1.88, "kg", "Karak Dairy"],

  ["fresh-juices", "Fresh Orange Juice (1L)", "Freshly squeezed oranges, nothing added.", 2, "bottle", "Rakan Fresh Juicery"],
  ["fresh-juices", "Pure Cold-Pressed Ajloun Apple Juice (1L)", "Golden juice pressed from mountain apples.", 2.2, "bottle", "Ajloun Apple Orchards"],
  ["fresh-juices", "Carrot, Apple & Orange Vitamin Boost (1L)", "Immune-boosting blend of sweet carrots, apples and oranges.", 2.4, "bottle", "Rakan Fresh Juicery"],
  ["fresh-juices", "Lemon & Mint Juice (1L)", "Cooling lemonade with fresh mint.", 1.8, "bottle", "Rakan Fresh Juicery"],
  ["fresh-juices", "Pomegranate Juice (1L)", "Pure pressed pomegranate juice.", 3, "bottle", "Rakan Fresh Juicery"],
  ["fresh-juices", "Strawberry & Banana Smoothie (1L)", "Thick, creamy and naturally sweet.", 2.6, "bottle", "Rakan Fresh Juicery"],
  ["fresh-juices", "Fresh Mango Juice (1L)", "Ripe mango blended smooth.", 2.5, "bottle", "Rakan Fresh Juicery"],
  ["fresh-juices", "Pink Grapefruit Juice (1L)", "Tangy, refreshing grapefruit juice.", 2.2, "bottle", "Rakan Fresh Juicery"],
  ["fresh-juices", "Watermelon Juice (1L)", "Light and hydrating, great in summer.", 1.9, "bottle", "Rakan Fresh Juicery"],
  ["fresh-juices", "Mixed Fruit Cocktail (1L)", "A sweet blend of seasonal fruits.", 2.7, "bottle", "Rakan Fresh Juicery"],

  ["supermarket", "Kafarat Extra Virgin Olive Oil (1L)", "Cold-pressed olive oil from Kafarat mills.", 7.5, "bottle", "Kafarat Olive Mills"],
  ["supermarket", "Aged Basmati Rice", "Long-grain aged rice that cooks up fluffy.", 0.45, "kg", "Rakan Pantry"],
  ["supermarket", "Local Red Lentils", "Quick-cooking red lentils for soups.", 0.3, "kg", "Rakan Pantry"],
  ["supermarket", "Local Chickpeas", "Large chickpeas for hummus and stews.", 0.33, "kg", "Rakan Pantry"],
  ["supermarket", "Coarse Bulgur", "Coarse bulgur for kibbeh and salads.", 0.25, "kg", "Rakan Pantry"],
  ["supermarket", "Green Freekeh", "Smoky roasted green wheat.", 0.75, "kg", "Rakan Pantry"],
  ["supermarket", "Dried Fava Beans", "Dried fava beans for foul and soups.", 0.35, "kg", "Rakan Pantry"],
  ["supermarket", "White Sugar", "Fine white sugar.", 0.23, "kg", "Rakan Pantry"],
  ["supermarket", "Zaatar Mix (250 g)", "Thyme, sesame and sumac blend.", 2.5, "pack", "Irbid Spice House"],
  ["supermarket", "Tahini Paste (500 g)", "Smooth stone-ground sesame paste.", 3.2, "pack", "Irbid Spice House"],
];

let added = 0;
for (const [categoryId, name, description, price, unit, farm] of products) {
  const exists = await prisma.product.findFirst({ where: { name, categoryId } });
  if (exists) continue;
  await prisma.product.create({ data: { categoryId, name, description, price, unit, farm } });
  added += 1;
}
console.log(`Seeded products: ${added} added, ${products.length - added} already there.`);

await prisma.$disconnect();
