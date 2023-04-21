import React from 'react';
import { useQuery, gql } from '@apollo/client';
import { useParams } from 'react-router-dom';
import WorkweekHustle from '../components/WorkweekHustle';


type ChallengeViewParams = {
  challengeId: string;
}

const ChallengeView = () => {
    let { challengeId } = useParams<ChallengeViewParams>();
    const id = parseInt(challengeId || "0", 10);

    return (
    <div className="container mx-auto">
        <WorkweekHustle id={id} />
    </div>
  )
}

export default ChallengeView;
