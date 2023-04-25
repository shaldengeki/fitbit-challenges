import React from 'react';
import Activity from '../types/Activity';
import { useMutation, gql } from '@apollo/client';
import {FETCH_ACTIVITIES_QUERY} from './WorkweekHustle';

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
    console.log("time", time)
    if (time !== undefined) {
        currTime = new Date(time * 1000);
    }
    console.log("currTime", currTime)
    const formattedMonth = padDate(currTime.getMonth() + 1);
    const formattedDate = padDate(currTime.getDate());

    return currTime.getFullYear() + "-" + (formattedMonth) + "-" + formattedDate;
}

type UserActivityFormProps = {
    startAt: number
    endAt: number
}

const UserActivityForm = ({ startAt, endAt }: UserActivityFormProps) => {
    const [createUserActivity, {data, loading, error, reset}] = useMutation(
        CREATE_USER_ACTIVITY_MUTATION,
        {
            refetchQueries: [
                {query: FETCH_ACTIVITIES_QUERY},
                'FetchActivities'
            ]
        }
    );

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
        console.log("Data", data);
        innerContent = (
            <form
                onSubmit={e => {
                    e.preventDefault();
                    console.log("recordDate", recordDate.value);
                    const enteredRecordDate = recordDate ? Date.parse(recordDate.value) / 1000 : 0;
                    console.log("enteredRecordDate", enteredRecordDate);
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
                    max={getDate(endAt)}
                    min={getDate(startAt)}
                />
                <input
                    ref={node => {
                        user = node;
                    }}
                />
                <input
                    ref={node => {
                        steps = node;
                    }}
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
