import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/dashboard/$chatId")({
  component: RouteComponent,
  loader: async ({ context: { queryClient, trpc }, params }) => {
    return queryClient.ensureQueryData(trpc.getChatById.queryOptions({ chatId: params.chatId }));
  },
});

function RouteComponent() {
  const { chat, timegroups } = Route.useLoaderData();
  const [open, setOpen] = useState(() => Object.keys(timegroups));

  useEffect(() => {
    console.log(timegroups);
  }, [timegroups]);

  return (
    <div className="flex w-full flex-col gap-4">
      {Object.entries(timegroups).map(([time, groupedUsers]) => (
        <Accordion
          key={time}
          type="multiple"
          className="w-full"
          value={open}
          onValueChange={setOpen}
        >
          <AccordionItem value={time}>
            <AccordionTrigger>{time}</AccordionTrigger>
            <AccordionContent>
              {Object.values(groupedUsers).map((user) => (
                <div key={user.info.id._serialized}>
                  <span>{user.info.name}</span>
                  <div>
                    {user.media.map((mediaId) => (
                      <p key={mediaId}>{mediaId}</p>
                    ))}
                  </div>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      ))}
    </div>
  );
}
