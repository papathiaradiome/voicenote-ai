import { useAuthStore } from '../stores/authStore';
import { PLANS } from '../utils/constants';

export const useAuth = () => {
  const { session, user, profile, isLoading, isAuthenticated, signOut } = useAuthStore();

  const isPro = profile?.subscription_plan === 'pro' || profile?.subscription_plan === 'business';
  const isBusiness = profile?.subscription_plan === 'business';
  
  const currentPlanLimits = profile?.subscription_plan 
    ? PLANS[profile.subscription_plan.toUpperCase() as keyof typeof PLANS]?.limits 
    : PLANS.FREE.limits;

  const checkLimit = (feature: keyof typeof PLANS.FREE.limits, currentUsage: number) => {
    if (!currentPlanLimits) return false;
    return currentUsage < (currentPlanLimits[feature] || 0);
  };

  return {
    session,
    user,
    profile,
    isLoading,
    isAuthenticated,
    signOut,
    isPro,
    isBusiness,
    currentPlanLimits,
    checkLimit,
  };
};
