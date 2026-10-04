import { ScriptPreset, CEFRLevel } from '../types'

export interface CEFRLevelDetail {
  level: CEFRLevel
  title: string
  sublabel: string
  badgeClass: string
  borderClass: string
  bgClass: string
  activeRing: string
  description: string
}

export const CEFR_LEVELS_CONFIG: Record<CEFRLevel, CEFRLevelDetail> = {
  A1: {
    level: 'A1',
    title: 'A1 - Beginner',
    sublabel: 'Everyday Basics',
    badgeClass: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
    borderClass: 'border-emerald-500/30 hover:border-emerald-500/60',
    bgClass: 'bg-emerald-500/10',
    activeRing: 'ring-emerald-500 border-emerald-500',
    description: 'Basic everyday expressions, introductions, and simple daily routines.',
  },
  A2: {
    level: 'A2',
    title: 'A2 - Elementary',
    sublabel: 'Daily Situations',
    badgeClass: 'text-teal-400 bg-teal-500/15 border-teal-500/30',
    borderClass: 'border-teal-500/30 hover:border-teal-500/60',
    bgClass: 'bg-teal-500/10',
    activeRing: 'ring-teal-500 border-teal-500',
    description: 'Simple communications regarding shopping, directions, and leisure plans.',
  },
  B1: {
    level: 'B1',
    title: 'B1 - Intermediate',
    sublabel: 'Travel & Real Life',
    badgeClass: 'text-sky-400 bg-sky-500/15 border-sky-500/30',
    borderClass: 'border-sky-500/30 hover:border-sky-500/60',
    bgClass: 'bg-sky-500/10',
    activeRing: 'ring-sky-500 border-sky-500',
    description: 'Travel journeys, hotel stays, health inquiries, and descriptive narratives.',
  },
  B2: {
    level: 'B2',
    title: 'B2 - Upper-Intermediate',
    sublabel: 'Work & Discourse',
    badgeClass: 'text-indigo-400 bg-indigo-500/15 border-indigo-500/30',
    borderClass: 'border-indigo-500/30 hover:border-indigo-500/60',
    bgClass: 'bg-indigo-500/10',
    activeRing: 'ring-indigo-500 border-indigo-500',
    description: 'Job interviews, remote collaboration, environmental debates, and abstract topics.',
  },
  C1: {
    level: 'C1',
    title: 'C1 - Advanced',
    sublabel: 'Academic & Professional',
    badgeClass: 'text-purple-400 bg-purple-500/15 border-purple-500/30',
    borderClass: 'border-purple-500/30 hover:border-purple-500/60',
    bgClass: 'bg-purple-500/10',
    activeRing: 'ring-purple-500 border-purple-500',
    description: 'Artificial intelligence ethics, global economic markets, and stoic philosophy.',
  },
  C2: {
    level: 'C2',
    title: 'C2 - Mastery',
    sublabel: 'Proficiency & Rhetoric',
    badgeClass: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
    borderClass: 'border-amber-500/30 hover:border-amber-500/60',
    bgClass: 'bg-amber-500/10',
    activeRing: 'ring-amber-500 border-amber-500',
    description: 'Diplomatic rhetoric, literary mastery, and demanding articulatory tongue twisters.',
  },
}

export const ALL_CEFR_LEVELS: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

