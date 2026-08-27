export type AdRequestConfiguration = {
  testDeviceIdentifiers: string[];
};

export type ResolveAdRequestConfigurationInput = {
  isDevelopment: boolean;
  testDeviceIdentifiers?: readonly string[];
};

const DEVELOPMENT_TEST_DEVICE_IDS = ['EMULATOR'];

function normalizeIdentifiers(identifiers: readonly string[]): string[] {
  return [...new Set(identifiers.map((identifier) => identifier.trim()).filter(Boolean))];
}

export function resolveAdRequestConfiguration({
  isDevelopment,
  testDeviceIdentifiers = [],
}: ResolveAdRequestConfigurationInput): AdRequestConfiguration {
  if (!isDevelopment) {
    return { testDeviceIdentifiers: [] };
  }

  return {
    testDeviceIdentifiers: normalizeIdentifiers([...DEVELOPMENT_TEST_DEVICE_IDS, ...testDeviceIdentifiers]),
  };
}
