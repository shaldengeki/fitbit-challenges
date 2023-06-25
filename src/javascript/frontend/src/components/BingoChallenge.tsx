import React, {useState} from 'react';
import _ from 'lodash'
import { useQuery, gql } from '@apollo/client';

import PageTitle from './PageTitle';
import Activity, {ActivityDelta, ActivityTotal, emptyActivity, emptyActivityDelta} from '../types/Activity';
import User from '../types/User';
import BingoCard, {BingoTile} from '../types/Bingo';

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

type BingoChallengeUnusedAmountsProps = {
    steps: number;
    activeMinutes: number;
    distanceKm: number;
}

const BingoChallengeUnusedAmounts = ({steps, activeMinutes, distanceKm}: BingoChallengeUnusedAmountsProps) => {
    return (
        <ul>
            <li>{steps} steps</li>
            <li>{activeMinutes} active minutes</li>
            <li>{distanceKm} km</li>
        </ul>
    )
}

type BingoChallengeCardProps = {
    card: BingoCard
    user: User
    currentUser: User
}

const BingoChallengeCard = ({card, user, currentUser}: BingoChallengeCardProps) => {
    console.log(card);
    return (
        <div className="grid grid-cols-5 gap-1">
            <div>01</div>
            <div>02</div>
            <div>03</div>
            <div>04</div>
            <div>05</div>
            <div>06</div>
        </div>
    )
}

type BingoChallengeProps = {
    id: number;
    currentUser: User;
}

const BingoChallenge = ({id, currentUser}: BingoChallengeProps) => {
    const [displayedUser, setDisplayedUser] = useState<User>(currentUser);
    const {loading, error, data } = useQuery(
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

    const cards: Array<BingoCard> = data.bingoChallenge.bingoCards;
    const displayedCard = cards.filter(
        (card) => card.user.fitbitUserId === displayedUser.fitbitUserId
    )[0];

    return (
        <div>
            <PageTitle className="text-center">Bingo</PageTitle>
            <BingoChallengeUnusedAmounts
                steps={data.bingoChallenge.unusedAmounts.steps}
                activeMinutes={data.bingoChallenge.unusedAmounts.activeMinutes}
                distanceKm={data.bingoChallenge.unusedAmounts.distanceKm}
            />
            <BingoChallengeCard
                card={displayedCard}
                user={displayedUser}
                currentUser={currentUser}
            />
        </div>
    )
};

export default BingoChallenge;
