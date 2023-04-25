import React from 'react';
import { useMutation, gql } from '@apollo/client';
import {FETCH_ACTIVITIES_QUERY} from './WorkweekHustle';
import {getCurrentUnixTime} from '../DateUtils';

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

type UserActivityFormProps = {
    users: string[]
    startAt: number
    endAt: number
}

const UserActivityForm = ({ users, startAt, endAt }: UserActivityFormProps) => {
    const [createUserActivity, {data, loading, error, reset}] = useMutation(
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

    const maxDate = endAt > getCurrentUnixTime() ? getCurrentUnixTime() : endAt;

    let recordDate: any;
    let user: any;
    let steps: any;

    let innerContent = <div></div>;
    if (loading) innerContent = <p>Loading...</p>
    else if (error) return <p>Error!</p>
    else if (data) {
        reset()
    }
    else {
        const userElements = users.map((user) => {
            return <option key={user} value={user}>{user}</option>
        });

        innerContent = (
            <form
                onSubmit={e => {
                    e.preventDefault();
                    const enteredRecordDate = recordDate ? Date.parse(recordDate.value) / 1000 : 0;
                    const enteredUser = user ? user.value : "";
                    const enteredSteps = parseInt(steps ? steps.value : "0", 10);
                    createUserActivity({
                        variables: {
                            recordDate: enteredRecordDate,
                            user: enteredUser,
                            steps: enteredSteps
                        }
                    })
                }}>
                <input
                    type="date"
                    ref={node => {
                        recordDate = node;
                    }}
                    defaultValue={getDate()}
                    max={getDate(maxDate)}
                    min={getDate(startAt)}
                />
                <select
                    ref={node => {
                        user = node;
                    }}>
                    {userElements}
                </select>
                <input
                    ref={node => {
                        steps = node;
                    }}
                    placeholder="Today's total step count"
                />
                <button type="submit">Log activity</button>
            </form>
        );
    }

    return (
        <div>
            {innerContent}
        </div>
    )
}

export default UserActivityForm;
