
import { Spot, User } from '../types';

/**
 * LIGHTWEIGHT VERIFICATION LAYER
 * Centralizes logic for "Can User Do X?"
 */

const MAX_CHECK_IN_DISTANCE_KM = 0.5;

function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; 
  const dLat = deg2rad(lat2-lat1);
  const dLon = deg2rad(lon2-lon1); 
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; 
  return d;
}

function deg2rad(deg: number) {
  return deg * (Math.PI/180)
}

export const VerificationService = {
  
  canCheckIn: (userLocation: {lat: number, lng: number} | null, spot: Spot): { allowed: boolean, reason?: string } => {
    if (!userLocation) {
      return { allowed: false, reason: "GPS Signal Lost. Enable location services." };
    }
    
    const dist = getDistanceFromLatLonInKm(userLocation.lat, userLocation.lng, spot.location.lat, spot.location.lng);
    
    if (dist > MAX_CHECK_IN_DISTANCE_KM) {
      return { 
        allowed: false, 
        reason: `Too far from spot (${dist.toFixed(1)}km). Get closer than 500m.` 
      };
    }

    return { allowed: true };
  },

  canCreateSession: (user: User | null): { allowed: boolean, reason?: string } => {
    if (!user) return { allowed: false, reason: "Authentication required." };
    // Future: Add cooldowns or level requirements
    return { allowed: true };
  },

  canUploadClip: (user: User | null, skillId: string): { allowed: boolean, reason?: string } => {
    if (!user) return { allowed: false, reason: "Authentication required." };
    if (user.masteredSkills.includes(skillId)) return { allowed: false, reason: "Skill already mastered." };
    return { allowed: true };
  }
};
