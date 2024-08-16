import { useNetworkStore } from '@/store/network';

export async function isFeatureEnabled(key: string): Promise<boolean> {
  const caminoClient = useNetworkStore(state => state.caminoClient);

  if (!caminoClient) {
    console.warn('Camino client is not available.');
    return false;
  }

  const phases = await caminoClient.PChain().getUpgradePhases();
  const { BerlinPhase, CairoPhase } = phases;

  if (!BerlinPhase || isNaN(BerlinPhase) || BerlinPhase === 0) {
    return false;
  }

  if (BerlinPhase >= 1) {
    const berlinFeatures = ['NewMember', 'ExcludeMember'];

    if (berlinFeatures.includes(key)) {
      return true;
    }
  }

  if (CairoPhase && !isNaN(CairoPhase) && CairoPhase >= 1) {
    const cairoFeatures = ['BaseFee', 'FeeDistribution']; // 'FeeDistribution' is the key for distribution (30/30/40) of gas fee
    if (cairoFeatures.includes(key)) {
      return true;
    }
  }

  return false;
}
