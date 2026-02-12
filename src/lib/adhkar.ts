export interface AdhkarItem {
  title: string;
  arabic?: string;
  meaning: string;
  target: number;
  reference?: string;
  virtue?: string;
  hadith?: string;
}

export interface AdhkarCollection {
  id: string;
  title: string;
  description: string;
  category: 'morning' | 'evening' | 'post-prayer' | 'sleep' | 'general';
  items: AdhkarItem[];
}

export const ADHKAR_PRESETS: AdhkarItem[] = [
  {
    title: "SubhanAllah",
    arabic: "سُبْحَانَ اللَّهِ",
    meaning: "Glory be to Allah",
    target: 33,
    virtue: "A tree is planted in Paradise for each recitation",
    hadith: "Whoever says 'SubhanAllah' 100 times, his sins are forgiven even if they are like the foam of the sea. (Bukhari)"
  },
  {
    title: "Alhamdulillah",
    arabic: "الْحَمْدُ لِلَّهِ",
    meaning: "Praise be to Allah",
    target: 33,
    virtue: "Fills the scale with good deeds",
    hadith: "Saying 'Alhamdulillah' fills the scales. (Muslim)"
  },
  {
    title: "Allahu Akbar",
    arabic: "اللَّهُ أَكْبَرُ",
    meaning: "Allah is the Greatest",
    target: 33,
    virtue: "Fills what is between the heavens and earth",
    hadith: "Saying 'Allahu Akbar' fills what is between the heavens and the earth. (Muslim)"
  },
  {
    title: "Astaghfirullah",
    arabic: "أَسْتَغْفِرُ اللَّهَ",
    meaning: "I seek forgiveness from Allah",
    target: 100,
    virtue: "Relief from distress and increase in provision",
    hadith: "Whoever regularly seeks forgiveness, Allah will appoint for him a way out of every distress and relief from every worry. (Abu Dawud)"
  },
  {
    title: "La ilaha illa Allah",
    arabic: "لَا إِلَهَ إِلَّا اللَّهُ",
    meaning: "There is no deity but Allah",
    target: 100,
    virtue: "Best form of dhikr, enters Paradise",
    hadith: "The best dhikr is 'La ilaha illa Allah'. (Tirmidhi)"
  },
  {
    title: "Salawat",
    arabic: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ",
    meaning: "Blessings upon the Prophet",
    target: 100,
    virtue: "Allah sends 10 blessings upon you for each one",
    hadith: "Whoever sends blessings upon me once, Allah will send blessings upon him tenfold. (Muslim)"
  },
  {
    title: "SubhanAllah wa bihamdihi",
    arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
    meaning: "Glory be to Allah and His Praise",
    target: 100,
    virtue: "Light on the tongue, heavy on the scale",
    hadith: "Two words light on the tongue, heavy on the scale, beloved to the Most Merciful: SubhanAllah wa bihamdihi, SubhanAllah al-Azim. (Bukhari)"
  },
  {
    title: "La hawla wa la quwwata illa billah",
    arabic: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
    meaning: "No power nor strength except by Allah",
    target: 100,
    virtue: "A treasure of Paradise, cure for 99 ailments",
    hadith: "'La hawla wa la quwwata illa billah' is a treasure from the treasures of Paradise. (Bukhari)"
  }
];

