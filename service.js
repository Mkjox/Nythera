import TrackPlayer, { Event } from 'react-native-track-player';

module.exports = async function() {
  TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play());
  TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause());
  TrackPlayer.addEventListener(Event.RemoteNext, () => TrackPlayer.skipToNext());
  TrackPlayer.addEventListener(Event.RemotePrevious, () => TrackPlayer.skipToPrevious());
  TrackPlayer.addEventListener(Event.RemoteStop, () => TrackPlayer.destroy());
  TrackPlayer.addEventListener(Event.RemoteSeek, async (data) => {
    try {
      // data.position is in seconds
      await TrackPlayer.seekTo(data.position);
    } catch (e) { console.warn('RemoteSeek error', e); }
  });
  TrackPlayer.addEventListener(Event.RemoteJumpForward, async () => {
    try {
      const pos = await TrackPlayer.getPosition();
      await TrackPlayer.seekTo(pos + 15);
    } catch (e) { console.warn('RemoteJumpForward error', e); }
  });
  TrackPlayer.addEventListener(Event.RemoteJumpBackward, async () => {
    try {
      const pos = await TrackPlayer.getPosition();
      await TrackPlayer.seekTo(Math.max(0, pos - 15));
    } catch (e) { console.warn('RemoteJumpBackward error', e); }
  });
};
