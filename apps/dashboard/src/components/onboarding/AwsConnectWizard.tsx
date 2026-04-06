'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { CheckCircle2, ExternalLink, Copy, ChevronDown, ChevronUp, AlertCircle, Info } from 'lucide-react';

interface AwsConnectWizardProps {
  orgId: string;
  onComplete: () => void;
}

type WizardStep = 'cur_setup' | 'cloudformation' | 'verify';

export default function AwsConnectWizard({ orgId, onComplete }: AwsConnectWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('cur_setup');
  const [accountName, setAccountName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // CUR setup state
  const [curBucketName, setCurBucketName] = useState('');
  const [curPrefix, setCurPrefix] = useState('cur');
  const [curConfirmed, setCurConfirmed] = useState(false);
  const [skipCur, setSkipCur] = useState(false);

  // CloudFormation state
  const [externalId, setExternalId] = useState<string | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [roleArn, setRoleArn] = useState('');
  const [showManualSetup, setShowManualSetup] = useState(false);
  const [copied, setCopied] = useState(false);

  // Verify state
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<{
    success: boolean;
    accountId?: string;
    currentMonthCost?: number;
    error?: string;
    code?: string;
    message?: string;
  } | null>(null);

  const handleContinueToCF = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/orgs/${orgId}/cloud-accounts/aws-setup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: accountName || 'AWS Account',
          curBucketName: skipCur ? '' : curBucketName,
          curPrefix: skipCur ? 'cur' : curPrefix,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to initiate AWS setup');
      }

      const data = await res.json();
      setExternalId(data.externalId);
      setAccountId(data.accountId);
      setCurrentStep('cloudformation');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleLaunchStack = () => {
    if (!externalId) return;

    const templateURL = process.env.NEXT_PUBLIC_CF_TEMPLATE_URL || '/cloudformation/clouddory-role.yaml';
    const cfUrl = [
      'https://console.aws.amazon.com/cloudformation/home#/stacks/create/review',
      `?stackName=CloudDoryAccess`,
      `&templateURL=${encodeURIComponent(templateURL)}`,
      `&param_ExternalId=${encodeURIComponent(externalId)}`,
      skipCur ? '' : `&param_CURBucketName=${encodeURIComponent(curBucketName)}`,
      skipCur ? '' : `&param_CURBucketPrefix=${encodeURIComponent(curPrefix)}`,
    ].join('');

    window.open(cfUrl, '_blank');
  };

  const handleCopyExternalId = useCallback(() => {
    if (!externalId) return;
    navigator.clipboard.writeText(externalId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [externalId]);

  const handleSubmitRoleArn = async () => {
    if (!roleArn.trim() || !externalId) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/orgs/${orgId}/cloud-accounts/aws-callback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roleArn: roleArn.trim(),
          externalId,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to save Role ARN');
      }

      setCurrentStep('verify');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!accountId) return;

    setVerifying(true);
    setVerifyResult(null);
    setError(null);

    try {
      const res = await fetch(`/api/orgs/${orgId}/cloud-accounts/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cloudAccountId: accountId }),
      });

      const data = await res.json();
      setVerifyResult(data);
    } catch (err) {
      setVerifyResult({
        success: false,
        error: err instanceof Error ? err.message : 'Verification failed',
      });
    } finally {
      setVerifying(false);
    }
  };

  // Step indicators
  const steps = [
    { key: 'cur_setup', label: '1. Setup CUR' },
    { key: 'cloudformation', label: '2. Launch Stack' },
    { key: 'verify', label: '3. Verify' },
  ];

  const stepIndex = steps.findIndex((s) => s.key === currentStep);

  return (
    <div className="w-full max-w-lg space-y-6">
      {/* Step indicator */}
      <div className="flex items-center justify-between px-2">
        {steps.map((s, i) => (
          <div key={s.key} className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                i < stepIndex
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : i === stepIndex
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'bg-white/5 text-slate-500 border border-white/10'
              }`}
            >
              {i < stepIndex ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                i + 1
              )}
            </div>
            <span
              className={`text-xs hidden sm:inline ${
                i === stepIndex ? 'text-cyan-400' : i < stepIndex ? 'text-emerald-400' : 'text-slate-500'
              }`}
            >
              {s.label}
            </span>
            {i < steps.length - 1 && (
              <div className={`w-8 h-px mx-1 ${i < stepIndex ? 'bg-emerald-500/30' : 'bg-white/10'}`} />
            )}
          </div>
        ))}
      </div>

      {/* STEP 1: CUR Setup */}
      {currentStep === 'cur_setup' && (
        <div className="space-y-5 animate-in fade-in-50 duration-300">
          <div className="space-y-2 text-center">
            <h2 className="text-xl font-display font-semibold text-white">
              Setup Cost and Usage Report
            </h2>
            <p className="text-sm text-muted-foreground">
              CUR provides detailed, hourly cost data. This is recommended for the most accurate analysis.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300" htmlFor="awsAccountName">
              Account Name
            </label>
            <Input
              id="awsAccountName"
              placeholder="e.g. Production, Staging"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
            />
          </div>

          {!skipCur && (
            <>
              <Card className="border-white/5 bg-navy-800/30">
                <CardContent className="p-4 space-y-3">
                  <p className="text-sm font-medium text-slate-300 flex items-center gap-2">
                    <Info className="w-4 h-4 text-cyan-400" />
                    Follow these steps in your AWS Console:
                  </p>
                  <ol className="list-decimal list-inside text-xs text-slate-400 space-y-2 ml-1">
                    <li>
                      <a
                        href="https://us-east-1.console.aws.amazon.com/costmanagement/home?region=us-east-1#/bcm-data-exports/create?e=&tableName=COST_AND_USAGE_REPORT"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-400 hover:underline inline-flex items-center gap-1"
                      >
                        Click here to create a CUR export in AWS
                        <ExternalLink className="w-3 h-3" />
                      </a>{' '}
                      and configure with these settings:
                    </li>
                    <li>Create a new report with these settings:</li>
                    <ul className="list-none ml-4 space-y-1 mt-1">
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                        Report name: <code className="text-cyan-400 bg-white/5 px-1.5 py-0.5 rounded">clouddory-cur</code>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        Include resource IDs: Enabled
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                        Time granularity: <code className="text-cyan-400 bg-white/5 px-1.5 py-0.5 rounded">Hourly</code>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                        Compression: <code className="text-cyan-400 bg-white/5 px-1.5 py-0.5 rounded">Parquet</code>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        Enable auto-refresh: Enabled
                      </li>
                    </ul>
                    <li>Choose or create an S3 bucket for the report.</li>
                    <li>Enter your S3 bucket name and prefix below.</li>
                  </ol>

                  <div className="mt-3 pt-3 border-t border-white/5 space-y-2">
                    <p className="text-xs text-slate-400 font-medium">Optional but recommended:</p>
                    <div className="space-y-1.5 text-xs text-slate-400">
                      <p>
                        <a
                          href="https://us-east-1.console.aws.amazon.com/costmanagement/home?region=us-east-1#/bcm-data-exports/create?e=&tableName=COST_AND_USAGE_REPORT&exportType=COST_OPTIMIZATION_RECOMMENDATIONS"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:underline inline-flex items-center gap-1"
                        >
                          Create a Cost Optimization export
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        {' '}— enables right-sizing and savings recommendations
                      </p>
                      <p>
                        <a
                          href="https://us-east-1.console.aws.amazon.com/billing/home?region=us-east-1#/tags"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:underline inline-flex items-center gap-1"
                        >
                          Activate cost allocation tags
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        {' '}— required for tag-based cost breakdown in CloudDory
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400" htmlFor="curBucket">
                    S3 Bucket Name
                  </label>
                  <Input
                    id="curBucket"
                    placeholder="my-cur-bucket"
                    value={curBucketName}
                    onChange={(e) => setCurBucketName(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400" htmlFor="curPrefix">
                    S3 Prefix
                  </label>
                  <Input
                    id="curPrefix"
                    placeholder="cur"
                    value={curPrefix}
                    onChange={(e) => setCurPrefix(e.target.value)}
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={curConfirmed}
                  onChange={(e) => setCurConfirmed(e.target.checked)}
                  className="rounded border-white/20 bg-white/5 text-cyan-500 focus:ring-cyan-500/20"
                />
                <span className="text-sm text-slate-300">I have set up my CUR</span>
              </label>
            </>
          )}

          <Button
            size="lg"
            className="w-full"
            disabled={loading || (!skipCur && !curConfirmed)}
            onClick={handleContinueToCF}
          >
            {loading ? (
              <>
                <LoadingSpinner className="w-4 h-4 mr-2" />
                Preparing...
              </>
            ) : (
              'Continue'
            )}
          </Button>

          {!skipCur && (
            <button
              type="button"
              className="text-xs text-muted-foreground hover:text-cyan-400 transition-colors w-full text-center"
              onClick={() => {
                setSkipCur(true);
                setCurConfirmed(false);
              }}
            >
              Skip CUR setup (use Cost Explorer API only)
            </button>
          )}

          {skipCur && (
            <div className="rounded-lg bg-amber-500/5 border border-amber-500/20 p-3">
              <p className="text-xs text-amber-400 flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                CUR skipped. CloudDory will use the Cost Explorer API which provides less granular data.
              </p>
              <button
                type="button"
                className="text-xs text-cyan-400 hover:underline mt-1 ml-5"
                onClick={() => setSkipCur(false)}
              >
                Set up CUR instead
              </button>
            </div>
          )}

          {error && <p className="text-sm text-rose-400 text-center">{error}</p>}
        </div>
      )}

      {/* STEP 2: CloudFormation */}
      {currentStep === 'cloudformation' && (
        <div className="space-y-5 animate-in fade-in-50 duration-300">
          <div className="space-y-2 text-center">
            <h2 className="text-xl font-display font-semibold text-white">
              Launch CloudFormation Stack
            </h2>
            <p className="text-sm text-muted-foreground">
              This creates a read-only IAM role in your AWS account for CloudDory to access cost data.
            </p>
          </div>

          {/* External ID display */}
          <Card className="border-white/5 bg-navy-800/30">
            <CardContent className="p-4 space-y-2">
              <p className="text-xs font-medium text-slate-400">Your External ID</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm text-cyan-400 bg-white/5 rounded px-3 py-2 font-mono truncate">
                  {externalId}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyExternalId}
                  className="shrink-0"
                >
                  {copied ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Button
            size="lg"
            className="w-full bg-[#FF9900] hover:bg-[#FF9900]/90 text-black font-semibold"
            onClick={handleLaunchStack}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Launch CloudFormation Stack in AWS
          </Button>

          <div className="rounded-lg bg-navy-800/30 border border-white/5 p-4 text-xs text-slate-400 space-y-2">
            <p className="font-medium text-slate-300">After the stack completes:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Go to the <span className="text-cyan-400">Outputs</span> tab in CloudFormation.</li>
              <li>Copy the <span className="text-cyan-400">RoleArn</span> value.</li>
              <li>Paste it below.</li>
            </ol>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300" htmlFor="roleArnInput">
              Role ARN
            </label>
            <Input
              id="roleArnInput"
              placeholder="arn:aws:iam::123456789012:role/CloudDoryReadOnlyRole"
              value={roleArn}
              onChange={(e) => setRoleArn(e.target.value)}
            />
          </div>

          <Button
            size="lg"
            className="w-full"
            disabled={!roleArn.trim().startsWith('arn:aws:iam::') || loading}
            onClick={handleSubmitRoleArn}
          >
            {loading ? (
              <>
                <LoadingSpinner className="w-4 h-4 mr-2" />
                Saving...
              </>
            ) : (
              'Continue to Verification'
            )}
          </Button>

          {/* Manual setup expandable */}
          <div className="border-t border-white/5 pt-4">
            <button
              type="button"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-cyan-400 transition-colors w-full justify-center"
              onClick={() => setShowManualSetup(!showManualSetup)}
            >
              Or set up manually
              {showManualSetup ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showManualSetup && (
              <Card className="mt-3 border-white/5 bg-navy-800/20">
                <CardContent className="p-4 text-xs text-slate-400 space-y-3">
                  <p className="font-medium text-slate-300">Manual IAM Role Setup</p>
                  <ol className="list-decimal list-inside space-y-2">
                    <li>Open the AWS IAM Console and create a new role.</li>
                    <li>
                      Select <span className="text-cyan-400">&quot;Another AWS account&quot;</span> and enter
                      CloudDory&apos;s account ID:{' '}
                      <code className="text-cyan-400 bg-white/5 px-1.5 py-0.5 rounded">{process.env.NEXT_PUBLIC_AWS_ACCOUNT_ID || 'YOUR_AWS_ACCOUNT_ID'}</code>
                    </li>
                    <li>
                      Check <span className="text-cyan-400">&quot;Require external ID&quot;</span> and enter:{' '}
                      <code className="text-cyan-400 bg-white/5 px-1.5 py-0.5 rounded">{externalId}</code>
                    </li>
                    <li>
                      Attach the managed policy:{' '}
                      <code className="text-cyan-400 bg-white/5 px-1.5 py-0.5 rounded">ViewOnlyAccess</code>
                    </li>
                    <li>
                      Add an inline policy with these permissions:
                      <ul className="list-disc ml-4 mt-1 space-y-0.5">
                        <li><code className="text-slate-300">ce:GetCostAndUsage</code>, <code className="text-slate-300">ce:GetCostForecast</code></li>
                        <li><code className="text-slate-300">ce:GetReservationUtilization</code>, <code className="text-slate-300">ce:GetRightsizingRecommendation</code></li>
                        <li><code className="text-slate-300">ce:GetSavingsPlansUtilization</code>, <code className="text-slate-300">ce:GetTags</code></li>
                        <li><code className="text-slate-300">cloudwatch:GetMetricData</code>, <code className="text-slate-300">cloudwatch:ListMetrics</code></li>
                        <li><code className="text-slate-300">s3:GetObject</code>, <code className="text-slate-300">s3:ListBucket</code> (on CUR bucket)</li>
                      </ul>
                    </li>
                    <li>
                      Name the role{' '}
                      <code className="text-cyan-400 bg-white/5 px-1.5 py-0.5 rounded">CloudDoryReadOnlyRole</code>
                      {' '}and copy the ARN into the field above.
                    </li>
                  </ol>
                </CardContent>
              </Card>
            )}
          </div>

          {error && <p className="text-sm text-rose-400 text-center">{error}</p>}
        </div>
      )}

      {/* STEP 3: Verify */}
      {currentStep === 'verify' && (
        <div className="space-y-5 animate-in fade-in-50 duration-300">
          <div className="space-y-2 text-center">
            <h2 className="text-xl font-display font-semibold text-white">
              Verify Connection
            </h2>
            <p className="text-sm text-muted-foreground">
              CloudDory will assume the IAM role and test access to your cost data.
            </p>
          </div>

          {/* Verifying state */}
          {verifying && (
            <Card className="border-cyan-500/20 bg-cyan-500/5">
              <CardContent className="flex flex-col items-center py-8 space-y-4">
                <LoadingSpinner className="w-8 h-8 text-cyan-400" />
                <p className="text-sm text-slate-300">Verifying connection...</p>
                <p className="text-xs text-slate-500">
                  Testing role assumption and Cost Explorer access
                </p>
              </CardContent>
            </Card>
          )}

          {/* Success state */}
          {!verifying && verifyResult?.success && (
            <Card className="border-emerald-500/30 bg-emerald-500/5">
              <CardContent className="flex flex-col items-center py-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-xl font-display font-semibold text-white">Connected!</h3>
                <p className="text-sm text-slate-400 text-center">
                  CloudDory is now analyzing your AWS costs.
                </p>
                {verifyResult.accountId && (
                  <p className="text-xs text-slate-500">
                    AWS Account: <code className="text-cyan-400">{verifyResult.accountId}</code>
                  </p>
                )}
                {verifyResult.currentMonthCost !== undefined && (
                  <p className="text-xs text-slate-500">
                    Current month spend:{' '}
                    <span className="text-emerald-400 font-medium">
                      ${verifyResult.currentMonthCost.toFixed(2)}
                    </span>
                  </p>
                )}
                <Badge variant="success">Active</Badge>
                <Button onClick={onComplete} className="mt-4">
                  Continue to Dashboard
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Error state */}
          {!verifying && verifyResult && !verifyResult.success && (
            <Card className="border-rose-500/30 bg-rose-500/5">
              <CardContent className="flex flex-col items-center py-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-rose-500/20 flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-rose-400" />
                </div>
                <h3 className="text-lg font-display font-semibold text-rose-300">
                  Connection Failed
                </h3>
                <div className="text-center space-y-1">
                  <p className="text-sm text-rose-400">{verifyResult.error}</p>
                  {verifyResult.code && (
                    <p className="text-xs text-slate-500">
                      Error code: <code className="text-rose-300">{verifyResult.code}</code>
                    </p>
                  )}
                </div>
                <div className="rounded-lg bg-navy-800/50 border border-white/5 p-3 text-xs text-slate-400 w-full">
                  <p className="font-medium text-slate-300 mb-1">Common causes:</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    <li>CloudFormation stack not yet complete</li>
                    <li>Incorrect Role ARN copied</li>
                    <li>External ID mismatch</li>
                    <li>Trust policy does not allow the configured AWS account</li>
                  </ul>
                </div>
                <Button variant="outline" onClick={handleVerify}>
                  Try Again
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Initial state - not yet verified */}
          {!verifying && !verifyResult && (
            <Card className="border-white/5">
              <CardContent className="flex flex-col items-center py-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-cyan-500/10 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-cyan-400" />
                </div>
                <p className="text-sm text-slate-300 text-center">
                  Role ARN saved. Click below to verify the connection works.
                </p>
                <Button size="lg" onClick={handleVerify}>
                  Verify Connection
                </Button>
              </CardContent>
            </Card>
          )}

          {error && <p className="text-sm text-rose-400 text-center">{error}</p>}
        </div>
      )}
    </div>
  );
}
