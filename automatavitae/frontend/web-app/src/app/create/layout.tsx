"use client";

import React from 'react';
import CVLayout from '@/layouts/CVLayout';

export default function CreateLayout({ children }: { children: React.ReactNode }) {
  return (
    <CVLayout>{children}</CVLayout>
  );
}
