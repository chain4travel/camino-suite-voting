import { useNetworkStore } from '@/store/network';

export function useIsFeatureEnabled() {
  const caminoClient = useNetworkStore(state => state.caminoClient);

  const isFeatureEnabled = async (key: string) => {
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
      const cairoFeatures = ['BaseFee', 'FeeDistribution'];
      if (cairoFeatures.includes(key)) {
        return true;
      }
    }

    return false;
  };

  return { isFeatureEnabled };
}
