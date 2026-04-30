'use client';

import { useOpsStore } from '@/store/opsStore';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Heading } from '@/components/common/Heading';
import { CheckCircle2 } from 'lucide-react';

export function OutputPanel() {
  const output = useOpsStore((state) => state.output);
  const status = useOpsStore((state) => state.status);

  const hasOutput = Object.values(output).some((v) => v !== null);

  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="flex items-center justify-between">
        <Heading level={3} className="text-foreground">
          Execution Results
        </Heading>
        {status === 'completed' && (
          <div className="flex items-center gap-2 text-green-500 text-sm font-medium">
            <CheckCircle2 className="w-4 h-4" />
            Complete
          </div>
        )}
      </div>

      {!hasOutput && status === 'idle' ? (
        <Card className="flex-1 flex items-center justify-center bg-background/50 border-border/50">
          <p className="text-muted-foreground text-center">
            Submit a task to see results here
          </p>
        </Card>
      ) : (
        <Tabs defaultValue="plan" className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-5 bg-background border border-border rounded-lg">
            <TabsTrigger value="plan" className="text-xs">
              Plan
            </TabsTrigger>
            <TabsTrigger value="research" className="text-xs">
              Research
            </TabsTrigger>
            <TabsTrigger value="code" className="text-xs">
              Code
            </TabsTrigger>
            <TabsTrigger value="tests" className="text-xs">
              Tests
            </TabsTrigger>
            <TabsTrigger value="report" className="text-xs">
              Report
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 mt-4 rounded-lg border border-border/50">
            <TabsContent value="plan" className="p-4 m-0">
              {output.plan ? (
                <OutputSection data={output.plan} />
              ) : (
                <EmptyState />
              )}
            </TabsContent>

            <TabsContent value="research" className="p-4 m-0">
              {output.research ? (
                <OutputSection data={output.research} />
              ) : (
                <EmptyState />
              )}
            </TabsContent>

            <TabsContent value="code" className="p-4 m-0">
              {output.code ? (
                <OutputSection data={output.code} />
              ) : (
                <EmptyState />
              )}
            </TabsContent>

            <TabsContent value="tests" className="p-4 m-0">
              {output.tests ? (
                <OutputSection data={output.tests} />
              ) : (
                <EmptyState />
              )}
            </TabsContent>

            <TabsContent value="report" className="p-4 m-0">
              {output.report ? (
                <OutputSection data={output.report} />
              ) : (
                <EmptyState />
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      )}
    </div>
  );
}

function OutputSection({ data }) {
  if (typeof data === 'string') {
    return <pre className="text-xs whitespace-pre-wrap text-foreground">{data}</pre>;
  }

  if (Array.isArray(data)) {
    return (
      <ul className="space-y-2">
        {data.map((item, idx) => (
          <li key={idx} className="text-sm text-foreground flex gap-2">
            <span className="text-primary">•</span>
            <span>{typeof item === 'string' ? item : JSON.stringify(item)}</span>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="space-y-4">
      {Object.entries(data).map(([key, value]) => (
        <div key={key}>
          <h4 className="font-semibold text-sm text-foreground mb-2 capitalize">
            {key.replace(/([A-Z])/g, ' $1').trim()}
          </h4>
          <div className="ml-4 text-xs text-muted-foreground space-y-1">
            {typeof value === 'string' ? (
              <p>{value}</p>
            ) : Array.isArray(value) ? (
              <ul className="space-y-1">
                {value.map((item, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span className="text-primary">-</span>
                    {typeof item === 'string' ? item : JSON.stringify(item)}
                  </li>
                ))}
              </ul>
            ) : typeof value === 'object' ? (
              <pre className="bg-background/50 p-2 rounded text-xs overflow-x-auto">
                {JSON.stringify(value, null, 2)}
              </pre>
            ) : (
              <p>{String(value)}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return <p className="text-muted-foreground text-sm">No output yet...</p>;
}
