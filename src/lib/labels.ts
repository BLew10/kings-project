/** Returns a human-friendly label for raw dataset and derived category values. */
export function labelFor(value: string): string {
  const labels: Record<string, string> = {
    all: "All",
    heave: "Heave",
    jumper: "Jumper",
    post: "Post",
    floater: "Floater",
    layup: "Layup / Dunk",
    catchAndShoot: "Catch and Shoot",
    catchAndShootRelocating: "Relocation Catch and Shoot",
    catchAndShootOnMoveLeft: "Off-Screen Catch, Left Turn",
    catchAndShootOnMoveRight: "Off-Screen Catch, Right Turn",
    pullupJumper: "Pull-Up Jumper",
    stepback: "Stepback Jumper",
    shakeAndRaise: "Shake and Raise",
    overScreen: "Behind Screen Jumper",
    drivingFloater: "Driving Floater",
    cutFloater: "Cut Floater",
    postLeft: "Post, Left Shoulder",
    postRight: "Post, Right Shoulder",
    drivingLayup: "Driving Layup / Dunk",
    cutLayup: "Cut Layup / Dunk",
    standstillLayup: "Standstill Layup / Dunk",
    lob: "Lob Finish",
    tip: "Tip / Putback",
    uncontested: "Uncontested",
    lightly_contested: "Lightly Contested",
    heavily_contested: "Heavily Contested",
    early: "Early Clock (18-24)",
    middle: "Middle Clock (8-17)",
    late: "Late Clock (4-7)",
    end: "End Clock (0-3)",
    rim: "Rim",
    paint: "Paint",
    short_midrange: "Short Midrange",
    long_midrange: "Long Midrange",
    corner_three: "Corner 3",
    above_break_three: "Above-Break 3",
    backcourt: "Backcourt",
  };

  return labels[value] ?? titleize(value);
}

/** Returns a human-friendly label for dashboard filter keys. */
export function filterLabel(key: string): string {
  const labels: Record<string, string> = {
    player: "Player",
    shotType: "Shot Type",
    complexShotType: "Shot Detail",
    contestLevel: "Contest Level",
    assisted: "Creation",
    catchAndShoot: "Touch Type",
    shotClockBucket: "Shot Clock",
    dateFrom: "From",
    dateTo: "To",
  };

  return labels[key] ?? titleize(key);
}

/** Returns display labels for scalar boolean-style filters. */
export function booleanFilterLabel(key: string, value: string): string {
  if (key === "assisted") return value === "true" ? "Assisted" : "Self-Created";
  if (key === "catchAndShoot") return value === "true" ? "Catch and Shoot" : "Off the Dribble";
  return value;
}

/** Converts snake_case or camelCase fallback labels into title case. */
function titleize(value: string): string {
  return value
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
