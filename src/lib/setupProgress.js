export function getSetupCompletion({ knowledge, localSetup = {} }) {
  const hasKnowledge = Number(knowledge?.stats?.documentCount || 0) > 0;
  const hasPlayground = Boolean(localSetup.playground);
  const hasInstall = Boolean(localSetup.install);
  const prerequisitesComplete = hasKnowledge && hasPlayground && hasInstall;

  return {
    knowledge: hasKnowledge,
    playground: hasPlayground,
    install: hasInstall,
    live: prerequisitesComplete && Boolean(localSetup.live)
  };
}
