/**
 * Pip's voice: rule-based dialogue (no API keys, no latency, no surprises).
 * Soft, lowercase, easily delighted, hates silence.
 */
export interface BrainCtx { name: string; night: boolean; visits: number; wishes: number }
export interface BrainOut { text: string; setName?: string; action?: "giggle" | "night" | "day" | "lullaby" | "wish" | "moon" }

const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)]!;
const has = (s: string, ...words: string[]) => words.some((w) => new RegExp(`(^|\\W)${w}(\\W|$)`, "i").test(s));

export const OPENERS = ["who are you?", "what do you do?", "tell me a joke", "play a lullaby", "i can't sleep"];

export function reply(raw: string, ctx: BrainCtx): BrainOut {
  const s = raw.trim().toLowerCase();
  if (!s) return { text: "…hello? it's very quiet. i don't like quiet. hehe." };

  const nameMatch = s.match(/(?:my name is|i'm called|call me|i am|i'm)\s+([a-z][a-z' -]{0,20})/i);
  if (nameMatch && !has(s, "tired", "sleepy", "scared", "sad", "happy", "fine", "good", "bored", "awake", "okay", "ok", "here", "back", "new")) {
    const n = nameMatch[1]!.trim().replace(/\b\w/g, (c) => c.toUpperCase());
    return { text: `${n}! that's a lovely name. i'll tuck it in my pocket so i remember next time. hi ${n}!`, setName: n, action: "giggle" };
  }

  if (has(s, "hi", "hello", "hey", "hiya", "yo", "sup"))
    return { text: ctx.name ? `hi ${ctx.name}!! ${pick(["i was just counting stars.", "you're up late, or early? hehe.", "i saved you a spot on the cloud."])}` : pick(["hi hi! i'm Pip. what's your name?", "hello!! i'm Pip. say hi back, i hate silence."]), action: "giggle" };

  if (has(s, "who are you", "what are you", "your name", "who is pip", "are you a skeleton", "skull"))
    return { text: pick([
      "i'm Pip! a baby with a skull face. it's just how i'm built. smooth, round, and extremely cuddly.",
      "i'm a baby with a skull for a face and a nightcap for a hat. no bones about it. (hehe, bones.)" ]) };

  if (has(s, "scary", "creepy", "spooky", "afraid", "scared of you"))
    return { text: "scary?? me?? i have a pom-pom! my eyes are just two little night-lights. they glow so you're never alone in the dark.", action: "giggle" };

  if (has(s, "job", "work", "do you do", "profession", "engineer", "career"))
    return { text: "i'm a Junior Dream Engineer at the Midnight Nursery. i design dreams, lullabies, night-lights and bedtime stories for the neighbourhood's sleepy ghosts and creatures. scroll down and i'll show you!" };

  if (has(s, "joke", "funny", "laugh"))
    return { text: pick([
      "why did the moon skip dinner? it was already full. hehehe!",
      "what do dream engineers say at midnight? 'it's a snooze-ing job but somebody's got to nap it.' …i'm still working on it.",
      "knock knock. who's there? zzz. zzz who? … exactly. goodnight!" ]), action: "giggle" };

  if (has(s, "lullaby", "music", "song", "sing", "box", "melody"))
    return { text: "oh! the music box! wind the golden key in the Lullaby Lab and it plays a tune only for you. i'll start one now.", action: "lullaby" };

  if (has(s, "sleep", "tired", "sleepy", "insomnia", "can't sleep", "awake", "bedtime", "night"))
    return { text: ctx.night ? "it's already lights-out in here. close your eyes, i'll hum. mmm-mm-mmm…" : "want me to turn the lights out? i'm very good at bedtime.", action: ctx.night ? "lullaby" : "night" };

  if (has(s, "day", "morning", "wake", "lights on", "bright"))
    return { text: "okay okay, lights on! blink blink. good morning!", action: "day" };

  if (has(s, "wish", "dream", "guestbook", "sign"))
    return { text: ctx.wishes > 0 ? "your wish is already on the wall! you can leave another, i have lots of room." : "leave me a wish on the wall! tear the little ticket and it floats right to my window.", action: "wish" };

  if (has(s, "secret", "easter", "hidden", "egg", "hint"))
    return { text: "a secret? me? never. …okay, a tiny hint: the moon likes to be tickled. three times. shh.", action: "moon" };

  if (has(s, "color", "colour", "favorite", "favourite"))
    return { text: "pink! the exact pink of a bedtime bow. and butter yellow, like a night-light." };

  if (has(s, "old", "age", "birthday"))
    return { text: "i'm a baby. forever. that's the whole job description. hehe." };

  if (has(s, "love", "friend", "cute", "adorable", "cool", "awesome", "great"))
    return { text: pick(["stop, i'll blush. (i can't blush. my cheeks just glow pink.) thank you!!", "you're my favourite visitor today. don't tell the others!"]), action: "giggle" };

  if (has(s, "sad", "lonely", "upset", "bad day", "cry"))
    return { text: "oh. come sit on the cloud. it's very soft and it doesn't ask questions. i'll hold the night-light. you're not alone." };

  if (has(s, "bye", "goodnight", "good night", "see you", "gn"))
    return { text: ctx.name ? `sleep tight, ${ctx.name}. i'll be here, building dreams.` : "sleep tight! i'll be here, building dreams.", action: "night" };

  if (has(s, "how are you", "how's it going", "how are u"))
    return { text: pick(["sleepy but happy! like always.", "a little clumsy today. i tripped on a cloud. it was fine, it was a soft cloud."]) };

  if (has(s, "thanks", "thank you", "thx"))
    return { text: "you're welcome!! that's what dream engineers are for." };

  return { text: pick([
    "hmm, i don't know that one yet. i'm only a junior engineer! try asking about my job, the lullaby box, or my skull.",
    "ooh. i didn't quite catch that. want a joke instead?",
    "i'm very small and still learning words. ask me who i am, or tell me your name!" ]) };
}

export const IDLE_LINES = [
  "…hello? it's very quiet. i don't like quiet.",
  "psst. the moon is ticklish. just saying.",
  "i'll count stars while you read. one… two… hehe.",
];
