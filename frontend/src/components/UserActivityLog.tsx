import React, {useState} from 'react';
import Activity, {ActivityDelta} from '../types/Activity';
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
    delta: ActivityDelta
    editHook: Function
}

const UserActivityLogEntry = ( {delta, editHook}: UserActivityLogEntryProps) => {
    return (
        <div className="grid grid-cols-3 gap-0">
            <div className="col-span-2">
                {delta.user} recorded {delta.stepsDelta} steps for {formatActivityDate(delta.recordDate)}
            </div>
            <div className="col-span-1 text-right italic">
                <span>
                    {formatDateDifference(getCurrentUnixTime() - delta.createdAt)} ago
                    <button onClick={() => editHook(delta as Activity)}>✏️</button>
                </span>
            </div>
        </div>
    )
}

type UserActivityLogProps = {
    users: string[]
    deltas: ActivityDelta[]
    startAt: number
    endAt: number
}

const UserActivityLog = ({ users, deltas, startAt, endAt }: UserActivityLogProps) => {
    const [editedActivity, setEditedActivity] = useState({
        id: 0,
        user: '',
        createdAt: 0,
        recordDate: 0,
        steps: 0,
        activeMinutes: 0,
        distanceKm: 0,
    });
    const entries = deltas.map(
        (delta: ActivityDelta) => {
            return <UserActivityLogEntry key={delta.id} delta={delta} editHook={setEditedActivity} />;
        }
    )
    return (
        <>
            <div className="grow overflow-y-auto">
                {entries}
            </div>
            <div className="border-t-2 border-slate-50 dark:border-neutral-600 mt-8 pt-4">
                <UserActivityForm users={users} startAt={startAt} endAt={endAt} editedActivity={editedActivity} editActivityHook={setEditedActivity} />
            </div>
        </>
    )
}

export default UserActivityLog;
