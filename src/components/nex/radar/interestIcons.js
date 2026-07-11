import {
  Cpu, Dumbbell, Briefcase, Car, Moon, Camera, Plane, UtensilsCrossed,
  Clapperboard, Rocket, Trophy, Music, Palette, Gamepad2, Shirt, Film,
  BookOpen, Mountain, Flower, ChefHat, PenTool, Bitcoin, FlaskConical, PawPrint, Leaf,
} from "lucide-react";

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