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
  category: 'morning' | 'evening' | 'post-prayer' | 'sleep' | 'general' | 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
  items: AdhkarItem[];
}

export type PrayerName = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export interface PrayerInfo {
  id: PrayerName;
  name: string;
  arabicName: string;
  time: string;
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

export const PRAYERS: PrayerInfo[] = [
  { id: 'fajr', name: 'Fajr', arabicName: 'الفجر', time: 'Dawn' },
  { id: 'dhuhr', name: 'Dhuhr', arabicName: 'الظهر', time: 'Noon' },
  { id: 'asr', name: 'Asr', arabicName: 'العصر', time: 'Afternoon' },
  { id: 'maghrib', name: 'Maghrib', arabicName: 'المغرب', time: 'Sunset' },
  { id: 'isha', name: 'Isha', arabicName: 'العشاء', time: 'Night' },
];

const COMMON_POST_SALAH: AdhkarItem[] = [
  {
    title: "Astaghfirullah",
    arabic: "أَسْتَغْفِرُ اللَّهَ",
    meaning: "I seek forgiveness from Allah",
    target: 3,
    reference: "After every prayer",
    hadith: "The Prophet ﷺ would say this three times after every obligatory prayer. (Muslim)"
  },
  {
    title: "Allahumma antas-salam",
    arabic: "اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ",
    meaning: "O Allah, You are Peace and from You is peace. Blessed are You, O Owner of Majesty and Honor",
    target: 1,
    hadith: "The Prophet ﷺ would say this immediately after the Taslim. (Muslim)"
  },
  {
    title: "SubhanAllah",
    arabic: "سُبْحَانَ اللَّهِ",
    meaning: "Glory be to Allah",
    target: 33,
    hadith: "Whoever says SubhanAllah 33 times after every prayer, his sins will be forgiven even if they are like the foam of the sea. (Muslim)"
  },
  {
    title: "Alhamdulillah",
    arabic: "الْحَمْدُ لِلَّهِ",
    meaning: "Praise be to Allah",
    target: 33,
    hadith: "Whoever says Alhamdulillah 33 times after every prayer will have all his sins forgiven. (Muslim)"
  },
  {
    title: "Allahu Akbar",
    arabic: "اللَّهُ أَكْبَرُ",
    meaning: "Allah is the Greatest",
    target: 33,
    hadith: "Whoever says Allahu Akbar 33 times after every prayer, his sins will be forgiven. (Muslim)"
  },
  {
    title: "Ayat al-Kursi",
    arabic: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ وَلَا يَئُودُهُ حِفْظُهُمَا وَهُوَ الْعَلِيُّ الْعَظِيمُ",
    meaning: "Allah - there is no deity except Him, the Ever-Living, the Sustainer of existence...",
    target: 1,
    virtue: "Nothing stands between him and Paradise except death",
    hadith: "Whoever recites Ayat al-Kursi after every prescribed prayer, nothing stands between him and Paradise except death. (An-Nasai)"
  },
  {
    title: "La ilaha illa Allah",
    arabic: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
    meaning: "None has the right to be worshipped except Allah, alone, without partner, to Him belongs all sovereignty and praise, and He is over all things omnipotent",
    target: 1,
    hadith: "Whoever says this after every prayer will have his sins forgiven. (Muslim)"
  }
];

const FAJR_SPECIFIC: AdhkarItem[] = [
  {
    title: "Protection Dua - Bismillah",
    arabic: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
    meaning: "In the name of Allah with whose name nothing is harmed on earth nor in the heavens, and He is The All-Hearing, The All-Knowing",
    target: 3,
    reference: "Recite 3 times after Fajr and Maghrib",
    virtue: "Protection from all harm until evening",
    hadith: "Whoever recites this three times in the morning will not be stricken with sudden affliction until evening. (Abu Dawood 5088)"
  },
  {
    title: "Morning Dua - Sovereignty",
    arabic: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ",
    meaning: "We have reached the morning and at this very time unto Allah belongs all sovereignty, and all praise is for Allah...",
    target: 1,
    reference: "Specific for Fajr",
    virtue: "Complete morning supplication taught by the Prophet ﷺ",
    hadith: "The Prophet ﷺ used to supplicate this every morning after Fajr. (Muslim 2723)"
  },
  {
    title: "Allahumma bika asbahna",
    arabic: "اللَّهُمَّ بِكَ أَصْبَحْنَا وَبِكَ أَمْسَيْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ",
    meaning: "O Allah, by Your leave we have reached the morning, by Your leave we live and die, and unto You is our return",
    target: 1,
    reference: "Morning after Fajr",
    hadith: "The Messenger ﷺ taught his companions to recite this morning and evening. (At-Tirmidhi 3391)"
  },
  {
    title: "Surah Al-Ikhlas",
    arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ",
    meaning: "Say: He is Allah, the One. Allah, the Eternal Refuge. He neither begets nor is born, nor is there to Him any equivalent.",
    target: 3,
    reference: "Recite 3 times after Fajr and Maghrib",
    virtue: "Protection from all evil until evening",
    hadith: "Recite Surat Al-Ikhlas, Al-Falaq and An-Nas three times at dawn and dusk - it will suffice you in all respects. (Abu Dawood 5082)"
  },
  {
    title: "Surah Al-Falaq",
    arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ مِن شَرِّ مَا خَلَقَ ۝ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ۝ وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ۝ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ",
    meaning: "Say: I seek refuge in the Lord of daybreak, from the evil of that which He created...",
    target: 3,
    reference: "Recite 3 times after Fajr and Maghrib",
    virtue: "Protection from all evil",
    hadith: "The Prophet ﷺ would recite these three surahs for protection. (Al-Bukhari)"
  },
  {
    title: "Surah An-Nas",
    arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۝ مَلِكِ النَّاسِ ۝ إِلَٰهِ النَّاسِ ۝ مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۝ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ۝ مِنَ الْجِنَّةِ وَالنَّاسِ",
    meaning: "Say: I seek refuge in the Lord of mankind...",
    target: 3,
    reference: "Recite 3 times after Fajr and Maghrib",
    virtue: "Protection from whispers of jinn and mankind",
    hadith: "The Prophet ﷺ would recite these three surahs, blow into his hands, and wipe over his body. (Al-Bukhari)"
  },
  {
    title: "Sayyidul Istighfar",
    arabic: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَٰهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ وَأَنَا عَلَىٰ عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ أَعُوذُ بِكَ مِن شَرِّ مَا صَنَعْتُ أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَبُوءُ بِذَنبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ",
    meaning: "O Allah, You are my Lord, none has the right to be worshipped except You, You created me and I am Your servant...",
    target: 1,
    reference: "Best recited after Fajr",
    virtue: "If you die that day, you will be among the people of Paradise",
    hadith: "Whoever says this during the day with certainty and dies before evening, will be among the people of Paradise. (Al-Bukhari 6306)"
  }
];

const MAGHRIB_SPECIFIC: AdhkarItem[] = [
  {
    title: "Protection Dua - Bismillah",
    arabic: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
    meaning: "In the name of Allah with whose name nothing is harmed on earth nor in the heavens, and He is The All-Hearing, The All-Knowing",
    target: 3,
    reference: "Recite 3 times after Fajr and Maghrib",
    virtue: "Protection from all harm until morning",
    hadith: "Whoever recites this three times in the evening will not be stricken with sudden affliction until morning. (Abu Dawood 5088)"
  },
  {
    title: "Evening Dua - Sovereignty",
    arabic: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ",
    meaning: "We have reached the evening and at this very time unto Allah belongs all sovereignty...",
    target: 1,
    reference: "Specific for Maghrib",
    virtue: "Complete evening supplication taught by the Prophet ﷺ",
    hadith: "The Prophet ﷺ used to supplicate this every evening after Maghrib. (Muslim 2723)"
  },
  {
    title: "Allahumma bika amsayna",
    arabic: "اللَّهُمَّ بِكَ أَمْسَيْنَا وَبِكَ أَصْبَحْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ الْمَصِيرُ",
    meaning: "O Allah, by Your leave we have reached the evening and by Your leave we have reached the morning...",
    target: 1,
    reference: "Evening after Maghrib",
    hadith: "The Messenger ﷺ taught his companions to recite this morning and evening. (At-Tirmidhi 3391)"
  },
  {
    title: "Surah Al-Ikhlas",
    arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ",
    meaning: "Say: He is Allah, the One...",
    target: 3,
    reference: "Recite 3 times after Fajr and Maghrib",
    virtue: "Protection from all evil until morning",
    hadith: "Recite Surat Al-Ikhlas, Al-Falaq and An-Nas three times at dawn and dusk - it will suffice you in all respects. (Abu Dawood 5082)"
  },
  {
    title: "Surah Al-Falaq",
    arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ مِن شَرِّ مَا خَلَقَ ۝ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ۝ وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ۝ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ",
    meaning: "Say: I seek refuge in the Lord of daybreak...",
    target: 3,
    reference: "Recite 3 times after Fajr and Maghrib",
    virtue: "Protection from all evil throughout the night",
    hadith: "The Prophet ﷺ would recite these three surahs for protection. (Al-Bukhari)"
  },
  {
    title: "Surah An-Nas",
    arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۝ مَلِكِ النَّاسِ ۝ إِلَٰهِ النَّاسِ ۝ مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۝ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ۝ مِنَ الْجِنَّةِ وَالنَّاسِ",
    meaning: "Say: I seek refuge in the Lord of mankind...",
    target: 3,
    reference: "Recite 3 times after Fajr and Maghrib",
    virtue: "Protection from whispers of jinn and mankind throughout the night",
    hadith: "The Prophet ﷺ would recite these three surahs, blow into his hands, and wipe over his body. (Al-Bukhari)"
  },
  {
    title: "Sayyidul Istighfar",
    arabic: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَٰهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ وَأَنَا عَلَىٰ عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ أَعُوذُ بِكَ مِن شَرِّ مَا صَنَعْتُ أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَبُوءُ بِذَنبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ",
    meaning: "O Allah, You are my Lord, none has the right to be worshipped except You...",
    target: 1,
    reference: "Best recited after Maghrib",
    virtue: "If you die that night, you will be among the people of Paradise",
    hadith: "Whoever says this at night with certainty and dies before morning, will be among the people of Paradise. (Al-Bukhari 6306)"
  }
];

export function getPrayerAdhkar(prayer: PrayerName): AdhkarItem[] {
  const common = [...COMMON_POST_SALAH];
  
  switch (prayer) {
    case 'fajr':
      return [...common, ...FAJR_SPECIFIC];
    case 'maghrib':
      return [...common, ...MAGHRIB_SPECIFIC];
    case 'dhuhr':
    case 'asr':
    case 'isha':
    default:
      return common;
  }
}

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
        title: "Surah Al-Fatihah",
        arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ۝ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ۝ الرَّحْمَٰنِ الرَّحِيمِ ۝ مَالِكِ يَوْمِ الدِّينِ ۝ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ۝ اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ ۝ صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ",
        meaning: "In the name of Allah, the Entirely Merciful, the Especially Merciful. All praise is due to Allah, Lord of the worlds. The Entirely Merciful, the Especially Merciful. Sovereign of the Day of Recompense. It is You we worship and You we ask for help. Guide us to the straight path, the path of those upon whom You have bestowed favour, not of those who have evoked anger or of those who are astray.",
        target: 1,
        reference: "Recite once",
        virtue: "The greatest surah in the Quran - Allah responds to each verse",
        hadith: "Allah said: 'I have divided prayer between myself and my servant into two halves.' (Muslim 395)"
      },
      {
        title: "Ayat al-Kursi",
        arabic: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ وَلَا يَئُودُهُ حِفْظُهُمَا وَهُوَ الْعَلِيُّ الْعَظِيمُ",
        meaning: "Allah - there is no deity except Him, the Ever-Living, the Sustainer of existence. Neither drowsiness overtakes Him nor sleep. To Him belongs whatever is in the heavens and whatever is on the earth. Who is it that can intercede with Him except by His permission? He knows what is presently before them and what will be after them, and they encompass not a thing of His knowledge except for what He wills. His Kursi extends over the heavens and the earth, and their preservation tires Him not. And He is the Most High, the Most Great.",
        target: 1,
        reference: "Recite once",
        virtue: "Protection from Shaytan all day",
        hadith: "Whoever recites Ayatul Kursi after each prescribed prayer, nothing stands between him and Paradise except death. (An-Nasai)"
      },
      {
        title: "Surah Al-Ikhlas",
        arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ",
        meaning: "Say: He is Allah, the One. Allah, the Eternal Refuge. He neither begets nor is born, nor is there to Him any equivalent.",
        target: 3,
        reference: "Recite 3 times",
        virtue: "Equals one-third of the Quran in reward",
        hadith: "Recite Surat Al-Ikhlas, Al-Falaq and An-Nas three times at dawn and dusk - it will suffice you in all respects. (Abu Dawood 5082)"
      },
      {
        title: "Surah Al-Falaq",
        arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ مِن شَرِّ مَا خَلَقَ ۝ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ۝ وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ۝ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ",
        meaning: "Say: I seek refuge in the Lord of daybreak, from the evil of that which He created, and from the evil of darkness when it settles, and from the evil of the blowers in knots, and from the evil of an envier when he envies.",
        target: 3,
        reference: "Recite 3 times",
        virtue: "Protection from all evil",
        hadith: "The Prophet ﷺ would recite these three surahs, blow into his hands, and wipe over his body. (Al-Bukhari)"
      },
      {
        title: "Surah An-Nas",
        arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۝ مَلِكِ النَّاسِ ۝ إِلَٰهِ النَّاسِ ۝ مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۝ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ۝ مِنَ الْجِنَّةِ وَالنَّاسِ",
        meaning: "Say: I seek refuge in the Lord of mankind, the Sovereign of mankind, the God of mankind, from the evil of the retreating whisperer who whispers in the breasts of mankind, from among the jinn and mankind.",
        target: 3,
        reference: "Recite 3 times",
        virtue: "Protection from whispers of jinn and mankind",
        hadith: "The Prophet ﷺ would recite these three surahs for protection. (Al-Bukhari)"
      },
      {
        title: "Morning Dua - Sovereignty belongs to Allah",
        arabic: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَٰذَا الْيَوْمِ وَخَيْرَ مَا بَعْدَهُ وَأَعُوذُ بِكَ مِن شَرِّ مَا فِي هَٰذَا الْيَوْمِ وَشَرِّ مَا بَعْدَهُ رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ",
        meaning: "We have reached the morning and at this very time unto Allah belongs all sovereignty, and all praise is for Allah. None has the right to be worshiped except Allah, alone, without partner, to Him belongs all sovereignty and praise and He is over all things omnipotent. My Lord, I ask You for the good of this day and the good of what follows it and I take refuge in You from the evil of this day and the evil of what follows it. My Lord, I take refuge in You from laziness and senility. My Lord, I take refuge in You from torment in the Fire and punishment in the grave.",
        target: 1,
        reference: "Muslim 4/2088",
        virtue: "Complete morning supplication taught by the Prophet ﷺ",
        hadith: "The Prophet ﷺ used to supplicate this every morning. (Muslim 2723)"
      },
      {
        title: "Allahumma bika asbahna",
        arabic: "اللَّهُمَّ بِكَ أَصْبَحْنَا وَبِكَ أَمْسَيْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ",
        meaning: "O Allah, by Your leave we have reached the morning, by Your leave we live and die, and unto You is our return",
        target: 1,
        reference: "Abu Dawood 5068",
        virtue: "Acknowledging Allah's control over life and death",
        hadith: "The Messenger ﷺ taught his companions to recite this morning and evening. (At-Tirmidhi 3391)"
      },
      {
        title: "Gratitude Dua",
        arabic: "اللَّهُمَّ مَا أَصْبَحَ بِي مِنْ نِعْمَةٍ أَوْ بِأَحَدٍ مِنْ خَلْقِكَ فَمِنْكَ وَحْدَكَ لَا شَرِيكَ لَكَ فَلَكَ الْحَمْدُ وَلَكَ الشُّكْرُ",
        meaning: "O Allah, whatever blessing I or any of Your creation have risen upon, is from You alone, without partner, so for You is all praise and unto You all thanks.",
        target: 1,
        reference: "Abu Dawood 4/324",
        virtue: "Fulfills obligation of gratitude for the day",
        hadith: "Whoever recites this in the morning has offered his day's thanks. (Abu Dawood)"
      },
      {
        title: "Radeetu billahi Rabba",
        arabic: "رَضِيتُ بِاللَّهِ رَبًّا وَبِالْإِسْلَامِ دِينًا وَبِمُحَمَّدٍ نَبِيًّا",
        meaning: "I am pleased with Allah as my Lord, Islam as my religion, and Muhammad as my Prophet",
        target: 3,
        reference: "Imam Ahmad 18967",
        virtue: "Allah will make you content on the Day of Resurrection",
        hadith: "Whoever recites this morning and evening will be content on the Day of Resurrection. (An-Nasai)"
      },
      {
        title: "Protection Dua - Bismillah",
        arabic: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
        meaning: "In the name of Allah with whose name nothing is harmed on earth nor in the heavens, and He is The All-Hearing, The All-Knowing.",
        target: 3,
        reference: "Abu Dawood 4/323",
        virtue: "Protection from all harm until evening",
        hadith: "Whoever recites this three times will not be stricken with sudden affliction. (Abu Dawood 5088)"
      },
      {
        title: "Protection in Allah's Words",
        arabic: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
        meaning: "I seek protection in the perfect words of Allah from every evil that He has created",
        target: 3,
        reference: "Imam Ahmad 2/290",
        virtue: "Protection from all created evil",
        hadith: "If you had said this when evening came, the scorpion would not have harmed you. (Muslim 2709)"
      },
      {
        title: "Hasbiyallahu",
        arabic: "حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ",
        meaning: "Allah is sufficient for me, none has the right to be worshipped except Him, upon Him I rely",
        target: 7,
        reference: "Abu Dawood 4/321",
        virtue: "Allah will suffice you against all concerns",
        hadith: "Whoever says this morning and evening seven times, Allah will suffice him. (Abu Dawood 5081)"
      },
      {
        title: "Sayyidul Istighfar",
        arabic: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَٰهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ وَأَنَا عَلَىٰ عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ أَعُوذُ بِكَ مِن شَرِّ مَا صَنَعْتُ أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَبُوءُ بِذَنبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ",
        meaning: "O Allah, You are my Lord, none has the right to be worshipped except You, You created me and I am Your servant and I abide to Your covenant and promise as best I can, I take refuge in You from the evil of which I have committed. I acknowledge Your favour upon me and I acknowledge my sin, so forgive me, for verily none can forgive sin except You.",
        target: 1,
        reference: "Al-Bukhari 7/150",
        virtue: "If you die that day, you will be among the people of Paradise",
        hadith: "Whoever says this during the day with certainty and dies before evening, will be among the people of Paradise. (Al-Bukhari 6306)"
      },
      {
        title: "La ilaha illa Allah (100x)",
        arabic: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
        meaning: "None has the right to be worshipped except Allah, alone, without partner, to Him belongs all sovereignty and praise",
        target: 100,
        reference: "Muslim 4/2071",
        virtue: "Equal to freeing 10 slaves, 100 good deeds, removes 100 sins, shield from Shaytan",
        hadith: "Whoever says this 100 times will get the reward of freeing 10 slaves. (Al-Bukhari 6040)"
      },
      {
        title: "SubhanAllah wa bihamdihi (100x)",
        arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
        meaning: "Glory be to Allah and His Praise",
        target: 100,
        reference: "Muslim 4/2071",
        virtue: "Light on the tongue, heavy on the scale, beloved to Allah",
        hadith: "Whoever says this 100 times will be forgiven all his sins even if they were as much as the foam of the sea. (Al-Bukhari 6040)"
      },
      {
        title: "SubhanAllah wa bihamdihi 'adada khalqihi",
        arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ عَدَدَ خَلْقِهِ وَرِضَا نَفْسِهِ وَزِنَةَ عَرْشِهِ وَمِدَادَ كَلِمَاتِهِ",
        meaning: "Glory be to Allah and praise Him by the number of His creation, His pleasure, the weight of His Throne, and the ink of His words",
        target: 3,
        reference: "Muslim 4/2090",
        virtue: "Outweighs lengthy dhikr",
        hadith: "These four words three times outweigh what you have said all day. (Muslim 2726)"
      },
      {
        title: "Ya Hayyu Ya Qayyum",
        arabic: "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ أَصْلِحْ لِي شَأْنِي كُلَّهُ وَلَا تَكِلْنِي إِلَىٰ نَفْسِي طَرْفَةَ عَيْنٍ",
        meaning: "O Ever Living, O Sustainer, by Your mercy I seek help, rectify for me all of my affairs and do not leave me to myself, even for the blink of an eye.",
        target: 3,
        reference: "An-Nasai | Al-Hakim",
        virtue: "Rectifies all affairs",
        hadith: "The Prophet ﷺ taught Fatima (ra) to recite this morning and evening. (An-Nasai)"
      },
      {
        title: "Shahada Dua (4x)",
        arabic: "اللَّهُمَّ إِنِّي أَصْبَحْتُ أُشْهِدُكَ وَأُشْهِدُ حَمَلَةَ عَرْشِكَ وَمَلَائِكَتَكَ وَجَمِيعَ خَلْقِكَ أَنَّكَ أَنْتَ اللَّهُ لَا إِلَٰهَ إِلَّا أَنْتَ وَحْدَكَ لَا شَرِيكَ لَكَ وَأَنَّ مُحَمَّدًا عَبْدُكَ وَرَسُولُكَ",
        meaning: "O Allah, verily I have reached the morning and call on You, the bearers of Your throne, Your angels, and all of Your creation to witness that You are Allah, none has the right to be worshipped except You, alone, without partner and that Muhammad ﷺ is Your servant and Messenger.",
        target: 4,
        reference: "Abu Dawood 4/317",
        virtue: "Emancipation from Hellfire",
        hadith: "If anyone says this four times, Allah will emancipate him from Hell. (Abu Dawood 505)"
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
        title: "Surah Al-Fatihah",
        arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ۝ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ۝ الرَّحْمَٰنِ الرَّحِيمِ ۝ مَالِكِ يَوْمِ الدِّينِ ۝ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ۝ اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ ۝ صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ",
        meaning: "In the name of Allah, the Entirely Merciful, the Especially Merciful. All praise is due to Allah, Lord of the worlds. The Entirely Merciful, the Especially Merciful. Sovereign of the Day of Recompense. It is You we worship and You we ask for help. Guide us to the straight path, the path of those upon whom You have bestowed favour, not of those who have evoked anger or of those who are astray.",
        target: 1,
        reference: "Recite once",
        virtue: "The greatest surah in the Quran - Allah responds to each verse",
        hadith: "Allah said: 'I have divided prayer between myself and my servant into two halves.' (Muslim 395)"
      },
      {
        title: "Ayat al-Kursi",
        arabic: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ وَلَا يَئُودُهُ حِفْظُهُمَا وَهُوَ الْعَلِيُّ الْعَظِيمُ",
        meaning: "Allah - there is no deity except Him, the Ever-Living, the Sustainer of existence. Neither drowsiness overtakes Him nor sleep. To Him belongs whatever is in the heavens and whatever is on the earth. Who is it that can intercede with Him except by His permission? He knows what is presently before them and what will be after them, and they encompass not a thing of His knowledge except for what He wills. His Kursi extends over the heavens and the earth, and their preservation tires Him not. And He is the Most High, the Most Great.",
        target: 1,
        reference: "Recite once",
        virtue: "Protection from Shaytan all night",
        hadith: "Whoever recites Ayatul Kursi after each prescribed prayer, nothing stands between him and Paradise except death. (An-Nasai)"
      },
      {
        title: "Surah Al-Ikhlas",
        arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ",
        meaning: "Say: He is Allah, the One. Allah, the Eternal Refuge. He neither begets nor is born, nor is there to Him any equivalent.",
        target: 3,
        reference: "Recite 3 times",
        virtue: "Equals one-third of the Quran in reward",
        hadith: "Recite Surat Al-Ikhlas, Al-Falaq and An-Nas three times at dawn and dusk - it will suffice you in all respects. (Abu Dawood 5082)"
      },
      {
        title: "Surah Al-Falaq",
        arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ مِن شَرِّ مَا خَلَقَ ۝ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ۝ وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ۝ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ",
        meaning: "Say: I seek refuge in the Lord of daybreak, from the evil of that which He created, and from the evil of darkness when it settles, and from the evil of the blowers in knots, and from the evil of an envier when he envies.",
        target: 3,
        reference: "Recite 3 times",
        virtue: "Protection from all evil",
        hadith: "The Prophet ﷺ would recite these three surahs, blow into his hands, and wipe over his body. (Al-Bukhari)"
      },
      {
        title: "Surah An-Nas",
        arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۝ مَلِكِ النَّاسِ ۝ إِلَٰهِ النَّاسِ ۝ مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۝ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ۝ مِنَ الْجِنَّةِ وَالنَّاسِ",
        meaning: "Say: I seek refuge in the Lord of mankind, the Sovereign of mankind, the God of mankind, from the evil of the retreating whisperer who whispers in the breasts of mankind, from among the jinn and mankind.",
        target: 3,
        reference: "Recite 3 times",
        virtue: "Protection from whispers of jinn and mankind",
        hadith: "The Prophet ﷺ would recite these three surahs for protection. (Al-Bukhari)"
      },
      {
        title: "Evening Dua - Sovereignty belongs to Allah",
        arabic: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَٰذِهِ اللَّيْلَةِ وَخَيْرَ مَا بَعْدَهَا وَأَعُوذُ بِكَ مِن شَرِّ مَا فِي هَٰذِهِ اللَّيْلَةِ وَشَرِّ مَا بَعْدَهَا رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ",
        meaning: "We have reached the evening and at this very time unto Allah belongs all sovereignty, and all praise is for Allah. None has the right to be worshiped except Allah, alone, without partner, to Him belongs all sovereignty and praise and He is over all things omnipotent. My Lord, I ask You for the good of this night and the good of what follows it and I take refuge in You from the evil of this night and the evil of what follows it. My Lord, I take refuge in You from laziness and senility. My Lord, I take refuge in You from torment in the Fire and punishment in the grave.",
        target: 1,
        reference: "Muslim 4/2088",
        virtue: "Complete evening supplication taught by the Prophet ﷺ",
        hadith: "The Prophet ﷺ used to supplicate this every evening. (Muslim 2723)"
      },
      {
        title: "Evening upon the fitrah of Islam",
        arabic: "أَمْسَيْنَا عَلَىٰ فِطْرَةِ الْإِسْلَامِ وَعَلَىٰ كَلِمَةِ الْإِخْلَاصِ وَعَلَىٰ دِينِ نَبِيِّنَا مُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ وَعَلَىٰ مِلَّةِ أَبِينَا إِبْرَاهِيمَ حَنِيفًا مُّسْلِمًا وَمَا كَانَ مِنَ الْمُشْرِكِينَ",
        meaning: "We have reached the evening upon the fitrah of Al-Islam, and the word of pure faith, and upon the religion of our Prophet Muhammad and the religion of our forefather Ibrahim, who was a Muslim and of true faith and was not of those who associate others with Allah.",
        target: 1,
        reference: "Imam Ahmad 15367",
        virtue: "Affirming faith and following the straight path",
        hadith: "This day I have perfected for you your religion. (Al-Maa'idah 5:3)"
      },
      {
        title: "Allahumma bika amsayna",
        arabic: "اللَّهُمَّ بِكَ أَمْسَيْنَا وَبِكَ أَصْبَحْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ الْمَصِيرُ",
        meaning: "O Allah, by Your leave we have reached the evening and by Your leave we have reached the morning, by Your leave we live and die and unto You is our return.",
        target: 1,
        reference: "Abu Dawood 5068",
        virtue: "Acknowledging Allah's control over life and death",
        hadith: "The Messenger ﷺ taught his companions to recite this morning and evening. (At-Tirmidhi 3391)"
      },
      {
        title: "Gratitude Dua",
        arabic: "اللَّهُمَّ مَا أَمْسَى بِي مِنْ نِعْمَةٍ أَوْ بِأَحَدٍ مِنْ خَلْقِكَ فَمِنْكَ وَحْدَكَ لَا شَرِيكَ لَكَ فَلَكَ الْحَمْدُ وَلَكَ الشُّكْرُ",
        meaning: "O Allah, whatever blessing I or any of Your creation have reached the evening upon, is from You alone, without partner, so for You is all praise and unto You all thanks.",
        target: 1,
        reference: "Abu Dawood 4/324",
        virtue: "Fulfills obligation of gratitude for the night",
        hadith: "Whoever recites this in the evening has offered his night's thanks. (Abu Dawood)"
      },
      {
        title: "All Praise to Allah - As it should be",
        arabic: "يَا رَبِّ لَكَ الْحَمْدُ كَمَا يَنْبَغِي لِجَلَالِ وَجْهِكَ وَعَظِيمِ سُلْطَانِكَ",
        meaning: "O my Lord, all praises be to You as it should be due to Your Might and the Greatness of Your Power.",
        target: 1,
        reference: "Imam Ahmad | Ibn Majah",
        virtue: "Angels cannot register its reward until Allah commands",
        hadith: "Write reward as what just spoken by him until he meets me, I will reward him. (Imam Ahmad)"
      },
      {
        title: "Radeetu billahi Rabba",
        arabic: "رَضِيتُ بِاللَّهِ رَبًّا وَبِالْإِسْلَامِ دِينًا وَبِمُحَمَّدٍ نَبِيًّا",
        meaning: "I am pleased with Allah as my Lord, Islam as my religion, and Muhammad as my Prophet",
        target: 3,
        reference: "Imam Ahmad 18967",
        virtue: "Allah will make you content on the Day of Resurrection",
        hadith: "Whoever recites this morning and evening will be content on the Day of Resurrection. (An-Nasai)"
      },
      {
        title: "Protection Dua - Bismillah",
        arabic: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
        meaning: "In the name of Allah with whose name nothing is harmed on earth nor in the heavens, and He is The All-Hearing, The All-Knowing.",
        target: 3,
        reference: "Abu Dawood 4/323",
        virtue: "Protection from all harm until morning",
        hadith: "Whoever recites this three times will not be stricken with sudden affliction. (Abu Dawood 5088)"
      },
      {
        title: "Protection from Shirk",
        arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ أَنْ أُشْرِكَ بِكَ شَيْئًا أَعْلَمُهُ وَأَسْتَغْفِرُكَ لِمَا لَا أَعْلَمُ",
        meaning: "O Allah, I take refuge in You lest I should commit shirk with You knowingly and I seek Your forgiveness for what I do unknowingly.",
        target: 3,
        reference: "Sahih Al-Jami 4674",
        virtue: "Protection from minor and major shirk",
        hadith: "The thing I fear most for you is minor shirk. (Imam Ahmad 23119)"
      },
      {
        title: "Protection in Allah's Words",
        arabic: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
        meaning: "I seek protection in the perfect words of Allah from every evil that He has created.",
        target: 3,
        reference: "Imam Ahmad 2/290",
        virtue: "Protection from all created evil",
        hadith: "If you had said this when evening came, the scorpion would not have harmed you. (Muslim 2709)"
      },
      {
        title: "Hasbiyallahu",
        arabic: "حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ",
        meaning: "Allah is sufficient for me, none has the right to be worshipped except Him, upon Him I rely and He is Lord of the exalted throne.",
        target: 7,
        reference: "Abu Dawood 4/321",
        virtue: "Allah will suffice you against all concerns",
        hadith: "Whoever says this morning and evening seven times, Allah will suffice him. (Abu Dawood 5081)"
      },
      {
        title: "Sayyidul Istighfar",
        arabic: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَٰهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ وَأَنَا عَلَىٰ عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ أَعُوذُ بِكَ مِن شَرِّ مَا صَنَعْتُ أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَبُوءُ بِذَنبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ",
        meaning: "O Allah, You are my Lord, none has the right to be worshipped except You, You created me and I am Your servant and I abide to Your covenant and promise as best I can, I take refuge in You from the evil of which I have committed. I acknowledge Your favour upon me and I acknowledge my sin, so forgive me, for verily none can forgive sin except You.",
        target: 1,
        reference: "Al-Bukhari 7/150",
        virtue: "If you die that night, you will be among the people of Paradise",
        hadith: "Whoever says this at night with certainty and dies before morning, will be among the people of Paradise. (Al-Bukhari 6306)"
      },
      {
        title: "La ilaha illa Allah (100x)",
        arabic: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
        meaning: "None has the right to be worshipped except Allah, alone, without partner, to Him belongs all sovereignty and praise, and He is over all things omnipotent.",
        target: 100,
        reference: "Muslim 4/2071",
        virtue: "Equal to freeing 10 slaves, 100 good deeds, removes 100 sins, shield from Shaytan",
        hadith: "Whoever says this 100 times will get the reward of freeing 10 slaves. (Al-Bukhari 6040)"
      },
      {
        title: "SubhanAllah wa bihamdihi (100x)",
        arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
        meaning: "Glory be to Allah and His Praise",
        target: 100,
        reference: "Muslim 4/2071",
        virtue: "Light on the tongue, heavy on the scale, beloved to Allah",
        hadith: "Whoever says this 100 times will be forgiven all his sins even if they were as much as the foam of the sea. (Al-Bukhari 6040)"
      },
      {
        title: "SubhanAllah wa bihamdihi 'adada khalqihi",
        arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ عَدَدَ خَلْقِهِ وَرِضَا نَفْسِهِ وَزِنَةَ عَرْشِهِ وَمِدَادَ كَلِمَاتِهِ",
        meaning: "Glory be to Allah and praise Him by the number of His creation, His pleasure, the weight of His Throne, and the ink of His words.",
        target: 3,
        reference: "Muslim 4/2090",
        virtue: "Outweighs lengthy dhikr",
        hadith: "These four words three times outweigh what you have said all day. (Muslim 2726)"
      },
      {
        title: "Ya Hayyu Ya Qayyum",
        arabic: "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ أَصْلِحْ لِي شَأْنِي كُلَّهُ وَلَا تَكِلْنِي إِلَىٰ نَفْسِي طَرْفَةَ عَيْنٍ",
        meaning: "O Ever Living, O Sustainer, by Your mercy I seek help, rectify for me all of my affairs and do not leave me to myself, even for the blink of an eye.",
        target: 3,
        reference: "An-Nasai | Al-Hakim",
        virtue: "Rectifies all affairs",
        hadith: "The Prophet ﷺ taught Fatima (ra) to recite this morning and evening. (An-Nasai)"
      },
      {
        title: "Shahada Dua (4x)",
        arabic: "اللَّهُمَّ إِنِّي أَمْسَيْتُ أُشْهِدُكَ وَأُشْهِدُ حَمَلَةَ عَرْشِكَ وَمَلَائِكَتَكَ وَجَمِيعَ خَلْقِكَ أَنَّكَ أَنْتَ اللَّهُ لَا إِلَٰهَ إِلَّا أَنْتَ وَحْدَكَ لَا شَرِيكَ لَكَ وَأَنَّ مُحَمَّدًا عَبْدُكَ وَرَسُولُكَ",
        meaning: "O Allah, verily I have reached the evening and call on You, the bearers of Your throne, Your angels, and all of Your creation to witness that You are Allah, none has the right to be worshipped except You, alone, without partner and that Muhammad ﷺ is Your servant and Messenger.",
        target: 4,
        reference: "Abu Dawood 4/317",
        virtue: "Emancipation from Hellfire",
        hadith: "If anyone says this four times, Allah will emancipate him from Hell. (Abu Dawood 505)"
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
