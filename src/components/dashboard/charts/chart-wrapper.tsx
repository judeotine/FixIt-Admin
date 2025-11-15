"use client";

import dynamic from "next/dynamic";
import { ComponentType } from "react";

export const RevenueChart = dynamic(
  () => import("./revenue-chart").then((mod) => ({ default: mod.RevenueChart })),
  { ssr: false }
);

export const ServiceDistributionChart = dynamic(
  () => import("./service-distribution-chart").then((mod) => ({ default: mod.ServiceDistributionChart })),
  { ssr: false }
);

export const TopWorkersChart = dynamic(
  () => import("./top-workers-chart").then((mod) => ({ default: mod.TopWorkersChart })),
  { ssr: false }
);

export const UserGrowthChart = dynamic(
  () => import("./user-growth-chart").then((mod) => ({ default: mod.UserGrowthChart })),
  { ssr: false }
);

