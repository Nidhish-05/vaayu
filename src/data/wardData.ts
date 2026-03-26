export interface WardData {
  name: string;
  aqi: number;
  source: string;
  sourceIcon: string;
  lat: number;
  lng: number;
}

export const WARD_DATA: WardData[] = [
  { name: "Anand Vihar",       aqi: 341, source: "Construction", sourceIcon: "🏗️", lat: 28.6469, lng: 77.3164 },
  { name: "Rohini Sector 16",  aqi: 189, source: "Vehicular",    sourceIcon: "🚗", lat: 28.7379, lng: 77.1157 },
  { name: "Okhla Phase 2",     aqi: 267, source: "Industrial",   sourceIcon: "🏭", lat: 28.5308, lng: 77.2710 },
  { name: "Chandni Chowk",     aqi: 312, source: "Biomass",      sourceIcon: "🔥", lat: 28.6506, lng: 77.2301 },
  { name: "R.K. Puram",        aqi: 98,  source: "Clean",        sourceIcon: "🌿", lat: 28.5667, lng: 77.1833 },
  { name: "Mustafabad",        aqi: 287, source: "Biomass",      sourceIcon: "🔥", lat: 28.6950, lng: 77.2625 },
  { name: "Karawal Nagar",     aqi: 224, source: "Stubble",      sourceIcon: "🌾", lat: 28.7237, lng: 77.2617 },
  { name: "Dwarka Sector 10",  aqi: 156, source: "Vehicular",    sourceIcon: "🚗", lat: 28.5823, lng: 77.0567 },
  { name: "Shahdara",          aqi: 298, source: "Industrial",   sourceIcon: "🏭", lat: 28.6742, lng: 77.2893 },
  { name: "Wazirpur",          aqi: 334, source: "Industrial",   sourceIcon: "🏭", lat: 28.6993, lng: 77.1652 },
  { name: "Sarita Vihar",      aqi: 178, source: "Vehicular",    sourceIcon: "🚗", lat: 28.5277, lng: 77.2899 },
  { name: "Tughlakabad",       aqi: 241, source: "Construction", sourceIcon: "🏗️", lat: 28.5139, lng: 77.2543 },
  { name: "Burari",            aqi: 203, source: "Biomass",      sourceIcon: "🔥", lat: 28.7575, lng: 77.2028 },
  { name: "Mehrauli",          aqi: 134, source: "Vehicular",    sourceIcon: "🚗", lat: 28.5246, lng: 77.1855 },
  { name: "Bawana",            aqi: 378, source: "Industrial",   sourceIcon: "🏭", lat: 28.7762, lng: 77.0510 },
  { name: "Narela",            aqi: 289, source: "Construction", sourceIcon: "🏗️", lat: 28.8525, lng: 77.0926 },
  { name: "Mundka",            aqi: 311, source: "Industrial",   sourceIcon: "🏭", lat: 28.6817, lng: 77.0214 },
  { name: "Vasant Kunj",       aqi: 88,  source: "Clean",        sourceIcon: "🌿", lat: 28.5194, lng: 77.1548 },
  { name: "Lajpat Nagar",      aqi: 167, source: "Vehicular",    sourceIcon: "🚗", lat: 28.5700, lng: 77.2400 },
  { name: "Patel Nagar",       aqi: 219, source: "Vehicular",    sourceIcon: "🚗", lat: 28.6518, lng: 77.1641 },
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
