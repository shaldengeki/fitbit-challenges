import React from 'react';
import ProgressBar from './ProgressBar';
import {ActivityTotal} from '../types/Activity';
import {getCurrentUnixTime, formatDateDifference} from '../DateUtils';
import { Link } from "react-router-dom";

export type UserData = {
    name: string;
    value: number;
    unit: string;
}

type UserLeaderboardHeaderProps = {
    title: string;
    id: number;
    startAt: number;
    endAt: number;
    ended: boolean;
    sealAt: number;
    sealed: boolean;
}

const UserLeaderboardHeader = ({ title, id, startAt, endAt, ended, sealAt, sealed }: UserLeaderboardHeaderProps) => {
    let timingCopy = "";
    if (ended) {
        timingCopy = "Ended " + formatDateDifference(getCurrentUnixTime() - endAt) + " ago";
        if (!sealed) {
            timingCopy = "⚠️" + timingCopy + `. ${formatDateDifference(sealAt - getCurrentUnixTime())} left to record data!⚠️`
        }
    } else if (getCurrentUnixTime() > startAt) {
        timingCopy = "Started " + formatDateDifference(getCurrentUnixTime() - startAt) + " ago (ends in " + formatDateDifference(endAt - getCurrentUnixTime()) + ")";
    } else {
        timingCopy = "Will start in " + formatDateDifference(startAt - getCurrentUnixTime());
    }
    return (
        <div className="border-b-2 border-slate-50 dark:border-neutral-600 mb-8 pb-4">
            <div className='col-span-3 text-center text-2xl'><a href={`/challenges/${id}`}>{title}</a></div>
            <div className='col-span-3 text-center'>{timingCopy}</div>
        </div>
    );
};

type UserLeaderboardListingEntryProps = {
    activityTotal: ActivityTotal;
    maximum: number;
    sealed: boolean;
    rank: number;
}

export const UserLeaderboardListingEntry = ({ activityTotal, maximum, sealed, rank }: UserLeaderboardListingEntryProps) => {
    let placeEmoji = "";
    if (sealed) {
        if (rank === 1) {
            placeEmoji = "🥇";
        } else if (rank === 2) {
            placeEmoji = "🥈";
        } else if (rank === 3) {
            placeEmoji = "🥉";
        }
    }
    return (
        <div className="grid grid-cols-3 gap-0">
            <div className="col-span-2">{placeEmoji}{activityTotal.name}</div>
            <ProgressBar value={activityTotal.value} maximum={maximum} />
        </div>
    );
};

type UserLeaderboardListingProps = {
    users: string[];
    activityTotals: ActivityTotal[];
    unit: string;
    sealed: boolean;
}

const UserLeaderboardListing = ({ users, activityTotals, unit, sealed }: UserLeaderboardListingProps) => {
    // Compute the totals per user.
    const userTotals = users.map((user, _) => {
        return {
            'name': user,
            'value': activityTotals.filter(at => at.name === user).reduce((acc, curr) => acc + curr.value, 0),
             unit,
        };
    }).sort((a, b) => b.value - a.value);
    const maxValue = Math.max.apply(null, userTotals.map((at, _) => at.value));
    const entries = userTotals.map((at, idx) => <UserLeaderboardListingEntry key={at.name} activityTotal={at} maximum={maxValue} sealed={sealed} rank={idx + 1} />);

    return (
        <div>
            {entries}
        </div>
    )
}

type UserLeaderboardProps = {
    challengeName: string;
    id: number;
    users: string[];
    activityTotals: ActivityTotal[];
    startAt: number;
    endAt: number;
    ended: boolean;
    sealAt: number;
    sealed: boolean;
    unit: string;
}

const UserLeaderboard = ({ challengeName, id, users, activityTotals, startAt, endAt, ended, sealAt, sealed, unit }: UserLeaderboardProps) => {
  return (
    <div>
        <UserLeaderboardHeader title={challengeName} id={id} startAt={startAt} endAt={endAt} ended={ended} sealAt={sealAt} sealed={sealed} />
        <UserLeaderboardListing users={users} activityTotals={activityTotals} unit={unit} sealed={sealed} />
    </div>
  )
}

export default UserLeaderboard;
