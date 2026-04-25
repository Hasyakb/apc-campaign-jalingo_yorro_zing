export const WARDS = {
  Jalingo: [
    "Turaki A",
    "Turaki B",
    "Sarkin Dawaki",
    "Barade",
    "Kachalla",
    "Majidadi",
    "Abbare",
    "Kona",
    "Yelwa",
    "Sintali"
  ],
  Yorro: [
    "Mumuye",
    "Pantisawa",
    "Nyaja",
    "Kassa",
    "Kayya",
    "Dandabba",
    "Lankaviri",
    "Panti",
    "Poly",
    "Bikasi",
    "Donkin"
  ],
  Zing: [
    "Zing A",
    "Zing B",
    "Zing C",
    "Zing D",
    "Zan",
    "Monkin",
    "Yakoko",
    "Dinding",
    "Lamma",
    "Bitako"
  ]
};

export type LGA = keyof typeof WARDS;
export type UserRole = 'Admin' | 'Delegate' | 'Supporter';
