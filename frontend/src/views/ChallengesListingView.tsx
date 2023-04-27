import React from 'react';
import { useQuery, gql } from '@apollo/client';
import PageTitle from "../components/PageTitle";

export const FETCH_CHALLENGES_QUERY = gql`
    query FetchChallenges {
          challenges {
              id
              users
              createdAt
              startAt
              endAt
              ended
              sealAt
              sealed
          }
      }
`;

const ChallengesListingView = () => {
    const  {loading, error, data } = useQuery(
        FETCH_CHALLENGES_QUERY,
    );

    let innerContent = <p></p>;
    if (loading) innerContent = <p>Loading...</p>;
    else if (error) innerContent = <p>Error: {error.message}</p>;
    else if (data.challenges.length < 1) {
        innerContent = <p>No challenges found!</p>;
    } else {
        innerContent = <p>Loaded!</p>
    }

    return (
        <div className="dark:bg-neutral-600 dark:text-slate-400 h-screen">
            <div className="container mx-auto bg-blue-200 dark:bg-indigo-950 dark:text-slate-400 p-2 h-screen flex flex-col">
                <PageTitle>Challenges</PageTitle>
                { innerContent }
            </div>
        </div>
    )
}

export default ChallengesListingView;
