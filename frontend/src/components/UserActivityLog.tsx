import React from 'react';
import Activity from '../types/Activity';

function formatActivityDate(unixTime: number): string {
    const dateObj = new Date(unixTime*1000);
    return dateObj.toLocaleDateString(
        undefined,
        {
            weekday: 'long',
        }
    )
}

type UserActivityLogEntryProps = {
    activity: Activity
}

const UserActivityLogEntry = ( {activity}: UserActivityLogEntryProps) => {
    return (
        <div>{activity.user} recorded {activity.steps} steps for {formatActivityDate(activity.recordDate)}</div>
    )
}

type UserActivityLogProps = {
    data: Activity[]
}

const UserActivityLog = ({ data }: UserActivityLogProps) => {
    const entries = data.map(
        (activityDelta: Activity) => {
            return <UserActivityLogEntry key={activityDelta.id} activity={activityDelta} />;
        }
    )
    return (
        <div>
            {entries}
        </div>
    )
}

export default UserActivityLog;
