import { createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { toCanvas } from "qrcode";
import { useEffect, useRef } from "react";
import { z } from "zod";

export const Route = createFileRoute("/login")({
  component: Login,
  validateSearch: zodValidator(z.object({ code: z.string().nonempty() })),
});

function Login() {
  const { code } = Route.useSearch();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    toCanvas(canvasRef.current, code);
  }, [code]);

  return (
    <div className="flex flex-col size-full items-center justify-center ">
      <div className="size-80">
        <canvas ref={canvasRef} className="size-full! rounded-2xl" />
      </div>
    </div>
  );
}
