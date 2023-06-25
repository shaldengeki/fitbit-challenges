import * as React from 'react';
import _ from 'lodash'
import { useQuery, gql } from '@apollo/client';

import Activity, {ActivityDelta, ActivityTotal, emptyActivity, emptyActivityDelta} from '../types/Activity';
import User from '../types/User';

export const FETCH_BINGO_QUERY = gql`
    query FetchBingo($id: Int!) {
          bingoChallenge(id: $id) {
              id
              users {
                fitbitUserId
                displayName
              }
              createdAt
              startAt
              endAt
              ended
              bingoCards {
                user {
                    fitbitUserId
                    displayName
                }
                rows
                columns
                tiles {
                    steps
                    activeMinutes
                    distanceKm
                    coordinateX
                    coordinateY
                    flipped
                    requiredForWin
                }
              }
              unusedAmounts {
                steps
                activeMinutes
                distanceKm
              }
          }
      }
`;

type BingoChallengeProps = {
    id: number;
}

const BingoChallenge = ({id}: BingoChallengeProps) => {
    const  {loading, error, data } = useQuery(
        FETCH_BINGO_QUERY,
        {variables: { id }},
    );
    if (loading) {
        return <p>Loading...</p>
    }
    if (error) {
        return <p>Error loading bingo challenge!</p>
    }
    if (!data.bingoChallenge) {
        return <p>Could not find a bingo challenge with that ID!</p>
    }

    return (
        <div>
            <p>Bingo challenge here, yay</p>
        </div>
    )
};

export default BingoChallenge;
