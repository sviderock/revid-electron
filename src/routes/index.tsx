import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

const ipcTestOptions = queryOptions({
  queryKey: ["test"],
  queryFn: async () => {
    const data = await window.electron.ipcRenderer.getData({
      clickedAt: new Date().toISOString(),
    });
    return data;
  },
});

export const Route = createFileRoute("/")({
  component: Index,
  loader: ({ context }) => context.queryClient.ensureQueryData(ipcTestOptions),
  pendingComponent: () => <div>Loading...</div>,
});

function Index() {
  console.log(1);
  const test = useSuspenseQuery(ipcTestOptions);

  console.log(2);
  return <div className="p-2">{JSON.stringify(test.data)}</div>;
}
