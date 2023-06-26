import { render, screen } from '@testing-library/react';
import { MockedProvider } from '@apollo/react-testing';
import BingoChallenge, { FETCH_BINGO_QUERY } from './BingoChallenge';
import React from 'react';

import { emptyUser } from '../types/User';
import { emptyBingoCard } from '../types/Bingo';

function mockFetchBingoQuery(result: object) {
    return {
        request: {
            query: FETCH_BINGO_QUERY,
            variables: {
                id: 1
            }
        },
        result
    }
}

it('should render a loading screen before data is loaded', async () => {
    const mock = mockFetchBingoQuery({
        data: {
            bingoChallenge: null
        }
    })

    render(
        <MockedProvider mocks={[mock]}>
            <BingoChallenge id={1} currentUser={emptyUser} />
        </MockedProvider>,
    );
    expect(await screen.findByText("Loading...")).toBeInTheDocument();
});

it('should render an error when the query fails', async () => {
    const mock = mockFetchBingoQuery({
        errors: [
            {
                message: "Sample error"
            }
        ]
    })

    render(
        <MockedProvider mocks={[mock]}>
            <BingoChallenge id={1} currentUser={emptyUser} />
        </MockedProvider>,
    );
    expect(await screen.findByText("Error loading bingo challenge!")).toBeInTheDocument();
});


it('should render an error when no challenge exists', async () => {
    const mock = mockFetchBingoQuery({
        data: {
            bingoChallenge: null
        }
    })

    render(
        <MockedProvider mocks={[mock]}>
            <BingoChallenge id={1} currentUser={emptyUser} />
        </MockedProvider>,
    );
    expect(await screen.findByText("Could not find a bingo challenge with that ID!")).toBeInTheDocument();
});

it('should render a bingo card', async () => {
    const mock = mockFetchBingoQuery({
        data: {
            bingoChallenge: {
                id: 1,
                users: [
                    emptyUser,
                ],
                createdAt: 0,
                startAt: 0,
                endAt: 0,
                ended: false,
                bingoCards: [
                    emptyBingoCard,
                ],
                unusedAmounts: {
                    steps: 0,
                    activeMinutes: 0,
                    distanceKm: 0,
                }
            }
        }
    })

    render(
        <MockedProvider mocks={[mock]}>
            <BingoChallenge id={1} currentUser={emptyUser} />
        </MockedProvider>,
    );
    expect(await screen.findByText("Bingo")).toBeInTheDocument();
});
