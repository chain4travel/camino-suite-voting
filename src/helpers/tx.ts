import { ProposalTypes } from '@/types';
import { Buffer, BinTools } from '@c4tplatform/caminojs/dist';
import {
  AddProposalTx,
  AdminProposal,
  PlatformVMConstants,
  UnsignedTx,
} from '@c4tplatform/caminojs/dist/apis/platformvm';

export const parseUnsignedTx = (tx: string, hrp?: string, chainId?: string) => {
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
        proposal.options = proposal.getOptions().map((opt, idx) => ({
          option: idx,
          value: opt.bytes.readInt32BE(4),
        }));
        proposal.type = ProposalTypes.BaseFee;
        proposal.typeId = Object.values(ProposalTypes).indexOf(
          ProposalTypes.BaseFee
        );
        proposal.inactive = true;
        break;
      case PlatformVMConstants.ADDMEMBERPORPOSAL_TYPE_ID:
        proposal = proposalPayload.getProposal();
        proposal.startTimestamp = proposal.getStart().readInt32BE(4);
        proposal.endTimestamp = proposal.getEnd().readInt32BE(4);
        proposal.type = ProposalTypes.NewMember;
        proposal.typeId = Object.values(ProposalTypes).indexOf(
          ProposalTypes.NewMember
        );
        proposal.target =
          proposal.getApplicantAddress() &&
          bintools.addressToString(
            hrp,
            chainId,
            proposal.getApplicantAddress()
          );
        proposal.inactive = true;
        break;
      case PlatformVMConstants.EXCLUDEMEMBERPORPOSAL_TYPE_ID:
        proposal = proposalPayload.getProposal();
        proposal.startTimestamp = proposal.getStart().readInt32BE(4);
        proposal.endTimestamp = proposal.getEnd().readInt32BE(4);
        proposal.type = ProposalTypes.ExcludeMember;
        proposal.typeId = Object.values(ProposalTypes).indexOf(
          ProposalTypes.ExcludeMember
        );
        proposal.target =
          proposal.getMemberAddress() &&
          bintools.addressToString(hrp, chainId, proposal.getMemberAddress());
        proposal.inactive = true;
        break;
      case PlatformVMConstants.ADMINPROPOSAL_TYPE_ID:
        {
          proposal = proposalPayload.getProposal() as AdminProposal;
          const execProposal = proposal.getProposal();
          proposal.startTimestamp = execProposal.getStart().readInt32BE(4);
          proposal.endTimestamp = execProposal.getEnd().readInt32BE(4);
          switch (execProposal.getTypeID()) {
            case PlatformVMConstants.ADDMEMBERPORPOSAL_TYPE_ID:
              proposal.type = ProposalTypes.NewMember;
              proposal.typeId = Object.values(ProposalTypes).indexOf(
                ProposalTypes.NewMember
              );
              proposal.target =
                execProposal.getApplicantAddress() &&
                bintools.addressToString(
                  hrp,
                  chainId,
                  execProposal.getApplicantAddress()
                );
              break;
            case PlatformVMConstants.EXCLUDEMEMBERPORPOSAL_TYPE_ID:
              proposal.type = ProposalTypes.ExcludeMember;
              proposal.typeId = Object.values(ProposalTypes).indexOf(
                ProposalTypes.ExcludeMember
              );
              proposal.target =
                execProposal.getMemberAddress() &&
                bintools.addressToString(
                  hrp,
                  chainId,
                  execProposal.getMemberAddress()
                );
              break;
            default:
              console.warn(
                'Unsupported admin proposal type ',
                execProposal.getTypeID()
              );
          }
          proposal.inactive = true;
        }
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
