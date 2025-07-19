
/**
 * School Power Activities Manager
 * Central management system for all School Power functionalities and APIs
 * 
 * This file serves as the Single Source of Truth (SSOT) for:
 * - Activity definitions and metadata
 * - API configurations and pipelines
 * - Feature flags and enablement status
 * - Scalable activity registration system
 */

import schoolPowerActivitiesData from './data/schoolPowerActivities.json';

// API Key Configuration
export const GEMINI_API_KEY = 'AIzaSyD-Sso0SdyYKoA4M3tQhcWjQ1AoddB7Wo4';

// Type definitions for School Power activities
export interface SchoolPowerActivity {
  /** Unique identifier for the activity */
  id: string;
  
  /** Display name of the activity */
  title: string;
  
  /** Short description of what the activity does */
  description: string;
}

// Type for action plan items (used in the flow)
export interface ActionPlanActivity extends SchoolPowerActivity {
  /** Whether this activity is approved by the user */
  approved: boolean;
  
  /** Personalized title based on user context */
  personalizedTitle?: string;
  
  /** Personalized description based on user context */
  personalizedDescription?: string;
}

/**
 * Registry of all School Power activities from JSON file
 * These are the 137 activities that School Power can generate
 */
export const schoolPowerActivities: SchoolPowerActivity[] = schoolPowerActivitiesData;

/**
 * Utility Functions
 */

/**
 * Finds a School Power activity by its unique ID
 * @param id - The unique identifier of the activity
 * @returns The activity object if found, undefined otherwise
 */
export function getSchoolPowerActivityById(id: string): SchoolPowerActivity | undefined {
  return schoolPowerActivities.find(activity => activity.id === id);
}

/**
 * Filters School Power activities by tag
 * @param tag - The tag to filter by (e.g., "ponto-ativo", "geral", "avaliacao")
 * @returns Array of activities that include the specified tag
 */
export function listSchoolPowerActivitiesByTag(tag: string): SchoolPowerActivity[] {
  return schoolPowerActivities.filter(activity => 
    activity.tags.includes(tag) && activity.enabled
  );
}

/**
 * Gets all enabled School Power activities
 * @returns Array of all currently enabled activities
 */
export function getEnabledSchoolPowerActivities(): SchoolPowerActivity[] {
  return schoolPowerActivities.filter(activity => activity.enabled);
}

/**
 * Gets all available tags from registered activities
 * @returns Array of unique tags used across all activities
 */
export function getAvailableActivityTags(): string[] {
  const allTags = schoolPowerActivities.flatMap(activity => activity.tags);
  return [...new Set(allTags)];
}

/**
 * Checks if an activity is available and enabled
 * @param id - The unique identifier of the activity
 * @returns Boolean indicating if the activity is available and enabled
 */
export function isActivityEnabled(id: string): boolean {
  const activity = getSchoolPowerActivityById(id);
  return activity?.enabled ?? false;
}

/**
 * Gets activities by API type
 * @param apiType - The type of API to filter by
 * @returns Array of activities using the specified API type
 */
export function getActivitiesByApiType(apiType: SchoolPowerActivity['apiType']): SchoolPowerActivity[] {
  return schoolPowerActivities.filter(activity => 
    activity.apiType === apiType && activity.enabled
  );
}

// Export the main registry as default for easy importing
export default schoolPowerActivities;
