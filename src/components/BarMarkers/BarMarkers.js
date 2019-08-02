import React from 'react';
import { connect } from 'react-redux';

import { BEAT_DEPTH, SONG_OFFSET } from '../../constants';
import { range } from '../../utils';
import { convertMillisecondsToBeats } from '../../helpers/audio.helpers';
import { getCursorPositionInBeats } from '../../reducers/navigation.reducer';
import { getSelectedSong } from '../../reducers/songs.reducer';

import Marker from './Marker';

const NUM_TO_RENDER = 12;

const BarMarkers = ({ duration, cursorPositionInBeats, bpm }) => {
  const totalNumOfBeats = Math.ceil(convertMillisecondsToBeats(duration, bpm));

  const linesArray = React.useMemo(() => range(totalNumOfBeats * 4), [
    totalNumOfBeats,
  ]);
  const visibleSubsetOfLines = linesArray.filter(i => {
    const beat = i / 4;

    // I want to truncate all lines before the cursorPosition, but if I use
    // the exact value, sometimes the line right AT the cursor gets cut off.
    // Add a tiny fudge factor to allow a bit of leniency
    const FUDGE_FACTOR = 0.1;

    return (
      beat >= cursorPositionInBeats - FUDGE_FACTOR &&
      beat < cursorPositionInBeats + NUM_TO_RENDER + FUDGE_FACTOR
    );
  });

  return visibleSubsetOfLines.map(i => {
    // Emphasize every bar (4 beats).
    const isBar = i % 16 === 0;
    const isBeat = i % 4 === 0;

    const type = isBar ? 'bar' : isBeat ? 'beat' : 'sub-beat';

    return (
      <Marker
        key={i}
        barNum={isBar && i / 16}
        offset={-SONG_OFFSET + -i * (BEAT_DEPTH / 4)}
        type={type}
      />
    );
  });
};

const mapStateToProps = state => {
  const song = getSelectedSong(state);

  return {
    duration: state.navigation.duration,
    bpm: song.bpm,
    cursorPositionInBeats: getCursorPositionInBeats(state),
    isPlaying: state.navigation.isPlaying,
  };
};

export default connect(mapStateToProps)(BarMarkers);