<div className='overflow-x-auto'>
  <table className='w-full bg-white rounded-lg overflow-hidden border border-gray-200'>
    <thead>
      <tr className='bg-gray-50 border-b border-gray-200'>
        <th className='p-2 text-left whitespace-nowrap'></th>
        <th className='p-2 text-left whitespace-nowrap text-sm font-medium text-gray-500 min-w-[180px]'>
          Match
        </th>
        <th
          className='p-2 text-center whitespace-nowrap cursor-pointer hover:bg-gray-100 text-sm font-medium text-gray-500 min-w-[70px]'
          onClick={() => handleSort('playedSeconds')}
        >
          Time
          {sortField === 'playedSeconds' && (
            <span className='ml-1'>{sortDirection === 'asc' ? '↑' : '↓'}</span>
          )}
        </th>
        <th
          className='p-2 text-center whitespace-nowrap cursor-pointer hover:bg-gray-100 text-sm font-medium text-gray-500 min-w-[70px]'
          onClick={() => handleSort('homeScore')}
        >
          Score
          {sortField === 'homeScore' && (
            <span className='ml-1'>{sortDirection === 'asc' ? '↑' : '↓'}</span>
          )}
        </th>
        <th
          className='p-2 text-center whitespace-nowrap cursor-pointer hover:bg-gray-100 text-sm font-medium text-gray-500 min-w-[70px]'
          onClick={() => handleSort('awayScore')}
        >
          Score
          {sortField === 'awayScore' && (
            <span className='ml-1'>{sortDirection === 'asc' ? '↑' : '↓'}</span>
          )}
        </th>
        <th
          className='p-2 text-center whitespace-nowrap cursor-pointer hover:bg-gray-100 text-sm font-medium text-gray-500 min-w-[70px]'
          onClick={() => handleSort('homeAvg')}
        >
          Home Avg
          {sortField === 'homeAvg' && (
            <span className='ml-1'>{sortDirection === 'asc' ? '↑' : '↓'}</span>
          )}
        </th>
        <th
          className='p-2 text-center whitespace-nowrap cursor-pointer hover:bg-gray-100 text-sm font-medium text-gray-500 min-w-[70px]'
          onClick={() => handleSort('awayAvg')}
        >
          Away Avg
          {sortField === 'awayAvg' && (
            <span className='ml-1'>{sortDirection === 'asc' ? '↑' : '↓'}</span>
          )}
        </th>
        <th
          className='p-2 text-center whitespace-nowrap cursor-pointer hover:bg-gray-100 text-sm font-medium text-gray-500 min-w-[60px]'
          onClick={() => handleSort('positionGap')}
        >
          Pos Gap
          {sortField === 'positionGap' && (
            <span className='ml-1'>{sortDirection === 'asc' ? '↑' : '↓'}</span>
          )}
        </th>
        <th className='p-2 text-center whitespace-nowrap cursor-pointer hover:bg-gray-100 text-sm font-medium text-gray-500 min-w-[70px]'>
          H/A Pos
        </th>
        <th
          className='p-2 text-center whitespace-nowrap cursor-pointer hover:bg-gray-100 text-sm font-medium text-gray-500 min-w-[70px]'
          onClick={() => handleSort('homeAwayForm')}
        >
          H/A Form
          {sortField === 'homeAwayForm' && (
            <span className='ml-1'>{sortDirection === 'asc' ? '↑' : '↓'}</span>
          )}
        </th>
        <th
          className='p-2 text-center whitespace-nowrap cursor-pointer hover:bg-gray-100 text-sm font-medium text-gray-500 min-w-[80px]'
          onClick={() => handleSort('formPoints')}
        >
          Form Pts %
          {sortField === 'formPoints' && (
            <span className='ml-1'>{sortDirection === 'asc' ? '↑' : '↓'}</span>
          )}
        </th>
        <th
          className='p-2 text-center whitespace-nowrap cursor-pointer hover:bg-gray-100 text-sm font-medium text-gray-500 min-w-[60px]'
          onClick={() => handleSort('form')}
        >
          Form
          {sortField === 'form' && (
            <span className='ml-1'>{sortDirection === 'asc' ? '↑' : '↓'}</span>
          )}
        </th>
        <th
          className='p-2 text-center whitespace-nowrap cursor-pointer hover:bg-gray-100 text-sm font-medium text-gray-500 min-w-[60px]'
          onClick={() => handleSort('h2h')}
        >
          H2H
          {sortField === 'h2h' && (
            <span className='ml-1'>{sortDirection === 'asc' ? '↑' : '↓'}</span>
          )}
        </th>
        <th
          className='p-2 text-center whitespace-nowrap cursor-pointer hover:bg-gray-100 text-sm font-medium text-gray-500 min-w-[60px]'
          onClick={() => handleSort('expectedGoals')}
        >
          xGoals
          {sortField === 'expectedGoals' && (
            <span className='ml-1'>{sortDirection === 'asc' ? '↑' : '↓'}</span>
          )}
        </th>
        <th
          className='p-2 text-center whitespace-nowrap cursor-pointer hover:bg-gray-100 text-sm font-medium text-gray-500 min-w-[70px]'
          onClick={() => handleSort('odds.over15Goals')}
        >
          Over 1.5
          {sortField === 'odds.over15Goals' && (
            <span className='ml-1'>{sortDirection === 'asc' ? '↑' : '↓'}</span>
          )}
        </th>
        <th
          className='p-2 text-center whitespace-nowrap cursor-pointer hover:bg-gray-100 text-sm font-medium text-gray-500 min-w-[80px]'
          onClick={() => handleSort('defensiveStrength')}
        >
          Def Rating
          {sortField === 'defensiveStrength' && (
            <span className='ml-1'>{sortDirection === 'asc' ? '↑' : '↓'}</span>
          )}
        </th>
        <th className='p-2 text-center whitespace-nowrap text-sm font-medium text-gray-500 min-w-[120px]'>
          Favorite
        </th>
        <th
          className='p-2 text-center whitespace-nowrap cursor-pointer hover:bg-gray-100 text-sm font-medium text-gray-500 min-w-[80px]'
          onClick={() => handleSort('confidenceScore')}
        >
          Confidence
          {sortField === 'confidenceScore' && (
            <span className='ml-1'>{sortDirection === 'asc' ? '↑' : '↓'}</span>
          )}
        </th>
        <th
          className='p-2 text-center whitespace-nowrap cursor-pointer hover:bg-gray-100 text-sm font-medium text-gray-500 min-w-[70px]'
          onClick={() => handleSort('bttsRate')}
        >
          BTTS %
          {sortField === 'bttsRate' && (
            <span className='ml-1'>{sortDirection === 'asc' ? '↑' : '↓'}</span>
          )}
        </th>
      </tr>
    </thead>
    <tbody>
      {filterMatches(sortMatches(liveMatches)).map((match, index) => {
        const selectedFavoriteColor =
          match.favorite === 'home'
            ? 'bg-blue-50 text-blue-800 border border-blue-200'
            : match.favorite === 'away'
            ? 'bg-purple-50 text-purple-800 border border-purple-200'
            : 'bg-gray-50 text-gray-800 border border-gray-200';

        // Generate a truly unique key by always including index
        const uniqueKey = `match-${match.id}-${index}`;

        return (
          <React.Fragment key={uniqueKey}>
            <tr
              className={`border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors duration-200 ${
                expandedMatch === match.id ? 'bg-gray-50' : ''
              }`}
              onClick={() =>
                setExpandedMatch(expandedMatch === match.id ? null : match.id)
              }
            >
              <td className='p-2'>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMatchInCart(match.id, index);
                  }}
                  className={`w-6 h-6 rounded-full border transition-colors duration-200 ${
                    checkMatchInCart(match.id, index)
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'border-gray-300 bg-white hover:border-blue-400'
                  } flex items-center justify-center`}
                >
                  {checkMatchInCart(match.id, index) ? (
                    <Check size={14} />
                  ) : (
                    <Plus size={14} className='text-gray-500' />
                  )}
                </button>
              </td>
              <td className='p-2'>
                <div className='flex flex-col min-h-[60px]'>
                  <div className='flex items-center'>
                    <span className='text-lg mr-2'>
                      {renderTeamLogo(match.homeTeam.logo)}
                    </span>
                    <span className='font-medium text-gray-800 text-sm'>
                      {match.homeTeam.name}
                    </span>
                    <span className='text-xs text-gray-500 ml-2'>
                      ({match.homeTeam.position})
                    </span>
                  </div>
                  <div className='flex items-center mt-1'>
                    <span className='text-lg mr-2'>
                      {renderTeamLogo(match.awayTeam.logo)}
                    </span>
                    <span className='font-medium text-gray-800 text-sm'>
                      {match.awayTeam.name}
                    </span>
                    <span className='text-xs text-gray-500 ml-2'>
                      ({match.awayTeam.position})
                    </span>
                  </div>
                </div>
              </td>
              <td className='p-2 text-center whitespace-nowrap'>
                <div className='text-gray-800 text-sm min-w-[60px]'>
                  {formatMatchTime(match.playedSeconds)}
                </div>
              </td>
              <td className='p-2 text-center'>
                <div
                  className={`px-2 py-1 rounded-lg text-sm min-w-[40px] ${getMetricColor(
                    match.homeScore,
                    { high: 2, medium: 1 }
                  )}`}
                >
                  {match.homeScore}
                </div>
              </td>
              <td className='p-2 text-center'>
                <div
                  className={`px-2 py-1 rounded-lg text-sm min-w-[40px] ${getMetricColor(
                    match.awayScore,
                    { high: 2, medium: 1 }
                  )}`}
                >
                  {match.awayScore}
                </div>
              </td>
              <td className='p-2 text-center'>
                <div
                  className={`px-2 py-1 rounded-lg text-sm min-w-[40px] ${getMetricColor(
                    (match.homeTeam.avgHomeGoals ?? 0) > 0
                      ? match.homeTeam.avgHomeGoals ?? 0
                      : (match.expectedGoals ?? 0) / 2,
                    { high: 1.8, medium: 1.3 }
                  )}`}
                >
                  {Math.round(
                    (match.homeTeam.avgHomeGoals ?? 0) > 0
                      ? match.homeTeam.avgHomeGoals ?? 0
                      : (match.expectedGoals ?? 0) / 2
                  )}
                </div>
              </td>
              <td className='p-2 text-center'>
                <div
                  className={`px-2 py-1 rounded-lg text-sm min-w-[40px] ${getMetricColor(
                    (match.awayTeam.avgAwayGoals ?? 0) > 0
                      ? match.awayTeam.avgAwayGoals ?? 0
                      : (match.expectedGoals ?? 0) / 2,
                    { high: 1.4, medium: 1.0 }
                  )}`}
                >
                  {Math.round(
                    (match.awayTeam.avgAwayGoals ?? 0) > 0
                      ? match.awayTeam.avgAwayGoals ?? 0
                      : (match.expectedGoals ?? 0) / 2
                  )}
                </div>
              </td>
              <td className='p-2 text-center'>
                <div
                  className={`px-2 py-1 rounded-lg text-sm min-w-[40px] ${getMetricColor(
                    match.positionGap,
                    { high: 10, medium: 5 }
                  )}`}
                >
                  {match.positionGap}
                </div>
              </td>
              <td className='p-2 text-center'>
                <div className='flex items-center justify-center gap-1 text-xs min-w-[60px]'>
                  <span className='px-2 py-1 rounded-lg bg-blue-50 text-blue-800'>
                    {match.homeTeam.position}
                  </span>
                  <span className='text-gray-500'>/</span>
                  <span className='px-2 py-1 rounded-lg bg-purple-50 text-purple-800'>
                    {match.awayTeam.position}
                  </span>
                </div>
              </td>
              <td className='p-2 text-center'>
                <div className='flex flex-col gap-1 min-w-[60px]'>
                  <div
                    className={`px-2 py-1 rounded-lg bg-blue-50 text-blue-800 text-xs`}
                  >
                    H: {match.homeTeam.homeForm || '-'}
                  </div>
                  <div
                    className={`px-2 py-1 rounded-lg bg-purple-50 text-purple-800 text-xs`}
                  >
                    A: {match.awayTeam.awayForm || '-'}
                  </div>
                </div>
              </td>
              <td className='p-2 text-center'>
                <div className='flex items-center justify-center gap-1 text-xs min-w-[60px]'>
                  <span
                    className={`px-2 py-1 rounded-lg ${
                      calculateFormPoints(match.homeTeam.form) >= 60
                        ? 'bg-green-50 text-green-800'
                        : calculateFormPoints(match.homeTeam.form) >= 40
                        ? 'bg-yellow-50 text-yellow-800'
                        : 'bg-red-50 text-red-800'
                    }`}
                  >
                    {calculateFormPoints(match.homeTeam.form)}%
                  </span>
                  <span className='text-gray-500'>/</span>
                  <span
                    className={`px-2 py-1 rounded-lg ${
                      calculateFormPoints(match.awayTeam.form) >= 60
                        ? 'bg-green-50 text-green-800'
                        : calculateFormPoints(match.awayTeam.form) >= 40
                        ? 'bg-yellow-50 text-yellow-800'
                        : 'bg-red-50 text-red-800'
                    }`}
                  >
                    {calculateFormPoints(match.awayTeam.form)}%
                  </span>
                </div>
              </td>
              <td className='p-2 text-center'>
                <div
                  className={`px-2 py-1 rounded-lg text-sm min-w-[40px] ${getFormColor(
                    match.favorite === 'home'
                      ? match.homeTeam.form
                      : match.favorite === 'away'
                      ? match.awayTeam.form
                      : 'LLLLL'
                  )}`}
                >
                  {match.favorite === 'home'
                    ? match.homeTeam.form
                    : match.favorite === 'away'
                    ? match.awayTeam.form
                    : '-'}
                </div>
              </td>
              <td className='p-2 text-center'>
                {match.headToHead.matches > 0 ? (
                  <div
                    className={`px-2 py-1 rounded-lg text-sm min-w-[60px] ${getMetricColor(
                      match.headToHead.wins / match.headToHead.matches,
                      { high: 0.7, medium: 0.4 }
                    )}`}
                  >
                    {match.headToHead.wins}-{match.headToHead.draws}-
                    {match.headToHead.losses}
                  </div>
                ) : (
                  <div className='px-2 py-1 rounded-lg bg-gray-100 text-gray-600 text-sm min-w-[60px]'>
                    N/A
                  </div>
                )}
              </td>
              <td className='p-2 text-center'>
                <div
                  className={`px-2 py-1 rounded-lg text-sm min-w-[40px] ${getMetricColor(
                    match.expectedGoals,
                    { high: 2.2, medium: 1.5 }
                  )}`}
                >
                  {Math.round(match.expectedGoals)}
                </div>
              </td>
              <td className='p-2 text-center'>
                {match.odds ? (
                  <div
                    className={`px-2 py-1 rounded-lg text-sm min-w-[40px] ${
                      match.odds.over15Goals < 1.8
                        ? 'bg-green-100 text-green-800'
                        : match.odds.over15Goals < 2.2
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {Math.round(match.odds.over15Goals)}
                  </div>
                ) : (
                  <div className='px-2 py-1 rounded-lg bg-gray-100 text-gray-600 text-sm min-w-[40px]'>
                    N/A
                  </div>
                )}
              </td>
              <td className='p-2 text-center'>
                <div
                  className={`px-2 py-1 rounded-lg text-sm min-w-[40px] ${getMetricColor(
                    1 / match.defensiveStrength,
                    { high: 1.2, medium: 1.0 }
                  )}`}
                >
                  {Math.round(1 / match.defensiveStrength)}
                </div>
              </td>
              <td className='p-2 text-center'>
                {match.favorite ? (
                  <div
                    className={`px-2 py-1 rounded-lg inline-flex items-center text-sm min-w-[100px] ${selectedFavoriteColor}`}
                  >
                    <span className='text-xl mr-2'>
                      {renderTeamLogo(
                        match.favorite === 'home'
                          ? match.homeTeam.logo
                          : match.awayTeam.logo,
                        'lg'
                      )}
                    </span>
                    <span className='truncate max-w-[80px]'>
                      {match.favorite === 'home'
                        ? match.homeTeam.name
                        : match.awayTeam.name}
                    </span>
                  </div>
                ) : (
                  <div className='px-2 py-1 rounded-lg bg-gray-100 text-gray-600 border border-gray-200 text-sm min-w-[100px]'>
                    None
                  </div>
                )}
              </td>
              <td className='p-2 text-center'>
                <div
                  className={`px-2 py-1 rounded-lg flex items-center justify-between text-sm min-w-[60px] ${getMetricColor(
                    match.confidenceScore,
                    { high: 80, medium: 60 }
                  )}`}
                >
                  <span>{match.confidenceScore}%</span>
                  {expandedMatch === match.id ? (
                    <ChevronUp size={14} className='ml-1' />
                  ) : (
                    <ChevronDown size={14} className='ml-1' />
                  )}
                </div>
              </td>
              <td className='p-2 text-center'>
                <div
                  className={`px-2 py-1 rounded-lg text-sm min-w-[40px] ${getMetricColor(
                    match.favorite === 'home'
                      ? match.homeTeam.bttsRate || 0
                      : match.favorite === 'away'
                      ? match.awayTeam.bttsRate || 0
                      : 0,
                    { high: 70, medium: 50 }
                  )}`}
                >
                  {Math.round(
                    match.favorite === 'home'
                      ? match.homeTeam.bttsRate || 0
                      : match.favorite === 'away'
                      ? match.awayTeam.bttsRate || 0
                      : 0
                  )}
                  %
                </div>
              </td>
            </tr>
            {expandedMatch === match.id && (
              <tr className='bg-gray-50'>
                <td colSpan={17} className='p-3'>
                  <div className='bg-white border border-gray-200 rounded-lg p-3 shadow-sm transition-all duration-200'>
                    {/* Main Stats Grid */}
                    <div className='grid grid-cols-1 md:grid-cols-4 gap-3'>
                      {/* Match Overview */}
                      <div className='space-y-2'>
                        <h3 className='text-sm font-semibold text-gray-700'>
                          Match Overview
                        </h3>
                        <div className='text-xs space-y-1'>
                          <div className='flex justify-between'>
                            <span className='text-gray-500'>Time:</span>
                            <span className='font-medium'>
                              {formatMatchTime(match.playedSeconds)}
                            </span>
                          </div>
                          <div className='flex justify-between'>
                            <span className='text-gray-500'>Status:</span>
                            <span className='font-medium'>{match.status}</span>
                          </div>
                          <div className='flex justify-between'>
                            <span className='text-gray-500'>Venue:</span>
                            <span className='font-medium'>{match.venue}</span>
                          </div>
                          <div className='flex justify-between'>
                            <span className='text-gray-500'>xGoals:</span>
                            <span className='font-medium'>
                              {Math.round(match.expectedGoals)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Odds & Betting */}
                      <div className='space-y-2'>
                        <h3 className='text-sm font-semibold text-gray-700'>
                          Odds & Betting
                        </h3>
                        <div className='text-xs space-y-1'>
                          {match.odds && (
                            <>
                              <div className='flex justify-between'>
                                <span className='text-gray-500'>Over 1.5:</span>
                                <span className='font-medium'>
                                  {Math.round(match.odds.over15Goals)}
                                </span>
                              </div>
                              <div className='flex justify-between'>
                                <span className='text-gray-500'>H/D/A:</span>
                                <span className='font-medium'>
                                  {Math.round(match.odds.homeWin)}/
                                  {Math.round(match.odds.draw)}/
                                  {Math.round(match.odds.awayWin)}
                                </span>
                              </div>
                            </>
                          )}
                          <div className='flex justify-between'>
                            <span className='text-gray-500'>Favorite:</span>
                            <span className='font-medium'>
                              {match.favorite === 'home'
                                ? match.homeTeam.name
                                : match.favorite === 'away'
                                ? match.awayTeam.name
                                : 'None'}
                            </span>
                          </div>
                          <div className='flex justify-between'>
                            <span className='text-gray-500'>Confidence:</span>
                            <span className='font-medium'>
                              {match.confidenceScore}%
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Team Comparison */}
                      <div className='space-y-2'>
                        <h3 className='text-sm font-semibold text-gray-700'>
                          Team Comparison
                        </h3>
                        <div className='grid grid-cols-2 gap-2 text-xs'>
                          <div className='space-y-1'>
                            <div className='font-medium text-blue-600'>
                              Home
                            </div>
                            <div className='flex justify-between'>
                              <span className='text-gray-500'>Pos:</span>
                              <span>{match.homeTeam.position}</span>
                            </div>
                            <div className='flex justify-between'>
                              <span className='text-gray-500'>Form:</span>
                              <span>{match.homeTeam.form}</span>
                            </div>
                            <div className='flex justify-between'>
                              <span className='text-gray-500'>Avg Goals:</span>
                              <span>
                                {Math.round(match.homeTeam.avgHomeGoals || 0)}
                              </span>
                            </div>
                            <div className='flex justify-between'>
                              <span className='text-gray-500'>
                                Clean Sheets:
                              </span>
                              <span>{match.homeTeam.cleanSheets}</span>
                            </div>
                          </div>
                          <div className='space-y-1'>
                            <div className='font-medium text-purple-600'>
                              Away
                            </div>
                            <div className='flex justify-between'>
                              <span className='text-gray-500'>Pos:</span>
                              <span>{match.awayTeam.position}</span>
                            </div>
                            <div className='flex justify-between'>
                              <span className='text-gray-500'>Form:</span>
                              <span>{match.awayTeam.form}</span>
                            </div>
                            <div className='flex justify-between'>
                              <span className='text-gray-500'>Avg Goals:</span>
                              <span>
                                {Math.round(match.awayTeam.avgAwayGoals || 0)}
                              </span>
                            </div>
                            <div className='flex justify-between'>
                              <span className='text-gray-500'>
                                Clean Sheets:
                              </span>
                              <span>{match.awayTeam.cleanSheets}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* H2H & Recent */}
                      <div className='space-y-2'>
                        <h3 className='text-sm font-semibold text-gray-700'>
                          Head-to-Head
                        </h3>
                        {match.headToHead.matches > 0 ? (
                          <div className='text-xs space-y-1'>
                            <div className='flex justify-between'>
                              <span className='text-gray-500'>Record:</span>
                              <span>
                                {match.headToHead.wins}W{' '}
                                {match.headToHead.draws}D{' '}
                                {match.headToHead.losses}L
                              </span>
                            </div>
                            <div className='flex justify-between'>
                              <span className='text-gray-500'>Goals:</span>
                              <span>
                                {match.headToHead.goalsScored}-
                                {match.headToHead.goalsConceded}
                              </span>
                            </div>
                            {match.headToHead.recentMatches && (
                              <div className='mt-1'>
                                <div className='text-gray-500 mb-0.5'>
                                  Recent:
                                </div>
                                <div className='space-y-0.5'>
                                  {match.headToHead.recentMatches
                                    .slice(0, 3)
                                    .map((h2hMatch, idx) => (
                                      <div key={idx} className='text-gray-600'>
                                        {h2hMatch.date.substring(0, 10)}:{' '}
                                        {h2hMatch.result}
                                      </div>
                                    ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className='text-xs text-gray-500'>
                            No H2H data available
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Detailed Stats Grid */}
                    <div className='mt-3 pt-3 border-t border-gray-100'>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                        {/* Clean Sheets & Scoring */}
                        <div className='bg-gray-50 rounded-lg p-2'>
                          <h4 className='text-xs font-medium text-gray-700 mb-2'>
                            Clean Sheets & Scoring
                          </h4>
                          <div className='grid grid-cols-2 gap-2 text-xs'>
                            <div className='space-y-1'>
                              <div className='font-medium text-blue-600'>
                                Home
                              </div>
                              <div className='flex justify-between'>
                                <span className='text-gray-500'>Total CS:</span>
                                <span>{match.homeTeam.cleanSheets || '0'}</span>
                              </div>
                              <div className='flex justify-between'>
                                <span className='text-gray-500'>Home CS:</span>
                                <span>
                                  {match.homeTeam.homeCleanSheets || '0'}
                                </span>
                              </div>
                              <div className='flex justify-between'>
                                <span className='text-gray-500'>
                                  Score 1st Win%:
                                </span>
                                <span>
                                  {(
                                    match.homeTeam.scoringFirstWinRate || 0
                                  ).toFixed(1)}
                                  %
                                </span>
                              </div>
                              <div className='flex justify-between'>
                                <span className='text-gray-500'>
                                  Concede 1st Win%:
                                </span>
                                <span>
                                  {(
                                    match.homeTeam.concedingFirstWinRate || 0
                                  ).toFixed(1)}
                                  %
                                </span>
                              </div>
                            </div>
                            <div className='space-y-1'>
                              <div className='font-medium text-purple-600'>
                                Away
                              </div>
                              <div className='flex justify-between'>
                                <span className='text-gray-500'>Total CS:</span>
                                <span>{match.awayTeam.cleanSheets || '0'}</span>
                              </div>
                              <div className='flex justify-between'>
                                <span className='text-gray-500'>Away CS:</span>
                                <span>
                                  {match.awayTeam.awayCleanSheets || '0'}
                                </span>
                              </div>
                              <div className='flex justify-between'>
                                <span className='text-gray-500'>
                                  Score 1st Win%:
                                </span>
                                <span>
                                  {(
                                    match.awayTeam.scoringFirstWinRate || 0
                                  ).toFixed(1)}
                                  %
                                </span>
                              </div>
                              <div className='flex justify-between'>
                                <span className='text-gray-500'>
                                  Concede 1st Win%:
                                </span>
                                <span>
                                  {(
                                    match.awayTeam.concedingFirstWinRate || 0
                                  ).toFixed(1)}
                                  %
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Match Patterns */}
                        <div className='bg-gray-50 rounded-lg p-2'>
                          <h4 className='text-xs font-medium text-gray-700 mb-2'>
                            Match Patterns
                          </h4>
                          <div className='grid grid-cols-2 gap-2 text-xs'>
                            <div className='space-y-1'>
                              <div className='font-medium text-blue-600'>
                                Home
                              </div>
                              <div className='flex justify-between'>
                                <span className='text-gray-500'>Corners:</span>
                                <span>
                                  {(match.homeTeam.avgCorners || 0).toFixed(1)}
                                </span>
                              </div>
                              <div className='flex justify-between'>
                                <span className='text-gray-500'>
                                  BTTS Rate:
                                </span>
                                <span>
                                  {(match.homeTeam.bttsRate || 0).toFixed(1)}%
                                </span>
                              </div>
                              <div className='flex justify-between'>
                                <span className='text-gray-500'>
                                  Home BTTS:
                                </span>
                                <span>
                                  {(match.homeTeam.homeBttsRate || 0).toFixed(
                                    1
                                  )}
                                  %
                                </span>
                              </div>
                              <div className='flex justify-between'>
                                <span className='text-gray-500'>
                                  Late Goals:
                                </span>
                                <span>
                                  {(match.homeTeam.lateGoalRate || 0).toFixed(
                                    1
                                  )}
                                  %
                                </span>
                              </div>
                            </div>
                            <div className='space-y-1'>
                              <div className='font-medium text-purple-600'>
                                Away
                              </div>
                              <div className='flex justify-between'>
                                <span className='text-gray-500'>Corners:</span>
                                <span>
                                  {(match.awayTeam.avgCorners || 0).toFixed(1)}
                                </span>
                              </div>
                              <div className='flex justify-between'>
                                <span className='text-gray-500'>
                                  BTTS Rate:
                                </span>
                                <span>
                                  {(match.awayTeam.bttsRate || 0).toFixed(1)}%
                                </span>
                              </div>
                              <div className='flex justify-between'>
                                <span className='text-gray-500'>
                                  Away BTTS:
                                </span>
                                <span>
                                  {(match.awayTeam.awayBttsRate || 0).toFixed(
                                    1
                                  )}
                                  %
                                </span>
                              </div>
                              <div className='flex justify-between'>
                                <span className='text-gray-500'>
                                  Late Goals:
                                </span>
                                <span>
                                  {(match.awayTeam.lateGoalRate || 0).toFixed(
                                    1
                                  )}
                                  %
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Prediction Reasons */}
                    <div className='mt-3 pt-3 border-t border-gray-100'>
                      <h4 className='text-xs font-medium text-gray-700 mb-2'>
                        Prediction Reasons
                      </h4>
                      <ul className='text-xs space-y-1 list-disc pl-4'>
                        {match.reasonsForPrediction.map((reason, idx) => (
                          <li key={idx} className='text-gray-600'>
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </React.Fragment>
        );
      })}
    </tbody>
  </table>
</div>;
