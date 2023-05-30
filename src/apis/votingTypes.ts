import { get } from '@/helpers/http';

export const fetchVotingTypes = async () => get('voting_types.json');
