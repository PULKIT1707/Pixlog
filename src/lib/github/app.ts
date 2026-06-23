import { Octokit } from "@octokit/rest";
import { createAppAuth } from "@octokit/auth-app";
import { env } from "@/lib/env";

/**
 * Returns an Octokit instance authenticated as the GitHub App itself.
 * Used for: listing installations, getting installation IDs.
 */
export function getAppOctokit(): Octokit {
  return new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId: env.GITHUB_APP_ID,
      privateKey: env.GITHUB_APP_PRIVATE_KEY.replace(/\\n/g, "\n"),
    },
  });
}

/**
 * Returns an Octokit instance authenticated as a specific installation.
 * This is the token that actually creates repos and commits on behalf of a user.
 *
 * Installation tokens are short-lived (1 hour) — always fetch fresh.
 */
export async function getInstallationOctokit(
  installationId: number
): Promise<Octokit> {
  const appAuth = createAppAuth({
    appId: env.GITHUB_APP_ID,
    privateKey: env.GITHUB_APP_PRIVATE_KEY.replace(/\\n/g, "\n"),
    installationId,
  });

  const { token } = await appAuth({ type: "installation" });

  return new Octokit({ auth: token });
}

/**
 * Fetches the installation ID for a given GitHub user login.
 * Returns null if the user hasn't installed the Pixlog GitHub App yet.
 */
export async function getInstallationId(
  userLogin: string
): Promise<number | null> {
  const octokit = getAppOctokit();

  try {
    const { data } = await octokit.apps.getUserInstallation({
      username: userLogin,
    });
    return data.id;
  } catch (err: unknown) {
    // 404 = user hasn't installed the app
    if (isOctokitError(err) && err.status === 404) {
      return null;
    }
    throw err;
  }
}

/**
 * Generates a fresh installation access token string.
 * Store this in the job payload — it expires in 1 hour.
 */
export async function getInstallationToken(
  installationId: number
): Promise<string> {
  const appAuth = createAppAuth({
    appId: env.GITHUB_APP_ID,
    privateKey: env.GITHUB_APP_PRIVATE_KEY.replace(/\\n/g, "\n"),
    installationId,
  });

  const { token } = await appAuth({ type: "installation" });
  return token;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

interface OctokitError {
  status: number;
  message: string;
}

function isOctokitError(err: unknown): err is OctokitError {
  return (
    typeof err === "object" &&
    err !== null &&
    "status" in err &&
    typeof (err as OctokitError).status === "number"
  );
}
