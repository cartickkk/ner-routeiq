// frontend/modules/driverService.js

export function checkDriverFatigue(hoursDriven, continuousDrivingMinutes) {
    let fatigueStatus = "Optimal";
    let alertRequired = false;
    let recommendation = "Driver alertness levels are normal.";

    if (continuousDrivingMinutes > 240) { // More than 4 hours continuous
        fatigueStatus = "Critical Fatigue Risk";
        alertRequired = true;
        recommendation = "Mandatory 30-minute rest stop required immediately at the nearest safe zone.";
    } else if (continuousDrivingMinutes > 180) { // 3+ hours
        fatigueStatus = "Moderate Fatigue Warning";
        alertRequired = true;
        recommendation = "Prepare for a scheduled rest stop within the next 30 minutes.";
    }

    return {
        hoursDriven,
        continuousDrivingMinutes,
        fatigueStatus,
        alertRequired,
        recommendation
    };
}
