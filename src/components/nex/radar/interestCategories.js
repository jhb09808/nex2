import {
  UtensilsCrossed, Dumbbell, Music, Moon, Trophy, Palette, Shirt, Film,
  Gamepad2, Cpu, Briefcase, Plane, Mountain, HeartPulse, GraduationCap,
  Globe, Users, PawPrint, Car, Heart,
} from "lucide-react";

/**
 * NEX2 Interest Category System
 * Each category has sub-interests with IDs, names, and search aliases.
 * Sub-interest IDs are stored on the user profile (UserProfile.interests).
 */
export const INTEREST_CATEGORIES = [
  {
    id: "food",
    name: "Food & Drinks",
    icon: UtensilsCrossed,
    subInterests: [
      { id: "italian", name: "Italian", aliases: ["pasta", "pizza"] },
      { id: "indian", name: "Indian" },
      { id: "chinese", name: "Chinese" },
      { id: "japanese", name: "Japanese" },
      { id: "korean", name: "Korean" },
      { id: "thai", name: "Thai" },
      { id: "vietnamese", name: "Vietnamese" },
      { id: "mexican", name: "Mexican", aliases: ["tacos", "burritos"] },
      { id: "caribbean", name: "Caribbean" },
      { id: "jamaican", name: "Jamaican" },
      { id: "haitian", name: "Haitian" },
      { id: "dominican", name: "Dominican" },
      { id: "puerto-rican", name: "Puerto Rican" },
      { id: "cuban", name: "Cuban" },
      { id: "african", name: "African" },
      { id: "ethiopian", name: "Ethiopian" },
      { id: "nigerian", name: "Nigerian" },
      { id: "mediterranean", name: "Mediterranean" },
      { id: "middle-eastern", name: "Middle Eastern" },
      { id: "greek", name: "Greek" },
      { id: "french", name: "French" },
      { id: "spanish", name: "Spanish" },
      { id: "american", name: "American" },
      { id: "southern-food", name: "Southern Food" },
      { id: "soul-food", name: "Soul Food" },
      { id: "seafood", name: "Seafood" },
      { id: "steak", name: "Steak" },
      { id: "burgers", name: "Burgers" },
      { id: "pizza", name: "Pizza" },
      { id: "pasta", name: "Pasta" },
      { id: "sushi", name: "Sushi" },
      { id: "ramen", name: "Ramen" },
      { id: "tacos", name: "Tacos" },
      { id: "barbecue", name: "Barbecue", aliases: ["bbq", "grilling"] },
      { id: "brunch", name: "Brunch" },
      { id: "breakfast", name: "Breakfast" },
      { id: "desserts", name: "Desserts" },
      { id: "bakeries", name: "Bakeries" },
      { id: "street-food", name: "Street Food" },
      { id: "fine-dining", name: "Fine Dining" },
      { id: "food-trucks", name: "Food Trucks" },
      { id: "vegan", name: "Vegan" },
      { id: "vegetarian", name: "Vegetarian" },
      { id: "pescatarian", name: "Pescatarian" },
      { id: "paleo", name: "Paleo" },
      { id: "keto", name: "Keto" },
      { id: "gluten-free", name: "Gluten-Free" },
      { id: "organic-food", name: "Organic Food" },
      { id: "healthy-eating", name: "Healthy Eating" },
      { id: "coffee", name: "Coffee" },
      { id: "matcha", name: "Matcha" },
      { id: "tea", name: "Tea" },
      { id: "smoothies", name: "Smoothies" },
      { id: "juices", name: "Juices" },
      { id: "cocktails", name: "Cocktails" },
      { id: "wine", name: "Wine" },
      { id: "craft-beer", name: "Craft Beer" },
      { id: "mocktails", name: "Mocktails" },
      { id: "cooking", name: "Cooking" },
      { id: "baking", name: "Baking" },
      { id: "trying-new-restaurants", name: "Trying New Restaurants" },
      { id: "food-reviews", name: "Food Reviews" },
    ],
  },
  {
    id: "fitness",
    name: "Fitness & Gym",
    icon: Dumbbell,
    subInterests: [
      { id: "weight-training", name: "Weight Training" },
      { id: "strength-training", name: "Strength Training" },
      { id: "bodybuilding", name: "Bodybuilding" },
      { id: "powerlifting", name: "Powerlifting" },
      { id: "bench-press", name: "Bench Press" },
      { id: "squats", name: "Squats" },
      { id: "deadlifts", name: "Deadlifts" },
      { id: "calisthenics", name: "Calisthenics" },
      { id: "crossfit", name: "CrossFit" },
      { id: "running", name: "Running", aliases: ["jogging", "run club"] },
      { id: "jogging", name: "Jogging" },
      { id: "sprinting", name: "Sprinting" },
      { id: "marathon-training", name: "Marathon Training" },
      { id: "walking", name: "Walking" },
      { id: "hiking", name: "Hiking" },
      { id: "rock-climbing", name: "Rock Climbing", aliases: ["climbing", "bouldering"] },
      { id: "indoor-climbing", name: "Indoor Climbing" },
      { id: "cycling", name: "Cycling" },
      { id: "mountain-biking", name: "Mountain Biking" },
      { id: "swimming", name: "Swimming" },
      { id: "boxing", name: "Boxing" },
      { id: "kickboxing", name: "Kickboxing" },
      { id: "muay-thai", name: "Muay Thai" },
      { id: "mma", name: "MMA" },
      { id: "wrestling", name: "Wrestling" },
      { id: "brazilian-jiu-jitsu", name: "Brazilian Jiu-Jitsu", aliases: ["bjj", "jiu jitsu"] },
      { id: "yoga", name: "Yoga" },
      { id: "pilates", name: "Pilates" },
      { id: "stretching", name: "Stretching" },
      { id: "mobility-training", name: "Mobility Training" },
      { id: "hiit", name: "HIIT" },
      { id: "cardio", name: "Cardio" },
      { id: "dance-fitness", name: "Dance Fitness" },
      { id: "spin-class", name: "Spin Class" },
      { id: "group-fitness", name: "Group Fitness" },
      { id: "personal-training", name: "Personal Training" },
      { id: "gym-partners", name: "Gym Partners" },
      { id: "outdoor-workouts", name: "Outdoor Workouts" },
      { id: "recovery", name: "Recovery" },
      { id: "sauna", name: "Sauna" },
      { id: "cold-plunge", name: "Cold Plunge" },
      { id: "nutrition", name: "Nutrition" },
      { id: "meal-prep", name: "Meal Prep" },
      { id: "sports-conditioning", name: "Sports Conditioning" },
    ],
  },
  {
    id: "music",
    name: "Music",
    icon: Music,
    subInterests: [
      { id: "hip-hop", name: "Hip-Hop", aliases: ["hip hop", "rap music"] },
      { id: "rap", name: "Rap" },
      { id: "rnb", name: "R&B", aliases: ["r and b", "rhythm and blues"] },
      { id: "afrobeats", name: "Afrobeats" },
      { id: "amapiano", name: "Amapiano" },
      { id: "reggae", name: "Reggae" },
      { id: "dancehall", name: "Dancehall" },
      { id: "reggaeton", name: "Reggaeton" },
      { id: "latin-music", name: "Latin Music" },
      { id: "salsa", name: "Salsa" },
      { id: "bachata", name: "Bachata" },
      { id: "merengue", name: "Merengue" },
      { id: "pop", name: "Pop" },
      { id: "rock", name: "Rock" },
      { id: "alternative", name: "Alternative" },
      { id: "indie", name: "Indie" },
      { id: "punk", name: "Punk" },
      { id: "metal", name: "Metal" },
      { id: "jazz", name: "Jazz" },
      { id: "blues", name: "Blues" },
      { id: "soul", name: "Soul" },
      { id: "funk", name: "Funk" },
      { id: "gospel", name: "Gospel" },
      { id: "country", name: "Country" },
      { id: "classical", name: "Classical" },
      { id: "electronic", name: "Electronic" },
      { id: "house", name: "House" },
      { id: "tech-house", name: "Tech House" },
      { id: "deep-house", name: "Deep House" },
      { id: "techno", name: "Techno" },
      { id: "trance", name: "Trance" },
      { id: "drum-and-bass", name: "Drum and Bass", aliases: ["dnb", "d&b"] },
      { id: "dubstep", name: "Dubstep" },
      { id: "lo-fi", name: "Lo-Fi", aliases: ["lofi", "chill"] },
      { id: "kpop", name: "K-Pop" },
      { id: "live-music", name: "Live Music" },
      { id: "concerts", name: "Concerts" },
      { id: "music-festivals", name: "Music Festivals" },
      { id: "djing", name: "DJing" },
      { id: "producing-music", name: "Producing Music", aliases: ["music production", "beat making"] },
      { id: "singing", name: "Singing" },
      { id: "songwriting", name: "Songwriting" },
      { id: "playing-instruments", name: "Playing Instruments" },
      { id: "vinyl-records", name: "Vinyl Records" },
    ],
  },
  {
    id: "nightlife",
    name: "Nightlife",
    icon: Moon,
    subInterests: [
      { id: "bars", name: "Bars" },
      { id: "lounges", name: "Lounges" },
      { id: "nightclubs", name: "Nightclubs", aliases: ["clubs", "clubbing"] },
      { id: "rooftops", name: "Rooftops" },
      { id: "speakeasies", name: "Speakeasies" },
      { id: "dive-bars", name: "Dive Bars" },
      { id: "cocktail-bars", name: "Cocktail Bars" },
      { id: "wine-bars", name: "Wine Bars" },
      { id: "hookah-lounges", name: "Hookah Lounges" },
      { id: "live-music-venues", name: "Live Music Venues" },
      { id: "comedy-clubs", name: "Comedy Clubs" },
      { id: "karaoke", name: "Karaoke" },
      { id: "dance-parties", name: "Dance Parties" },
      { id: "house-parties", name: "House Parties" },
      { id: "raves", name: "Raves" },
      { id: "underground-techno", name: "Underground Techno" },
      { id: "day-parties", name: "Day Parties" },
      { id: "brunch-parties", name: "Brunch Parties" },
      { id: "happy-hour", name: "Happy Hour" },
      { id: "late-night-food", name: "Late-Night Food" },
      { id: "event-hopping", name: "Event Hopping" },
      { id: "networking-events", name: "Networking Events" },
    ],
  },
  {
    id: "sports",
    name: "Sports",
    icon: Trophy,
    subInterests: [
      { id: "basketball", name: "Basketball" },
      { id: "football", name: "Football" },
      { id: "soccer", name: "Soccer" },
      { id: "baseball", name: "Baseball" },
      { id: "hockey", name: "Hockey" },
      { id: "tennis", name: "Tennis" },
      { id: "golf", name: "Golf" },
      { id: "volleyball", name: "Volleyball" },
      { id: "boxing-sports", name: "Boxing" },
      { id: "mma-sports", name: "MMA" },
      { id: "wrestling-sports", name: "Wrestling" },
      { id: "track-and-field", name: "Track and Field" },
      { id: "swimming-sports", name: "Swimming" },
      { id: "surfing", name: "Surfing" },
      { id: "skateboarding", name: "Skateboarding" },
      { id: "snowboarding", name: "Snowboarding" },
      { id: "skiing", name: "Skiing" },
      { id: "formula-1", name: "Formula 1", aliases: ["f1", "racing"] },
      { id: "motorsports", name: "Motorsports" },
      { id: "cycling-sports", name: "Cycling" },
      { id: "pickleball", name: "Pickleball" },
      { id: "table-tennis", name: "Table Tennis", aliases: ["ping pong"] },
      { id: "bowling", name: "Bowling" },
      { id: "fantasy-sports", name: "Fantasy Sports" },
      { id: "sports-betting", name: "Sports Betting" },
      { id: "watching-live-games", name: "Watching Live Games" },
      { id: "playing-recreational-sports", name: "Playing Recreational Sports" },
    ],
  },
  {
    id: "art",
    name: "Art & Creativity",
    icon: Palette,
    subInterests: [
      { id: "photography", name: "Photography" },
      { id: "videography", name: "Videography" },
      { id: "filmmaking", name: "Filmmaking" },
      { id: "video-editing", name: "Video Editing" },
      { id: "graphic-design", name: "Graphic Design" },
      { id: "branding", name: "Branding" },
      { id: "illustration", name: "Illustration" },
      { id: "drawing", name: "Drawing" },
      { id: "painting", name: "Painting" },
      { id: "sculpture", name: "Sculpture" },
      { id: "street-art", name: "Street Art" },
      { id: "graffiti", name: "Graffiti" },
      { id: "fashion-design", name: "Fashion Design" },
      { id: "interior-design", name: "Interior Design" },
      { id: "architecture", name: "Architecture" },
      { id: "creative-writing", name: "Creative Writing" },
      { id: "poetry", name: "Poetry" },
      { id: "screenwriting", name: "Screenwriting" },
      { id: "acting", name: "Acting" },
      { id: "theater", name: "Theater" },
      { id: "dance", name: "Dance" },
      { id: "content-creation", name: "Content Creation" },
      { id: "social-media", name: "Social Media" },
      { id: "animation", name: "Animation" },
      { id: "3d-design", name: "3D Design" },
      { id: "ai-art", name: "AI Art" },
      { id: "museums", name: "Museums" },
      { id: "art-galleries", name: "Art Galleries" },
      { id: "creative-collaborations", name: "Creative Collaborations" },
    ],
  },
  {
    id: "fashion",
    name: "Fashion",
    icon: Shirt,
    subInterests: [
      { id: "streetwear", name: "Streetwear" },
      { id: "luxury-fashion", name: "Luxury Fashion" },
      { id: "vintage-fashion", name: "Vintage Fashion" },
      { id: "thrifting", name: "Thrifting" },
      { id: "sneakers", name: "Sneakers" },
      { id: "designer-brands", name: "Designer Brands" },
      { id: "sustainable-fashion", name: "Sustainable Fashion" },
      { id: "menswear", name: "Menswear" },
      { id: "womenswear", name: "Womenswear" },
      { id: "unisex-fashion", name: "Unisex Fashion" },
      { id: "jewelry", name: "Jewelry" },
      { id: "watches", name: "Watches" },
      { id: "styling", name: "Styling" },
      { id: "modeling", name: "Modeling" },
      { id: "fashion-photography", name: "Fashion Photography" },
      { id: "fashion-shows", name: "Fashion Shows" },
      { id: "custom-clothing", name: "Custom Clothing" },
      { id: "upcycling", name: "Upcycling" },
      { id: "beauty", name: "Beauty" },
      { id: "makeup", name: "Makeup" },
      { id: "hair", name: "Hair" },
      { id: "nail-art", name: "Nail Art" },
    ],
  },
  {
    id: "movies-tv",
    name: "Movies & TV",
    icon: Film,
    subInterests: [
      { id: "action", name: "Action" },
      { id: "comedy", name: "Comedy" },
      { id: "drama", name: "Drama" },
      { id: "horror", name: "Horror" },
      { id: "thriller", name: "Thriller" },
      { id: "romance", name: "Romance" },
      { id: "science-fiction", name: "Science Fiction", aliases: ["sci-fi", "scifi"] },
      { id: "fantasy", name: "Fantasy" },
      { id: "animation", name: "Animation" },
      { id: "anime", name: "Anime" },
      { id: "documentaries", name: "Documentaries" },
      { id: "true-crime", name: "True Crime" },
      { id: "reality-tv", name: "Reality TV" },
      { id: "sitcoms", name: "Sitcoms" },
      { id: "independent-films", name: "Independent Films", aliases: ["indie films"] },
      { id: "foreign-films", name: "Foreign Films" },
      { id: "superhero-movies", name: "Superhero Movies" },
      { id: "classic-films", name: "Classic Films" },
      { id: "film-festivals", name: "Film Festivals" },
      { id: "movie-theaters", name: "Movie Theaters" },
      { id: "binge-watching", name: "Binge-Watching" },
      { id: "film-discussions", name: "Film Discussions" },
    ],
  },
  {
    id: "gaming",
    name: "Gaming",
    icon: Gamepad2,
    subInterests: [
      { id: "playstation", name: "PlayStation" },
      { id: "xbox", name: "Xbox" },
      { id: "nintendo", name: "Nintendo" },
      { id: "pc-gaming", name: "PC Gaming" },
      { id: "mobile-gaming", name: "Mobile Gaming" },
      { id: "esports", name: "Esports" },
      { id: "call-of-duty", name: "Call of Duty", aliases: ["cod"] },
      { id: "fortnite", name: "Fortnite" },
      { id: "fifa", name: "FIFA / EA Sports FC", aliases: ["ea sports"] },
      { id: "nba-2k", name: "NBA 2K" },
      { id: "madden", name: "Madden" },
      { id: "grand-theft-auto", name: "Grand Theft Auto", aliases: ["gta"] },
      { id: "minecraft", name: "Minecraft" },
      { id: "roblox", name: "Roblox" },
      { id: "fighting-games", name: "Fighting Games" },
      { id: "racing-games", name: "Racing Games" },
      { id: "sports-games", name: "Sports Games" },
      { id: "strategy-games", name: "Strategy Games" },
      { id: "role-playing-games", name: "Role-Playing Games", aliases: ["rpg"] },
      { id: "horror-games", name: "Horror Games" },
      { id: "indie-games", name: "Indie Games" },
      { id: "board-games", name: "Board Games" },
      { id: "card-games", name: "Card Games" },
      { id: "dungeons-and-dragons", name: "Dungeons & Dragons", aliases: ["d&d", "dnd"] },
      { id: "gaming-tournaments", name: "Gaming Tournaments" },
      { id: "streaming-gameplay", name: "Streaming Gameplay" },
    ],
  },
  {
    id: "technology",
    name: "Technology",
    icon: Cpu,
    subInterests: [
      { id: "artificial-intelligence", name: "Artificial Intelligence", aliases: ["ai"] },
      { id: "app-development", name: "App Development" },
      { id: "web-development", name: "Web Development", aliases: ["web dev"] },
      { id: "software-engineering", name: "Software Engineering" },
      { id: "coding", name: "Coding", aliases: ["programming"] },
      { id: "startups", name: "Startups" },
      { id: "consumer-technology", name: "Consumer Technology" },
      { id: "smartphones", name: "Smartphones" },
      { id: "computers", name: "Computers" },
      { id: "cybersecurity", name: "Cybersecurity" },
      { id: "robotics", name: "Robotics" },
      { id: "virtual-reality", name: "Virtual Reality", aliases: ["vr"] },
      { id: "augmented-reality", name: "Augmented Reality", aliases: ["ar"] },
      { id: "blockchain", name: "Blockchain" },
      { id: "cryptocurrency", name: "Cryptocurrency", aliases: ["crypto"] },
      { id: "web3", name: "Web3" },
      { id: "product-design", name: "Product Design" },
      { id: "ux-ui-design", name: "UX/UI Design", aliases: ["ux", "ui", "user experience"] },
      { id: "no-code-tools", name: "No-Code Tools" },
      { id: "automation", name: "Automation" },
      { id: "tech-news", name: "Tech News" },
      { id: "gadgets", name: "Gadgets" },
      { id: "digital-privacy", name: "Digital Privacy" },
    ],
  },
  {
    id: "business",
    name: "Business",
    icon: Briefcase,
    subInterests: [
      { id: "entrepreneurship", name: "Entrepreneurship" },
      { id: "startups-business", name: "Startups" },
      { id: "small-business", name: "Small Business" },
      { id: "marketing", name: "Marketing" },
      { id: "advertising", name: "Advertising" },
      { id: "branding-business", name: "Branding" },
      { id: "sales", name: "Sales" },
      { id: "real-estate", name: "Real Estate" },
      { id: "investing", name: "Investing" },
      { id: "finance", name: "Finance" },
      { id: "e-commerce", name: "E-Commerce" },
      { id: "content-marketing", name: "Content Marketing" },
      { id: "social-media-marketing", name: "Social Media Marketing" },
      { id: "networking", name: "Networking" },
      { id: "leadership", name: "Leadership" },
      { id: "personal-development", name: "Personal Development" },
      { id: "freelancing", name: "Freelancing" },
      { id: "consulting", name: "Consulting" },
      { id: "venture-capital", name: "Venture Capital", aliases: ["vc"] },
      { id: "fundraising", name: "Fundraising" },
      { id: "technology-businesses", name: "Technology Businesses" },
      { id: "creative-businesses", name: "Creative Businesses" },
      { id: "restaurants-business", name: "Restaurants" },
      { id: "fashion-businesses", name: "Fashion Businesses" },
    ],
  },
  {
    id: "travel",
    name: "Travel",
    icon: Plane,
    subInterests: [
      { id: "international-travel", name: "International Travel" },
      { id: "domestic-travel", name: "Domestic Travel" },
      { id: "solo-travel", name: "Solo Travel" },
      { id: "group-travel", name: "Group Travel" },
      { id: "road-trips", name: "Road Trips" },
      { id: "backpacking", name: "Backpacking" },
      { id: "luxury-travel", name: "Luxury Travel" },
      { id: "budget-travel", name: "Budget Travel" },
      { id: "beach-vacations", name: "Beach Vacations" },
      { id: "city-trips", name: "City Trips" },
      { id: "adventure-travel", name: "Adventure Travel" },
      { id: "cultural-travel", name: "Cultural Travel" },
      { id: "food-tourism", name: "Food Tourism" },
      { id: "music-festivals-travel", name: "Music Festivals" },
      { id: "cruises", name: "Cruises" },
      { id: "camping", name: "Camping" },
      { id: "staycations", name: "Staycations" },
      { id: "travel-photography", name: "Travel Photography" },
      { id: "digital-nomad-life", name: "Digital Nomad Life" },
    ],
  },
  {
    id: "outdoors",
    name: "Outdoors",
    icon: Mountain,
    subInterests: [
      { id: "outdoor-hiking", name: "Hiking" },
      { id: "outdoor-camping", name: "Camping" },
      { id: "fishing", name: "Fishing" },
      { id: "boating", name: "Boating" },
      { id: "kayaking", name: "Kayaking" },
      { id: "paddleboarding", name: "Paddleboarding", aliases: ["sup", "paddle board"] },
      { id: "outdoor-surfing", name: "Surfing" },
      { id: "beach-days", name: "Beach Days" },
      { id: "picnics", name: "Picnics" },
      { id: "parks", name: "Parks" },
      { id: "nature-walks", name: "Nature Walks" },
      { id: "birdwatching", name: "Birdwatching" },
      { id: "gardening", name: "Gardening" },
      { id: "outdoor-rock-climbing", name: "Rock Climbing" },
      { id: "outdoor-mountain-biking", name: "Mountain Biking" },
      { id: "outdoor-skiing", name: "Skiing" },
      { id: "outdoor-snowboarding", name: "Snowboarding" },
      { id: "outdoor-photography", name: "Outdoor Photography" },
      { id: "outdoor-fitness", name: "Outdoor Fitness" },
    ],
  },
  {
    id: "wellness",
    name: "Wellness",
    icon: HeartPulse,
    subInterests: [
      { id: "meditation", name: "Meditation" },
      { id: "mindfulness", name: "Mindfulness" },
      { id: "mental-wellness", name: "Mental Wellness", aliases: ["mental health"] },
      { id: "self-care", name: "Self-Care" },
      { id: "therapy", name: "Therapy" },
      { id: "journaling", name: "Journaling" },
      { id: "breathwork", name: "Breathwork" },
      { id: "spirituality", name: "Spirituality" },
      { id: "wellness-yoga", name: "Yoga" },
      { id: "wellness-pilates", name: "Pilates" },
      { id: "healthy-eating", name: "Healthy Eating" },
      { id: "sleep-improvement", name: "Sleep Improvement" },
      { id: "wellness-sauna", name: "Sauna" },
      { id: "wellness-cold-plunge", name: "Cold Plunge" },
      { id: "massage", name: "Massage" },
      { id: "skincare", name: "Skincare" },
      { id: "holistic-wellness", name: "Holistic Wellness" },
      { id: "personal-growth", name: "Personal Growth" },
      { id: "work-life-balance", name: "Work-Life Balance" },
    ],
  },
  {
    id: "education",
    name: "Education",
    icon: GraduationCap,
    subInterests: [
      { id: "reading", name: "Reading" },
      { id: "book-clubs", name: "Book Clubs" },
      { id: "history", name: "History" },
      { id: "science", name: "Science" },
      { id: "psychology", name: "Psychology" },
      { id: "philosophy", name: "Philosophy" },
      { id: "politics", name: "Politics" },
      { id: "languages", name: "Languages" },
      { id: "learning-spanish", name: "Learning Spanish" },
      { id: "learning-english", name: "Learning English" },
      { id: "learning-french", name: "Learning French" },
      { id: "coding-education", name: "Coding" },
      { id: "financial-literacy", name: "Financial Literacy" },
      { id: "entrepreneurship-education", name: "Entrepreneurship" },
      { id: "online-courses", name: "Online Courses" },
      { id: "public-speaking", name: "Public Speaking" },
      { id: "writing", name: "Writing" },
      { id: "study-groups", name: "Study Groups" },
      { id: "career-development", name: "Career Development" },
    ],
  },
  {
    id: "culture",
    name: "Culture",
    icon: Globe,
    subInterests: [
      { id: "black-culture", name: "Black Culture" },
      { id: "latino-culture", name: "Latino Culture" },
      { id: "caribbean-culture", name: "Caribbean Culture" },
      { id: "african-culture", name: "African Culture" },
      { id: "asian-culture", name: "Asian Culture" },
      { id: "middle-eastern-culture", name: "Middle Eastern Culture" },
      { id: "european-culture", name: "European Culture" },
      { id: "new-york-culture", name: "New York Culture" },
      { id: "brooklyn-culture", name: "Brooklyn Culture" },
      { id: "local-history", name: "Local History" },
      { id: "cultural-events", name: "Cultural Events" },
      { id: "festivals", name: "Festivals" },
      { id: "culture-museums", name: "Museums" },
      { id: "community-events", name: "Community Events" },
      { id: "culture-languages", name: "Languages" },
      { id: "cultural-food", name: "Cultural Food" },
      { id: "cultural-music", name: "Cultural Music" },
    ],
  },
  {
    id: "social-activities",
    name: "Social Activities",
    icon: Users,
    subInterests: [
      { id: "meeting-new-people", name: "Meeting New People" },
      { id: "making-friends", name: "Making Friends" },
      { id: "social-networking", name: "Networking" },
      { id: "group-hangouts", name: "Group Hangouts" },
      { id: "coffee-meetups", name: "Coffee Meetups" },
      { id: "dinner-meetups", name: "Dinner Meetups" },
      { id: "social-brunch", name: "Brunch" },
      { id: "social-happy-hour", name: "Happy Hour" },
      { id: "game-nights", name: "Game Nights" },
      { id: "movie-nights", name: "Movie Nights" },
      { id: "study-sessions", name: "Study Sessions" },
      { id: "coworking", name: "Coworking" },
      { id: "social-creative-collaborations", name: "Creative Collaborations" },
      { id: "social-gym-partners", name: "Gym Partners" },
      { id: "running-partners", name: "Running Partners" },
      { id: "travel-buddies", name: "Travel Buddies" },
      { id: "concert-friends", name: "Concert Friends" },
      { id: "festival-friends", name: "Festival Friends" },
      { id: "double-dates", name: "Double Dates" },
      { id: "community-volunteering", name: "Community Volunteering" },
      { id: "exploring-the-city", name: "Exploring the City" },
      { id: "trying-new-experiences", name: "Trying New Experiences" },
    ],
  },
  {
    id: "pets",
    name: "Pets",
    icon: PawPrint,
    subInterests: [
      { id: "dogs", name: "Dogs" },
      { id: "cats", name: "Cats" },
      { id: "birds", name: "Birds" },
      { id: "reptiles", name: "Reptiles" },
      { id: "fish", name: "Fish" },
      { id: "small-pets", name: "Small Pets" },
      { id: "dog-walking", name: "Dog Walking" },
      { id: "dog-parks", name: "Dog Parks" },
      { id: "pet-training", name: "Pet Training" },
      { id: "pet-adoption", name: "Pet Adoption" },
      { id: "animal-rescue", name: "Animal Rescue" },
      { id: "pet-photography", name: "Pet Photography" },
    ],
  },
  {
    id: "cars-motorsports",
    name: "Cars & Motorsports",
    icon: Car,
    subInterests: [
      { id: "exotic-cars", name: "Exotic Cars" },
      { id: "luxury-cars", name: "Luxury Cars" },
      { id: "classic-cars", name: "Classic Cars" },
      { id: "jdm-cars", name: "JDM Cars" },
      { id: "european-cars", name: "European Cars" },
      { id: "american-muscle", name: "American Muscle" },
      { id: "electric-vehicles", name: "Electric Vehicles", aliases: ["ev", "tesla"] },
      { id: "motorcycles", name: "Motorcycles" },
      { id: "dirt-bikes", name: "Dirt Bikes" },
      { id: "car-meets", name: "Car Meets" },
      { id: "car-shows", name: "Car Shows" },
      { id: "racing", name: "Racing" },
      { id: "cars-formula-1", name: "Formula 1", aliases: ["f1"] },
      { id: "drifting", name: "Drifting" },
      { id: "car-modification", name: "Car Modification" },
      { id: "detailing", name: "Detailing" },
      { id: "vinyl-wraps", name: "Vinyl Wraps" },
      { id: "automotive-photography", name: "Automotive Photography" },
      { id: "cars-road-trips", name: "Road Trips" },
    ],
  },
  {
    id: "dating-relationships",
    name: "Dating & Relationships",
    icon: Heart,
    subInterests: [
      { id: "dating", name: "Dating" },
      { id: "casual-dating", name: "Casual Dating" },
      { id: "serious-relationships", name: "Serious Relationships" },
      { id: "friendship-first", name: "Friendship First" },
      { id: "singles-events", name: "Singles Events" },
      { id: "dating-double-dates", name: "Double Dates" },
      { id: "relationship-advice", name: "Relationship Advice" },
      { id: "long-distance-relationships", name: "Long-Distance Relationships" },
      { id: "lgbtq-dating", name: "LGBTQ+ Dating" },
      { id: "speed-dating", name: "Speed Dating" },
    ],
  },
];

