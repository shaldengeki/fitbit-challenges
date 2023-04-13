import React from 'react';
import ProgressBar from './ProgressBar.tsx';
// import { useQuery, gql } from '@apollo/client';

const UserLeaderboardHeader = () => (
    <div className='col-span-3 text-center text-2xl'>Leaderboard</div>
);

const UserLeaderboardListingEntry = (props) => {
    const {user, maxSteps} = props;
    return (
        <div className="grid grid-cols-3 gap-0">
            <div className="col-span-2">{user['name']}</div>
            <ProgressBar value={user['steps']} maximum={maxSteps} />
        </div>
    );
};

const UserLeaderboardListing = () => {
    const users = [
        {"name": "merlyneve", "steps": 1234},
        {"name": "ouguoc", "steps": 567},
    ];

    const maxSteps = Math.max.apply(null, users.map((user, _) => user['steps']))
    const entries = users.map((user, _) => <UserLeaderboardListingEntry user={user} maxSteps={maxSteps} />);

    return (
        <div>
            {entries}
        </div>
    )
}

const UserLeaderboard = () => {
//   const { loading, error, data } = useQuery(TEST_QUERY);

//   if (loading) return <p>Loading...</p>;

//   if (error) return <p>Error : {error.message}</p>;

  return (
    <div className="bg-blue-200 p-2">
        <UserLeaderboardHeader />
        <UserLeaderboardListing />
    </div>
  )
}

export default UserLeaderboard;