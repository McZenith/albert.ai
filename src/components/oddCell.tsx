import React, { useEffect, useState } from 'react';

interface OddsCellProps {
  odds: number;
  previousOdds?: number;
  description: string;
  stakePercentage: number;
}

const OddsCell = ({ odds, previousOdds, description, stakePercentage }: OddsCellProps) => {
  const [animateValue, setAnimateValue] = useState(false);
  const [animateDirection, setAnimateDirection] = useState<'up' | 'down' | null>(null);

  useEffect(() => {
    if (previousOdds && previousOdds !== odds) {
      setAnimateDirection(odds > previousOdds ? 'up' : 'down');
      setAnimateValue(true);
      const timer = setTimeout(() => setAnimateValue(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [odds, previousOdds]);

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm">{description}</span>
      <div className="flex items-center space-x-2">
        <span 
          className={`font-medium ${
            animateValue 
              ? animateDirection === 'up'
                ? 'text-green-600 animate-odds-up'
                : 'text-red-600 animate-odds-down'
              : ''
          }`}
        >
          {odds.toFixed(2)}
        </span>
        <span className="text-xs text-gray-500">
          ({stakePercentage.toFixed(1)}%)
        </span>
      </div>
    </div>
  );
};

export default React.memo(OddsCell);