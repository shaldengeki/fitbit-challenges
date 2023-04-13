import React from 'react';
// import { useQuery, gql } from '@apollo/client';

const UserLeaderboardHeader = () => (
    <div className='col-span-3 text-center text-2xl'>Leaderboard</div>
);

const UserLeaderboardListing = () => {
    return (
        <div className="grid grid-cols-3 gap-0">
            <div className="col-span-2">merlyneve</div>
            <div className="text-right">1,234</div>
            <div className="col-span-2">ouguoc</div>
            <div className="text-right">567</div>
        </div>
    )
}

const UserLeaderboard = () => {
//   const { loading, error, data } = useQuery(TEST_QUERY);

//   if (loading) return <p>Loading...</p>;

//   if (error) return <p>Error : {error.message}</p>;

  return (
    <div>
        <UserLeaderboardHeader />
        <UserLeaderboardListing />
    </div>
  )
}

export default UserLeaderboard;