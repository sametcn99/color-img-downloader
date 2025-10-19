import { useCallback } from "react";

// --- 1. Type Definitions ---

/**
 * Defines the structure for custom Umami event data (key-value pairs).
 */
interface UmamiEventData {
	[key: string]: string | number | boolean | null | undefined;
}

/**
 * Defines the structure for dynamic context data collected and appended to every event.
 */
interface ContextData extends UmamiEventData {
	userAgent: string;
	language: string;

	// Session and Page
	currentPath: string;
	pageTitle: string;
	referrer: string;
	timestamp: string; // The time the event was triggered (ISO 8601)
}

// Global type definition for the Umami object on the window.
declare global {
	interface Window {
		umami?: {
			track: (eventName: string, eventData?: UmamiEventData) => void;
		};
	}
}

/**
 * Collects comprehensive, anonymous data about the user's browser environment and context.
 * Safely returns null when executed outside of a browser environment (e.g., during SSR).
 * @returns {ContextData | null} Dynamically collected context data, or null if running in SSR.
 */
const getDynamicContextData = (): ContextData | null => {
	// Strict check for SSR and Browser environment
	if (typeof window === "undefined" || !window.navigator || !document) {
		return null;
	}

	// Browser/Device Data
	const { userAgent, language } = window.navigator;

	// Page/Session Context Data
	const currentPath = window.location.pathname;
	const pageTitle = document.title;
	const referrer = document.referrer;
	const timestamp = new Date().toISOString(); // When the event occurred (ISO 8601)

	// Explicitly return as ContextData for type safety
	return {
		userAgent,
		language,
		currentPath,
		pageTitle,
		referrer,
		timestamp,
	} as ContextData;
};

// --- 3. The Main Hook ---

/**
 * A type-safe and comprehensive React Hook for reliably tracking custom Umami events.
 * It automatically merges dynamic user context data with custom event-specific data.
 *
 * @returns {{ trackEvent: (eventName: string, eventData?: UmamiEventData) => void }} A function to trigger a custom Umami event.
 */
export const useUmami = () => {
	/**
	 * Triggers a custom Umami event with merged data.
	 * @param {string} eventName - The name of the event to track.
	 * @param {UmamiEventData} [eventData={}] - Additional event-specific data.
	 */
	const trackEvent = useCallback(
		(eventName: string, eventData: UmamiEventData = {}) => {
			// 1. Collect Dynamic Context Data
			const dynamicData = getDynamicContextData();

			// Stop tracking if in SSR or data cannot be collected
			if (dynamicData === null) {
				return;
			}

			// 2. Merge Data (Custom event data overrides dynamic data if keys overlap)
			const mergedData: UmamiEventData = {
				...dynamicData,
				...eventData,
			};

			// 3. Perform Tracking
			if (
				typeof window !== "undefined" &&
				window.umami &&
				typeof window.umami.track === "function"
			) {
				window.umami.track(eventName, mergedData);
			} else {
				// Console output for Development/Debugging purposes (Check data schema and content)
				console.groupCollapsed(`[Umami TRACKED] ${eventName} (Mock/Dev)`);
				console.log("Payload:", mergedData);
				console.groupEnd();
			}
		},
		[],
	);

	return { trackEvent };
};
