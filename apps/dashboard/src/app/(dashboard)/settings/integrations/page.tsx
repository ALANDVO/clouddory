'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { MessageSquare, SquareKanban } from 'lucide-react';

const integrations = [
  {
    id: 'slack',
    name: 'Slack',
    description: 'Send cost alerts and recommendations to Slack channels.',
    icon: MessageSquare,
    fields: [
      { label: 'Webhook URL', placeholder: 'https://hooks.slack.com/services/...' },
      { label: 'Default Channel', placeholder: '#cloud-costs' },
    ],
  },
  {
    id: 'jira',
    name: 'Jira',
    description: 'Create Jira tickets from cost optimization recommendations.',
    icon: SquareKanban,
    fields: [
      { label: 'Instance URL', placeholder: 'https://yourorg.atlassian.net' },
      { label: 'API Token', placeholder: 'Enter API token' },
      { label: 'Project Key', placeholder: 'CLOUD' },
    ],
  },
];

export default function IntegrationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-display font-semibold text-white">Integrations</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Connect third-party services to enhance your workflow.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {integrations.map((integration) => (
          <Card key={integration.id} className="relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <Badge variant="warning">Coming Soon</Badge>
            </div>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-navy-800 border border-white/10 flex items-center justify-center">
                  <integration.icon className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <CardTitle>{integration.name}</CardTitle>
                  <CardDescription>{integration.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {integration.fields.map((field) => (
                <div key={field.label} className="space-y-2">
                  <Label className="text-slate-500">{field.label}</Label>
                  <Input
                    placeholder={field.placeholder}
                    disabled
                    className="opacity-50"
                  />
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Button disabled className="opacity-50">
                Configure
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