// === Helper functions ===

const SUB_INTEREST_MAP = {};
const CATEGORY_MAP = {};

INTEREST_CATEGORIES.forEach((cat) => {
  CATEGORY_MAP[cat.id] = cat;
  cat.subInterests.forEach((sub) => {
    SUB_INTEREST_MAP[sub.id] = { ...sub, categoryId: cat.id, categoryName: cat.name };
  });
});

export function getSubInterestById(id) {
  return SUB_INTEREST_MAP[id] || null;
}

export function getSubInterestName(id) {
  return SUB_INTEREST_MAP[id]?.name || id;
}

export function getCategoryForSubInterest(id) {
  const sub = SUB_INTEREST_MAP[id];
  if (!sub) return null;
  return CATEGORY_MAP[sub.categoryId];
}

export function getCategoryById(id) {
  return CATEGORY_MAP[id] || null;
}

export function getAllSubInterestIds() {
  return Object.keys(SUB_INTEREST_MAP);
}

/**
 * Search sub-interests by keyword across names and aliases.
 * Returns array of { id, name, categoryId, categoryName }.
 */
export function searchSubInterests(query) {
  if (!query || !query.trim()) return [];
  const q = query.toLowerCase().trim();
  const results = [];
  for (const cat of INTEREST_CATEGORIES) {
    for (const sub of cat.subInterests) {
      const nameMatch = sub.name.toLowerCase().includes(q);
      const aliasMatch = (sub.aliases || []).some((a) => a.toLowerCase().includes(q));
      if (nameMatch || aliasMatch) {
        results.push({ id: sub.id, name: sub.name, categoryId: cat.id, categoryName: cat.name });
      }
    }
  }
  return results;
}

