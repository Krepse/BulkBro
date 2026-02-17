// Global lock to prevent multiple simultaneous token refresh attempts
class TokenRefreshLock {
    private refreshing = false;
    private refreshPromise: Promise<void> | null = null;

    async acquireLock<T>(refreshFn: () => Promise<T>): Promise<T> {
        // If already refreshing, wait for it to complete
        if (this.refreshing && this.refreshPromise) {
            await this.refreshPromise;
            // After waiting, the token should be fresh, so just return
            // We need to call the function anyway to get the result
        }

        // If not refreshing, start a new refresh
        if (!this.refreshing) {
            this.refreshing = true;
            this.refreshPromise = (async () => {
                try {
                    await refreshFn();
                } finally {
                    this.refreshing = false;
                    this.refreshPromise = null;
                }
            })();
            await this.refreshPromise;
        }

        // Call the function to get the result
        return await refreshFn();
    }

    isRefreshing(): boolean {
        return this.refreshing;
    }
}

export const tokenRefreshLock = new TokenRefreshLock();
