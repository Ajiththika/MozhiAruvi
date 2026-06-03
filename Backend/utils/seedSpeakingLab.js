import SpeakingLabItem from '../models/SpeakingLabItem.js';

/**
 * Starter Speaking Lab content — scales from basic phonetic sounds to advanced
 * colloquial fluency. Seeded ONLY when the collection is empty so it never
 * overwrites admin-authored drills.
 */
const starterItems = [
  // ── Difficulty 1–2 · Phonetic foundations ──────────────────────────────────
  { type: 'phonetic', difficulty: 1, order: 0, xp: 10, prompt: "Say the word for 'mother'.", tamilWord: 'அம்மா', phoneticHint: 'ammaa' },
  { type: 'phonetic', difficulty: 1, order: 1, xp: 10, prompt: "Say the word for 'water'.", tamilWord: 'தண்ணீர்', phoneticHint: 'thaṇṇīr' },
  { type: 'phonetic', difficulty: 1, order: 2, xp: 10, prompt: "Say the word for 'house'.", tamilWord: 'வீடு', phoneticHint: 'vīṭu' },
  { type: 'phonetic', difficulty: 2, order: 0, xp: 12, prompt: "Practise the ழ் sound — say 'Tamil'.", tamilWord: 'தமிழ்', phoneticHint: 'tamiḻ' },
  { type: 'phonetic', difficulty: 2, order: 1, xp: 12, prompt: "Practise the ள் sound — say 'sacrifice'.", tamilWord: 'வேள்வி', phoneticHint: 'vēḷvi' },
  { type: 'phonetic', difficulty: 2, order: 2, xp: 12, prompt: "Practise the ற் sound — say 'river'.", tamilWord: 'ஆறு', phoneticHint: 'āṟu' },

  // ── Difficulty 3 · Situational roleplays ────────────────────────────────────
  { type: 'roleplay', difficulty: 3, order: 0, xp: 15, prompt: 'Greet someone in the morning.', tamilWord: 'காலை வணக்கம்', phoneticHint: 'kālai vaṇakkam' },
  { type: 'roleplay', difficulty: 3, order: 1, xp: 15, prompt: 'Order a cup of tea at a shop.', tamilWord: 'ஒரு டீ வேண்டும்', phoneticHint: 'oru ṭī vēṇṭum' },
  { type: 'roleplay', difficulty: 3, order: 2, xp: 15, prompt: "Ask a friend 'how are you?'", tamilWord: 'எப்படி இருக்கீங்க', phoneticHint: 'eppaṭi irukkīṅka' },

  // ── Difficulty 4 · Verbal drag boards (sequence + speak) ────────────────────
  { type: 'dragboard', difficulty: 4, order: 0, xp: 18, prompt: "Arrange and say: 'I learn Tamil'.", sequence: ['நான்', 'தமிழ்', 'படிக்கிறேன்'], expectedAudioText: 'நான் தமிழ் படிக்கிறேன்' },
  { type: 'dragboard', difficulty: 4, order: 1, xp: 18, prompt: "Arrange and say: 'I am going home'.", sequence: ['நான்', 'வீட்டுக்கு', 'போகிறேன்'], expectedAudioText: 'நான் வீட்டுக்கு போகிறேன்' },

  // ── Difficulty 5 · Tongue twisters ──────────────────────────────────────────
  { type: 'tongue_twister', difficulty: 5, order: 0, xp: 20, prompt: 'Tongue twister — say it clearly!', tamilWord: 'நெல்லிக்காய் நல்ல காய்', phoneticHint: 'nellikkāy nalla kāy' },
  { type: 'tongue_twister', difficulty: 5, order: 1, xp: 20, prompt: 'Say this twister at speed.', tamilWord: 'சக்கரை சாப்பிட்ட சக்கரவர்த்தி', phoneticHint: 'sakkarai sāppiṭṭa sakkaravartti' },

  // ── Difficulty 6–7 · Colloquial fluency ─────────────────────────────────────
  { type: 'fluency', difficulty: 6, order: 0, xp: 22, prompt: 'Say this fluently: "I really like Tamil".', tamilWord: 'எனக்கு தமிழ் ரொம்ப பிடிக்கும்', phoneticHint: 'enakku tamiḻ romba piṭikkum' },
  { type: 'fluency', difficulty: 7, order: 0, xp: 25, prompt: 'Advanced line — say it naturally.', tamilWord: 'இன்னைக்கு வானிலை ரொம்ப நல்லா இருக்கு', phoneticHint: 'innaikku vānilai romba nallā irukku' },
];

export async function seedSpeakingLab() {
  try {
    const count = await SpeakingLabItem.estimatedDocumentCount();
    if (count > 0) {
      return; // Admin/content already present — never overwrite.
    }
    await SpeakingLabItem.insertMany(starterItems);
    console.log(`✅ Seeded ${starterItems.length} starter Speaking Lab activities.`);
  } catch (e) {
    console.error('❌ Speaking Lab seeding failed:', e.message);
  }
}
