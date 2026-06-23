export const SUPPORTED_SOURCE_EXTENSIONS = ['ts', 'tsx', 'js', 'jsx'] as const;

export const SUPPORTED_SOURCE_GLOB = `**/*.{${SUPPORTED_SOURCE_EXTENSIONS.join(',')}}`;
