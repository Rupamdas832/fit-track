export interface DietMealSlot {
  time: string;
  minutes: number;
  meal: string;
  primary: string;
  alt: string;
}

export interface DietDay {
  focus: string;
  meals: DietMealSlot[];
}

function slot(
  time: string,
  minutes: number,
  meal: string,
  primary: string,
  alt: string
): DietMealSlot {
  return { time, minutes, meal, primary, alt };
}

// Fixed 7-day lean-bulk rotation: ~2,150–2,200 kcal, 100–115g protein/day, no fluid milk.
export const DIET_PLAN: Record<string, DietDay> = {
  monday: {
    focus: "Chest & Arms",
    meals: [
      slot(
        "7:00 AM",
        420,
        "Hydration",
        "1 glass warm water + 5 soaked, peeled almonds.",
        "3 overnight-soaked walnuts."
      ),
      slot(
        "8:30 AM",
        510,
        "Breakfast",
        "3-whole egg omelet with tomatoes & spinach + 2 slices brown toast.",
        "3 egg bhurji with multi-grain roti."
      ),
      slot(
        "11:30 AM",
        690,
        "Mid-Morning",
        "1 bowl fresh sliced papaya + 1 tbsp roasted flaxseeds.",
        "1 medium crisp apple."
      ),
      slot(
        "1:30 PM",
        810,
        "Lunch",
        "1.5 cups brown/basmati rice + 150g grilled chicken breast + stir-fried veggies.",
        "150g light chicken curry cooked with less oil."
      ),
      slot(
        "5:30 PM",
        1050,
        "Evening Snack",
        "1 bowl (200g) fresh homemade curd + 1 tbsp chia seeds.",
        "1 cup boiled Kala Chana chaat."
      ),
      slot(
        "7:30 PM",
        1170,
        "Post-Workout",
        "1 scoop whey protein isolate mixed in 300ml water.",
        "3 boiled egg whites (if resting)."
      ),
      slot(
        "9:00 PM",
        1260,
        "Dinner",
        "2 oats-atta blend rotis + 1 cup thick moong dal + 1 cup green veg curry.",
        "1.5 cups rice + 1 cup dal tarka."
      ),
    ],
  },
  tuesday: {
    focus: "Legs & Core",
    meals: [
      slot(
        "7:00 AM",
        420,
        "Hydration",
        "1 glass warm water + 3 overnight-soaked walnuts.",
        "5 soaked, peeled almonds."
      ),
      slot(
        "8:30 AM",
        510,
        "Breakfast",
        "Savory oats porridge (40g dry oats cooked with onions, carrots & 100g minced chicken).",
        "Oats cooked with 3 egg whites whisked in."
      ),
      slot(
        "11:30 AM",
        690,
        "Mid-Morning",
        "1 bowl fresh pomegranate seeds + 1 tbsp chia seeds.",
        "1 whole pear or guava."
      ),
      slot(
        "1:30 PM",
        810,
        "Lunch",
        "2 chapatis + 1.5 cups thick masoor dal + 100g pan-seared fresh paneer cubes.",
        "100g paneer bhurji with minimal oil + rice."
      ),
      slot(
        "5:30 PM",
        1050,
        "Evening Snack",
        "1 bowl (200g) fresh homemade curd with roasted cumin powder.",
        "1 cup sprouts salad with cucumber & lemon juice."
      ),
      slot(
        "7:30 PM",
        1170,
        "Post-Workout",
        "1 scoop whey protein isolate mixed in 300ml water.",
        "3 boiled egg whites."
      ),
      slot(
        "9:00 PM",
        1260,
        "Dinner",
        "1.5 cups jeera rice + egg curry (2 whole eggs in light tomato-onion gravy) + 1 cup stir-fried greens.",
        "2 multi-grain rotis + 2 whole egg bhurji."
      ),
    ],
  },
  wednesday: {
    focus: "Active Cardio Recovery",
    meals: [
      slot(
        "7:00 AM",
        420,
        "Hydration",
        "1 glass warm water + 5 soaked, peeled almonds.",
        "3 soaked walnuts."
      ),
      slot(
        "8:30 AM",
        510,
        "Breakfast",
        "3 moong dal cheelas stuffed with 60g grated paneer and green coriander.",
        "3 besan cheelas with mint chutney."
      ),
      slot(
        "11:30 AM",
        690,
        "Mid-Morning",
        "1 medium crisp apple + 1 tbsp roasted pumpkin seeds.",
        "1 bowl fresh papaya slices."
      ),
      slot(
        "1:30 PM",
        810,
        "Lunch",
        "1.5 cups basmati rice + 150g fish curry (Rahu/Katla, thin home style gravy) + 1 cup steamed green beans.",
        "150g baked or tawa pan-fried fish fillets."
      ),
      slot(
        "5:30 PM",
        1050,
        "Evening Snack",
        "1 cup boiled Kala Chana chaat with tomato, cucumber & fresh lemon.",
        "1 bowl fresh curd (200g)."
      ),
      slot(
        "7:30 PM",
        1170,
        "Evening Fuel",
        "3 boiled egg whites (rest day macro balance).",
        "1 scoop whey protein isolate in water."
      ),
      slot(
        "9:00 PM",
        1260,
        "Dinner",
        "2 whole wheat chapatis + 1 cup thick chana dal + 1 cup seasonal veg curry (bhindi or parwal).",
        "1.5 cups brown rice + dal + mixed veg."
      ),
    ],
  },
  thursday: {
    focus: "Back & Shoulders",
    meals: [
      slot(
        "7:00 AM",
        420,
        "Hydration",
        "1 glass warm water + 3 overnight-soaked walnuts.",
        "5 soaked, peeled almonds."
      ),
      slot(
        "8:30 AM",
        510,
        "Breakfast",
        "3 scrambled whole eggs + 2 slices whole wheat toast + sliced tomatoes.",
        "3 egg white omelet + 1 whole egg + toast."
      ),
      slot(
        "11:30 AM",
        690,
        "Mid-Morning",
        "1 bowl fresh papaya + 1 tbsp roasted flaxseeds.",
        "1 bowl fresh pomegranate."
      ),
      slot(
        "1:30 PM",
        810,
        "Lunch",
        "1.5 cups rice + 150g chicken keema cooked with green peas & minimal oil + green salad.",
        "150g chicken breast strips stir-fried with bell peppers."
      ),
      slot(
        "5:30 PM",
        1050,
        "Evening Snack",
        "1 bowl (200g) fresh homemade curd + 1 tbsp chia seeds.",
        "1 cup boiled green moong chaat."
      ),
      slot(
        "7:30 PM",
        1170,
        "Post-Workout",
        "1 scoop whey protein isolate mixed in 300ml water.",
        "3 boiled egg whites."
      ),
      slot(
        "9:00 PM",
        1260,
        "Dinner",
        "2 oats-atta blend rotis + 1 cup thick toor dal + 1 cup bottle gourd (lauki) subji.",
        "1.5 cups rice + toor dal + ridge gourd (jhinge) subji."
      ),
    ],
  },
  friday: {
    focus: "Arms Volume",
    meals: [
      slot(
        "7:00 AM",
        420,
        "Hydration",
        "1 glass warm water + 5 soaked, peeled almonds.",
        "3 soaked walnuts."
      ),
      slot(
        "8:30 AM",
        510,
        "Breakfast",
        "High-protein savory oats porridge cooked with 100g minced chicken breast & spices.",
        "3 whole egg omelet with 2 slices brown toast."
      ),
      slot(
        "11:30 AM",
        690,
        "Mid-Morning",
        "1 medium fresh apple + 1 tbsp pumpkin seeds.",
        "1 bowl sweet orange or seasonal citrus fruit."
      ),
      slot(
        "1:30 PM",
        810,
        "Lunch",
        "1.5 cups brown/basmati rice + 100g pan-seared fresh paneer + 1 cup thick moong dal.",
        "100g paneer curry in a light tomato base + 1.5 cups rice."
      ),
      slot(
        "5:30 PM",
        1050,
        "Evening Snack",
        "1 bowl (200g) fresh homemade curd with black salt and cumin.",
        "1 cup chickpea/chana salad."
      ),
      slot(
        "7:30 PM",
        1170,
        "Post-Workout",
        "1 scoop whey protein isolate mixed in 300ml water.",
        "3 boiled egg whites."
      ),
      slot(
        "9:00 PM",
        1260,
        "Dinner",
        "2 whole wheat chapatis + 150g grilled/tawa fish + 1 cup stir-fried mixed vegetables.",
        "1.5 cups rice + 150g home style light fish curry."
      ),
    ],
  },
  saturday: {
    focus: "Lower Body Volume",
    meals: [
      slot(
        "7:00 AM",
        420,
        "Hydration",
        "1 glass warm water + 3 overnight-soaked walnuts.",
        "5 soaked, peeled almonds."
      ),
      slot(
        "8:30 AM",
        510,
        "Breakfast",
        "3 moong dal cheelas filled with 60g grated paneer.",
        "Savory oats porridge with veggies."
      ),
      slot(
        "11:30 AM",
        690,
        "Mid-Morning",
        "1 bowl fresh pomegranate seeds + 1 tbsp chia seeds.",
        "1 bowl fresh papaya."
      ),
      slot(
        "1:30 PM",
        810,
        "Lunch",
        "1.5 cups rice + 150g tawa chicken breast with light turmeric & black pepper + cucumber salad.",
        "150g chicken breast strips cooked with capsicum & rice."
      ),
      slot(
        "5:30 PM",
        1050,
        "Evening Snack",
        "1 cup boiled Kala Chana chaat with fresh coriander and lemon.",
        "1 bowl fresh curd (200g)."
      ),
      slot(
        "7:30 PM",
        1170,
        "Post-Workout",
        "1 scoop whey protein isolate mixed in 300ml water.",
        "3 boiled egg whites."
      ),
      slot(
        "9:00 PM",
        1260,
        "Dinner",
        "2 chapatis + egg curry (2 whole eggs in light home gravy) + 1 cup boiled green peas & carrots.",
        "1.5 cups rice + 2 whole egg bhurji with vegetables."
      ),
    ],
  },
  sunday: {
    focus: "Full Rest & Intestinal Reset",
    meals: [
      slot(
        "7:00 AM",
        420,
        "Hydration",
        "1 glass warm water + 5 soaked, peeled almonds.",
        "3 soaked walnuts."
      ),
      slot(
        "8:30 AM",
        510,
        "Breakfast",
        "3 whole eggs scrambled with onions, green chilies & tomatoes + 2 slices brown toast.",
        "3 moong dal cheelas (no filling)."
      ),
      slot(
        "11:30 AM",
        690,
        "Mid-Morning",
        "1 bowl fresh papaya or 1 fresh apple.",
        "1 glass fresh sweet lime juice (no strained pulp)."
      ),
      slot(
        "1:30 PM",
        810,
        "Lunch",
        "1.5 cups basmati rice + 150g fish curry (thin Bengali style, cumin & turmeric) + 1 cup stir-fried parwal.",
        "150g grilled chicken + rice + thick dal."
      ),
      slot(
        "5:30 PM",
        1050,
        "Evening Snack",
        "1 bowl (200g) fresh homemade curd + 1 tbsp chia seeds.",
        "1 cup boiled sprouts or Kala Chana chaat."
      ),
      slot(
        "7:30 PM",
        1170,
        "Evening Protein",
        "1 scoop whey protein isolate mixed in 300ml water.",
        "3 boiled egg whites."
      ),
      slot(
        "9:00 PM",
        1260,
        "Dinner",
        "2 oats-atta blend rotis + 1 cup thick masoor dal + 1 cup sautéed cabbage and green peas.",
        "1.5 cups rice + 1 cup thick dal + stir-fried veggies."
      ),
    ],
  },
};

/** Which meal slot is "current" right now, given minutes-since-midnight. */
export function getCurrentMealIndex(
  meals: DietMealSlot[],
  nowMinutes: number
): { index: number; status: "now" | "next" } {
  if (nowMinutes < meals[0]!.minutes) return { index: 0, status: "next" };
  for (let i = meals.length - 1; i >= 0; i--) {
    if (nowMinutes >= meals[i]!.minutes) return { index: i, status: "now" };
  }
  return { index: 0, status: "now" };
}