export const ADHKAR_COLLECTIONS: AdhkarCollection[] = [
  {
    id: 'post-salah',
    title: 'Post-Salah Adhkar',
    description: 'Recited after each obligatory prayer',
    category: 'post-prayer',
    items: [
      {
        title: "Astaghfirullah",
        arabic: "أَسْتَغْفِرُ اللَّهَ",
        meaning: "I seek forgiveness from Allah",
        target: 3,
        reference: "After every prayer"
      },
      {
        title: "Allahumma antas-salam",
        arabic: "اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ",
        meaning: "O Allah, You are Peace and from You is peace. Blessed are You, O Owner of Majesty and Honor",
        target: 1
      },
      {
        title: "SubhanAllah",
        arabic: "سُبْحَانَ اللَّهِ",
        meaning: "Glory be to Allah",
        target: 33
      },
      {
        title: "Alhamdulillah",
        arabic: "الْحَمْدُ لِلَّهِ",
        meaning: "Praise be to Allah",
        target: 33
      },
      {
        title: "Allahu Akbar",
        arabic: "اللَّهُ أَكْبَرُ",
        meaning: "Allah is the Greatest",
        target: 33
      },
      {
        title: "Ayat al-Kursi",
        arabic: "آيَةُ الْكُرْسِيِّ",
        meaning: "Verse of the Throne (Surah Al-Baqarah: 255)",
        target: 1
      }
    ]
  },
  {
    id: 'morning',
    title: 'Morning Adhkar',
    description: 'Recited after Fajr prayer until sunrise',
    category: 'morning',
    items: [
      {
        title: "SubhanAllah wa bihamdihi",
        arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
        meaning: "Glory be to Allah and His Praise",
        target: 100,
        reference: "Muslim"
      },
      {
        title: "La ilaha illa Allah",
        arabic: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
        meaning: "None has the right to be worshipped but Allah alone, He has no partner, His is the dominion and His is the praise, and He is Able to do all things",
        target: 100,
        reference: "Bukhari & Muslim"
      },
      {
        title: "SubhanAllah wa bihamdihi 'adada khalqihi",
        arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ عَدَدَ خَلْقِهِ",
        meaning: "Glory be to Allah and praise Him as many as His creations",
        target: 3,
        reference: "Muslim"
      },
      {
        title: "Hasbiyallahu la ilaha illa Huwa",
        arabic: "حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ",
        meaning: "Allah is sufficient for me. There is no deity except Him. I have placed my trust in Him, and He is the Lord of the Great Throne",
        target: 7,
        reference: "Abu Dawud"
      },
      {
        title: "Allahumma bika asbahna",
        arabic: "اللَّهُمَّ بِكَ أَصْبَحْنَا وَبِكَ أَمْسَيْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ",
        meaning: "O Allah, by Your leave we have reached the morning and by Your leave we reach the evening, by Your leave we live and die, and unto You is our resurrection",
        target: 1
      },
      {
        title: "Surah Al-Ikhlas, Al-Falaq, An-Nas",
        arabic: "قُلْ هُوَ اللَّهُ أَحَدٌ ...",
        meaning: "The Three Qul (Surahs of Protection)",
        target: 3,
        reference: "Recite 3 times each after Fajr"
      }
    ]
  },
  {
    id: 'evening',
    title: 'Evening Adhkar',
    description: 'Recited after Asr prayer until sunset',
    category: 'evening',
    items: [
      {
        title: "SubhanAllah wa bihamdihi",
        arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
        meaning: "Glory be to Allah and His Praise",
        target: 100,
        reference: "Muslim"
      },
      {
        title: "La ilaha illa Allah",
        arabic: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
        meaning: "None has the right to be worshipped but Allah alone",
        target: 100,
        reference: "Bukhari & Muslim"
      },
      {
        title: "Allahumma bika amsayna",
        arabic: "اللَّهُمَّ بِكَ أَمْسَيْنَا وَبِكَ أَصْبَحْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ الْمَصِيرُ",
        meaning: "O Allah, by Your leave we have reached the evening and by Your leave we reach the morning...",
        target: 1
      },
      {
        title: "Surah Al-Ikhlas, Al-Falaq, An-Nas",
        arabic: "قُلْ هُوَ اللَّهُ أَحَدٌ ...",
        meaning: "The Three Qul (Surahs of Protection)",
        target: 3,
        reference: "Recite 3 times each after Asr"
      },
      {
        title: "Hasbiyallahu la ilaha illa Huwa",
        arabic: "حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ",
        meaning: "Allah is sufficient for me...",
        target: 7,
        reference: "Abu Dawud"
      }
    ]
  },
  {
    id: 'sleep',
    title: 'Before Sleep Adhkar',
    description: 'Recited before sleeping',
    category: 'sleep',
    items: [
      {
        title: "Ayat al-Kursi",
        arabic: "آيَةُ الْكُرْسِيِّ",
        meaning: "Verse of the Throne",
        target: 1,
        reference: "Protection throughout the night"
      },
      {
        title: "Surah Al-Ikhlas, Al-Falaq, An-Nas",
        arabic: "قُلْ هُوَ اللَّهُ أَحَدٌ ...",
        meaning: "The Three Qul",
        target: 3,
        reference: "Blow into hands and wipe over body"
      },
      {
        title: "SubhanAllah",
        arabic: "سُبْحَانَ اللَّهِ",
        meaning: "Glory be to Allah",
        target: 33
      },
      {
        title: "Alhamdulillah",
        arabic: "الْحَمْدُ لِلَّهِ",
        meaning: "Praise be to Allah",
        target: 33
      },
      {
        title: "Allahu Akbar",
        arabic: "اللَّهُ أَكْبَرُ",
        meaning: "Allah is the Greatest",
        target: 34
      },
      {
        title: "Allahumma bika namut",
        arabic: "اللَّهُمَّ بِاسْمِكَ أَمُوتُ وَأَحْيَا",
        meaning: "O Allah, in Your name I die and live",
        target: 1
      }
    ]
  },
  {
    id: 'general',
    title: 'General Dhikr',
    description: 'Can be recited at any time',
    category: 'general',
    items: [
      {
        title: "SubhanAllah wa bihamdihi wa subhanAllah al-azim",
        arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ وَسُبْحَانَ اللَّهِ الْعَظِيمِ",
        meaning: "Glory be to Allah and His Praise, Glory be to Allah the Supreme",
        target: 100,
        reference: "Two words light on tongue, heavy on scale"
      },
      {
        title: "La hawla wa la quwwata illa billah",
        arabic: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
        meaning: "No power nor strength except by Allah",
        target: 100,
        reference: "Treasure of Paradise"
      },
      {
        title: "Astaghfirullah",
        arabic: "أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ وَأَتُوبُ إِلَيْهِ",
        meaning: "I seek forgiveness from Allah the Supreme and repent to Him",
        target: 100,
        reference: "Sayyid al-Istighfar"
      },
      {
        title: "Salawat",
        arabic: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ",
        meaning: "O Allah, send blessings upon Muhammad and the family of Muhammad",
        target: 100,
        reference: "Bukhari"
      }
    ]
  }
];
