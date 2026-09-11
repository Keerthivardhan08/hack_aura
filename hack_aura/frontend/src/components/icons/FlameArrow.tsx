import { clsx, type ClassValue } from "clsx";
import { useEffect, useState } from "react";

type FlameArrowProps = {
  size?: number;
  className?: string;
  "data-testid"?: string;
};

const BASE_SIZE = 24;

function getPathData(direction: "left" | "right"): string {
  if (direction === "left") return "M12 2L2 12l2 10h4l4-10 4 10h4l2-10z";
  return "M12 22l10-10-2-2-8 8V2h-2v12l-8-8-2 2z";
}

function FlameArrowBase({ direction, size = BASE_SIZE, className = "" }: FlameArrowProps & { direction: "left" | "right" }) {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      className={clsx(
        "flame-arrow",
        size !== BASE_SIZE && `w-[${size}px] h-[${size}px]`,
        className
      )}
      aria-hidden="true"
      data-testid={`${direction}-flame-arrow`}
    >
      <path 
        d={getPathData(direction)} 
        strokeWidth="1.5" 
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <div className="absolute inset-0 pointer-events-none">
        <div className="flame-layer-1" />
        <div className="flame-layer-2" />
        <div className="flame-layer-3" />
      </div>
    </svg>
  );
}

export function FlameArrowLeft(props: FlameArrowProps) {
  return <FlameArrowBase direction="left" {...props} />;
}

export function FlameArrowRight(props: FlameArrowProps) {
  return <FlameArrowBase direction="right" {...props} />;
}