export const PRESET_SCRIPTS: ScriptPreset[] = [
  // ── A1 LEVEL (Beginner) ──────────────────────────────────────────────────
  {
    id: 'a1-greetings',
    title: 'Daily Greetings & Introductions',
    category: 'Everyday Basics',
    level: 'A1',
    difficulty: 'Beginner',
    emoji: '👋',
    description: 'Fundamental phrases for introducing yourself and meeting someone new.',
    content: `Hello, my name is Alex and I am happy to meet you.
Where are you from?
I come from Spain, but I live in London now.
How are you doing today?
I am doing very well, thank you!
What is your favorite hobby?
I really enjoy reading books and listening to music.
Nice to talk with you, see you tomorrow!`
  },
  {
    id: 'a1-coffee-shop',
    title: 'Ordering at a Coffee Shop',
    category: 'Food & Drinks',
    level: 'A1',
    difficulty: 'Beginner',
    emoji: '☕',
    description: 'Natural phrases used when ordering drinks and breakfast at a café.',
    content: `Good morning! Can I get a medium caramel latte, please?
Would you like that hot or iced?
I would like it iced with oat milk, please.
Sure thing! Would you like a warm pastry with your order?
Yes, a chocolate croissant would be wonderful.
That will be six dollars and fifty cents.
Thank you, and have a fantastic day!`
  },
  {
    id: 'a1-family-home',
    title: 'My Family & Home',
    category: 'Family & Home',
    level: 'A1',
    difficulty: 'Beginner',
    emoji: '🏡',
    description: 'Simple, clear descriptions of family members, pets, and your living space.',
    content: `I live in a cozy apartment with my family.
I have an older brother and a younger sister.
We also have a friendly brown dog named Max.
My father loves cooking dinner in the kitchen.
My mother works as a teacher at the local school.
On Sunday mornings, we like to walk in the park together.`
  },

  // ── A2 LEVEL (Elementary) ────────────────────────────────────────────────
  {
    id: 'a2-city-directions',
    title: 'Asking for Directions in the City',
    category: 'Travel & City',
    level: 'A2',
    difficulty: 'Beginner',
    emoji: '🗺️',
    description: 'Practical conversations for navigating streets, subways, and landmarks.',
    content: `Excuse me, could you tell me how to get to the central library?
Sure, walk straight down this street for two blocks.
Turn right at the traffic lights next to the bank.
Is it far from here, or can I walk there easily?
It takes only about ten minutes on foot.
You will see the big glass building on your left.
Thank you so much for your assistance!`
  },
  {
    id: 'a2-shopping-clothes',
    title: 'Shopping for Clothes & Gifts',
    category: 'Shopping',
    level: 'A2',
    difficulty: 'Beginner',
    emoji: '🛍️',
    description: 'Useful dialogues for trying on clothes, asking sizes, and buying items.',
    content: `Hello, do you have this blue sweater in a medium size?
Let me check the storage room for you right away.
Yes, here you are! Would you like to try it on?
Where are the fitting rooms located?
The fitting rooms are just around the corner on your right.
It fits perfectly, and the material feels very soft.
Can I pay by credit card or with cash?`
  },
  {
    id: 'a2-weekend-weather',
    title: 'Weekend Plans & Weather',
    category: 'Daily Life',
    level: 'A2',
    difficulty: 'Beginner',
    emoji: '☀️',
    description: 'Talking about free time activities, hobbies, and weather forecasts.',
    content: `Do you have any exciting plans for this upcoming weekend?
I am going to visit the beach if the weather stays sunny.
The forecast predicts warm sunshine with a gentle breeze.
That sounds wonderful, who are you going with?
A couple of close friends from my university class.
We plan to play volleyball and watch the sunset together.`
  },

  // ── B1 LEVEL (Intermediate) ──────────────────────────────────────────────
  {
    id: 'b1-airport-travel',
    title: 'At the Airport & Travel Journey',
    category: 'Travel',
    level: 'B1',
    difficulty: 'Intermediate',
    emoji: '✈️',
    description: 'Navigating flight check-in, customs questions, baggage, and boarding gates.',
    content: `Excuse me, where is the check-in desk for flight twenty-four?
Please have your passport and boarding pass ready for inspection.
Did you pack these luggage bags yourself today?
Yes, and I do not have any prohibited liquids in my carry-on bag.
Your departure gate is B twelve and boarding begins shortly.
Could you please tell me where the currency exchange counter is?
It is located right past the security checkpoint on the third floor.
Enjoy your flight and have safe travels!`
  },
  {
    id: 'b1-hotel-stay',
    title: 'Hotel Booking & Inquiries',
    category: 'Hospitality',
    level: 'B1',
    difficulty: 'Intermediate',
    emoji: '🏨',
    description: 'Checking into a hotel, inquiring about amenities, and room services.',
    content: `Good afternoon, I have a reservation under the name Robinson.
Welcome! You are booked for three nights in a deluxe ocean-view suite.
Does the reservation include complimentary breakfast in the morning?
Yes, breakfast is served in the rooftop restaurant from seven to ten.
Is high-speed wireless internet available throughout the hotel?
Of course, here is your keycard and the network access code.
If you need any extra towels or room service, dial zero from your room.`
  },
  {
    id: 'b1-doctor-clinic',
    title: 'Doctor Consultation & Health',
    category: 'Healthcare',
    level: 'B1',
    difficulty: 'Intermediate',
    emoji: '🩺',
    description: 'Describing physical symptoms, taking medical advice, and discussing prescriptions.',
    content: `What seems to be bothering you today?
I have had a throbbing headache and a sore throat since yesterday.
Have you had any fever, chills, or difficulty breathing?
No fever, but I feel unusually fatigued and dehydrated.
I will listen to your chest and check your blood pressure.
It looks like a mild viral infection that needs rest and fluids.
Take this prescription twice a day after meals for five days.`
  },

  // ── B2 LEVEL (Upper-Intermediate) ────────────────────────────────────────
  {
    id: 'b2-job-interview',
    title: 'Tech & Career Interview',
    category: 'Professional',
    level: 'B2',
    difficulty: 'Intermediate',
    emoji: '💼',
    description: 'Polished responses for technical interviews, teamwork, and career achievements.',
    content: `Thank you for taking the time to speak with me today.
I have four years of experience building scalable web applications.
I love solving complex problems and collaborating with cross-functional teams.
In my previous project, we optimized system performance by forty percent.
How does your engineering team approach continuous deployment and testing?
We prioritize maintainable architecture, code reviews, and proactive communication.
I am genuinely excited about the opportunity to contribute to your company vision.`
  },
  {
    id: 'b2-remote-work',
    title: 'Remote Work & Digital Collaboration',
    category: 'Business & Culture',
    level: 'B2',
    difficulty: 'Intermediate',
    emoji: '💻',
    description: 'Debating modern workplace flexibility, async workflows, and productivity.',
    content: `Remote work has fundamentally reshaped how global teams collaborate.
Asynchronous communication allows team members to work across diverse time zones.
However, maintaining genuine connection requires intentional virtual social interactions.
Clear written documentation prevents bottlenecks and reduces unnecessary video meetings.
Finding a healthy boundary between work responsibilities and personal life is essential.
A hybrid model often combines the best aspects of autonomy and in-person collaboration.`
  },
  {
    id: 'b2-sustainability',
    title: 'Environmental Sustainability',
    category: 'Science & Society',
    level: 'B2',
    difficulty: 'Intermediate',
    emoji: '🌱',
    description: 'Discussions around renewable energy, urban planning, and ecological responsibility.',
    content: `Transitioning to renewable energy is crucial for combating global climate change.
Modern cities are investing heavily in solar infrastructure and electrified public transit.
Reducing single-use plastics requires systemic shifts in consumer packaging.
Sustainable agriculture practices protect fertile soil and conserve freshwater reserves.
Every community can make meaningful contributions toward carbon neutrality.
Technological innovation must go hand in hand with environmental stewardship.`
  },

  // ── C1 LEVEL (Advanced) ──────────────────────────────────────────────────
  {
    id: 'c1-ai-ethics',
    title: 'Artificial Intelligence & Ethics',
    category: 'Technology & Ethics',
    level: 'C1',
    difficulty: 'Advanced',
    emoji: '🤖',
    description: 'Complex analysis of algorithmic bias, automated decision systems, and cognitive philosophy.',
    content: `The proliferation of generative models poses unprecedented philosophical challenges.
Algorithmic transparency is vital to mitigate systemic bias in automated decisions.
We must carefully distinguish between synthetic linguistic fluency and genuine comprehension.
Regulatory frameworks often struggle to keep pace with exponential technological breakthroughs.
Ethical governance demands interdisciplinary collaboration between engineers and humanists.
Our primary responsibility is ensuring that transformative technologies advance human flourishing.`
  },
  {
    id: 'c1-economics-finance',
    title: 'Global Economics & Financial Markets',
    category: 'Finance & Economics',
    level: 'C1',
    difficulty: 'Advanced',
    emoji: '📈',
    description: 'Nuanced analysis of fiscal monetary policies, inflation, and market volatility.',
    content: `Central banks face a delicate balancing act between controlling inflation and fostering growth.
Disruptions in global supply chains inevitably trigger cascading price adjustments.
Emerging markets frequently experience heightened volatility during periods of monetary tightening.
Diversification across uncorrelated asset classes remains a cornerstone of risk management.
Long-term economic resilience depends upon structural reform rather than transient stimulus.
Investors must distinguish between cyclical fluctuations and fundamental secular shifts.`
  },
  {
    id: 'c1-wisdom-philosophy',
    title: 'Wisdom & Stoic Philosophy',
    category: 'Philosophy',
    level: 'C1',
    difficulty: 'Advanced',
    emoji: '🌟',
    description: 'Profound insights on human nature, fortitude, and the pursuit of meaningful purpose.',
    content: `We suffer more often in imagination than we do in reality.
True wisdom lies in discerning what is within our control and gracefully accepting what is not.
Success is not final, failure is not fatal: it is the steadfast courage to persevere that endures.
The obstacle that stands in the way of purposeful action frequently becomes the way itself.
He who has a clear why to live can bear almost any how.
Mastery is not a distant summit to conquer, but an ongoing devotion to craft and character.`
  },

  // ── C2 LEVEL (Mastery) ───────────────────────────────────────────────────
  {
    id: 'c2-diplomacy',
    title: 'Diplomatic Discourse & Statecraft',
    category: 'Diplomacy & Governance',
    level: 'C2',
    difficulty: 'Advanced',
    emoji: '🏛️',
    description: 'Sophisticated rhetoric, high-level diplomatic negotiation, and multilateral consensus.',
    content: `Multilateral diplomacy requires synthesizing seemingly irreconcilable geopolitical imperatives.
The ambassador articulated a compelling framework predicated on reciprocity and mutual deterrence.
Superficial concessions rarely resolve intractable disputes rooted in sovereignty and security.
Constructive ambiguity can bridge diplomatic impasses while preserving strategic flexibility.
Substantive progress hinges on verifiable compliance rather than declaratory platitudes.
Statesmanship is the rare art of anticipating consequences long before they manifest.`
  },
  {
    id: 'c2-literature',
    title: 'Literary Mastery & Poetic Prose',
    category: 'Literature & Art',
    level: 'C2',
    difficulty: 'Advanced',
    emoji: '📜',
    description: 'Rich prose exploring poignant imagery, timeless human longing, and evocative style.',
    content: `The twilight draped the ancient cobblestones in an ethereal mantle of melancholy.
Memories lingered like the faint aroma of incense in a long-abandoned sanctuary.
Language, when wielded with sublime craftsmanship, captures the elusive contours of human yearning.
Between the unspoken syllables lay an ocean of profound yearning and quiet reconciliation.
Time flows like an inexorable river, relentlessly smoothing the sharpest edges of grief.
Great literature does not merely reflect reality; it illuminates our capacity for empathy.`
  },
  {
    id: 'c2-tongue-twisters',
    title: 'Articulatory Precision & Twisters',
    category: 'Acoustic Precision',
    level: 'C2',
    difficulty: 'Advanced',
    emoji: '👅',
    description: 'Deceptively intricate phonetic sequences demanding impeccable articulation and cadence.',
    content: `She sells intricate seashells by the tempestuous seashore.
How can a clam cram in a clean cream can without collapsing?
Six sleek swans swam swiftly southwards through the swirling storm.
A proper cup of coffee from a proper copper coffee pot satisfies the soul.
Which wristwatches are Swiss wristwatches when wondrous watchmakers whisper?
The sixth sick sheik's sixth sheep is sick beyond therapeutic remedy.`
  },
]
