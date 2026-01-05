
const GIST_FILENAME = "thm_career_mapper_data.json";
const GIST_DESCRIPTION = "THM Career Mapper Persistence Store";

interface GistFile {
  content: string;
}

interface Gist {
  id: string;
  files: Record<string, GistFile>;
  description: string;
}

export const findExistingGist = async (token: string): Promise<string | null> => {
  try {
    const response = await fetch("https://api.github.com/gists", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!response.ok) {
        const err = await response.text();
        console.error("Failed to fetch gists:", err);
        throw new Error(`GitHub API Error: ${response.status}`);
    }

    const gists: Gist[] = await response.json();
    const targetGist = gists.find(
      (g) => g.description === GIST_DESCRIPTION && g.files[GIST_FILENAME]
    );

    return targetGist ? targetGist.id : null;
  } catch (error) {
    console.error("Error finding gist:", error);
    throw error;
  }
};

export const loadFromGist = async (token: string, gistId: string): Promise<any> => {
  try {
    const response = await fetch(`https://api.github.com/gists/${gistId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!response.ok) throw new Error("Failed to load gist");

    const gist: Gist = await response.json();
    const file = gist.files[GIST_FILENAME];

    if (!file || !file.content) return null;
    return JSON.parse(file.content);
  } catch (error) {
    console.error("Error loading from gist:", error);
    throw error;
  }
};

export const saveToGist = async (token: string, data: any, existingGistId: string | null): Promise<string> => {
  const content = JSON.stringify(data, null, 2);
  const files = {
    [GIST_FILENAME]: {
      content: content,
    },
  };

  try {
    let url = "https://api.github.com/gists";
    let method = "POST";

    if (existingGistId) {
      url = `${url}/${existingGistId}`;
      method = "PATCH";
    }

    const body = existingGistId 
      ? JSON.stringify({ files }) 
      : JSON.stringify({ description: GIST_DESCRIPTION, public: false, files });

    const response = await fetch(url, {
      method: method,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: body,
    });

    if (!response.ok) {
        const errText = await response.text();
        // If the Gist ID is stale (deleted on GH), reset and create a new one
        if (response.status === 404 && existingGistId) {
            console.warn("Gist ID not found on GitHub, creating a new one...");
            return saveToGist(token, data, null);
        }
        console.error(`Gist Save Error (${response.status}):`, errText);
        throw new Error(`Failed to save to gist: ${response.statusText}`);
    }

    const result: Gist = await response.json();
    return result.id;
  } catch (error) {
    console.error("Error saving to gist:", error);
    throw error;
  }
};
