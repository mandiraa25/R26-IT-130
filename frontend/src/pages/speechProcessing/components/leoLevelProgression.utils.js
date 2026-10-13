export function computeLevelProgression({
  configs = [],
  completedActivityIds = new Set(),
  devUnlock = false,
  zones = [],
  activities = [],
} = {}) {
  const levelCompleted = configs.map((config) => {
    const zone =
      zones.find((z) => z.activityId === config.activityId) ||
      activities.find((a) => a.activityId === config.activityId) ||
      {};
    return Boolean(
      completedActivityIds.has(config.activityId) ||
      zone.state === "completed" ||
      zone.state === "replay" ||
      zone.status === "completed"
    );
  });

  return configs.map((config, index) => {
    const zone =
      zones.find((z) => z.activityId === config.activityId) ||
      activities.find((a) => a.activityId === config.activityId) ||
      {};

    const isCompleted = levelCompleted[index];

    // Strict sequential unlock:
    // Level 1 (index 0) is always unlocked.
    // Any completed level is unlocked for replay.
    // Any subsequent level (index > 0) is unlocked IF AND ONLY IF Level index - 1 is completed.
    const isUnlocked = Boolean(
      devUnlock ||
      index === 0 ||
      isCompleted ||
      levelCompleted[index - 1]
    );

    let stars = 0;
    if (zone.stars !== undefined && zone.stars !== null && zone.stars > 0) {
      stars = zone.stars > 3 ? Math.round((zone.stars / 15) * 3) : zone.stars;
    } else if (isCompleted) {
      stars = 3;
    }

    return {
      ...config,
      activity: {
        ...zone,
        activityId: config.activityId,
        title: config.title,
        shortTitle: config.title,
        isPrimary: zone.isPrimary || (index === 0 && !completedActivityIds.size),
      },
      isUnlocked,
      isCompleted,
      stars,
    };
  });
}
