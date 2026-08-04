import {
  PermissionStatus,
  getTrackingPermissionsAsync,
  requestTrackingPermissionsAsync,
} from 'expo-tracking-transparency';

export type TrackingAuthorizationStatus = PermissionStatus;

export async function requestIosTrackingAuthorization(): Promise<TrackingAuthorizationStatus> {
  const current = await getTrackingPermissionsAsync();

  if (current.status !== PermissionStatus.UNDETERMINED) {
    return current.status;
  }

  const requested = await requestTrackingPermissionsAsync();

  return requested.status;
}
