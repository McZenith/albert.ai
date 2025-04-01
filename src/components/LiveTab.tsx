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
                <td colSpan={17} className='p-4'>
                  <div className='bg-white border border-gray-200 rounded-lg p-4 shadow-sm transition-all duration-200'>
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                      {/* Match Details */}
                      <div className='border-r border-gray-100 pr-4'>
                        <h3 className='font-semibold text-gray-700 mb-2'>
                          Match Details
                        </h3>
                        <div className='space-y-2'>
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
                            <span className='text-gray-500'>
                              Expected Goals:
                            </span>
                            <span className='font-medium'>
                              {Math.round(match.expectedGoals)}
                            </span>
                          </div>
                          {match.odds && (
                            <>
                              <div className='flex justify-between'>
                                <span className='text-gray-500'>
                                  Over 1.5 Goals:
                                </span>
                                <span className='font-medium'>
                                  {Math.round(match.odds.over15Goals)}
                                </span>
                              </div>
                              <div className='flex justify-between'>
                                <span className='text-gray-500'>
                                  Home/Draw/Away:
                                </span>
                                <span className='font-medium'>
                                  {Math.round(match.odds.homeWin)} /{' '}
                                  {Math.round(match.odds.draw)} /{' '}
                                  {Math.round(match.odds.awayWin)}
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Teams Comparison */}
                      <div className='border-r border-gray-100 px-4'>
                        <h3 className='font-semibold text-gray-700 mb-2'>
                          Teams Comparison
                        </h3>
                        <table className='w-full text-sm'>
                          <thead>
                            <tr>
                              <th className='text-left font-medium text-gray-500'>
                                Metric
                              </th>
                              <th className='text-center font-medium text-gray-500'>
                                {match.homeTeam.name}
                              </th>
                              <th className='text-center font-medium text-gray-500'>
                                {match.awayTeam.name}
                              </th>
                            </tr>
                          </thead>
                          <tbody className='divide-y divide-gray-100'>
                            <tr>
                              <td className='py-1 text-gray-500'>Position</td>
                              <td className='py-1 text-center'>
                                {match.homeTeam.position}
                              </td>
                              <td className='py-1 text-center'>
                                {match.awayTeam.position}
                              </td>
                            </tr>
                            <tr>
                              <td className='py-1 text-gray-500'>Form</td>
                              <td className='py-1 text-center'>
                                {match.homeTeam.form}
                              </td>
                              <td className='py-1 text-center'>
                                {match.awayTeam.form}
                              </td>
                            </tr>
                            <tr>
                              <td className='py-1 text-gray-500'>
                                Form Points
                              </td>
                              <td className='py-1 text-center'>
                                {calculateFormPoints(match.homeTeam.form)}%
                              </td>
                              <td className='py-1 text-center'>
                                {calculateFormPoints(match.awayTeam.form)}%
                              </td>
                            </tr>
                            <tr>
                              <td className='py-1 text-gray-500'>Avg Goals</td>
                              <td className='py-1 text-center'>
                                {Math.round(match.homeTeam.avgHomeGoals || 0)}
                              </td>
                              <td className='py-1 text-center'>
                                {Math.round(match.awayTeam.avgAwayGoals || 0)}
                              </td>
                            </tr>
                            <tr>
                              <td className='py-1 text-gray-500'>
                                Clean Sheets
                              </td>
                              <td className='py-1 text-center'>
                                {match.homeTeam.cleanSheets}
                              </td>
                              <td className='py-1 text-center'>
                                {match.awayTeam.cleanSheets}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* Prediction Reasons */}
                      <div className='pl-4'>
                        <h3 className='font-semibold text-gray-700 mb-2'>
                          Prediction Reasons
                        </h3>
                        <ul className='list-disc pl-4 space-y-1'>
                          {match.reasonsForPrediction.map((reason, idx) => (
                            <li key={idx} className='text-gray-700 text-sm'>
                              {reason}
                            </li>
                          ))}
                        </ul>

                        {/* H2H Records */}
                        {match.headToHead.matches > 0 && (
                          <div className='mt-4'>
                            <h4 className='font-medium text-gray-700 mb-1'>
                              Head-to-Head
                            </h4>
                            <div className='text-sm text-gray-600 mb-2'>
                              Record: {match.headToHead.wins}W{' '}
                              {match.headToHead.draws}D{' '}
                              {match.headToHead.losses}L (
                              {match.headToHead.goalsScored}-
                              {match.headToHead.goalsConceded})
                            </div>
                            {match.headToHead.recentMatches && (
                              <div>
                                <h5 className='text-xs font-medium text-gray-500 mb-1'>
                                  Recent Matches:
                                </h5>
                                <ul className='text-xs space-y-1'>
                                  {match.headToHead.recentMatches.map(
                                    (h2hMatch, idx) => (
                                      <li key={idx} className='text-gray-600'>
                                        {h2hMatch.date.substring(0, 10)}:{' '}
                                        {h2hMatch.result}
                                      </li>
                                    )
                                  )}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Team Statistics Section */}
                    <div className='mt-6 pt-4 border-t border-gray-100'>
                      <h3 className='font-semibold text-gray-700 mb-4'>
                        Team Statistics
                      </h3>
                      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
                        {/* Clean Sheets & Scoring Stats */}
                        <div className='bg-gray-50 rounded-lg border border-gray-100 p-3'>
                          <h4 className='text-sm font-medium text-gray-700 mb-3'>
                            Clean Sheets & Scoring
                          </h4>
                          <div className='grid grid-cols-2 gap-3'>
                            <div className='space-y-2'>
                              <h5 className='text-xs font-medium text-blue-600 mb-2'>
                                Home Team
                              </h5>
                              <div className='space-y-1.5'>
                                <div className='flex justify-between items-center'>
                                  <span className='text-gray-600 text-xs'>
                                    Total Clean Sheets:
                                  </span>
                                  <span className='font-medium text-gray-900 text-xs'>
                                    {match.homeTeam.cleanSheets || '0'}
                                  </span>
                                </div>
                                <div className='flex justify-between items-center'>
                                  <span className='text-gray-600 text-xs'>
                                    Home Clean Sheets:
                                  </span>
                                  <span className='font-medium text-gray-900 text-xs'>
                                    {match.homeTeam.homeCleanSheets || '0'}
                                  </span>
                                </div>
                                <div className='flex justify-between items-center'>
                                  <span className='text-gray-600 text-xs'>
                                    Scoring First Win %:
                                  </span>
                                  <span className='font-medium text-gray-900 text-xs'>
                                    {(
                                      match.homeTeam.scoringFirstWinRate || 0
                                    ).toFixed(1)}
                                    %
                                  </span>
                                </div>
                                <div className='flex justify-between items-center'>
                                  <span className='text-gray-600 text-xs'>
                                    Conceding First Win %:
                                  </span>
                                  <span className='font-medium text-gray-900 text-xs'>
                                    {(
                                      match.homeTeam.concedingFirstWinRate || 0
                                    ).toFixed(1)}
                                    %
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className='space-y-2'>
                              <h5 className='text-xs font-medium text-purple-600 mb-2'>
                                Away Team
                              </h5>
                              <div className='space-y-1.5'>
                                <div className='flex justify-between items-center'>
                                  <span className='text-gray-600 text-xs'>
                                    Total Clean Sheets:
                                  </span>
                                  <span className='font-medium text-gray-900 text-xs'>
                                    {match.awayTeam.cleanSheets || '0'}
                                  </span>
                                </div>
                                <div className='flex justify-between items-center'>
                                  <span className='text-gray-600 text-xs'>
                                    Away Clean Sheets:
                                  </span>
                                  <span className='font-medium text-gray-900 text-xs'>
                                    {match.awayTeam.awayCleanSheets || '0'}
                                  </span>
                                </div>
                                <div className='flex justify-between items-center'>
                                  <span className='text-gray-600 text-xs'>
                                    Scoring First Win %:
                                  </span>
                                  <span className='font-medium text-gray-900 text-xs'>
                                    {(
                                      match.awayTeam.scoringFirstWinRate || 0
                                    ).toFixed(1)}
                                    %
                                  </span>
                                </div>
                                <div className='flex justify-between items-center'>
                                  <span className='text-gray-600 text-xs'>
                                    Conceding First Win %:
                                  </span>
                                  <span className='font-medium text-gray-900 text-xs'>
                                    {(
                                      match.awayTeam.concedingFirstWinRate || 0
                                    ).toFixed(1)}
                                    %
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Match Pattern Stats */}
                        <div className='bg-gray-50 rounded-lg border border-gray-100 p-3'>
                          <h4 className='text-sm font-medium text-gray-700 mb-3'>
                            Match Patterns
                          </h4>
                          <div className='grid grid-cols-2 gap-3'>
                            <div className='space-y-2'>
                              <h5 className='text-xs font-medium text-blue-600 mb-2'>
                                Home Team
                              </h5>
                              <div className='space-y-1.5'>
                                <div className='flex justify-between items-center'>
                                  <span className='text-gray-600 text-xs'>
                                    Avg Corners:
                                  </span>
                                  <span className='font-medium text-gray-900 text-xs'>
                                    {(match.homeTeam.avgCorners || 0).toFixed(
                                      1
                                    )}
                                  </span>
                                </div>
                                <div className='flex justify-between items-center'>
                                  <span className='text-gray-600 text-xs'>
                                    BTTS Rate:
                                  </span>
                                  <span className='font-medium text-gray-900 text-xs'>
                                    {(match.homeTeam.bttsRate || 0).toFixed(1)}%
                                  </span>
                                </div>
                                <div className='flex justify-between items-center'>
                                  <span className='text-gray-600 text-xs'>
                                    Home BTTS Rate:
                                  </span>
                                  <span className='font-medium text-gray-900 text-xs'>
                                    {(match.homeTeam.homeBttsRate || 0).toFixed(
                                      1
                                    )}
                                    %
                                  </span>
                                </div>
                                <div className='flex justify-between items-center'>
                                  <span className='text-gray-600 text-xs'>
                                    Late Goal Rate:
                                  </span>
                                  <span className='font-medium text-gray-900 text-xs'>
                                    {(match.homeTeam.lateGoalRate || 0).toFixed(
                                      1
                                    )}
                                    %
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className='space-y-2'>
                              <h5 className='text-xs font-medium text-purple-600 mb-2'>
                                Away Team
                              </h5>
                              <div className='space-y-1.5'>
                                <div className='flex justify-between items-center'>
                                  <span className='text-gray-600 text-xs'>
                                    Avg Corners:
                                  </span>
                                  <span className='font-medium text-gray-900 text-xs'>
                                    {(match.awayTeam.avgCorners || 0).toFixed(
                                      1
                                    )}
                                  </span>
                                </div>
                                <div className='flex justify-between items-center'>
                                  <span className='text-gray-600 text-xs'>
                                    BTTS Rate:
                                  </span>
                                  <span className='font-medium text-gray-900 text-xs'>
                                    {(match.awayTeam.bttsRate || 0).toFixed(1)}%
                                  </span>
                                </div>
                                <div className='flex justify-between items-center'>
                                  <span className='text-gray-600 text-xs'>
                                    Away BTTS Rate:
                                  </span>
                                  <span className='font-medium text-gray-900 text-xs'>
                                    {(match.awayTeam.awayBttsRate || 0).toFixed(
                                      1
                                    )}
                                    %
                                  </span>
                                </div>
                                <div className='flex justify-between items-center'>
                                  <span className='text-gray-600 text-xs'>
                                    Late Goal Rate:
                                  </span>
                                  <span className='font-medium text-gray-900 text-xs'>
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
