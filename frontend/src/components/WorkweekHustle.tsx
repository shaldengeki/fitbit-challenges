import * as React from 'react';
import { useQuery, gql } from '@apollo/client';

import UserLeaderboard from './UserLeaderboard';

export const FETCH_WORKWEEK_HUSTLE_QUERY = gql`
  query FetchChallenge($id: Int!) {
        challenges(id: $id) {
            id
            users
            createdAt
            startAt
            endAt
        }
    }
`;

type WorkweekHustleProps = {
    id: number;
}

const WorkweekHustle = ({id}: WorkweekHustleProps) => {
    const { loading, error, data } = useQuery(
        FETCH_WORKWEEK_HUSTLE_QUERY,
        {variables: { id }},
     );

   if (loading) return <p>Loading...</p>;

   if (error) return <p>Error : {error.message}</p>;

   const challenge = data.challenges[0];
   const users = challenge.users.split(",");

    return (
        <div>
            <UserLeaderboard challengeName={"Workweek Hustle"} id={id} users={users} createdAt={challenge.createdAt} startAt={challenge.startAt} endAt={challenge.endAt} />
        </div>
    );
};

export default WorkweekHustle;
