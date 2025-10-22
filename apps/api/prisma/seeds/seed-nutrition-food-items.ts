import { PrismaClient, NutritionFoodGroup } from '../generated/prisma';

const prisma = new PrismaClient();

const baseFoods: Array<{ name: string; group: NutritionFoodGroup }> = [
  { name: 'Arroz', group: NutritionFoodGroup.CEREAIS_TUBERCULOS },
  { name: 'Arroz integral', group: NutritionFoodGroup.CEREAIS_TUBERCULOS },
  { name: 'Batata doce', group: NutritionFoodGroup.CEREAIS_TUBERCULOS },
  { name: 'Feijao', group: NutritionFoodGroup.PROTEINA },
  { name: 'Feijao carioca', group: NutritionFoodGroup.PROTEINA },
  { name: 'Carne magra', group: NutritionFoodGroup.PROTEINA },
  { name: 'Frango desfiado', group: NutritionFoodGroup.PROTEINA },
  { name: 'Ovo cozido', group: NutritionFoodGroup.PROTEINA },
  { name: 'Verdura', group: NutritionFoodGroup.VEGETAL },
  { name: 'Brocolis', group: NutritionFoodGroup.VEGETAL },
  { name: 'Cenoura', group: NutritionFoodGroup.VEGETAL },
  { name: 'Fruta', group: NutritionFoodGroup.FRUTA },
  { name: 'Banana', group: NutritionFoodGroup.FRUTA },
  { name: 'Maca', group: NutritionFoodGroup.FRUTA },
  { name: 'Suco natural', group: NutritionFoodGroup.OUTRO },
  { name: 'Doce', group: NutritionFoodGroup.OUTRO },
  { name: 'Leite', group: NutritionFoodGroup.OUTRO },
  { name: 'Azeite de oliva', group: NutritionFoodGroup.GORDURA_BOA },
  { name: 'Abacate', group: NutritionFoodGroup.GORDURA_BOA }
];

async function main() {
  for (const food of baseFoods) {
    await prisma.nutritionFoodItem.upsert({
      where: { name: food.name },
      create: {
        name: food.name,
        group: food.group,
      },
      update: {
        group: food.group,
      },
    });
  }
}

main()
  .catch((error) => {
    console.error('Failed to seed nutrition food items', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.();
  });
