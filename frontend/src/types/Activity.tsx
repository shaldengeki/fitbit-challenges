type Activity = {
    id: number;
    user: string;
    createdAt: number;
    recordDate: string;
    steps: number;
    activeMinutes: number;
    distanceKm: number;
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

export default Activity;
