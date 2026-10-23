export function getSetupCompletion({ knowledge, localSetup = {} }) {
  const hasKnowledge = Number(knowledge?.stats?.documentCount || 0) > 0;
  const hasChannels = Boolean(localSetup.channels);
  const hasPlayground = Boolean(localSetup.playground);
  const hasInstall = Boolean(localSetup.install);
  const prerequisitesComplete = hasKnowledge && hasChannels && hasPlayground && hasInstall;

  return {
    knowledge: hasKnowledge,
    channels: hasChannels,
    playground: hasPlayground,
    install: hasInstall,
    live: prerequisitesComplete && Boolean(localSetup.live)
  };
}
