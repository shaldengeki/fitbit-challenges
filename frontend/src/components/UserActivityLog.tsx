import React from 'react';
import Activity from '../types/Activity';

type UserActivityLogProps = {
    activities: Activity[]
}

const UserActivityLog = ({ activities }: UserActivityLogProps) => {
  return (
    <div>
        Activity log here!
    </div>
  )
}

export default UserActivityLog;
