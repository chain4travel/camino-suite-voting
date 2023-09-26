import { ProposalTypes } from '@/types';
import { Buffer, BinTools } from '@c4tplatform/caminojs/dist';
import {
  AddProposalTx,
  PlatformVMConstants,
  UnsignedTx,
} from '@c4tplatform/caminojs/dist/apis/platformvm';

export const parseUnsignedTx = (tx: string) => {
  const bintools = BinTools.getInstance();

  const unsignedTx = new UnsignedTx();
  unsignedTx.fromBuffer(Buffer.from(tx, 'hex'));
  const proposalIdBuf = unsignedTx.getTransaction().getProposalID?.();
  let proposal;
  if (
    unsignedTx.getTransaction().getTypeID() ===
    PlatformVMConstants.ADDPROPOSALTX
  ) {
    const addProposalTx = unsignedTx.getTransaction() as AddProposalTx;
    const proposalPayload = addProposalTx.getProposalPayload();
    const proposalType = proposalPayload.getProposalType();
    switch (proposalType) {
      case PlatformVMConstants.BASEFEEPORPOSAL_TYPE_ID:
        proposal = proposalPayload.getProposal();
        proposal.startTimestamp = proposal.getStart().readInt32BE(4);
        proposal.endTimestamp = proposal.getEnd().readInt32BE(4);
        proposal.options = proposal
          .getOptions()
          .map((opt, idx) => ({
            option: idx,
            value: opt.bytes.readInt32BE(4),
          }));
        console.log(
          '@@@@@',
          Object.values(ProposalTypes).indexOf(ProposalTypes.BaseFee)
        );
        proposal.type = ProposalTypes.BaseFee;
        proposal.typeId = Object.values(ProposalTypes).indexOf(
          ProposalTypes.BaseFee
        );
        proposal.inactive = true;
        break;
      default:
        console.warn('Unsupported proposal type ', proposalType);
    }
  }
  return {
    typeId: unsignedTx.getTransaction().getTypeID(),
    proposal,
    proposalId: proposalIdBuf && bintools.cb58Encode(proposalIdBuf),
    voteOptionIndex: Number(
      unsignedTx.getTransaction().getVotePayload?.().getVote?.().serialize()
        .optionIndex
    ),
  };
};
