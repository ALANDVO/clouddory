'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

interface StepCreateOrgProps {
  onComplete: (orgId: string) => void;
}

const companySizes = [
  { value: 'solo', label: 'Solo (1 person)' },
  { value: 'startup', label: 'Startup (2-20)' },
  { value: 'mid-market', label: 'Mid-Market (21-200)' },
  { value: 'enterprise', label: 'Enterprise (200+)' },
];

export default function StepCreateOrg({ onComplete }: StepCreateOrgProps) {
  const [orgName, setOrgName] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim() || !companySize) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/orgs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: orgName.trim(), companySize }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to create organization');
      }

      const { id } = await res.json();
      onComplete(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-display font-semibold text-white">
          Name your organization
        </h2>
        <p className="text-sm text-muted-foreground">
          This will be your workspace for managing cloud resources.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="orgName">Organization name</Label>
          <Input
            id="orgName"
            placeholder="Acme Corp"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            autoFocus
          />
        </div>

        <div className="space-y-2">
          <Label>Company size</Label>
          <Select value={companySize} onValueChange={setCompanySize}>
            <SelectTrigger>
              <SelectValue placeholder="Select company size" />
            </SelectTrigger>
            <SelectContent>
              {companySizes.map((size) => (
                <SelectItem key={size.value} value={size.value}>
                  {size.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && (
        <p className="text-sm text-rose-400 text-center">{error}</p>
      )}

      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={!orgName.trim() || !companySize || loading}
      >
        {loading ? (
          <>
            <LoadingSpinner className="w-4 h-4 mr-2" />
            Creating...
          </>
        ) : (
          'Continue'
        )}
      </Button>
    </form>
  );
}
