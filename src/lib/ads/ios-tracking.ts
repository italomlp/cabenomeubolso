export type TrackingAuthorizationStatus = 'unavailable';

export async function requestIosTrackingAuthorization(): Promise<TrackingAuthorizationStatus> {
  return 'unavailable';
}
