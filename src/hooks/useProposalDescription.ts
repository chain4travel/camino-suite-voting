import { useNetworkStore } from '@/store/network';
import {
  AddProposalTx,
  UnsignedTx,
} from '@c4tplatform/caminojs/dist/apis/platformvm';
import { useState, useEffect } from 'react';
import { Buffer } from 'buffer/';
import DOMPurify from 'dompurify';

interface ProposalDescriptionState {
  description: string;
  isLoading: boolean;
  error: Error | null;
}

export const useProposalDescription = (
  dataId: string
): ProposalDescriptionState => {
  const caminoClient = useNetworkStore(state => state.caminoClient);
  const [state, setState] = useState<ProposalDescriptionState>({
    description: '',
    isLoading: false,
    error: null,
  });

  useEffect(() => {
    const fetchAndProcessTx = async () => {
      if (!dataId || !caminoClient) {
        setState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const res = await caminoClient.PChain().getTx(dataId);
        if (res) {
          const addProposalTxHex: string = (res as string).slice(2);
          const unsignedTx = new UnsignedTx();
          unsignedTx.fromBuffer(Buffer.from(addProposalTxHex, 'hex'));
          const addProposalTx = unsignedTx.getTransaction() as AddProposalTx;
          const sanitizedDescription = DOMPurify.sanitize(
            addProposalTx.getProposalDescription().toString()
          );

          setState({
            description: sanitizedDescription,
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        console.error('Failed to fetch or process the transaction:', error);
        setState({
          description: '',
          isLoading: false,
          error:
            error instanceof Error
              ? error
              : new Error('Unknown error occurred'),
        });
      }
    };

    fetchAndProcessTx();
  }, [dataId, caminoClient]);

  return state;
};
