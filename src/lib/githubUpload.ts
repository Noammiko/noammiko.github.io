const OWNER  = "Noammiko";
const REPO   = "noammiko.github.io";
const BRANCH = "master";

function sanitizeFileName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Uploads a file directly from the browser to GitHub using a token
 * obtained from the Convex backend. Returns the raw.githubusercontent.com URL.
 */
export async function uploadFileToGitHub(
  token: string,
  file: File,
  folder: "gallery" | "portfolio",
): Promise<string> {
  const fileContent = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const safe   = sanitizeFileName(file.name);
  const unique = `${Date.now()}-${safe}`;
  const path   = `media/${folder}/${unique}`;

  const res = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`,
    {
      method: "PUT",
      headers: {
        "Authorization":        `Bearer ${token}`,
        "Accept":               "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type":         "application/json",
      },
      body: JSON.stringify({
        message: `Upload ${folder} file: ${unique}`,
        content: fileContent,
        branch:  BRANCH,
      }),
    },
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`GitHub upload failed (${res.status}): ${errText}`);
  }

  return `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/${path}`;
}
