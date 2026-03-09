import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { AbTestVariant } from "@shared/schema";
import { useEffect, useState, useCallback, useRef } from "react";

function getSessionId(): string {
  let sessionId = sessionStorage.getItem("ab_session_id");
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    sessionStorage.setItem("ab_session_id", sessionId);
  }
  return sessionId;
}

function getStoredVariant(testName: string): string | null {
  return sessionStorage.getItem(`ab_variant_${testName}`);
}

function storeVariant(testName: string, variantId: string): void {
  sessionStorage.setItem(`ab_variant_${testName}`, variantId);
}

function clearStoredVariant(testName: string): void {
  sessionStorage.removeItem(`ab_variant_${testName}`);
}

function selectVariant(variants: AbTestVariant[]): AbTestVariant | null {
  if (!variants || variants.length === 0) return null;
  
  const activeVariants = variants.filter(v => v.active);
  if (activeVariants.length === 0) return null;
  
  const totalWeight = activeVariants.reduce((sum, v) => sum + (v.weight || 50), 0);
  const random = Math.random() * totalWeight;
  
  let cumulative = 0;
  for (const variant of activeVariants) {
    cumulative += variant.weight || 50;
    if (random <= cumulative) {
      return variant;
    }
  }
  
  return activeVariants[0];
}

export function useAbTest(testName: string) {
  const [selectedVariant, setSelectedVariant] = useState<AbTestVariant | null>(null);
  const variantRef = useRef<AbTestVariant | null>(null);
  const sessionId = getSessionId();

  const { data: variants, isLoading } = useQuery<AbTestVariant[]>({
    queryKey: [`/api/ab-tests/${testName}/variants`],
  });

  const { mutate } = useMutation({
    mutationFn: async ({ conversionType, variantId }: { conversionType: string; variantId: string }) => {
      return apiRequest("POST", "/api/ab-tests/conversions", {
        testName,
        variantId,
        sessionId,
        conversionType,
      });
    },
  });

  useEffect(() => {
    variantRef.current = selectedVariant;
  }, [selectedVariant]);

  useEffect(() => {
    if (isLoading) return;

    if (!variants || variants.length === 0) {
      clearStoredVariant(testName);
      setSelectedVariant(null);
      return;
    }

    if (selectedVariant) {
      const currentVariantInList = variants.find(v => v.id === selectedVariant.id);
      if (currentVariantInList && currentVariantInList.active) {
        return;
      }
      clearStoredVariant(testName);
      setSelectedVariant(null);
    }

    const storedVariantId = getStoredVariant(testName);
    
    if (storedVariantId) {
      const stored = variants.find(v => v.id === storedVariantId);
      if (stored && stored.active) {
        setSelectedVariant(stored);
        return;
      }
      clearStoredVariant(testName);
    }

    const selected = selectVariant(variants);
    if (selected) {
      setSelectedVariant(selected);
      storeVariant(testName, selected.id);
    }
  }, [variants, testName, selectedVariant, isLoading]);

  const trackConversion = useCallback((conversionType: string = "click") => {
    const currentVariant = variantRef.current;
    if (!currentVariant) return;
    mutate({ conversionType, variantId: currentVariant.id });
  }, [mutate]);

  return {
    variant: selectedVariant,
    isLoading,
    trackConversion,
    sessionId,
  };
}
