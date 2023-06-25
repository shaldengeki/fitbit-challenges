import { render, screen } from '@testing-library/react';
import { MockedProvider } from '@apollo/react-testing';
import BingoChallenge, { FETCH_BINGO_QUERY } from './BingoChallenge';
import React from 'react';

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
            <BingoChallenge id={1} />
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
            <BingoChallenge id={1} />
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
            <BingoChallenge id={1} />
        </MockedProvider>,
    );
    expect(await screen.findByText("Could not find a bingo challenge with that ID!")).toBeInTheDocument();
});
