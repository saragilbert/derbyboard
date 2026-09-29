import { persisted } from 'svelte-persisted-store';

/** Team whose jammer currently has lead, or null when nobody has it. */
export const leadJammer = persisted<'A' | 'B' | null>('derbyboard-lead-jammer', null);
