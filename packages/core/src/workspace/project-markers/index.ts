import type { FileSystemReader } from '../interfaces/file-system-reader.js';
import type { ProjectMarkerDetector } from '../interfaces/project-marker-detector.js';
import { CargoTomlMarkerDetector } from './cargo-toml-marker-detector.js';
import { ComposerJsonMarkerDetector } from './composer-json-marker-detector.js';
import { GoModMarkerDetector } from './go-mod-marker-detector.js';
import { GradleMarkerDetector } from './gradle-marker-detector.js';
import { PackageJsonMarkerDetector } from './package-json-marker-detector.js';
import { PomXmlMarkerDetector } from './pom-xml-marker-detector.js';
import { PyprojectMarkerDetector } from './pyproject-marker-detector.js';
import { RequirementsTxtMarkerDetector } from './requirements-txt-marker-detector.js';

export function createDefaultProjectMarkerDetectors(
  fs: FileSystemReader,
): ProjectMarkerDetector[] {
  return [
    new PackageJsonMarkerDetector(fs),
    new PyprojectMarkerDetector(fs),
    new RequirementsTxtMarkerDetector(fs),
    new GoModMarkerDetector(fs),
    new CargoTomlMarkerDetector(fs),
    new PomXmlMarkerDetector(fs),
    new GradleMarkerDetector(fs),
    new ComposerJsonMarkerDetector(fs),
  ];
}

export { CargoTomlMarkerDetector } from './cargo-toml-marker-detector.js';
export { ComposerJsonMarkerDetector } from './composer-json-marker-detector.js';
export { GoModMarkerDetector } from './go-mod-marker-detector.js';
export { GradleMarkerDetector } from './gradle-marker-detector.js';
export { PackageJsonMarkerDetector } from './package-json-marker-detector.js';
export { PomXmlMarkerDetector } from './pom-xml-marker-detector.js';
export { PyprojectMarkerDetector } from './pyproject-marker-detector.js';
export { RequirementsTxtMarkerDetector } from './requirements-txt-marker-detector.js';
