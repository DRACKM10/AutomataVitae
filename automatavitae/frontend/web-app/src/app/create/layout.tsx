"use client";

import React from 'react';
import CVLayout from '@/layouts/CVLayout'; // we will configure alias or absolute path
import { ResumeProvider } from '@/context/store';

export default function CreateLayout({ children }: { children: React.ReactNode }) {
  return (
    <ResumeProvider>
      <CVLayout>{children}</CVLayout>
    </ResumeProvider>
  );
}
