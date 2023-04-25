import React from 'react';
import Activity from '../types/Activity';

type UserActivityFormProps = {
    activity?: Activity
}

const UserActivityForm = ({ activity }: UserActivityFormProps) => {
    return (
        <div>
            Activity form here!
        </div>
    )
}

export default UserActivityForm;
