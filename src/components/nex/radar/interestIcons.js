import {
  Cpu, Dumbbell, Briefcase, Car, Moon, Camera, Plane, UtensilsCrossed,
  Clapperboard, Rocket, Trophy, Music, Palette, Gamepad2, Shirt, Film,
  BookOpen, Mountain, Flower, ChefHat, PenTool, Bitcoin, FlaskConical, PawPrint, Leaf,
} from "lucide-react";

// Neon glow colors per interest — matching the NEX2 design spec
export const INTEREST_COLORS = {
  Technology: "#4AC9FF",
  Fitness: "#FF9A2E",
  Business: "#4AC9FF",
  Cars: "#FF9A2E",
  Nightlife: "#B463FF",
  Photography: "#B463FF",
  Travel: "#4AC9FF",
  Food: "#FFC94A",
  Creators: "#B463FF",
  Startups: "#4AC9FF",
  Sports: "#39FF6A",
  Music: "#B463FF",
  Art: "#B463FF",
  Gaming: "#39FF6A",
  Fashion: "#FF9A2E",
  Movies: "#B463FF",
  Reading: "#39FF6A",
  Hiking: "#4AC9FF",
  Yoga: "#39FF6A",
  Cooking: "#FFC94A",
  Design: "#B463FF",
  Crypto: "#4AC9FF",
  Science: "#4AC9FF",
  Pets: "#39FF6A",
  "420": "#39FF6A",
};

export const INTEREST_ICONS = {
  Technology: Cpu,
  Fitness: Dumbbell,
  Business: Briefcase,
  Cars: Car,
  Nightlife: Moon,
  Photography: Camera,
  Travel: Plane,
  Food: UtensilsCrossed,
  Creators: Clapperboard,
  Startups: Rocket,
  Sports: Trophy,
  Music: Music,
  Art: Palette,
  Gaming: Gamepad2,
  Fashion: Shirt,
  Movies: Film,
  Reading: BookOpen,
  Hiking: Mountain,
  Yoga: Flower,
  Cooking: ChefHat,
  Design: PenTool,
  Crypto: Bitcoin,
  Science: FlaskConical,
  Pets: PawPrint,
  "420": Leaf,
};

export function getInterestIcon(interest) {
  return INTEREST_ICONS[interest] || null;
}

export function getInterestColor(interest) {
  return INTEREST_COLORS[interest] || "#4AC9FF";
}