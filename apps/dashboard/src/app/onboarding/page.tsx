'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '@/components/shared/Logo';
import StepCreateOrg from '@/components/onboarding/StepCreateOrg';
import StepConnectCloud from '@/components/onboarding/StepConnectCloud';
import StepInviteTeam from '@/components/onboarding/StepInviteTeam';

const steps = [
  { number: 1, label: 'Organization' },
  { number: 2, label: 'Cloud Account' },
  { number: 3, label: 'Invite Team' },
];

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -80 : 80,
    opacity: 0,
  }),
};

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [orgId, setOrgId] = useState<string | null>(null);

  const goToStep = (step: number) => {
    setDirection(step > currentStep ? 1 : -1);
    setCurrentStep(step);
  };

  const handleOrgCreated = (id: string) => {
    setOrgId(id);
    goToStep(2);
  };

  const handleCloudConnected = () => {
    goToStep(3);
  };

  const handleCloudSkipped = () => {
    goToStep(3);
  };

  const handleTeamDone = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <div className="mb-8 flex items-center gap-3">
        <Logo className="w-10 h-10" />
        <span className="text-xl font-display font-semibold text-white">CloudDory</span>
      </div>

      {/* Step Progress Bar */}
      <div className="mb-10 flex items-center gap-2">
        {steps.map((step, i) => (
          <div key={step.number} className="flex items-center">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                  currentStep >= step.number
                    ? 'bg-cyan-500 text-navy-950'
                    : 'bg-navy-800 text-slate-500'
                }`}
              >
                {currentStep > step.number ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step.number
                )}
              </div>
              <span
                className={`text-sm hidden sm:inline transition-colors duration-300 ${
                  currentStep >= step.number ? 'text-white' : 'text-slate-500'
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`w-12 sm:w-20 h-px mx-2 transition-colors duration-300 ${
                  currentStep > step.number ? 'bg-cyan-500' : 'bg-navy-800'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="w-full flex justify-center">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="flex justify-center w-full"
          >
            {currentStep === 1 && (
              <StepCreateOrg onComplete={handleOrgCreated} />
            )}
            {currentStep === 2 && orgId && (
              <StepConnectCloud
                orgId={orgId}
                onComplete={handleCloudConnected}
                onSkip={handleCloudSkipped}
              />
            )}
            {currentStep === 3 && orgId && (
              <StepInviteTeam orgId={orgId} onComplete={handleTeamDone} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
