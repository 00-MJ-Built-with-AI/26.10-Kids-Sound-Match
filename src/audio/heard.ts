/** The words said aloud since the game began (Find the real one picks from these). */
const heard = new Set<string>();

/** Called for every clip played; only names (labelled "name:<item>:<language>") count. */
export function noteHeard(label: string): void {
  const match = /^name:([^:]+):/.exec(label);
  if (match) heard.add(match[1]);
}

export function heardWords(): string[] {
  return [...heard];
}

export function forgetHeard(): void {
  heard.clear();
}
