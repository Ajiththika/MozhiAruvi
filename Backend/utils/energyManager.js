/**
 * Energy Manager for Duolingo-style energy system
 * Handles regeneration, attempts validation, and consumption.
 */

const MAX_ENERGY = 25;
const REGEN_RATE_MS = 60 * 60 * 1000; // 1 energy per 60 minutes

/**
 * Regenerates user energy based on elapsed time.
 * @param {Object} user - The mongoose user document
 * @returns {Boolean} - Whether the user object was modified
 */
export const regenerateEnergy = (user) => {
  if (!user) return false;
  if (user.isPremium || (user.subscription && user.subscription.plan !== 'FREE')) {
    user.progress.energy = MAX_ENERGY;
    return false;
  }

  const now = Date.now();
  const lastUpdate = user.progress?.lastEnergyUpdate ? new Date(user.progress.lastEnergyUpdate).getTime() : now;
  const diff = now - lastUpdate;
  
  const recovered = Math.floor(diff / REGEN_RATE_MS);
  
  if (recovered > 0) {
    const newEnergy = Math.min(MAX_ENERGY, (user.progress.energy || 0) + recovered);
    
    // Only update timestamp if energy actually changed or is already at max
    if (newEnergy !== (user.progress?.energy || 0)) {
      if (!user.progress) user.progress = {};
      user.progress.energy = newEnergy;
      user.progress.lastEnergyUpdate = new Date(now);
      return true;
    }
  }
  
  return false;
};

/**
 * Checks if a user has sufficient energy to attempt a question.
 * @param {Object} user - The mongoose user document
 * @returns {Object} { canAttempt: Boolean, nextRecoveryIn: Number }
 */
export const canAttempt = (user) => {
  if (!user) return { canAttempt: true };
  if (user.isPremium || (user.subscription && user.subscription.plan !== 'FREE')) {
    return { canAttempt: true, energy: MAX_ENERGY };
  }

  regenerateEnergy(user);
  
  const energy = user.progress.energy || 0;
  
  if (energy <= 0) {
    const now = Date.now();
    const lastUpdate = new Date(user.progress.lastEnergyUpdate || now).getTime();
    const nextRecoveryIn = Math.max(0, REGEN_RATE_MS - (now - lastUpdate));
    return { canAttempt: false, nextRecoveryIn, energy: 0 };
  }

  return { canAttempt: true, energy };
};

/**
 * Consumes 1 energy if the answer was incorrect.
 * @param {Object} user - The mongoose user document
 * @param {Boolean} isCorrect - Whether the answer was correct
 * @returns {Object} Updated energy state
 */
export const consumeEnergy = (user, isCorrect) => {
  if (!user) return;
  if (user.isPremium || (user.subscription && user.subscription.plan !== 'FREE')) {
    return { energy: MAX_ENERGY, isPremium: true };
  }

  // Deduct only on incorrect answer
  if (!isCorrect) {
    // If energy was already at MAX, start the clock for recovery
    if (user.progress.energy === MAX_ENERGY) {
        user.progress.lastEnergyUpdate = new Date();
    }
    
    user.progress.energy = Math.max(0, (user.progress.energy || 0) - 1);
  }

  return { 
    energy: user.progress.energy, 
    lastEnergyUpdate: user.progress.lastEnergyUpdate,
    isPremium: false 
  };
};

/**
 * Returns a standardized energy state for UI consumers.
 * @param {Object} user - The mongoose user document
 * @returns {Object} { currentEnergy, maxEnergy, isPremium, nextRecoveryIn }
 */
export const getEnergyResponse = (user) => {
  if (!user) return null;
  const isPremium = user.isPremium || (user.subscription && user.subscription.plan !== 'FREE');
  const now = Date.now();
  const lastUpdate = new Date(user.progress.lastEnergyUpdate || now).getTime();
  const nextRecoveryIn = isPremium ? 0 : Math.max(0, REGEN_RATE_MS - (now - lastUpdate));

  return {
    currentEnergy: isPremium ? MAX_ENERGY : (user.progress.energy || 0),
    maxEnergy: MAX_ENERGY,
    isPremium,
    nextRecoveryIn: (user.progress.energy || 0) >= MAX_ENERGY ? 0 : nextRecoveryIn
  };
};

/**
 * Validates and resets user streak if they missed a day.
 * @param {Object} user - The mongoose user document
 * @returns {Boolean} - Whether the user object was modified
 */
export const validateStreak = (user) => {
  if (!user || !user.progress || !user.progress.lastLessonDate) return false;
  
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const lastDate = new Date(user.progress.lastLessonDate);
  const lastMidnight = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate());
  
  const diffTime = today.getTime() - lastMidnight.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  // If they missed yesterday (diffDays > 1), reset streak
  if (diffDays > 1 && user.progress.currentStreak > 0) {
    user.progress.currentStreak = 0;
    return true;
  }
  return false;
};

