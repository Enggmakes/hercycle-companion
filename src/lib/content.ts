export const LOVE_TIPS = [
  "Ask how she's feeling today — then really listen.",
  "Bring her favorite chocolate on your way home.",
  "Remind her to stay hydrated (and refill her bottle).",
  "Give her extra hugs today.",
  "She may need more rest — take something off her plate.",
  "Make her a warm drink without being asked.",
  "Put a heating pad and her comfy socks within reach.",
  "Send a small text just to say you're thinking of her.",
  "Cook or order her comfort food tonight.",
  "Be patient today, even if the mood shifts.",
];

export const QUOTES = [
  "Loving her well is a daily practice, not a grand gesture.",
  "Be the calm on her hardest days.",
  "Small kindnesses, repeated, become a whole life together.",
  "She doesn't need you to fix it — she needs you beside her.",
  "Choose her again today.",
];

export const PHASE_INFO = [
  {
    name: "Menstrual phase",
    days: "Day 1 – 5",
    body: "The uterine lining sheds. Energy is often lowest and cramps, headaches or back pain are common.",
    care: "Warmth, iron-rich food, gentle movement, extra rest and zero pressure.",
  },
  {
    name: "Follicular phase",
    days: "Day 6 – 13",
    body: "Estrogen rises as follicles mature. Mood, focus and energy usually climb.",
    care: "Great time for plans, dates and new activities together.",
  },
  {
    name: "Ovulation",
    days: "Around day 14",
    body: "An egg is released. Some feel a brief one-sided twinge and a surge of energy.",
    care: "Highest fertility window — be mindful and communicative.",
  },
  {
    name: "Luteal phase",
    days: "Day 15 – 28",
    body: "Progesterone rises then falls. Appetite changes, bloating and tender breasts are common.",
    care: "Steady routines, magnesium-rich snacks, early nights.",
  },
  {
    name: "PMS",
    days: "Last 5 days",
    body: "Hormones drop sharply, which can bring irritability, low mood, cravings and fatigue.",
    care: "Extra patience, fewer commitments, and reassurance she is loved.",
  },
];

export const SYMPTOMS = [
  "Cramps",
  "Headache",
  "Bloating",
  "Back pain",
  "Fatigue",
  "Mood swings",
  "Cravings",
  "Tender breasts",
  "Trouble sleeping",
  "Acne",
];

export function pickDaily<T>(list: T[], seed: Date) {
  const key = seed.getFullYear() * 1000 + seed.getMonth() * 40 + seed.getDate();
  return list[key % list.length];
}