/**
 * Facebook / Meta SDK utilities for WhatsApp Embedded Signup.
 */

export interface WhatsAppSignupData {
    code?: string;
    accessToken?: string;
    wabaId?: string;
    phoneNumberId?: string;
    selectedBusinessId?: string;
}

declare global {
    interface Window {
        FB: any;
        fbAsyncInit: () => void;
    }
}

/**
 * Dynamically loads the Facebook JS SDK and initialises it with the given appId.
 * Safe to call multiple times — resolves immediately if already loaded.
 */
export function loadFacebookSDK(appId: string): Promise<void> {
    return new Promise((resolve, reject) => {
        // Already loaded
        if (typeof window !== 'undefined' && window.FB) {
            resolve();
            return;
        }

        window.fbAsyncInit = function () {
            window.FB.init({
                appId,
                autoLogAppEvents: true,
                xfbml: true,
                version: 'v19.0',
            });
            resolve();
        };

        // Inject the SDK script tag
        const script = document.createElement('script');
        script.id = 'facebook-jssdk';
        script.src = 'https://connect.facebook.net/en_US/sdk.js';
        script.async = true;
        script.defer = true;
        script.onerror = () => reject(new Error('Failed to load Facebook SDK'));
        document.body.appendChild(script);
    });
}

/**
 * Opens the WhatsApp Embedded Signup flow via the Facebook SDK login dialog.
 * Returns the signup data (auth code / access token) on success.
 */
export function launchWhatsAppSignup(configId: string): Promise<WhatsAppSignupData> {
    return new Promise((resolve, reject) => {
        if (!window.FB) {
            reject(new Error('Facebook SDK not loaded'));
            return;
        }

        window.FB.login(
            (response: any) => {
                if (response.authResponse) {
                    const { code, accessToken } = response.authResponse;
                    resolve({
                        code,
                        accessToken,
                        wabaId: response.authResponse.wabaId,
                        phoneNumberId: response.authResponse.phoneNumberId,
                        selectedBusinessId: response.authResponse.selectedBusinessId,
                    });
                } else {
                    reject(new Error('User cancelled or did not authorise the signup'));
                }
            },
            {
                config_id: configId,
                response_type: 'code',
                override_default_response_type: true,
                extras: {
                    setup: {},
                    featureType: '',
                    sessionInfoVersion: '3',
                },
            }
        );
    });
}
