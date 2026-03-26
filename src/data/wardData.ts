export interface WardData {
  name: string;
  aqi: number;
  source: string;
  sourceIcon: string;
}

export const WARD_DATA: WardData[] = [
  { name: "Anand Vihar", aqi: 341, source: "Construction", sourceIcon: "🏗️" },
  { name: "Rohini Sector 16", aqi: 189, source: "Vehicular", sourceIcon: "🚗" },
  { name: "Okhla Phase 2", aqi: 267, source: "Industrial", sourceIcon: "🏭" },
  { name: "Chandni Chowk", aqi: 312, source: "Biomass", sourceIcon: "🔥" },
  { name: "R.K. Puram", aqi: 98, source: "Clean", sourceIcon: "🌿" },
  { name: "Mustafabad", aqi: 287, source: "Biomass", sourceIcon: "🔥" },
  { name: "Karawal Nagar", aqi: 224, source: "Stubble", sourceIcon: "🌾" },
  { name: "Dwarka Sector 10", aqi: 156, source: "Vehicular", sourceIcon: "🚗" },
  { name: "Shahdara", aqi: 298, source: "Industrial", sourceIcon: "🏭" },
  { name: "Wazirpur", aqi: 334, source: "Industrial", sourceIcon: "🏭" },
  { name: "Sarita Vihar", aqi: 178, source: "Vehicular", sourceIcon: "🚗" },
  { name: "Tughlakabad", aqi: 241, source: "Construction", sourceIcon: "🏗️" },
  { name: "Burari", aqi: 203, source: "Biomass", sourceIcon: "🔥" },
  { name: "Mehrauli", aqi: 134, source: "Vehicular", sourceIcon: "🚗" },
  { name: "Bawana", aqi: 378, source: "Industrial", sourceIcon: "🏭" },
  { name: "Narela", aqi: 289, source: "Construction", sourceIcon: "🏗️" },
  { name: "Mundka", aqi: 311, source: "Industrial", sourceIcon: "🏭" },
  { name: "Vasant Kunj", aqi: 88, source: "Clean", sourceIcon: "🌿" },
  { name: "Lajpat Nagar", aqi: 167, source: "Vehicular", sourceIcon: "🚗" },
  { name: "Patel Nagar", aqi: 219, source: "Vehicular", sourceIcon: "🚗" },
];

export function getAqiColor(aqi: number): string {
  if (aqi < 100) return '#39FF14'; // Toxic Green
  if (aqi < 200) return '#00E5FF'; // Neon Cyan
  if (aqi < 300) return '#7A5CFF'; // Electric Purple
  return '#FF5F3C'; // Warning Red
}

export function getAqiLabel(aqi: number): string {
  if (aqi < 100) return 'Good';
  if (aqi < 200) return 'Moderate';
  if (aqi < 300) return 'Poor';
  return 'Severe';
}

export const RADAR_DATA: Record<string, number[]> = {
  'Biomass Burning': [95, 72, 18, 88, 15],
  'Construction Dust': [28, 94, 18, 12, 8],
  'Vehicular': [71, 55, 92, 78, 22],
  'Industrial': [74, 69, 71, 58, 88],
  'Stubble Burning': [91, 78, 15, 85, 12],
};

export const RADAR_AXES = ['PM2.5', 'PM10', 'NO₂', 'CO', 'SO₂'];

export const RADAR_COLORS: Record<string, string> = {
  'Biomass Burning': '#FF5F3C',
  'Construction Dust': '#FF3CAC',
  'Vehicular': '#00E5FF',
  'Industrial': '#7A5CFF',
  'Stubble Burning': '#39FF14',
};
