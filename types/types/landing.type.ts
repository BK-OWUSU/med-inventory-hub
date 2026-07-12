// types/landing.ts
import { ReactNode } from "react";

export interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export interface StepProps {
  number: string;
  title: string;
  description: string;
}

export interface StatProps {
  value: string;
  label: string;
}

export interface TestimonialProps {
  quote: string;
  author: string;
  role: string;
  facility: string;
  avatarUrl: string;
}

export interface FAQProps {
  question: string;
  answer: string;
  value: string;
}