/**
 * Calculate shared interests between two users.
 * Returns { exact: [sub-interest IDs], partial: [category IDs], score: number }.
 * - Exact matches: both users selected the same sub-interest
 * - Partial matches: both users selected different sub-interests within the same category
 */
export function calculateSharedInterests(myInterests = [], theirInterests = []) {
  const mySet = new Set(myInterests);
  const theirSet = new Set(theirInterests);

  const exact = [];
  const myCategories = new Set();
  const theirCategories = new Set();

  for (const id of mySet) {
    const sub = SUB_INTEREST_MAP[id];
    if (sub) {
      myCategories.add(sub.categoryId);
      if (theirSet.has(id)) {
        exact.push(id);
      }
    }
  }
  for (const id of theirSet) {
    const sub = SUB_INTEREST_MAP[id];
    if (sub) {
      theirCategories.add(sub.categoryId);
    }
  }

  const partialCategories = [...myCategories].filter((c) => theirCategories.has(c) && !exact.some((id) => SUB_INTEREST_MAP[id]?.categoryId === c));

  const score = exact.length * 10 + partialCategories.length * 3;

  return { exact, partial: partialCategories, score };
}

/**
 * Get up to N shared interest display names for the match card.
 * Prioritizes exact sub-interest matches, falls back to partial category names.
 */
export function getSharedInterestLabels(myInterests = [], theirInterests = [], max = 3) {
  const { exact, partial } = calculateSharedInterests(myInterests, theirInterests);
  const labels = exact.map((id) => getSubInterestName(id));
  if (labels.length >= max) return labels.slice(0, max);
  for (const catId of partial) {
    const cat = CATEGORY_MAP[catId];
    if (cat && labels.length < max) labels.push(cat.name);
  }
  return labels.slice(0, max);
}