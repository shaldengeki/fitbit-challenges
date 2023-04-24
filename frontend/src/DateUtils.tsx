export function getCurrentUnixTime(): number {
    const currentTime = Date.now();
    return Math.round(currentTime / 1000);
}

export function formatDateDifference(seconds: number): string {
    let unit = "";
    let quantity = 0;
    if (seconds < 60) {
        unit = "second";
        quantity = seconds;
    } else if (seconds < 3600) {
        quantity = Math.floor(seconds / 60);
        unit = "minute";
    } else if (seconds < 86400) {
        quantity = Math.floor(seconds / 3600);
        unit = "hour";
    } else if (seconds < 604800) {
        quantity = Math.floor(seconds / 86400);
        unit = "day";
    } else if (seconds < 2592000) {
        quantity = Math.floor(seconds / 604800);
        unit = "week";
    } else if (seconds < 31536000) {
        quantity = Math.floor(seconds / 2592000);
        unit = "month";
    } else {
        quantity = Math.floor(seconds / 31536000);
        unit = "year";
    }

    if (quantity > 1) {
        unit = unit + "s";
    }

    return quantity + " " + unit;
}