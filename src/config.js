// Single source of truth — saara copy, memories, games, letter & 3D cake flavours yahin se edit karo.
export const CONFIG = {
  friendName: "Urvisha",
  senderName: "Jeenish",
  editionTag: "PRODUCTION EDITION // GOOD FRIENDS",

  // Apni Gemini PNG image ko public/images/face.png par rakho — engine exact wahi PNG as-is draw karega
  imageSrc: "/images/face.png",
  audioSrc: "/audios/1.mp3",

  // 'audio' = exact 28.34s audio currentTime ke saath sync; ya custom number (seconds)
  drawSeconds: "audio",
  fallbackDrawSeconds: 28.34,

  // Sketch complete hone ke baad calm stillness pause (seconds)
  quietSeconds: 5,
  // Itne seconds baad ek subtle 'Aage badhein →' pill dikhega agar pehle aage badhna ho
  quietUnlockAfter: 2,

  // Voiceover synced subtitles (public/audios/1.mp3)
  voiceCaptions: [
    {
      start: 0.0,
      end: 4.4,
      text: "“She was beautiful, but not like those girls in magazines...”",
    },
    {
      start: 4.4,
      end: 7.4,
      text: "“She was beautiful, for the way she thought.”",
    },
    {
      start: 7.4,
      end: 12.6,
      text: "“She was beautiful, for the sparkle in her eyes when she talked about something she loved.”",
    },
    {
      start: 12.6,
      end: 18.2,
      text: "“She was beautiful, for her ability to make other people smile, even if she was sad.”",
    },
    {
      start: 18.2,
      end: 23.8,
      text: "“No, she wasn’t beautiful for something as temporary as her looks...”",
    },
    {
      start: 23.8,
      end: 28.5,
      text: "“She was beautiful, deep down to her soul.”",
    },
  ],

  // Stage 4: Sketch ke baad kuch punchy bestie lines
  intro: {
    speed: 20,
    gap: 2000,
    tail: 1000,
    lines: [
      "Acha sun *Dost*... ek second ke liye drama pause kar.",
      "College me hum ek-dusre ko *jaante tak nahi the*...",
      "Aur aaj? Sirf *4 meetups* aur *25,000+ messages* baad tu certified bestie hai ☕",
      "Koi filmy cliché nahi — bas *100% unfiltered dosti* aur humari asli story ✦",
    ],
  },

  // Stage 5: Real Memories Archive (WhatsApp Origin + Stats + 4 Real-Life Meets)
  memories: {
    eyebrow: "OUR ARCHIVE // UNKNOWN TO BESTIES",
    title: "4 Meetups, 25,000+ Chats & One Silly Reply",
    subtitle:
      "Hum roz nahi milte — par jab bhi mile aur jitni bhi baat ki, har moment legendary ban gaya.",

    chatCard: {
      groupName: "BCA 2022–25 Batch Reunion",
      groupMeta: "19 March ko group bana · 23 March ko story shuru hui",
      events: [
        {
          type: "system",
          text: "19 March · BCA 2022–25 reunion group created",
        },
        {
          type: "system",
          text: "23 March, 11:26 AM · Common friend added you...",
        },
        {
          type: "incoming",
          sender: "Bestie",
          time: "2:10 PM",
          text: "who is jenishh",
        },
        {
          type: "outgoing",
          sender: "Jeenish",
          time: "2:19 PM",
          text: "I'm.",
        },
      ],
      caption:
        "Tab tak hum college me ek-dusre ke liye bilkul unknown the — aur is 3-letter silly reply se sab shuru hua 😂",
    },

    stats: [
      { value: "04", label: "Total Meets" },
      { value: "25K+", label: "Insta Chats (Apr–Nov)" },
      { value: "2 km", label: "Shared Way" },
      { value: "05 Apr", label: "Insta Shift" },
    ],

    timeline: [
      {
        tag: "CHAPTER 00 · 05 APRIL",
        title: "Reunion Talks → Instagram DMs",
        place: "Online · Apr se Nov tak 25,000+ messages",
        detail:
          "23 March ke us “I’m.” reply ke baad reunion ki baatein personal DMs me aayin. Jobs, friends aur college nostalgia par baat karte-karte 25,000+ messages kab ho gaye pata hi nahi chala.",
      },
      {
        tag: "MEET 01 · 08 AUGUST",
        title: "Food Adda (~2 Hours Lunch)",
        place: "Food Adda · First Real-Life Meet",
        detail:
          "Months ki online bakwaas ke baad pehli baar saamne mile Food Adda par. Sirf ~2 ghante ka lunch catch-up tha, par laga hi nahi ki pehli baar mil rahe hain.",
      },
      {
        tag: "MEET 02 · 06 OCTOBER",
        title: "Birthday Chocolates Run",
        place: "6th Oct · Jeenish’s Birthday",
        detail:
          "Mere birthday ke din bas ek choti si mulaqaat — specially chocolates dene aaya tha taaki birthday celebration me bestie ka hissa pakka rahe.",
      },
      {
        tag: "MEET 03 · 07 OCTOBER",
        title: "The Return Birthday Gift",
        place: "7th Oct · Next Day Surprise",
        detail:
          "Ek din baad hi tera return surprise — jab tu specially birthday gift dene aayi. Short meet, par full-on memorable.",
      },
      {
        tag: "MEET 04 · 21 OCTOBER",
        title: "2 km Office × College Way",
        place: "21st Oct · Shared Route",
        detail:
          "Chauthi mulaqaat — main apne office ki taraf aur tu apne college ki taraf, and we shared the way...",
      },
    ],
  },

  // Stage 6: Best-Best Games (2 mini-games built on your actual memories)
  games: {
    badge: "BESTIE QNA ARCADE",
    title: "Mail kholne se pehle 2 chote tests pass karne padenge",
    subtitle:
      "Dekhte hain kitni asli bestie hai tu — saare questions humari real story se hain.",
    quiz: {
      title: "Round 01 · Memory Check (Sach Ya Drama?)",
      rounds: [
        {
          prompt: "Tum mujhe “Thobaro“ bolti ho, kab bandh karogi...🥱",
          options: [
            {
              label: "“Kabhi Nahi”",
              verdict: "Ba na! Itna bhi deserve nahi karta kya tujhse? 😒",
              ok: false,
            },
            {
              label: "“Aaj Abhi Se“",
              verdict:
                "Ye hui na baat! Thanksss dude ab mujhe koi wo word nahi bolege... 😎",
              ok: true,
            },
          ],
        },
        {
          prompt:
            "Maine ab tak kitni 100+ silks mangi hai, tune usme se kitni di hai??",
          options: [
            {
              label: "Zero - Ek Bhi Nahi",
              verdict:
                "SPOT ON ✓ Ek Bhi Nahi Di, Tumhe nahi lagta deni chahiye...!",
              ok: true,
            },
            {
              label: "Bahot Sari",
              verdict: "Error 404: Zuthhhh mat bol, paapp lagega! 😒",
              ok: false,
            },
          ],
        },
        {
          prompt: "Kaisa laga mera dost ban kar?",
          options: [
            {
              label: "Bahott Hi Achha",
              verdict:
                "BULLSEYE ✓ Wohoooo ✨ I hope you rock & shine next year...!",
              ok: true,
            },
            {
              label: "Bekarr, Maza Nahi Aaya",
              verdict: "Httttttttttttttttttttttttttttt Boghi, Dobii! 🫵",
              ok: false,
            },
          ],
        },
      ],
    },
    popper: {
      title: "Round 02 · 25K Chats & Chai Pop Rush",
      instruction:
        "Sealed mail ka wax stamp unlock karne ke liye 10 floating memory tokens pop karo!",
      targetCount: 10,
      tokens: ["✦", "☕", "🍫", "💬", "🎧", "★"],
    },
  },

  // Stage 7: Envelope Mail -> Best Line Extraction
  letter: {
    envelopeLabel: "CONFIDENTIAL // FOR BESTIE ONLY",
    sealHint: "Wax seal par tap karke mail kholo",
    greeting: "Dear Bestie,",
    typeSpeed: 18,
    paragraphs: [
      "Aaj tera birthday hai, toh socha thoda sa honest ho jaun — bina kisi cheesy filmy line ke. Kaun soch sakta tha ki 19 March ko banaye hue ek reunion group me, 23 March ko tere “who is jenishh” aur mere silly “I’m.” reply se itni solid dosti shuru hogi.",
      "College me hum ek-dusre ke liye bilkul unknown the, Phir bhi ab tak 25,000+ Insta chats me humne jobs, purane college days aur har random thought share kar liya.",
      "Duniya bhar ke fake filters ke beech, tu woh ek insaan hai jiske saamne bina soche apni har bakwaas aur har sach bol sakte hain — roz milna zaroori nahi hota, kyunki tu literal home-base bestie hai.",
      "Is naye saal me tujhe unlimited hasi, zero stress, badhiya chai aur woh saare dreams milein jo tu chupke se plan karti hai. Happy Birthday, Bestie!",
    ],
    // Mail me se sabse best iconic line jo spotlight me bahar niklegi:
    bestLine:
      "“Duniya bhar ke fake filters ke beech, tu woh ek insaan hai jiske saamne bina soche apni har bakwaas aur har sach bol sakte hain — roz milna zaroori nahi hota, kyunki tu literal home-base bestie hai.”",
    bestLineTag: "HIGHLIGHTED LINE FROM THE MAIL ✦",
    signOff: "Tera permanent chaos partner — Jeenish",
  },

  // Stage 8: Realistic 3D Studio Cakes
  cakes: [
    {
      id: "truffle",
      name: "Belgian Dark Truffle",
      subtitle: "70% cocoa sponge · espresso mascarpone · mirror ganache",
      sponge: "#4A281A",
      cream: "#D8B48A",
      frosting: "#2E1810",
      drip: "#180B07",
      accent: "#E8B84B",
      berry: "#8B1E3F",
    },
    {
      id: "dairy-milk-oreo",
      name: "Dairy Milk Oreo",
      subtitle:
        "Rich chocolate sponge · Oreo cookie cream · Dairy Milk chocolate ganache",
      sponge: "#4B2418",
      cream: "#E8D9C8",
      frosting: "#5A2E20",
      drip: "#3B1B16",
      accent: "#7B3F24",
      berry: "#21130F",
    },
    {
      id: "berry",
      name: "Madagascar Vanilla Berry",
      subtitle: "Vanilla bean sponge · whipped mascarpone · raspberry coulis",
      sponge: "#F2D399",
      cream: "#FFF9F0",
      frosting: "#F9EFE3",
      drip: "#C83E5B",
      accent: "#E8B84B",
      berry: "#A61C3C",
    },
    {
      id: "pistachio",
      name: "Royal Pistachio Saffron",
      subtitle: "Roasted pistachio sponge · saffron cream · white ganache",
      sponge: "#8AA878",
      cream: "#F6E6B4",
      frosting: "#DCE6D3",
      drip: "#F3EAD8",
      accent: "#D99B26",
      berry: "#5D7A4C",
    },
    {
      id: "caramel",
      name: "Salted Caramel Hazelnut",
      subtitle: "Toasted praline sponge · dulce cream · amber caramel glaze",
      sponge: "#9E6234",
      cream: "#F3DEC0",
      frosting: "#DFB686",
      drip: "#B8621B",
      accent: "#F2C94C",
      berry: "#6E3B1E",
    },
  ],

  cakeQuotes: [
    "Happy Birthday Bestie! Wish pakki samajhna ✦",
    "Ek slice khatam, ab next meetup ka plan shuru!",
    "Stay chaotic, stay real, stay legendary Bestie ★",
  ],

  // Stage 9: Grand Bestie Finale
  finale: {
    eyebrow: "CHAPTER 2026 // UNLOCKED",
    title: "Happy Birthday, Bestie!",
    wish: "Unknown classmates se lekar 25,000+ chats aur 4 yaadgar meetups tak — tere jaise genuine log bahut kam milte hain. Thanks for being my chatar-patar bestie!",
    closing: [
      "“who is jenishh” → “I’m.” se shuru hui kahani abhi bahut lambi chalegi.",
      "Cake khatam, par humari awaara plans aur chai sessions abhi baaki hain ✦",
    ],
  },

  partyColors: ["#E8B84B", "#D97736", "#5B8A72", "#6B9AC4", "#F4EFE6"],
};
