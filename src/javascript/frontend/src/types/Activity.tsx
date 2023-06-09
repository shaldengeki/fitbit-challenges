type Activity = {
    id: number;
    user: string;
    createdAt: number;
    recordDate: string;
    steps: number;
    activeMinutes: number;
    distanceKm: number;
}

export const emptyActivity: Activity = {
    id: 0,
    user: '',
    createdAt: 0,
    recordDate: '',
    steps: 0,
    activeMinutes: 0,
    distanceKm: 0,
}

export type ActivityDelta = {
    id: number;
    user: string;
    createdAt: number;
    recordDate: string;
    steps: number;
    stepsDelta: number;
    activeMinutes: number;
    activeMinutesDelta: number;
    distanceKm: number;
    distanceKmDelta: number;
}

export const emptyActivityDelta: ActivityDelta = {
    id: 0,
    user: '',
    createdAt: 0,
    recordDate: '',
    steps: 0,
    stepsDelta: 0,
    activeMinutes: 0,
    activeMinutesDelta: 0,
    distanceKm: 0,
    distanceKmDelta: 0,
}

export type ActivityTotal = {
    name: string;
    value: number;
    unit: string;
}

export function formatActivityDate(recordDate: string): string {
    const dateObj = new Date(recordDate + "T00:00:00");
    return dateObj.toLocaleDateString(
        undefined,
        {
            weekday: 'long',
        }
    )
}

export default Activity;
