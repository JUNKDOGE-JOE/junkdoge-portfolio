type GitHubResponse = {
  stargazers_count?: unknown
}

type Fetcher = (
  input: string,
  init?: RequestInit,
) => Promise<{ ok: boolean; json?: () => Promise<GitHubResponse> }>

type FetchGitHubStarCountOptions = {
  fetcher?: Fetcher
  signal?: AbortSignal
}

function githubRepositoryPath(repositoryUrl: string): string | null {
  try {
    const url = new URL(repositoryUrl)
    if (url.hostname.toLowerCase() !== 'github.com') return null

    const [owner, repository, ...rest] = url.pathname.split('/').filter(Boolean)
    if (!owner || !repository || rest.length > 0) return null

    const name = repository.replace(/\.git$/i, '')
    return name ? `${owner}/${name}` : null
  } catch {
    return null
  }
}

export async function fetchGitHubStarCount(
  repositoryUrl: string,
  { fetcher = fetch, signal }: FetchGitHubStarCountOptions = {},
): Promise<number | null> {
  const repository = githubRepositoryPath(repositoryUrl)
  if (!repository) return null

  try {
    const response = await fetcher(`https://api.github.com/repos/${repository}`, {
      headers: { Accept: 'application/vnd.github+json' },
      signal,
    })
    if (!response.ok || !response.json) return null

    const data = await response.json()
    return typeof data.stargazers_count === 'number' ? data.stargazers_count : null
  } catch {
    return null
  }
}
