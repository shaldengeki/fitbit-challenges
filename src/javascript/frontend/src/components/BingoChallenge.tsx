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

type IconProps = {
    path: string
}

const Icon = ({path}: IconProps) => {
    return (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-1/2 h-1/2 mx-auto">
        <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>);
}

// TODO: pick better icons for steps & distance
const StepsIcon = () => {
    return <Icon path="M3 8.688c0-.864.933-1.405 1.683-.977l7.108 4.062a1.125 1.125 0 010 1.953l-7.108 4.062A1.125 1.125 0 013 16.81V8.688zM12.75 8.688c0-.864.933-1.405 1.683-.977l7.108 4.062a1.125 1.125 0 010 1.953l-7.108 4.062a1.125 1.125 0 01-1.683-.977V8.688z" />;
}

const ActiveMinutesIcon = () => {
    return <Icon path="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />;
}

const DistanceKmIcon = () => {
    return <Icon path="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />;
}

type BingoChallengeTileProps = {
    tile: BingoTile
}

const BingoChallengeTile = ({tile}: BingoChallengeTileProps) => {
    let icon = <p />;
    let text = "";
    if (tile.steps !== null) {
        icon = <StepsIcon />
        text = `${tile.steps}`;
    } else if (tile.activeMinutes !== null) {
        icon = <ActiveMinutesIcon />;
        text = `${tile.activeMinutes}`;
    } else if (tile.distanceKm !== null) {
        icon = <DistanceKmIcon />;
        text = `${tile.distanceKm}`;
    }
    const className = `flex items-center rounded-full aspect-square font-extrabold text-white dark:text-slate-50 text-xl bg-blue-400 dark:bg-indigo-800`
    return (
        <div className={className}>
            <span>
                {icon}
                <p>{text}</p>
            </span>
        </div>
    );
}

type BingoChallengeUnusedAmountsProps = {
    steps: number;
    activeMinutes: number;
    distanceKm: number;
}

const BingoChallengeUnusedAmounts = ({steps, activeMinutes, distanceKm}: BingoChallengeUnusedAmountsProps) => {
    return (
        <div className="grid grid-cols-3 content-center text-left py-4">
            <div className="flex">
                <div className="w-1/3 my-auto">
                    <StepsIcon />
                </div>
                <div className="w-2/3">
                    <div>{steps}</div>
                    <p>Steps</p>
                </div>
            </div>
            <div className="flex">
                <div className="w-1/3 my-auto">
                    <ActiveMinutesIcon />
                </div>
                <div className="w-2/3">
                    <div>{activeMinutes}</div>
                    <p>Active Minutes</p>
                </div>
            </div>
            <div className="flex">
                <div className="w-1/3 my-auto">
                    <DistanceKmIcon />
                </div>
                <div className="w-2/3">
                    <div>{distanceKm}</div>
                    <p>Km</p>
                </div>
            </div>
        </div>
    )
}

type BingoChallengeCardProps = {
    card: BingoCard
    user: User
    currentUser: User
}

const BingoChallengeCard = ({card, user, currentUser}: BingoChallengeCardProps) => {
    console.log(card);

    const tiles = card.tiles.map((tile) => <BingoChallengeTile tile={tile} />);
    return (
        <div className="grid grid-cols-5 grid-rows-5 gap-1 text-center">
            {tiles}
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
