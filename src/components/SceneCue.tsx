import { AirplaneTilt, Car, Footprints, Train, Boat, SunHorizon, Tree, Buildings, MapTrifold } from "@phosphor-icons/react";
import { sceneLabels, type Scene } from "../lib/roadbook";

const icons = { flight: AirplaneTilt, driving: Car, walking: Footprints, rail: Train, ferry: Boat, sunset: SunHorizon, nature: Tree, city: Buildings, static: MapTrifold };

export function SceneCue({ scene }: { scene: Scene }) {
  const Icon = icons[scene];
  return <span className={`scene-cue scene-${scene}`}><Icon weight="duotone" aria-hidden="true" />{sceneLabels[scene]}</span>;
}
