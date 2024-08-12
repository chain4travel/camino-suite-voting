// src/utils/featureFlagUtils.ts
import { useNetworkStore } from '@/store/network';

export async function isFeatureEnabled(key: string): Promise<boolean> {
  const caminoClient = useNetworkStore(state => state.caminoClient);

  if (!caminoClient) {
    console.warn(`Camino client is not available.`);
    return false;
  }

  const phase = await caminoClient.PChain().getUpgradePhases();
  const { BerlinPhase } = phase;

  if (BerlinPhase && (isNaN(BerlinPhase) || BerlinPhase === 0)) {
    return false;
  }

  const enabledFeatures = ['BaseFee', 'NewMember', 'ExcludeMember'];
  return enabledFeatures.includes(key);
}
