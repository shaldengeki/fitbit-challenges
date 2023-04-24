import React from 'react';
import Activity from '../types/Activity';

type UserActivityLogEntryProps = {
    activity: Activity
}

const UserActivityLogEntry = ( {activity}: UserActivityLogEntryProps) => {
    return (
        <div>{activity.user} recorded {activity.steps} steps</div>
    )
}

type UserActivityLogProps = {
    data: Activity[]
}

const UserActivityLog = ({ data }: UserActivityLogProps) => {
    const entries = data.map(
        (activity: Activity) => {
            return <UserActivityLogEntry key={activity.id} activity={activity} />;
        }
    )
    return (
        <div>
            {entries}
        </div>
    )
}

export default UserActivityLog;
