import React from 'react';
import { RecentMatch } from '@/types/match';

interface RecentMatchesProps {
  matches: RecentMatch[];
  title: string;
  bgColor?: string;
  textColor?: string;
  maxItems?: number;
}

const RecentMatches: React.FC<RecentMatchesProps> = ({
  matches,
  title,
  bgColor = 'bg-gray-50',
  textColor = 'text-gray-700',
  maxItems = 5,
}) => {
  // If no matches, display a message
  if (!matches || matches.length === 0) {
    return (
      <div className={`${bgColor} rounded-lg p-3`}>
        <h4 className='text-xs font-medium text-gray-500 mb-2'>{title}</h4>
        <p className='text-sm text-gray-500 italic'>
          No recent matches available
        </p>
      </div>
    );
  }

  // Sort matches by date (most recent first)
  const sortedMatches = [...matches]
    .sort((a, b) => {
      // Try to convert to dates and compare
      try {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB.getTime() - dateA.getTime();
      } catch {
        return 0;
      }
    })
    .slice(0, maxItems);

  // Get result color based on result
  const getResultColor = (result: 'W' | 'D' | 'L') => {
    switch (result) {
      case 'W':
        return 'bg-green-100 text-green-800';
      case 'D':
        return 'bg-yellow-100 text-yellow-800';
      case 'L':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format date to be more readable
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className={`${bgColor} rounded-lg p-3`}>
      <h4 className='text-xs font-medium text-gray-500 mb-2'>{title}</h4>
      <div className='space-y-2'>
        {sortedMatches.map((match, index) => (
          <div key={index} className='flex justify-between items-center'>
            <div className='flex-1 text-xs'>
              <div className='flex items-center gap-1'>
                <span className='text-xs text-gray-500 font-semibold w-20 truncate'>
                  {formatDate(match.date)}
                </span>
                <div className='flex-1 truncate'>
                  <span className={`${textColor}`}>{match.homeTeam}</span>
                  <span className='mx-1 text-gray-400'>vs</span>
                  <span className={`${textColor}`}>{match.awayTeam}</span>
                </div>
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <span className='text-xs font-semibold'>{match.score}</span>
              <span
                className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${getResultColor(
                  match.result
                )}`}
              >
                {match.result}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentMatches;
