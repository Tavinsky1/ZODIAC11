import React from 'react';

export type ZodiacSign = 
  | 'Aries' 
  | 'Taurus' 
  | 'Gemini' 
  | 'Cancer' 
  | 'Leo' 
  | 'Virgo' 
  | 'Libra' 
  | 'Scorpio' 
  | 'Sagittarius' 
  | 'Capricorn' 
  | 'Aquarius' 
  | 'Pisces';

export type Personality = 'default' | 'cat' | 'dog';

export type PetType = 'Cat' | 'Dog' | 'Fish' | 'Bird' | 'Hamster';

export type View = 'horoscope' | 'compatibility' | 'petHoroscope' | 'dream';

export interface Zodiac {
  name: ZodiacSign;
  icon: string;
}

export interface Pet {
  name: PetType;
  icon: string;
}

export interface AnalyticsData {
  totalGenerations: number;
  generationsBySign: { [key in ZodiacSign]?: number };
}