import { useNetworkStore } from '@/store/network';
import {
  AddProposalTx,
  UnsignedTx,
} from '@c4tplatform/caminojs/dist/apis/platformvm';
import { useState, useEffect } from 'react';
import { Buffer } from 'buffer/';
import DOMPurify from 'dompurify';

export const useProposalDescription = (dataId: string) => {
  const caminoClient = useNetworkStore(state => state.caminoClient);
  const [description, setDescription] = useState('');

  useEffect(() => {
    const fetchAndProcessTx = async () => {
      try {
        const res = await caminoClient?.PChain().getTx(dataId);
        if (res) {
          const addProposalTxHex: string = (res as string).slice(2);
          const unsignedTx = new UnsignedTx();
          unsignedTx.fromBuffer(Buffer.from(addProposalTxHex, 'hex'));
          const addProposalTx = unsignedTx.getTransaction() as AddProposalTx;
          const sanitizedDescription = DOMPurify.sanitize(
            addProposalTx.getProposalDescription().toString()
          );
          setDescription(sanitizedDescription);
        }
      } catch (error) {
        console.error('Failed to fetch or process the transaction:', error);
      }
    };

    if (dataId && caminoClient) {
      fetchAndProcessTx();
    }
  }, [dataId]);

  return description;
};
