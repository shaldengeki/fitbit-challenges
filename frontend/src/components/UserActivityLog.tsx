import React from 'react';
import Activity from '../types/Activity';
import {formatDateDifference, getCurrentUnixTime} from '../DateUtils';
import UserActivityForm from './UserActivityForm';

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
        <div className="grid grid-cols-3 gap-0">
            <div className="col-span-2">
                {activity.user} recorded {activity.steps} steps for {formatActivityDate(activity.recordDate)}
            </div>
            <div className="col-span-1 text-right italic">
                {formatDateDifference(getCurrentUnixTime() - activity.createdAt)} ago
            </div>
        </div>
    )
}

type UserActivityLogProps = {
    users: string[]
    data: Activity[]
    startAt: number
    endAt: number
}

const UserActivityLog = ({ users, data, startAt, endAt }: UserActivityLogProps) => {
    const entries = data.map(
        (activityDelta: Activity) => {
            return <UserActivityLogEntry key={activityDelta.id} activity={activityDelta} />;
        }
    )
    return (
        <>
            <div className="grow overflow-y-auto">
                {entries}
            </div>
            <div className="border-t-2 border-slate-50 dark:border-neutral-600 mt-8 pt-4">
                <UserActivityForm users={users} startAt={startAt} endAt={endAt} />
            </div>
        </>
    )
}

export default UserActivityLog;
