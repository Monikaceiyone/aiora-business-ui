import type { Metadata } from 'next';

export type PageMeta = {
  title: string;
  description: string;
  keywords: string;
};

export const metaConfig: Record<string, PageMeta> = {
  commence: {
    title: 'AIORA – AI Platform for Real Businesses',
    description:
      'AIORA automates calls, WhatsApp orders, and customer support for grocery stores, restaurants, salons, clinics, and retail shops across India.',
    keywords:
      'AI business automation, WhatsApp AI agent, voice AI India, AIORA, small business AI, AI for retail, AI for restaurants, AI for clinics',
  },
  coreSuite: {
    title: 'Core Suite – AIORA AI Agents & Tools',
    description:
      "Explore AIORA's Core Suite: Voice Agent (VoIT), Marketing Agent, E-commerce Agent, Inventory Agent, Booking Agent, Logistics, Finance, and Operations AI.",
    keywords:
      'AI agents, voice agent, VoIT, marketing automation, e-commerce AI, inventory management AI, booking agent, logistics AI, finance AI, operations AI',
  },
  configurations: {
    title: 'Configurations – Build Your Custom AI Agent | AIORA',
    description:
      'Configure a custom AI agent for your business. Define your automation task, input sources, triggers, and expected outputs — AIORA builds it for you.',
    keywords:
      'custom AI agent, business automation setup, AI configuration, workflow automation, no-code AI, task automation India',
  },
  costing: {
    title: 'Pricing & Plans – AIORA Business AI',
    description:
      'Simple, transparent pricing for AIORA. Business plan from ₹3,999/month with Voice Agent, WhatsApp Sales, Marketing, and Inventory automation. Enterprise plans available.',
    keywords:
      'AIORA pricing, AI subscription India, business AI cost, WhatsApp automation price, voice agent pricing, AI plan India, ₹3999 AI plan',
  },
  connect: {
    title: 'Connect with AIORA – Get Started Today',
    description:
      'Reach out to AIORA to get started with AI automation for your business. Submit your inquiry and our team will onboard you within 48 hours.',
    keywords:
      'contact AIORA, get started AI, AI onboarding India, business inquiry, WhatsApp AI signup, AIORA demo',
  },
  commandCentre: {
    title: 'Command Centre – AIORA Business Dashboard',
    description:
      'Manage your AI agents, monitor conversations, track orders, and control your entire business automation from the AIORA Command Centre dashboard.',
    keywords:
      'AIORA dashboard, business command centre, AI agent management, order tracking, WhatsApp dashboard, business analytics AI',
  },
};

/** Helper — returns a Next.js Metadata object for a given page key */
export function buildMetadata(key: keyof typeof metaConfig): Metadata {
  const m = metaConfig[key];
  return {
    title: m.title,
    description: m.description,
    keywords: m.keywords,
    openGraph: {
      title: m.title,
      description: m.description,
      siteName: 'AIORA',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: m.title,
      description: m.description,
    },
  };
}
