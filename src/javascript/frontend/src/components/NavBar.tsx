import React from 'react';
import fitbit from './fitbit.png';
import logo192 from './logo192.png';
import { Link } from 'react-router-dom';
import { useQuery, gql } from '@apollo/client';

export const FETCH_CURRENT_USER_QUERY = gql`
    query FetchCurrentUser {
          currentUser {
            fitbitUserId
            displayName
            createdAt
          }
      }
`;


type NavBarProps = {
    className?: string;
}

const NavBar = (props: NavBarProps) => {
    const { loading, error, data } = useQuery(
        FETCH_CURRENT_USER_QUERY,
    );

    return (
        <div className="leading-6 w-full sticky border-b border-b-slate-50 py-4 px-4 bg-blue-200 dark:bg-slate-900 dark:text-slate-400">
            <div className="relative flex items-center gap-4">
                <img className="flex-none h-12 inline" src={logo192} alt="Fitbit app icon" />
                <div className="dark:hover:text-slate-300 hover:text-slate-500">
                    <Link to={'/challenges'}>
                        <p className="font-bold">Challenges</p>
                    </Link>
                </div>
                {
                    loading && <p>Loading...</p>
                }
                {
                    error && <p>Error loading login state</p>
                }
                {
                    data && data.currentUser === null &&
                    <Link to={'/auth'} className="ml-auto dark:hover:text-slate-300 hover:text-slate-500">
                        <img className="h-5 inline" src={fitbit} alt="Fitbit app icon" />
                        <span className="font-bold">Sign in with Fitbit</span>
                    </Link>
                }
                {
                    data && data.currentUser && <p className="ml-auto">{data.currentUser.displayName}</p>
                }
            </div>
        </div>
    );
};

export default NavBar;
