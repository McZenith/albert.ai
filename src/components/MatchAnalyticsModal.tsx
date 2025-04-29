import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface AnalyticsData {
  [key: string]: {
    total: number;
    hourData: { [hour: string]: number };
  };
}

interface MatchAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: AnalyticsData;
  onTimeSelect: (date: string, hour: string) => void;
  selectedTime: { date: string; hour: string } | null;
}

const MatchAnalyticsModal = ({
  isOpen,
  onClose,
  data,
  onTimeSelect,
  selectedTime,
}: MatchAnalyticsModalProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      // Trigger animation after a small delay to ensure DOM is ready
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsVisible(true);
        });
      });
    } else {
      setIsVisible(false);
      // Wait for animation to finish before removing from DOM
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 200); // Match this with the CSS transition duration
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  const getTimeBoxClass = (date: string, hour: string) => {
    const isSelected =
      selectedTime?.date === date && selectedTime?.hour === hour;
    const baseClass =
      'p-2 rounded-lg text-center cursor-pointer transition-all duration-200 hover:scale-105';

    if (isSelected) {
      return `${baseClass} bg-blue-500 text-white shadow-lg transform scale-105`;
    }
    return `${baseClass} bg-white hover:bg-blue-50 border border-gray-200`;
  };

  return (
    <div
      className={`fixed inset-0 backdrop-blur-[2px] transition-all duration-200 ease-in-out flex items-center justify-center z-50 ${
        isVisible ? 'bg-black/20' : 'bg-black/0'
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`bg-white rounded-xl w-[90%] max-w-4xl max-h-[90vh] overflow-y-auto transition-all duration-200 ease-in-out transform shadow-xl ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        {/* Header */}
        <div className='flex justify-between items-center p-4 border-b border-gray-200 bg-white rounded-t-xl sticky top-0 z-10'>
          <h2 className='text-xl font-semibold text-gray-800'>
            Match Analytics
          </h2>
          <button
            onClick={onClose}
            className='p-2 hover:bg-gray-100 rounded-full transition-colors'
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className='p-6 space-y-8 bg-white'>
          {Object.entries(data).map(([date, { total, hourData }]) => (
            <div key={date} className='space-y-4'>
              <div className='flex justify-between items-center'>
                <h3 className='text-lg font-medium text-gray-700'>
                  {date}{' '}
                  <span className='text-sm text-gray-500'>
                    ({total} matches)
                  </span>
                </h3>
              </div>

              <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4'>
                {Object.entries(hourData)
                  .sort(([hourA], [hourB]) => parseInt(hourA) - parseInt(hourB))
                  .map(([hour, count]) => (
                    <div
                      key={`${date}-${hour}`}
                      className={getTimeBoxClass(date, hour)}
                      onClick={() => onTimeSelect(date, hour)}
                    >
                      <div className='text-lg font-medium'>
                        {hour.padStart(2, '0')}:00
                      </div>
                      <div
                        className={`text-sm ${
                          selectedTime?.date === date &&
                          selectedTime?.hour === hour
                            ? 'text-blue-100'
                            : 'text-gray-500'
                        }`}
                      >
                        {count} {count === 1 ? 'match' : 'matches'}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className='p-4 border-t border-gray-200 bg-white rounded-b-xl sticky bottom-0'>
          <div className='flex justify-between items-center'>
            <div className='text-sm text-gray-500'>
              {selectedTime
                ? `Selected: ${
                    selectedTime.date
                  } at ${selectedTime.hour.padStart(2, '0')}:00`
                : 'Click on a time box to filter matches'}
            </div>
            <button
              onClick={onClose}
              className='px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors'
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchAnalyticsModal;
 