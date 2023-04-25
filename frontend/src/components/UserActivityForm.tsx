import React from 'react';
import { useMutation, gql } from '@apollo/client';
import {FETCH_ACTIVITIES_QUERY} from './WorkweekHustle';
import {getCurrentUnixTime} from '../DateUtils';
import Activity from '../types/Activity';

const CREATE_USER_ACTIVITY_MUTATION = gql`
    mutation CreateUserActivity(
        $user:String!,
        $recordDate:Int!,
        $steps:Int!,
    ) {
        createUserActivity(
            recordDate:$recordDate,
            user:$user,
            steps:$steps,
            activeMinutes:0,
            distanceKm:0
        ) {
            id
            recordDate
            user
            steps
        }
    }
`

const UPDATE_USER_ACTIVITY_MUTATION = gql`
    mutation UpdateUserActivity(
        $id:Int!,
        $user:String!,
        $recordDate:Int!,
        $steps:Int!,
    ) {
        updateUserActivity(
            id:$id,
            recordDate:$recordDate,
            user:$user,
            steps:$steps,
            activeMinutes:0,
            distanceKm:0
        ) {
            id
            recordDate
            user
            steps
        }
    }
`

function padDate(date: number): string {
    let formattedDate = "" + date;
    if (date < 10) {
        formattedDate = "0" + formattedDate;
    }
    return formattedDate;
}

function getDate(time?: number): string {
    let currTime = new Date();
    if (time !== undefined) {
        currTime = new Date(time * 1000);
    }
    const formattedMonth = padDate(currTime.getMonth() + 1);
    const formattedDate = padDate(currTime.getDate());

    return currTime.getFullYear() + "-" + (formattedMonth) + "-" + formattedDate;
}


type MutationErrorDialogProps = {
    error: any
    reset: Function
}

const MutationErrorDialog = ({ error, reset }: MutationErrorDialogProps) => {
    return (
        <dialog className="absolute inset-0" open>
            <p className="text-lg font-bold">Error recording your steps:</p>
            <p>{error.networkError?.message}</p>
            <button
                className="p-0.5 rounded bg-teal-400 dark:bg-pink-900 dark:text-slate-400"
                value="cancel"
                formMethod="dialog"
                onClick={() => reset()}
            >
                Close
            </button>
        </dialog>
    );
}

type MutationSuccessDialogProps = {
    reset: Function
}

const MutationSuccessDialog = ({ reset }: MutationSuccessDialogProps) => {
    return (
        <dialog className="absolute inset-0" open>
            <p className="text-lg font-bold">🎉Activity logged!🎉</p>
            <button
                className="p-0.5 rounded bg-teal-400 dark:bg-pink-900 dark:text-slate-400"
                value="cancel"
                formMethod="dialog"
                onClick={() => reset()}
            >
                Close
            </button>
        </dialog>
    );
}

type UserActivityFormProps = {
    users: string[]
    startAt: number
    endAt: number
    editedActivity: Activity
}

const UserActivityForm = ({ users, startAt, endAt, editedActivity }: UserActivityFormProps) => {
    const [
        createUserActivity,
        {
            data: createUserActivityData,
            loading: createUserActivityLoading,
            error: createUserActivityError,
            reset: createUserActivityReset
        }
    ] = useMutation(
        CREATE_USER_ACTIVITY_MUTATION,
        {
            refetchQueries: [
                {
                    query: FETCH_ACTIVITIES_QUERY,
                    variables: {
                        users,
                        recordedAfter: startAt,
                        recordedBefore: endAt,
                    }
                },
                'FetchActivities'
            ]
        }
    );
    const [
        updateUserActivity,
        {
            data: updateUserActivityData,
            loading: updateUserActivityLoading,
            error: updateUserActivityError,
            reset: updateUserActivityReset
        }
    ] = useMutation(
        UPDATE_USER_ACTIVITY_MUTATION,
        {
            refetchQueries: [
                {
                    query: FETCH_ACTIVITIES_QUERY,
                    variables: {
                        users,
                        recordedAfter: startAt,
                        recordedBefore: endAt,
                    }
                },
                'FetchActivities'
            ]
        }
    );

    if (createUserActivityLoading || updateUserActivityLoading) {
        return <p>Loading...</p>
    }

    const maxDate = endAt > getCurrentUnixTime() ? getCurrentUnixTime() : endAt;

    let recordDateNode: any;
    let userNode: any;
    let stepsNode: any;
    let idNode: any;

    const id = (editedActivity.id === 0) ? 0 : editedActivity.id;
    const date = (editedActivity.id === 0) ? getDate() : getDate(editedActivity.recordDate);
    const selectedUser = (editedActivity.id === 0) ? "" : editedActivity.user;
    const userElements = users.map((user) => {
        if (user === selectedUser) {
            return <option key={user} value={user} selected={true}>{user}</option>
        } else {
            return <option key={user} value={user}>{user}</option>
        }
    });
    const steps = (editedActivity.id === 0) ? 0 : editedActivity.steps;

    return <>
        <form
            className="space-x-1"
            onSubmit={e => {
                e.preventDefault();
                const enteredRecordDate = recordDateNode ? Date.parse(recordDateNode.value) / 1000 : 0;
                const enteredUser = userNode ? userNode.value : "";
                const enteredSteps = parseInt(stepsNode ? stepsNode.value : "0", 10);
                const enteredId = parseInt(idNode ? idNode.value : "0", 10);
                console.log("enteredId", enteredId);
                if (enteredId !== 0 && !isNaN(enteredId)) {
                    updateUserActivity({
                        variables: {
                            id: enteredId,
                            recordDate: enteredRecordDate,
                            user: enteredUser,
                            steps: enteredSteps
                        }
                    })
                } else {
                    createUserActivity({
                        variables: {
                            recordDate: enteredRecordDate,
                            user: enteredUser,
                            steps: enteredSteps
                        }
                    })
                }
            }}
        >
            <input
                hidden={true}
                value={id}
                ref={node => {
                    idNode = node;
                }}
            />
            <input
                className="rounded p-0.5"
                type="date"
                ref={node => {
                    recordDateNode = node;
                }}
                value={date}
                max={getDate(maxDate)}
                min={getDate(startAt)}
            />
            <select
                className="rounded p-0.5"
                ref={node => {
                    userNode = node;
                }}>
                {userElements}
            </select>
            <input
                type='number'
                className="rounded p-0.5 w-40"
                ref={node => {
                    stepsNode = node;
                }}
                value={steps}
                placeholder="Today's total steps"
            />
            <button
                className="p-0.5 rounded bg-teal-400 dark:bg-pink-900 dark:text-slate-400"
                type="submit"
            >
                Log activity
            </button>
        </form>
        {
            createUserActivityError &&
                <MutationErrorDialog
                    error={createUserActivityError}
                    reset={createUserActivityReset}
                />
        }
        {
            updateUserActivityError &&
                <MutationErrorDialog
                    error={updateUserActivityError}
                    reset={updateUserActivityReset}
                />
        }
        {
            createUserActivityData &&
                <MutationSuccessDialog
                    reset={createUserActivityReset}
                />
        }
        {
            updateUserActivityData &&
                <MutationSuccessDialog
                    reset={updateUserActivityReset}
                />
        }
    </>;
}

export default UserActivityForm;
