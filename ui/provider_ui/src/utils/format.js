export function secondsToTime(seconds) {
    let hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    let minutes = Math.floor(seconds / 60);
    seconds %= 60;
    return [hours, minutes, seconds].map(v => v < 10 ? "0" + v : v).join(":");
}

export function pcuToDisplay(pcu) {
    return pcu.toString() + " PCU";
}