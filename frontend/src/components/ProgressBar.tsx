import * as React from 'react';

type ProgressBarProps = {
    value: number;
    maximum: number;
}

const ProgressBar = ({ value, maximum }: ProgressBarProps) => {
    const inversePercent = 100 - (100 * value / maximum);
    const barStyles = {
        "width": `${inversePercent}%`
    };
    return (
        <div className="mb-6 h-7 w-full bg-teal-400 text-right">
            <div className="h-7 bg-neutral-200 dark:bg-neutral-600" style={barStyles}>
                {value}
            </div>
        </div>
    );
};

export default ProgressBar;