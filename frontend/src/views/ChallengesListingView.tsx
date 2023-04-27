import React from 'react';
import { useQuery, gql } from '@apollo/client';
import PageContainer from '../components/PageContainer';
import PageTitle from "../components/PageTitle";
import Challenge from "../types/Challenge";

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

type ChallengesListingTableProps = {
    challenges: Challenge[]
}

const ChallengesListingTable = ({ challenges }: ChallengesListingTableProps) => {
    return <p>Table here!</p>
}

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
        innerContent = (
            <ChallengesListingTable challenges={data.challenges} />
        )
    }

    return (
        <PageContainer>
            <PageTitle>Challenges</PageTitle>
            { innerContent }
        </PageContainer>
    )
}

export default ChallengesListingView;
