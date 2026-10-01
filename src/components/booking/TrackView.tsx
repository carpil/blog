import { useEffect } from "react";
import { track, type WebEvent } from "../../lib/client/analytics";

interface Props {
  event: WebEvent;
  properties: Record<string, unknown>;
}

export default function TrackView({ event, properties }: Props) {
  useEffect(() => {
    track(event, properties);
  }, []);
  return null;
}
